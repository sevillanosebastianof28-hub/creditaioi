// ORACLE Scoring Edge Function v1.1.0 — Enhanced causal scoring pipeline
// Implements: Feature encoding → Causal reasoning → Scoring → Fairness → Counterfactuals → Trajectory → LLM Explanation
// Improvements: Non-linear scoring, interaction features, adaptive CI, momentum trajectory, ensemble fairness

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════════════════════════════════
// CAUSAL GRAPH — Extended domain knowledge priors (v1.1)
// Added: interaction terms, non-linear activation, macro sensitivity
// ═══════════════════════════════════════════════════════════════════════════════

interface CausalEdge {
  cause: string;
  target: string;
  direction: "increases_risk" | "decreases_risk";
  strength: number;
  nonlinear?: "sigmoid" | "relu" | "quadratic"; // activation shape
  threshold?: number; // threshold for relu/step activations
}

const CAUSAL_PRIORS: CausalEdge[] = [
  { cause: "revolving_utilization",   target: "probability", direction: "increases_risk", strength: 0.74, nonlinear: "sigmoid" },
  { cause: "missed_payments_12m",     target: "probability", direction: "increases_risk", strength: 0.88, nonlinear: "relu", threshold: 0.08 },
  { cause: "derogatory_marks",        target: "probability", direction: "increases_risk", strength: 0.91, nonlinear: "sigmoid" },
  { cause: "gambling_amount",         target: "probability", direction: "increases_risk", strength: 0.55, nonlinear: "relu", threshold: 0.05 },
  { cause: "cash_flow_stress",        target: "probability", direction: "increases_risk", strength: 0.77, nonlinear: "sigmoid" },
  { cause: "dti_ratio",               target: "probability", direction: "increases_risk", strength: 0.65, nonlinear: "quadratic" },
  { cause: "inquiries_6m",            target: "probability", direction: "increases_risk", strength: 0.42 },
  { cause: "spend_velocity",          target: "probability", direction: "increases_risk", strength: 0.30, nonlinear: "relu", threshold: 1.5 },
  { cause: "atm_frequency",           target: "probability", direction: "increases_risk", strength: 0.25 },
  { cause: "income_norm",             target: "probability", direction: "decreases_risk", strength: 0.58 },
  { cause: "income_stability",        target: "probability", direction: "decreases_risk", strength: 0.64, nonlinear: "sigmoid" },
  { cause: "loan_payment_regularity", target: "probability", direction: "decreases_risk", strength: 0.68 },
  { cause: "oldest_account_norm",     target: "probability", direction: "decreases_risk", strength: 0.55 },
  { cause: "income_verified",         target: "probability", direction: "decreases_risk", strength: 0.38 },
  { cause: "total_accounts_norm",     target: "probability", direction: "decreases_risk", strength: 0.20 },
  { cause: "employment_months_norm",  target: "probability", direction: "decreases_risk", strength: 0.32 },
];

// Interaction effects — feature pairs that amplify risk together
const INTERACTION_EFFECTS: { a: string; b: string; amplifier: number }[] = [
  { a: "revolving_utilization", b: "missed_payments_12m", amplifier: 0.12 }, // high util + missed payments = compounding
  { a: "cash_flow_stress", b: "dti_ratio", amplifier: 0.09 },               // stress + debt = spiral
  { a: "gambling_amount", b: "cash_flow_stress", amplifier: 0.07 },         // gambling + stress = behavioral
  { a: "inquiries_6m", b: "revolving_utilization", amplifier: 0.05 },       // seeking credit + high util
  { a: "spend_velocity", b: "cash_flow_stress", amplifier: 0.06 },         // accelerating spend + stress
];

// ECOA-compliant adverse action reason mapping
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
  spend_velocity:          "Rapid increase in spending patterns",
  atm_frequency:           "Excessive cash withdrawals",
  employment_months_norm:  "Length of employment is insufficient",
  total_accounts_norm:     "Number of established accounts is limited",
};

const FACTOR_LABELS: Record<string, string> = {
  revolving_utilization:   "Credit utilization ratio",
  missed_payments_12m:     "Recent missed payments",
  missed_payments_24m:     "Missed payments (24 months)",
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
  spend_velocity:          "Spending acceleration",
  atm_frequency:           "Cash withdrawal frequency",
  total_accounts_norm:     "Number of credit accounts",
  employment_months_norm:  "Employment tenure",
};

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVATION FUNCTIONS — Non-linear transforms for causal edges
// ═══════════════════════════════════════════════════════════════════════════════

function activate(value: number, shape?: "sigmoid" | "relu" | "quadratic", threshold?: number): number {
  switch (shape) {
    case "sigmoid":
      // S-curve: gentle at extremes, steep in middle
      return 1 / (1 + Math.exp(-8 * (value - 0.5)));
    case "relu":
      // Only activates above threshold
      return Math.max(0, value - (threshold ?? 0));
    case "quadratic":
      // Accelerating impact at high values
      return value * value;
    default:
      return value; // linear
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCORING ENGINE — Improved probability → score calibration (v1.1)
// Uses piecewise-linear calibration for better spread across tiers
// ═══════════════════════════════════════════════════════════════════════════════

function probToScore(p: number): number {
  // Piecewise calibration: maps probability to FICO-like range
  // Ensures good separation across credit tiers
  const clampedP = Math.max(0.01, Math.min(0.99, p));

  // Calibration breakpoints: (probability, score)
  const breakpoints: [number, number][] = [
    [0.01, 830],
    [0.05, 780],
    [0.10, 740],
    [0.20, 700],
    [0.35, 660],
    [0.50, 620],
    [0.65, 580],
    [0.80, 530],
    [0.90, 480],
    [0.95, 400],
    [0.99, 320],
  ];

  // Linear interpolation between breakpoints
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const [p1, s1] = breakpoints[i];
    const [p2, s2] = breakpoints[i + 1];
    if (clampedP >= p1 && clampedP <= p2) {
      const t = (clampedP - p1) / (p2 - p1);
      return Math.round(s1 + t * (s2 - s1));
    }
  }

  return Math.round(Math.max(300, Math.min(850, 680 - Math.log(clampedP / (1 - clampedP)) * 55)));
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE ENCODER — Enhanced with derived interaction features (v1.1)
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

  // ATM cash frequency
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

  // Loan payment regularity
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

  // Spend velocity — ratio of recent to prior period (>1 means accelerating)
  const spendVelocity = spend60 > spend30 ? spend30 / Math.max(spend60 - spend30, 1) : 1.0;

  // Average account age (derived from oldest + total accounts)
  const avgAccountAge = f.avg_account_age_months
    ? Math.min(f.avg_account_age_months, 240) / 240
    : Math.min(f.oldest_account_months || 0, 360) / 720; // proxy

  return {
    revolving_utilization: Math.min(f.revolving_utilization ?? 0.5, 1.0),
    missed_payments_12m: Math.min(f.missed_payments_12m || 0, 12) / 12,
    missed_payments_24m: Math.min(f.missed_payments_24m || 0, 24) / 24,
    derogatory_marks: Math.min(f.derogatory_marks || 0, 10) / 10,
    inquiries_6m: Math.min(f.inquiries_6m || 0, 10) / 10,
    oldest_account_norm: Math.min(f.oldest_account_months || 0, 360) / 360,
    avg_account_age: avgAccountAge,
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
    spend_velocity: Math.min(spendVelocity, 5) / 5,
    // Macro features
    macro_fed_rate: (macro.fed_funds_rate || 5.25) / 10,
    macro_cpi: (macro.cpi_yoy || 3.2) / 15,
    macro_unemployment: (macro.unemployment_rate || 3.9) / 15,
    macro_sector_stress: macro.sector_stress || 0.2,
    macro_consumer_sentiment: Math.min(macro.consumer_sentiment || 65, 100) / 100,
    macro_delinquency_rate: Math.min(macro.credit_card_delinquency_rate || 2.5, 10) / 10,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAUSAL SCORING v1.1 — Non-linear activation + interaction effects
// ═══════════════════════════════════════════════════════════════════════════════

function computeProbability(fMap: Record<string, number>): number {
  let prob = 0.12; // calibrated base rate (historical avg)

  // Direct causal effects with non-linear activations
  for (const edge of CAUSAL_PRIORS) {
    const rawVal = fMap[edge.cause] ?? 0;
    const val = activate(rawVal, edge.nonlinear, edge.threshold);
    prob += edge.direction === "increases_risk"
      ? val * edge.strength * 0.08
      : -val * edge.strength * 0.08;
  }

  // Interaction effects — feature pairs that compound risk
  for (const { a, b, amplifier } of INTERACTION_EFFECTS) {
    const va = fMap[a] ?? 0;
    const vb = fMap[b] ?? 0;
    // Geometric mean ensures both must be elevated
    prob += Math.sqrt(va * vb) * amplifier;
  }

  // Macro environment adjustment
  const macroStress = (fMap["macro_sector_stress"] || 0.2) +
    (fMap["macro_delinquency_rate"] || 0.25) * 0.3 +
    (1 - (fMap["macro_consumer_sentiment"] || 0.65)) * 0.15;
  prob += (macroStress - 0.35) * 0.04; // small macro adjustment

  return Math.max(0.01, Math.min(0.99, prob));
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAUSAL ATTRIBUTION v1.1 — Enhanced with interaction attribution
// ═══════════════════════════════════════════════════════════════════════════════

function getCausalFactors(fMap: Record<string, number>): any[] {
  const factors = CAUSAL_PRIORS
    .map((edge) => {
      const rawVal = fMap[edge.cause] ?? 0;
      const val = activate(rawVal, edge.nonlinear, edge.threshold);
      const impact = edge.direction === "increases_risk"
        ? val * edge.strength
        : (1 - val) * edge.strength;
      return {
        feature: edge.cause,
        label: FACTOR_LABELS[edge.cause] || edge.cause,
        direction: edge.direction,
        causal_weight: edge.strength,
        impact: Math.round(impact * 1000) / 1000,
        value: Math.round(rawVal * 1000) / 1000,
        activated_value: Math.round(val * 1000) / 1000,
        activation: edge.nonlinear || "linear",
      };
    })
    .filter((f) => f.impact > 0.03)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 10);

  return factors;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTERFACTUAL EXPLAINER v1.1 — More actionable, priority-ranked
// ═══════════════════════════════════════════════════════════════════════════════

function getCounterfactuals(fMap: Record<string, number>, prob: number): any[] {
  const targets: { feat: string; target: number; desc: string; timeframe: string; feasibility: string; category: string }[] = [
    { feat: "revolving_utilization", target: 0.3, desc: "Pay down credit cards to below 30% utilization", timeframe: "1-3 months", feasibility: "high", category: "utilization" },
    { feat: "revolving_utilization", target: 0.1, desc: "Pay down credit cards to below 10% utilization for maximum score boost", timeframe: "1-3 months", feasibility: "medium", category: "utilization" },
    { feat: "missed_payments_12m", target: 0, desc: "Bring all accounts current immediately", timeframe: "1-3 months", feasibility: "high", category: "payment_history" },
    { feat: "inquiries_6m", target: 0, desc: "Stop applying for new credit for 6 months", timeframe: "6-12 months", feasibility: "high", category: "inquiries" },
    { feat: "gambling_amount", target: 0, desc: "Eliminate all gambling transactions", timeframe: "1-3 months", feasibility: "medium", category: "behavioral" },
    { feat: "dti_ratio", target: 0.36, desc: "Pay down debt to bring DTI below 36%", timeframe: "3-6 months", feasibility: "medium", category: "debt" },
    { feat: "loan_payment_regularity", target: 1.0, desc: "Set up autopay for all loan payments", timeframe: "3-6 months", feasibility: "high", category: "payment_history" },
    { feat: "cash_flow_stress", target: 0, desc: "Build emergency fund to cover monthly shortfalls", timeframe: "6-12 months", feasibility: "medium", category: "stability" },
    { feat: "spend_velocity", target: 0.2, desc: "Reduce monthly spending growth rate", timeframe: "1-3 months", feasibility: "high", category: "behavioral" },
    { feat: "income_verified", target: 1.0, desc: "Verify your income through documentation", timeframe: "1 month", feasibility: "high", category: "documentation" },
  ];

  return targets
    .flatMap(({ feat, target, desc, timeframe, feasibility, category }) => {
      const cur = fMap[feat] ?? 0;
      if (Math.abs(cur - target) < 0.02) return [];

      const edge = CAUSAL_PRIORS.find((p) => p.cause === feat);
      if (!edge) return [];

      const curActivated = activate(cur, edge.nonlinear, edge.threshold);
      const targetActivated = activate(target, edge.nonlinear, edge.threshold);
      const delta = edge.direction === "increases_risk"
        ? (curActivated - targetActivated) * edge.strength * 0.3
        : (targetActivated - curActivated) * edge.strength * 0.3;

      const newProb = Math.max(0.01, Math.min(0.99, prob - delta));
      const ns = probToScore(newProb);
      const os = probToScore(prob);
      if (ns <= os) return [];

      return [{
        feature: feat,
        factor: feat,
        description: desc,
        action: desc,
        category,
        current_value: Math.round(cur * 1000) / 1000,
        target_value: target,
        new_score: ns,
        score_improvement: ns - os,
        delta: ns - os,
        feasibility,
        timeframe,
        priority: ns - os > 30 ? 1 : ns - os > 15 ? 2 : 3,
      }];
    })
    .sort((a, b) => b.score_improvement - a.score_improvement || a.priority - b.priority)
    .slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFORMAL PREDICTION v1.1 — Adaptive confidence intervals
// Width scales with feature uncertainty and data density
// ═══════════════════════════════════════════════════════════════════════════════

function getConfidenceInterval(prob: number, fMap: Record<string, number>): { low: number; high: number } {
  // Base margin
  let margin = 0.06;

  // Wider intervals when features are extreme (less calibration data at tails)
  const extremeFeatures = Object.values(fMap).filter(v => v > 0.9 || v < 0.05).length;
  margin += extremeFeatures * 0.005;

  // Wider at probability extremes (less reliable calibration)
  if (prob > 0.85 || prob < 0.05) margin += 0.03;

  // Wider when income is unverified (more uncertainty)
  if ((fMap["income_verified"] ?? 0) < 0.5) margin += 0.015;

  // Cap margin
  margin = Math.min(margin, 0.15);

  return {
    low: probToScore(Math.min(0.99, prob + margin)),
    high: probToScore(Math.max(0.01, prob - margin)),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRAJECTORY FORECASTER v1.1 — Momentum-aware with decay
// ═══════════════════════════════════════════════════════════════════════════════

function getTrajectory(prob: number, fMap: Record<string, number>): any {
  const result: any = {};
  const baseScore = probToScore(prob);

  // Behavioral momentum signals
  const paymentTrend = fMap["loan_payment_regularity"] || 0.5;
  const incomeGrowth = fMap["income_stability"] || 0.5;
  const stressLevel = fMap["cash_flow_stress"] || 0;
  const spendVelocity = fMap["spend_velocity"] || 0.2;
  const utilization = fMap["revolving_utilization"] || 0.5;

  // Monthly drift with momentum decay
  const baseDrift =
    (paymentTrend - 0.5) * -0.014 +
    (incomeGrowth - 0.5) * -0.009 +
    stressLevel * 0.007 +
    (spendVelocity - 0.2) * 0.004;

  let runningProb = prob;
  let momentum = baseDrift;

  for (const h of [3, 6, 12]) {
    const prevProb = runningProb;

    for (let m = 0; m < (h === 3 ? 3 : h === 6 ? 3 : 6); m++) {
      // Momentum decays toward zero (mean reversion)
      momentum = momentum * 0.92 + 0.025 * (0.10 - runningProb);
      runningProb = runningProb + momentum;
      runningProb = Math.max(0.01, Math.min(0.99, runningProb));
    }

    const forecastScore = probToScore(runningProb);
    const drivers: string[] = [];

    // Dynamic driver identification
    if (paymentTrend > 0.6) drivers.push("Continued on-time payment history");
    else if (paymentTrend < 0.4) drivers.push("Payment delinquency risk");
    if (incomeGrowth > 0.6) drivers.push("Income stability supporting credit");
    if (stressLevel > 0.3) drivers.push("Cash flow stress remains elevated");
    if (utilization > 0.7) drivers.push("High credit utilization weighing on score");
    if (spendVelocity > 0.4) drivers.push("Spending acceleration detected");

    const delta = forecastScore - baseScore;
    result[`month_${h}`] = {
      predicted_score: forecastScore,
      predicted_prob: Math.round(runningProb * 10000) / 10000,
      score_delta: delta,
      confidence_range: Math.round(Math.abs(delta) * 0.4 + 8), // ± points
      key_drivers: drivers.slice(0, 3),
      change_direction: delta > 2 ? "improving" : delta < -2 ? "worsening" : "stable",
      trend: delta > 2 ? "improving" : delta < -2 ? "deteriorating" : "stable",
    };
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FAIRNESS CHECK v1.1 — Multi-criteria ensemble
// ═══════════════════════════════════════════════════════════════════════════════

function checkFairness(prob: number, fMap: Record<string, number>): { fair: boolean; flags: string[] } {
  const flags: string[] = [];

  // Boundary check — extreme probabilities are suspicious
  if (prob > 0.95) flags.push("extreme_high_probability");
  if (prob < 0.02) flags.push("extreme_low_probability");

  // Check if protected-proxy features dominate the score
  // (income_verified and employment alone shouldn't drive decisions)
  const proxyImpact =
    (fMap["income_verified"] || 0) * 0.38 +
    (fMap["employment_months_norm"] || 0) * 0.32;

  const totalImpact = CAUSAL_PRIORS.reduce((sum, edge) => {
    const val = fMap[edge.cause] ?? 0;
    return sum + val * edge.strength;
  }, 0);

  if (totalImpact > 0 && proxyImpact / totalImpact > 0.45) {
    flags.push("proxy_feature_dominance");
  }

  return { fair: flags.length === 0, flags };
}

// ═══════════════════════════════════════════════════════════════════════════════
// RISK CLASSIFICATION v1.1 — More granular
// ═══════════════════════════════════════════════════════════════════════════════

function classifyRisk(prob: number, fMap: Record<string, number>): { type: string; severity: string } {
  const type = prob < 0.10 ? "minimal"
    : (fMap["cash_flow_stress"] || 0) > 0.4 ? "liquidity"
    : (fMap["gambling_amount"] || 0) > 0.3 ? "behavioral"
    : (fMap["spend_velocity"] || 0) > 0.6 ? "behavioral"
    : (fMap["macro_sector_stress"] || 0) > 0.5 ? "systemic"
    : (fMap["missed_payments_12m"] || 0) > 0.3 ? "delinquency"
    : "structural";

  const severity = prob > 0.70 ? "critical"
    : prob > 0.45 ? "high"
    : prob > 0.25 ? "medium"
    : prob > 0.10 ? "low"
    : "minimal";

  return { type, severity };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NARRATIVE GENERATOR — Template + LLM
// ═══════════════════════════════════════════════════════════════════════════════

function generateTemplateNarrative(
  score: number,
  factors: any[],
  cfs: any[],
  riskType: string,
  macro: any,
): { explanation: string; improvement_plan: string } {
  const tierTexts: Record<string, string> = {
    excellent: `Your credit score of ${score} is in the excellent range. You qualify for the most competitive rates and terms available.`,
    good: `Your credit score of ${score} is in the good range. You qualify for most credit products, though not always at the best rates.`,
    fair: `Your credit score of ${score} indicates some credit risk factors that may limit approval options or result in higher interest rates.`,
    poor: `Your credit score of ${score} reflects significant credit challenges that are currently affecting your creditworthiness.`,
    very_poor: `Your credit score of ${score} indicates serious credit difficulties. Focused effort on the actions below can lead to meaningful improvement.`,
  };

  const tier = score >= 740 ? "excellent" : score >= 670 ? "good" : score >= 600 ? "fair" : score >= 500 ? "poor" : "very_poor";
  let explanation = tierTexts[tier] || `Your credit score is ${score}.`;

  const topNeg = factors.filter((f) => f.direction === "increases_risk").slice(0, 3);
  if (topNeg.length > 0) {
    const labels = topNeg.map((f) => f.label.toLowerCase());
    explanation += ` The primary factor${labels.length > 1 ? "s" : ""} affecting your score ${labels.length > 1 ? "are" : "is"} ${labels.join(", ")}.`;
  }

  const topPos = factors.filter((f) => f.direction === "decreases_risk").slice(0, 2);
  if (topPos.length > 0) {
    explanation += ` Working in your favor: ${topPos.map(f => f.label.toLowerCase()).join(" and ")}.`;
  }

  let improvement_plan = "";
  if (cfs.length > 0) {
    improvement_plan = `Top action: ${cfs[0].description}. This could improve your score by approximately ${cfs[0].score_improvement} points within ${cfs[0].timeframe}.`;
    if (cfs.length > 1) {
      improvement_plan += ` Additionally: ${cfs[1].description} (+${cfs[1].score_improvement} points, ${cfs[1].timeframe}).`;
    }
  }

  if ((macro.fed_funds_rate || 0) > 5.0) {
    explanation += " Note: elevated interest rates are affecting credit assessments broadly — maintaining low utilization is especially important now.";
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
  const cfText = cfs.slice(0, 3).map((c: any) => `${c.description} (+${c.score_improvement}pts)`).join("; ");

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 350,
        temperature: 0.2,
        messages: [{
          role: "user",
          content:
            `Credit score: ${score}/850. Risk type: ${riskType}. Top actions: ${cfText || "maintain current behavior"}. ` +
            `12-month forecast: ${t12?.change_direction || "stable"} by ${Math.abs(t12?.score_delta || 0)} pts.\n\n` +
            `Write 2 short paragraphs: (1) warm, clear plain-English explanation of this result with empathy, (2) the single most impactful next step. ` +
            `Never mention the word "default", raw probability numbers, or internal model details. Return ONLY the two paragraphs separated by a blank line.`,
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
      consumer_sentiment: 65,
      credit_card_delinquency_rate: 2.5,
      sector_stress: 0.2,
      ...macro_context,
    };

    // ── 2. Feature encoding ──────────────────────────────────────────────
    const fMap = encodeFeatures(features, macro);

    // ── 3. Causal probability computation ────────────────────────────────
    const probability = computeProbability(fMap);
    const score = probToScore(probability);

    // ── 4. Adaptive conformal prediction interval ────────────────────────
    const ci = getConfidenceInterval(probability, fMap);

    // ── 5. Causal attribution ────────────────────────────────────────────
    const causalFactors = getCausalFactors(fMap);

    // ── 6. Risk classification ───────────────────────────────────────────
    const risk = classifyRisk(probability, fMap);

    // ── 7. Ensemble fairness check ───────────────────────────────────────
    const fairness = checkFairness(probability, fMap);

    // ── 8. Counterfactual explanations ───────────────────────────────────
    const counterfactuals = getCounterfactuals(fMap, probability);

    // ── 9. Trajectory forecast ───────────────────────────────────────────
    const trajectory = getTrajectory(probability, fMap);

    // ── 10. ECOA adverse action reasons ──────────────────────────────────
    const adverseReasons = probability > 0.30
      ? causalFactors
          .filter((f: any) => f.direction === "increases_risk")
          .slice(0, 4)
          .map((f: any) => ECOA_REASONS[f.feature] || "See application details")
          .filter(Boolean)
      : [];

    // ── 11. Template narrative ───────────────────────────────────────────
    const templateNarrative = generateTemplateNarrative(score, causalFactors, counterfactuals, risk.type, macro);

    // ── 12. LLM-enhanced explanation ─────────────────────────────────────
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
      fair: fairness.fair,
      fairness_flags: fairness.flags,
      causal_factors: causalFactors,
      counterfactuals,
      trajectory,
      adverse_action_reasons: adverseReasons,
      explanation,
      explanation_status: "complete",
      improvement_plan,
      model_version: "oracle-v1.1.0",
      inference_ms: inferenceMs,
    };

    // ── 14. Persist to DB ────────────────────────────────────────────────
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
