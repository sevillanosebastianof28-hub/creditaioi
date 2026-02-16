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
      generate_insights: `Provide comprehensive credit insights as ONLY valid JSON:
{ "overview": { "averageScore": 0, "category": "", "bureauScores": {}, "scoreVariance": 0, "negativeItemCount": 0 }, "progress": { "currentCategory": "", "nextCategory": "", "pointsNeeded": 0, "estimatedTimeframe": "" }, "keyInsights": [{ "type": "success", "title": "", "message": "", "action": "" }], "recommendations": [], "scoringFactors": {} }`,
      score_analysis: `Analyze credit scores across bureaus as ONLY valid JSON:
{ "current": { "average": 0, "experian": 0, "equifax": 0, "transunion": 0 }, "analysis": { "trend": "", "stability": "", "riskLevel": "" }, "breakdown": {} }`,
      impact_assessment: `Assess impact of negative items as ONLY valid JSON:
{ "currentImpact": { "negativeItems": 0, "estimatedPointLoss": 0, "scoreWithoutNegatives": 0 }, "itemBreakdown": [], "recoveryPotential": { "immediate": 0, "threeMonths": 0, "sixMonths": 0, "oneYear": 0 } }`,
    };

    const prompt = `${prompts[action] || "Analyze this credit data and return structured JSON insights."}

Credit Data: ${JSON.stringify(creditData)}

Return ONLY valid JSON, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an AI credit intelligence engine. Return ONLY valid JSON. Be accurate, realistic, and FCRA compliant. Never guarantee outcomes." },
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
