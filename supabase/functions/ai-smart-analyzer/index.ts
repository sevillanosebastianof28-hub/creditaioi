import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { analysisType, items } = await req.json();

    if (!analysisType || !items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: "Missing analysisType or items array" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompts: Record<string, string> = {
      success_prediction: `Analyze these credit report items and predict dispute success probability for each. Return JSON:
{ "totalItems": N, "highPriority": N, "mediumPriority": N, "lowPriority": N, "predictions": [{ "itemId", "creditor", "type", "successProbability" (0-100), "recommendation", "strategy" }] }

Items: ${JSON.stringify(items)}`,
      priority_ranking: `Rank these credit report items by dispute priority (highest impact first). Return JSON:
{ "rankedItems": [{ "rank", "id", "creditor", "type", "balance", "priorityScore", "action" }] }

Items: ${JSON.stringify(items)}`,
      strategy_recommendation: `Recommend a phased dispute strategy for these items. Return JSON:
{ "summary": { "totalItems", "collections", "chargeOffs", "latePayments" }, "strategy": { "phase1", "phase2", "phase3", "timeline" }, "recommendations": [] }

Items: ${JSON.stringify(items)}`,
    };

    const prompt = prompts[analysisType] || `Analyze these credit items (type: ${analysisType}): ${JSON.stringify(items)}. Return structured JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a credit analysis AI. Analyze credit report items and return structured JSON. Be realistic about success probabilities based on item type, age, and balance. Never guarantee outcomes." },
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

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      result = { raw: content };
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("ai-smart-analyzer error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
