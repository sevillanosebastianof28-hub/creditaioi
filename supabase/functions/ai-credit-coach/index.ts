import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, creditContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert AI Credit Coach for a credit repair platform. Your role is to help clients understand their credit situation, answer questions about credit repair, and provide personalized guidance.

${creditContext ? `CURRENT CLIENT CREDIT DATA:
- Current Scores: Experian: ${creditContext.scores?.experian || 'N/A'}, Equifax: ${creditContext.scores?.equifax || 'N/A'}, TransUnion: ${creditContext.scores?.transunion || 'N/A'}
- Active Disputes: ${creditContext.activeDisputes || 0}
- Items Deleted: ${creditContext.deletedItems || 0}
- Pending Items: ${creditContext.pendingItems || 0}
- Goal Score: ${creditContext.goalScore || 'Not set'}
` : ''}

GUIDELINES:
1. Be encouraging and supportive - credit repair can be stressful
2. Explain complex credit concepts in simple terms
3. Provide actionable advice based on their specific situation
4. Never guarantee specific outcomes or timelines
5. Encourage patience - credit repair takes time
6. Reference their actual data when available
7. Be concise but thorough
8. If asked about legal matters, recommend consulting a professional

CAPABILITIES:
- Explain score changes and why they happen
- Clarify dispute processes and timelines
- Provide tips for improving credit
- Answer questions about credit reports
- Motivate clients during the repair journey
- Explain what items are most impacting their score`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service temporarily unavailable");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: unknown) {
    console.error("AI Credit Coach error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
