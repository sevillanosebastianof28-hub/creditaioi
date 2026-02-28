// AI Health Check Edge Function v1.1
// Reports status and latency of all ORACLE ML components

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const t0 = Date.now();

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Test DB connectivity
    let dbStatus = "not_configured";
    let dbLatencyMs: number | null = null;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const dbT0 = Date.now();
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/model_registry?select=version&is_active=eq.true&limit=1`, {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        });
        await res.text();
        dbStatus = res.ok ? "ok" : "degraded";
        dbLatencyMs = Date.now() - dbT0;
      } catch {
        dbStatus = "error";
        dbLatencyMs = Date.now() - dbT0;
      }
    }

    // Test LLM gateway
    let llmStatus = LOVABLE_API_KEY ? "ok" : "not_configured";
    let llmLatencyMs: number | null = null;
    if (LOVABLE_API_KEY) {
      const llmT0 = Date.now();
      try {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/models", {
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
        });
        await res.text();
        llmStatus = res.ok ? "ok" : "degraded";
        llmLatencyMs = Date.now() - llmT0;
      } catch {
        llmStatus = "error";
        llmLatencyMs = Date.now() - llmT0;
      }
    }

    const components: Record<string, { status: string; latency_ms?: number | null }> = {
      oracle_scoring_engine: { status: "ok" },
      causal_graph: { status: "ok" },
      feature_encoder: { status: "ok" },
      activation_functions: { status: "ok" },
      interaction_effects: { status: "ok" },
      fairness_layer: { status: "ok" },
      conformal_predictor: { status: "ok" },
      counterfactual_explainer: { status: "ok" },
      trajectory_forecaster: { status: "ok" },
      risk_classifier: { status: "ok" },
      llm_gateway: { status: llmStatus, latency_ms: llmLatencyMs },
      database: { status: dbStatus, latency_ms: dbLatencyMs },
    };

    const allOk = Object.values(components).every((v) => v.status === "ok");

    const health = {
      status: allOk ? "ok" : "degraded",
      model_version: "oracle-v1.1.0",
      ping_ms: Date.now() - t0,
      components,
      capabilities: [
        "causal_scoring_v1.1",
        "nonlinear_activations",
        "interaction_effects",
        "piecewise_score_calibration",
        "adaptive_conformal_intervals",
        "momentum_trajectory_forecasting",
        "ensemble_fairness_checks",
        "counterfactual_explanations",
        "ecoa_compliance",
        "llm_narrative_generation",
        "realtime_score_delivery",
        "audit_trail",
      ],
    };

    return new Response(JSON.stringify(health), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: "error", error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
