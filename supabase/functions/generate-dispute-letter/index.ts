import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { letterType, disputableItem, customInstructions, forceTemplate } = await req.json();

    if (!letterType || !disputableItem) {
      return new Response(JSON.stringify({ error: "Missing letterType or disputableItem" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Generate a professional FCRA-compliant dispute letter.

Letter Type: ${letterType}
Creditor: ${disputableItem.creditor || "Unknown"}
Account Number: ${disputableItem.accountNumber || "Not provided"}
Issue: ${disputableItem.issueType || disputableItem.disputeReason || "Inaccurate reporting"}
Dispute Reason: ${disputableItem.disputeReason || "Data inaccuracy"}
Applicable Law: ${disputableItem.applicableLaw || "FCRA Section 611"}
Bureaus: ${(disputableItem.bureaus || ["All three bureaus"]).join(", ")}
${customInstructions ? `Additional Instructions: ${customInstructions}` : ""}

Return ONLY valid JSON:
{
  "letter": "Full letter content with proper formatting, date, addresses, legal references, and signature line",
  "letterType": "${letterType}",
  "bureaus": ${JSON.stringify(disputableItem.bureaus || ["experian", "equifax", "transunion"])},
  "creditor": "${disputableItem.creditor || ""}",
  "legalBasis": "Applicable FCRA section"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a professional credit dispute letter writer. Generate FCRA-compliant letters that are firm, professional, and legally sound. Include proper formatting with date, sender address placeholder, bureau address, reference numbers, legal citations, and signature line. Return ONLY valid JSON." },
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
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { letter: content };
    } catch {
      result = { letter: content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("generate-dispute-letter error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
