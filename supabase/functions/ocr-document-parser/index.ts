import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "Missing imageBase64" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Extract the base64 data and mime type
    const mimeMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/pdf";
    const base64Data = mimeMatch ? mimeMatch[2] : imageBase64;

    const isImage = mimeType.startsWith("image/");

    // For images, use vision capabilities; for PDFs, extract text
    const messages: any[] = [
      {
        role: "system",
        content: `You are a credit report OCR parser. Extract ALL data from the document into structured JSON:
{
  "personalInfo": { "name": "", "address": "", "ssn4": "", "dob": "" },
  "scores": [{ "bureau": "", "score": 0 }],
  "negativeItems": [{ "creditor": "", "accountType": "", "status": "", "balance": 0, "originalBalance": 0, "dateOpened": "", "dateOfFirstDelinquency": "", "bureaus": [], "paymentHistory": "" }],
  "tradelines": [{ "creditor": "", "accountType": "", "balance": 0, "creditLimit": 0, "status": "", "dateOpened": "", "paymentHistory": "" }],
  "collections": [{ "creditor": "", "originalCreditor": "", "balance": 0, "originalAmount": 0, "datePlaced": "", "dateOfFirstDelinquency": "" }],
  "inquiries": [{ "creditor": "", "date": "", "type": "Hard" }],
  "rawText": "full extracted text"
}
Return ONLY valid JSON.`
      },
    ];

    if (isImage) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Parse this credit report image and extract all data into the structured JSON format." },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
        ],
      });
    } else {
      // For PDFs, just ask to parse the base64
      messages.push({
        role: "user",
        content: `Parse this credit report document (base64 PDF) and extract all data into structured JSON. Base64 data (first 5000 chars): ${base64Data.slice(0, 5000)}`,
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
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
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { rawText: content };
    } catch {
      result = { rawText: content };
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("ocr-document-parser error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
