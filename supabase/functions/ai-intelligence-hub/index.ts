import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, creditData } = await req.json();

    if (!action || !creditData) {
      return new Response(JSON.stringify({ error: "Missing action or creditData" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompts: Record<string, string> = {
      generate_insights: `Provide comprehensive credit insights as JSON:
{ "overview": { "averageScore", "category", "bureauScores", "scoreVariance", "negativeItemCount" }, "progress": { "currentCategory", "nextCategory", "pointsNeeded", "estimatedTimeframe" }, "keyInsights": [{ "type" ("success"|"warning"|"alert"|"info"), "title", "message", "action" }], "recommendations": [], "scoringFactors": {} }`,
      score_analysis: `Analyze credit scores across bureaus as JSON:
{ "current": { "average", "experian", "equifax", "transunion" }, "analysis": { "trend", "stability", "riskLevel" }, "breakdown": {} }`,
      impact_assessment: `Assess impact of negative items as JSON:
{ "currentImpact": { "negativeItems", "estimatedPointLoss", "scoreWithoutNegatives" }, "itemBreakdown": [], "recoveryPotential": { "immediate", "threeMonths", "sixMonths", "oneYear" } }`,
    };

    const prompt = `${prompts[action] || "Analyze this credit data and return structured JSON insights."}

Credit Data: ${JSON.stringify(creditData)}

Return ONLY valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an AI credit intelligence engine. Analyze credit data and return structured JSON insights. Be accurate, realistic, and compliant with FCRA. Never guarantee outcomes." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI service unavailable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let insights;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      insights = { raw: content };
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("ai-intelligence-hub error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
