import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  explain_credit: "You are an expert credit educator. Explain credit concepts clearly, referencing FICO scoring factors (Payment History 35%, Utilization 30%, Credit Age 15%, Mix 10%, New Credit 10%). Be accurate and concise. Never guarantee outcomes.",
  analyze_dispute: "You are a credit dispute analyst. Analyze dispute items for potential inaccuracies under FCRA. Assess likelihood of success, recommend dispute reasons, and suggest documentation needed. Be thorough but concise.",
  generate_strategy: "You are a credit repair strategist. Create phased action plans with realistic timelines. Consider the client's specific situation. Never recommend illegal actions or guarantee results.",
  classify_dispute: "You are a dispute eligibility classifier. Determine if an item is Eligible, Conditionally Eligible, Not Eligible, or Insufficient Information for dispute. Provide reasoning.",
  generate_letter: "You are a professional dispute letter writer. Generate FCRA-compliant dispute letters that are firm but professional. Include specific legal references. Never use threatening language.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, input, userId, stream = false } = await req.json();

    if (!action || !input) {
      return new Response(JSON.stringify({ error: "Missing action or input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[action] || "You are an AI credit repair assistant. Be helpful, accurate, and compliant with FCRA guidelines.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: typeof input === "string" ? input : JSON.stringify(input) },
        ],
        stream,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI service unavailable");
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("ai-orchestrator error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
