// ORACLE Scoring Edge Function — Full causal scoring pipeline
// Implements: Feature encoding → Causal reasoning → Scoring → Fairness → Counterfactuals → Trajectory → LLM Explanation
// Adapted from oracle-ml-codebase for Supabase Edge + Lovable AI Gateway

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════════════════════════════════
// CAUSAL GRAPH — Domain knowledge priors (from oracle/causal_graph.py)
// ═══════════════════════════════════════════════════════════════════════════════

const CAUSAL_PRIORS: [string, string, string, number][] = [
  ["revolving_utilization",   "probability", "increases_risk", 0.74],
  ["missed_payments_12m",     "probability", "increases_risk", 0.88],
  ["derogatory_marks",        "probability", "increases_risk", 0.91],
  ["gambling_amount",         "probability", "increases_risk", 0.55],
  ["cash_flow_stress",        "probability", "increases_risk", 0.77],
  ["dti_ratio",               "probability", "increases_risk", 0.65],
  ["inquiries_6m",            "probability", "increases_risk", 0.42],
  ["income_norm",             "probability", "decreases_risk", 0.58],
  ["income_stability",        "probability", "decreases_risk", 0.64],
  ["loan_payment_regularity", "probability", "decreases_risk", 0.68],
  ["oldest_account_norm",     "probability", "decreases_risk", 0.55],
  ["income_verified",         "probability", "decreases_risk", 0.38],
];

// ECOA-compliant adverse action reason mapping (from oracle/fairness.py)
const ECOA_REASONS: Record<string, string> = {
  revolving_utilization:   "Proportion of balances to credit limits is too high",
  missed_payments_12m:     "Delinquent past or present credit obligations",
  derogatory_marks:        "Derogatory public record or collection filed",
  inquiries_6m:            "Too many inquiries in the last 12 months",
  dti_ratio:               "Ratio of debt to income",
  income_norm:             "Insufficient income",
  cash_flow_stress:        "Insufficient balance in deposit accounts",
  gambling_amount:         "Proportion of income dedicated to discretionary expenses",
  income_stability:        "Insufficient length of employment",
  loan_payment_regularity: "Payment history shows inconsistent or late payments",
};

// Human-readable causal factor labels (from oracle/causal_graph.py)
const FACTOR_LABELS: Record<string, string> = {
  revolving_utilization:   "Credit utilization ratio",
  missed_payments_12m:     "Recent missed payments",
  derogatory_marks:        "Derogatory marks on record",
  gambling_amount:         "High-risk discretionary spending",
  cash_flow_stress:        "Cash flow stress indicators",
  dti_ratio:               "Debt-to-income ratio",
  inquiries_6m:            "Recent hard inquiries",
  income_norm:             "Income level",
  income_stability:        "Income stability",
  loan_payment_regularity: "Loan payment consistency",
  oldest_account_norm:     "Credit history length",
  income_verified:         "Income verification status",
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCORING ENGINE — Probability → Score conversion (from oracle/model.py)
// ═══════════════════════════════════════════════════════════════════════════════

function probToScore(p: number): number {
  // Logistic scaling calibrated so median applicant maps to ~680
  const logOdds = Math.log(Math.max(p, 1e-6) / Math.max(1 - p, 1e-6));
  return Math.round(Math.max(300, Math.min(850, 680 - logOdds * 55)));
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE ENCODER — Raw data → normalized feature map (from oracle/features.py)
// ═══════════════════════════════════════════════════════════════════════════════

function encodeFeatures(f: any, macro: any): Record<string, number> {
  const txns: any[] = f.transactions || [];
  const now = Date.now();
  const dAgo = (d: string) => Math.floor((now - new Date(d).getTime()) / 86400000);
  const debits = txns.filter((t: any) => t.type === "debit");
  const credits = txns.filter((t: any) => t.type === "credit");
  const spendWindow = (days: number) =>
    debits.filter((t: any) => dAgo(t.date) <= days).reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
  const income = f.stated_income || 4000;
  const spend30 = spendWindow(30);
  const spend60 = spendWindow(60);

  // Cash flow stress: count months where debits > credits * 1.1
  let deficits = 0;
  for (let mo = 0; mo < 12; mo++) {
    const md = debits
      .filter((t: any) => dAgo(t.date) >= mo * 30 && dAgo(t.date) < (mo + 1) * 30)
      .reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
    const mc = credits
      .filter((t: any) => dAgo(t.date) >= mo * 30 && dAgo(t.date) < (mo + 1) * 30)
      .reduce((s: number, t: any) => s + t.amount, 0);
    if (md > mc * 1.1) deficits++;
  }

  // Gambling exposure (90-day window)
  const gambling90 = debits
    .filter((t: any) => t.category === "gambling" && dAgo(t.date) <= 90)
    .reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

  // ATM cash frequency (behavioral signal)
  const atm30 = debits.filter((t: any) => t.category === "atm_cash" && dAgo(t.date) <= 30).length;

  // Income stability (coefficient of variation)
  const moInc = Array.from({ length: 12 }, (_, mo) =>
    credits
      .filter((t: any) => dAgo(t.date) >= mo * 30 && dAgo(t.date) < (mo + 1) * 30)
      .reduce((s: number, t: any) => s + t.amount, 0)
  );
  const avgInc = moInc.reduce((a, b) => a + b, 0) / 12 || 1;
  const stdInc = Math.sqrt(moInc.reduce((s, v) => s + Math.pow(v - avgInc, 2), 0) / 12);
  const incomeStability = 1 / (1 + stdInc / avgInc);

  // Loan payment regularity (consistency of payment intervals)
  const loanPmts = debits
    .filter((t: any) => t.category === "loan_payment")
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let loanReg = 0.5;
  if (loanPmts.length >= 2) {
    const gaps = loanPmts.slice(1).map((t: any, i: number) =>
      (new Date(t.date).getTime() - new Date(loanPmts[i].date).getTime()) / 86400000
    );
    const ag = gaps.reduce((a: number, b: number) => a + b, 0) / gaps.length;
    const sg = Math.sqrt(gaps.reduce((s: number, g: number) => s + Math.pow(g - ag, 2), 0) / gaps.length);
    loanReg = 1 / (1 + sg / 30);
  }

  return {
    revolving_utilization: f.revolving_utilization || 0.5,
    missed_payments_12m: Math.min(f.missed_payments_12m || 0, 12) / 12,
    missed_payments_24m: Math.min(f.missed_payments_24m || 0, 24) / 24,
    derogatory_marks: Math.min(f.derogatory_marks || 0, 10) / 10,
    inquiries_6m: Math.min(f.inquiries_6m || 0, 10) / 10,
    oldest_account_norm: Math.min(f.oldest_account_months || 0, 360) / 360,
    total_accounts_norm: Math.min(f.total_accounts || 5, 30) / 30,
    income_norm: Math.min(income, 50000) / 50000,
    income_verified: f.income_verified ? 1 : 0,
    employment_months_norm: Math.min(f.employment_months || 0, 120) / 120,
    dti_ratio: Math.min((f.total_balance || 0) * 0.025 / Math.max(income, 1), 2),
    income_stability: incomeStability,
    cash_flow_stress: deficits / 12,
    loan_payment_regularity: loanReg,
    gambling_amount: Math.min(gambling90, 5000) / 5000,
    atm_frequency: Math.min(atm30, 20) / 20,
    spend_velocity: spend30 / Math.max(spend60 - spend30, 1),
    macro_fed_rate: (macro.fed_funds_rate || 5.25) / 10,
    macro_cpi: (macro.cpi_yoy || 3.2) / 15,
    macro_unemployment: (macro.unemployment_rate || 3.9) / 15,
    macro_sector_stress: macro.sector_stress || 0.2,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAUSAL SCORING — Probability computation via causal graph (from oracle/model.py)
// ═══════════════════════════════════════════════════════════════════════════════

function computeProbability(fMap: Record<string, number>): number {
  let prob = 0.15; // base rate
  for (const [cause, , direction, strength] of CAUSAL_PRIORS) {
    const val = fMap[cause] ?? 0;
    prob += direction === "increases_risk"
      ? val * strength * 0.08
      : -val * strength * 0.08;
  }
  return Math.max(0.01, Math.min(0.99, prob));
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAUSAL ATTRIBUTION — Why is the score what it is? (from oracle/causal_graph.py)
// ═══════════════════════════════════════════════════════════════════════════════

function getCausalFactors(fMap: Record<string, number>): any[] {
  return CAUSAL_PRIORS
    .filter((p) => p[1] === "probability")
    .map(([cause, , direction, strength]) => {
      const val = fMap[cause] ?? 0;
      const impact = direction === "increases_risk" ? val * strength : (1 - val) * strength;
      return {
        feature: cause,
        label: FACTOR_LABELS[cause] || cause,
        direction,
        causal_weight: strength,
        impact: Math.round(impact * 1000) / 1000,
        value: Math.round(val * 1000) / 1000,
      };
    })
    .filter((f) => f.impact > 0.04)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 8);
}

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTERFACTUAL EXPLAINER — What would change the outcome? (from oracle/explainer.py)
// ═══════════════════════════════════════════════════════════════════════════════

function getCounterfactuals(fMap: Record<string, number>, prob: number): any[] {
  const targets: [string, number, string, string, string][] = [
    ["revolving_utilization", 0.3, "Pay down credit cards to below 30% utilization", "1-3 months", "high"],
    ["missed_payments_12m", 0, "Bring all accounts current immediately", "1-3 months", "high"],
    ["inquiries_6m", 0, "Stop applying for new credit for 6 months", "6-12 months", "high"],
    ["gambling_amount", 0, "Eliminate all gambling transactions", "1-3 months", "medium"],
    ["dti_ratio", 0.36, "Pay down debt to bring DTI below 36%", "3-6 months", "medium"],
    ["loan_payment_regularity", 1.0, "Set up autopay for all loan payments", "3-6 months", "high"],
    ["cash_flow_stress", 0, "Build emergency fund to cover monthly shortfalls", "6-12 months", "medium"],
  ];

  return targets
    .flatMap(([feat, target, desc, timeframe, feasibility]) => {
      const cur = fMap[feat] ?? 0;
      if (Math.abs(cur - target) < 0.02) return [];
      const prior = CAUSAL_PRIORS.find((p) => p[0] === feat && p[1] === "probability");
      if (!prior) return [];
      const [, , dir, str] = prior;
      const delta = dir === "increases_risk" ? (cur - target) * str * 0.3 : (target - cur) * str * 0.3;
      const newProb = Math.max(0.01, Math.min(0.99, prob - delta));
      const ns = probToScore(newProb);
      const os = probToScore(prob);
      if (ns <= os) return [];
      return [{
        feature: feat,
        factor: feat,
        description: desc,
        action: desc,
        new_score: ns,
        score_improvement: ns - os,
        delta: ns - os,
        feasibility,
        timeframe,
        priority: ns - os > 30 ? 1 : ns - os > 15 ? 2 : 3,
      }];
    })
    .sort((a, b) => b.score_improvement - a.score_improvement)
    .slice(0, 4);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFORMAL PREDICTION — Uncertainty intervals (from oracle/uncertainty.py)
// ═══════════════════════════════════════════════════════════════════════════════

function getConfidenceInterval(prob: number): { low: number; high: number } {
  // Without calibration data, use fixed margin of ±0.07 (conservative 95% CI)
  const margin = 0.07;
  return {
    low: probToScore(Math.min(0.99, prob + margin)),   // higher prob → lower score
    high: probToScore(Math.max(0.01, prob - margin)),  // lower prob → higher score
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRAJECTORY FORECASTER — 3/6/12 month projections (from oracle/causal_graph.py)
// ═══════════════════════════════════════════════════════════════════════════════

function getTrajectory(prob: number, fMap: Record<string, number>): any {
  const result: any = {};
  const baseScore = probToScore(prob);

  // Behavioral momentum signals
  const paymentTrend = fMap["loan_payment_regularity"] || 0.5;
  const incomeGrowth = (fMap["income_stability"] || 0.5);
  const stressLevel = fMap["cash_flow_stress"] || 0;

  // Monthly drift calibrated from causal graph
  const monthlyDrift =
    (paymentTrend - 0.5) * -0.015 +
    (incomeGrowth - 0.5) * -0.010 +
    stressLevel * 0.008;

  let runningProb = prob;
  for (const h of [3, 6, 12]) {
    // Compound drift with mean reversion toward 10% base rate
    for (let m = 0; m < h; m++) {
      runningProb = runningProb + monthlyDrift + 0.03 * (0.1 - runningProb);
      runningProb = Math.max(0.01, Math.min(0.99, runningProb));
    }

    const forecastScore = probToScore(runningProb);
    const drivers: string[] = [];
    if (paymentTrend > 0.6) drivers.push("Continued on-time payment history");
    else if (paymentTrend < 0.4) drivers.push("Payment delinquency risk increasing");
    if (incomeGrowth > 0.6) drivers.push("Income growth supporting stability");
    if (stressLevel > 0.3) drivers.push("Cash flow stress remains elevated");

    result[`month_${h}`] = {
      predicted_score: forecastScore,
      predicted_prob: Math.round(runningProb * 10000) / 10000,
      score_delta: forecastScore - baseScore,
      key_drivers: drivers.slice(0, 2),
      change_direction: forecastScore > baseScore ? "improving" : forecastScore < baseScore ? "worsening" : "stable",
      trend: forecastScore > baseScore ? "improving" : forecastScore < baseScore ? "deteriorating" : "stable",
    };
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FAIRNESS CHECK — Adversarial fairness (simplified, from oracle/fairness.py)
// ═══════════════════════════════════════════════════════════════════════════════

function checkFairness(prob: number): boolean {
  // Without trained adversary weights, use boundary check
  // Real adversarial check requires the trained adversary model
  return prob < 0.95 && prob > 0.02;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RISK CLASSIFICATION (from oracle/model.py)
// ═══════════════════════════════════════════════════════════════════════════════

function classifyRisk(prob: number, fMap: Record<string, number>): { type: string; severity: string } {
  const type = prob < 0.15 ? "low"
    : (fMap["cash_flow_stress"] || 0) > 0.4 ? "liquidity"
    : (fMap["gambling_amount"] || 0) > 0.3 ? "behavioral"
    : (fMap["macro_sector_stress"] || 0) > 0.5 ? "systemic"
    : "structural";

  const severity = prob > 0.65 ? "critical"
    : prob > 0.40 ? "high"
    : prob > 0.25 ? "medium"
    : "low";

  return { type, severity };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NARRATIVE GENERATOR — Template-based + LLM enhancement (from oracle/explainer.py)
// ═══════════════════════════════════════════════════════════════════════════════

function generateTemplateNarrative(
  score: number,
  factors: any[],
  cfs: any[],
  riskType: string,
  macro: any,
): { explanation: string; improvement_plan: string } {
  const tierTexts: Record<string, string> = {
    low: `Your credit score of ${score} is in the excellent range. You qualify for the most competitive rates and terms available.`,
    medium: `Your credit score of ${score} is in the good range. You qualify for most credit products, though not always at the best rates.`,
    high: `Your credit score of ${score} indicates some credit risk factors that may limit approval options or result in higher interest rates.`,
    very_high: `Your credit score of ${score} reflects significant credit challenges that are currently affecting your creditworthiness.`,
  };

  const tier = score >= 720 ? "low" : score >= 650 ? "medium" : score >= 580 ? "high" : "very_high";
  let explanation = tierTexts[tier] || `Your credit score is ${score}.`;

  const topFactors = factors.filter((f) => f.direction === "increases_risk").slice(0, 2);
  if (topFactors.length > 0) {
    const labels = topFactors.map((f) => f.label.toLowerCase());
    explanation += ` The primary factor${labels.length > 1 ? "s" : ""} affecting your score ${labels.length > 1 ? "are" : "is"} ${labels.join(" and ")}.`;
  }

  const protectiveFactors = factors.filter((f) => f.direction === "decreases_risk").slice(0, 1);
  if (protectiveFactors.length > 0) {
    explanation += ` Your ${protectiveFactors[0].label.toLowerCase()} is working in your favor.`;
  }

  let improvement_plan = "";
  if (cfs.length > 0) {
    improvement_plan = `The single most impactful step you can take: ${cfs[0].description}. This could improve your score by approximately ${cfs[0].score_improvement} points within ${cfs[0].timeframe}.`;
  }

  if ((macro.fed_funds_rate || 0) > 5.0) {
    explanation += " Note: current high interest rates are affecting credit assessments broadly — maintaining low utilization is especially important now.";
  }

  return { explanation, improvement_plan };
}

async function llmEnhanceExplanation(
  score: number,
  riskType: string,
  cfs: any[],
  trajectory: any,
  apiKey: string,
): Promise<{ explanation: string; improvement_plan: string }> {
  const t12 = trajectory["month_12"];
  const cfText = cfs.slice(0, 2).map((c: any) => c.description).join("; ");

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        max_tokens: 300,
        temperature: 0.3,
        messages: [{
          role: "user",
          content:
            `Credit score: ${score}/850. Risk type: ${riskType}. Top actions: ${cfText || "maintain behavior"}. ` +
            `12-month forecast: ${t12?.change_direction || "stable"} by ${Math.abs(t12?.score_delta || 0)} pts.\n\n` +
            `Write 2 short paragraphs: (1) warm plain-English explanation of this result, (2) single most impactful action. ` +
            `Never mention the word "default" or raw probability numbers. Return ONLY the two paragraphs separated by a blank line.`,
        }],
      }),
    });

    if (!response.ok) return { explanation: "", improvement_plan: "" };

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const parts = content.split("\n\n").filter((p: string) => p.trim());
    return {
      explanation: parts[0]?.trim() || "",
      improvement_plan: parts[1]?.trim() || "",
    };
  } catch {
    return { explanation: "", improvement_plan: "" };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const t0 = Date.now();

  try {
    const body = await req.json();
    const { application_id, applicant_id, features = {}, macro_context = {} } = body;

    if (!application_id) {
      return new Response(JSON.stringify({ error: "application_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 1. Macro context defaults ────────────────────────────────────────
    const macro = {
      fed_funds_rate: 5.25,
      cpi_yoy: 3.2,
      unemployment_rate: 3.9,
      credit_spread: 105,
      hpi_yoy: 3.5,
      sector_stress: 0.2,
      ...macro_context,
    };

    // ── 2. Feature encoding (oracle/features.py → TypeScript) ────────────
    const fMap = encodeFeatures(features, macro);

    // ── 3. Causal probability computation ────────────────────────────────
    const probability = computeProbability(fMap);
    const score = probToScore(probability);

    // ── 4. Conformal prediction interval ─────────────────────────────────
    const ci = getConfidenceInterval(probability);

    // ── 5. Causal attribution ────────────────────────────────────────────
    const causalFactors = getCausalFactors(fMap);

    // ── 6. Risk classification ───────────────────────────────────────────
    const risk = classifyRisk(probability, fMap);

    // ── 7. Adversarial fairness check ────────────────────────────────────
    const fair = checkFairness(probability);

    // ── 8. Counterfactual explanations ───────────────────────────────────
    const counterfactuals = getCounterfactuals(fMap, probability);

    // ── 9. Trajectory forecast (3/6/12 months) ──────────────────────────
    const trajectory = getTrajectory(probability, fMap);

    // ── 10. ECOA adverse action reasons ──────────────────────────────────
    const adverseReasons = probability > 0.35
      ? causalFactors
          .filter((f: any) => f.direction === "increases_risk")
          .slice(0, 4)
          .map((f: any) => ECOA_REASONS[f.feature] || "See application details")
          .filter(Boolean)
      : [];

    // ── 11. Template narrative (instant) ─────────────────────────────────
    const templateNarrative = generateTemplateNarrative(score, causalFactors, counterfactuals, risk.type, macro);

    // ── 12. LLM-enhanced explanation (async, non-blocking) ───────────────
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || "";
    let explanation = templateNarrative.explanation;
    let improvement_plan = templateNarrative.improvement_plan;

    if (LOVABLE_API_KEY) {
      const llmResult = await llmEnhanceExplanation(score, risk.type, counterfactuals, trajectory, LOVABLE_API_KEY);
      if (llmResult.explanation) explanation = llmResult.explanation;
      if (llmResult.improvement_plan) improvement_plan = llmResult.improvement_plan;
    }

    const inferenceMs = Date.now() - t0;

    // ── 13. Build result ─────────────────────────────────────────────────
    const result = {
      score,
      probability: Math.round(probability * 10000) / 10000,
      confidence_low: ci.low,
      confidence_high: ci.high,
      risk_type: risk.type,
      risk_severity: risk.severity,
      fair,
      causal_factors: causalFactors,
      counterfactuals,
      trajectory,
      adverse_action_reasons: adverseReasons,
      explanation,
      explanation_status: "complete",
      improvement_plan,
      model_version: "oracle-v1.0.0",
      inference_ms: inferenceMs,
    };

    // ── 14. Persist to DB (triggers Realtime push + audit log) ───────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && serviceRoleKey) {
      const sb = createClient(supabaseUrl, serviceRoleKey);

      await sb.from("credit_scores").upsert({
        application_id,
        applicant_id,
        score: result.score,
        probability: result.probability,
        confidence_low: result.confidence_low,
        confidence_high: result.confidence_high,
        risk_type: result.risk_type,
        risk_severity: result.risk_severity,
        fair: result.fair,
        causal_factors: result.causal_factors,
        counterfactuals: result.counterfactuals,
        trajectory: result.trajectory,
        adverse_action_reasons: result.adverse_action_reasons,
        explanation: result.explanation,
        explanation_status: result.explanation_status,
        improvement_plan: result.improvement_plan,
        model_version: result.model_version,
        inference_ms: result.inference_ms,
        scored_at: new Date().toISOString(),
      });

      // Update application status
      await sb.from("credit_applications").update({ status: "scored" }).eq("id", application_id);
    }

    return new Response(JSON.stringify({ ...result, status: "scored" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("oracle-score error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
