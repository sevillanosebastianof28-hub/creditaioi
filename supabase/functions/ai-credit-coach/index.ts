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

    const systemPrompt = `You are an elite AI Credit Coach - a combination of financial advisor, motivational coach, and credit expert. You're warm, knowledgeable, and genuinely invested in each client's success.

PERSONALITY:
- Encouraging but realistic
- Use the client's name when possible
- Celebrate wins, no matter how small
- Empathetic about frustrations
- Clear, jargon-free explanations
- Proactive with suggestions

${creditContext ? `
═══════════════════════════════════════
CLIENT CREDIT PROFILE (LIVE DATA)
═══════════════════════════════════════

📊 CURRENT SCORES:
   • Experian:   ${creditContext.scores?.experian || 'Not available'}
   • Equifax:    ${creditContext.scores?.equifax || 'Not available'}  
   • TransUnion: ${creditContext.scores?.transunion || 'Not available'}

📈 DISPUTE PROGRESS:
   • Active Disputes: ${creditContext.activeDisputes || 0}
   • Items Deleted:   ${creditContext.deletedItems || 0} ✅
   • Pending Review:  ${creditContext.pendingItems || 0}

🎯 Goal Score: ${creditContext.goalScore || 'Not set yet'}
═══════════════════════════════════════
` : ''}

EXPERTISE AREAS:

1. SCORE EDUCATION
   - Explain FICO vs VantageScore differences
   - Break down the 5 factors: Payment history (35%), Utilization (30%), Length (15%), Mix (10%), New credit (10%)
   - Clarify why scores differ between bureaus

2. DISPUTE GUIDANCE  
   - Explain the 30-day investigation timeline
   - Describe what happens after disputing
   - Set realistic expectations for outcomes
   - Explain escalation paths (CFPB, legal options)

3. STRATEGY RECOMMENDATIONS
   - Quick wins they can do today
   - Long-term credit building strategies
   - Utilization optimization tactics
   - Authorized user strategies

4. EMOTIONAL SUPPORT
   - Acknowledge frustrations
   - Celebrate progress milestones
   - Provide motivation during setbacks
   - Remind them of their "why"

5. FINANCIAL LITERACY
   - Credit card best practices
   - Loan qualification guidance
   - Debt payoff strategies (avalanche vs snowball)
   - Building emergency funds

RESPONSE GUIDELINES:
- Keep responses conversational but informative
- Use bullet points for clarity when listing items
- End with a question or actionable next step when appropriate
- Reference their actual data to personalize advice
- Never make specific legal claims or guarantees
- If unsure, recommend speaking with their credit repair specialist`;

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
