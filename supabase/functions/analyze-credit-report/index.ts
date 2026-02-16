import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { reportText, userId } = await req.json();

    if (!reportText || reportText.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Insufficient report data" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Analyze this credit report and identify all disputable items. Return ONLY valid JSON with this exact structure:
{
  "summary": {
    "totalAccounts": 0,
    "disputableItems": 0,
    "estimatedScoreIncrease": 0,
    "highPriorityItems": 0,
    "avgDeletionProbability": 0
  },
  "items": [
    {
      "id": "item_1",
      "creditor": "Name",
      "accountNumber": "XXXX1234",
      "accountType": "Collection|ChargeOff|LatePayment|Inquiry|etc",
      "issueType": "description of the issue",
      "balance": 0,
      "disputeReason": "specific reason under FCRA",
      "deletionProbability": 75,
      "expectedScoreImpact": 15,
      "applicableLaw": "FCRA Section 611|605b|etc",
      "strategy": "recommended approach",
      "priority": "high|medium|low",
      "bureaus": ["experian","equifax","transunion"]
    }
  ],
  "recommendations": ["actionable recommendation 1", "recommendation 2"]
}

Be realistic about deletion probabilities. Prioritize items by score impact. Never guarantee outcomes.

CREDIT REPORT:
${reportText.slice(0, 8000)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert credit report analyst. Analyze credit reports for errors, inaccuracies, and disputable items under FCRA. Return ONLY valid JSON. Be thorough but realistic." },
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
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: null, items: [], recommendations: [] };
    } catch {
      result = { summary: null, items: [], recommendations: [content] };
    }

    // Ensure items have IDs
    if (result.items) {
      result.items = result.items.map((item: any, i: number) => ({
        ...item,
        id: item.id || `item_${i + 1}`,
      }));
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("analyze-credit-report error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
