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

    const prompt = `You are analyzing a credit report. Follow these STRICT rules for consistency:

CLASSIFICATION RULES (apply these deterministically):
- Collection accounts → accountType: "Collection", priority: "high", applicableLaw: "FDCPA Section 809"
- Charge-offs → accountType: "ChargeOff", priority: "high", applicableLaw: "FCRA Section 611"
- Late payments (30-59 days) → accountType: "LatePayment", priority: "medium", applicableLaw: "FCRA Section 611"
- Late payments (60+ days) → accountType: "LatePayment", priority: "high", applicableLaw: "FCRA Section 611"
- Hard inquiries (>2 years) → accountType: "Inquiry", priority: "low", applicableLaw: "FCRA Section 605"
- Hard inquiries (<2 years, unauthorized) → accountType: "Inquiry", priority: "medium", applicableLaw: "FCRA Section 604"
- Medical debt → accountType: "MedicalDebt", priority: "high", applicableLaw: "FCRA Section 605(a)"
- Identity errors / wrong info → accountType: "PersonalInfo", priority: "high", applicableLaw: "FCRA Section 611"

DELETION PROBABILITY RULES (use these fixed ranges, do NOT vary randomly):
- Collection with no original creditor verification: 70-85%
- Collection older than 5 years: 75-90%
- Charge-off with balance discrepancy: 55-70%
- Late payment (single occurrence): 30-45%
- Late payment (pattern): 15-25%
- Unauthorized inquiry: 80-95%
- Medical debt under $500: 85-95%
- Default (if none match): 40-55%

SCORE IMPACT RULES (use these fixed ranges):
- Collection removal: 15-40 points (higher balance = higher impact)
- Charge-off removal: 20-50 points
- Late payment removal: 5-20 points per occurrence
- Inquiry removal: 3-10 points
- Balance under $1000: use lower end of range
- Balance over $5000: use upper end of range

Return ONLY valid JSON with this exact structure:
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
      "accountType": "Collection|ChargeOff|LatePayment|Inquiry|MedicalDebt|PersonalInfo",
      "issueType": "description of the issue",
      "balance": 0,
      "disputeReason": "specific reason under FCRA/FDCPA",
      "deletionProbability": 75,
      "expectedScoreImpact": 15,
      "applicableLaw": "FCRA Section 611",
      "strategy": "recommended approach",
      "priority": "high|medium|low",
      "bureaus": ["experian","equifax","transunion"]
    }
  ],
  "recommendations": ["actionable recommendation 1", "recommendation 2"]
}

IMPORTANT: Apply rules consistently. Same account type and conditions MUST produce same classification, probability range, and score impact range every time. Never guarantee outcomes. Sort items by priority (high first) then by expectedScoreImpact (descending).

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
        temperature: 0,
        messages: [
          { role: "system", content: "You are a deterministic credit report analyst. You MUST classify items using the exact rules provided. Same inputs must produce same outputs. Apply deletion probability and score impact from the fixed ranges specified. Return ONLY valid JSON. Never guarantee outcomes or make legal promises." },
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
