import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { currentScore, targetScore, goalType = "general", timeframe = 12 } = await req.json();

    if (!currentScore || !targetScore) {
      return new Response(JSON.stringify({ error: "Missing currentScore or targetScore" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Generate a credit score improvement roadmap as ONLY valid JSON:
{
  "overview": { "currentScore": ${currentScore}, "targetScore": ${targetScore}, "pointsToGain": ${targetScore - currentScore}, "difficulty": "", "monthlyTarget": "" },
  "milestones": [{ "milestone": "", "targetScore": 0, "timeframe": "", "actions": [], "focus": "" }],
  "phases": [{ "phase": 1, "name": "", "duration": "", "goals": [], "expectedGain": "", "priority": "" }],
  "keyActions": [],
  "warnings": [],
  "tips": []
}

Goal: ${goalType}, Timeframe: ${timeframe} months. Be realistic. Never guarantee outcomes. Return ONLY valid JSON, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a credit improvement strategist. Return ONLY valid JSON. Be realistic and FCRA compliant. Never guarantee outcomes." },
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

    let roadmap;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      roadmap = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      roadmap = { raw: content };
    }

    return new Response(JSON.stringify({ roadmap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("ai-goal-roadmap error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
