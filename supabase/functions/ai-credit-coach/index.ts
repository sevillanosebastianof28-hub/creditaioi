import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, creditContext, stream = true } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let scoreContext = "";
    if (creditContext?.scores) {
      const scores = creditContext.scores;
      const vals = [scores.experian, scores.equifax, scores.transunion].filter((s: number) => s > 0);
      if (vals.length) {
        const avg = Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length);
        scoreContext = `\n\nClient's current credit scores: Experian=${scores.experian || "N/A"}, Equifax=${scores.equifax || "N/A"}, TransUnion=${scores.transunion || "N/A"} (avg: ${avg}). Negative items: ${creditContext.negativeItems || 0}. Utilization: ${creditContext.utilization || "unknown"}%.`;
      }
    }

    const systemPrompt = `You are an expert AI Credit Coach for a professional credit repair platform. You provide personalized, actionable credit advice based on FCRA, FDCPA, and credit scoring models. Be concise, professional, and empathetic. Never guarantee specific outcomes. Always recommend consulting with a professional for legal matters.${scoreContext}

Key rules:
- Focus on education and actionable steps
- Reference FICO score ranges and factors accurately
- Never advise illegal actions or credit repair scams
- Be encouraging but realistic about timelines
- Keep responses focused and under 400 words`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
    return new Response(JSON.stringify({ message: data.choices?.[0]?.message?.content || "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("ai-credit-coach error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
