import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const systemPrompt = `You are an expert credit repair letter optimizer. Your job is to take an existing dispute letter and make it MORE effective by:

1. **Strengthening Legal Citations**: Add or improve specific legal references (FCRA sections, FDCPA, HIPAA, etc.)
2. **Clarifying Demands**: Make the action requests more specific with clear deadlines
3. **Professional Tone**: Ensure the language is assertive but professional
4. **Eliminating Weaknesses**: Remove vague language, add concrete details where possible
5. **Adding Compliance Pressure**: Include consequences for non-compliance (FTC complaints, lawsuits, etc.)
6. **Improving Structure**: Better organization with clear paragraphs and logical flow

IMPORTANT RULES:
- Keep all original factual information (names, account numbers, dates, amounts)
- Keep placeholder brackets like [YOUR NAME], [ACCOUNT NUMBER] intact
- Do NOT add fabricated details or claim things not in the original
- Output ONLY the improved letter text, no explanations or markdown
- Maintain a formal letter format with proper spacing`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { letterContent, letterType, creditor, stream } = await req.json();

    if (!letterContent) {
      return new Response(
        JSON.stringify({ error: "Letter content is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = `Please optimize and strengthen this ${letterType || 'dispute'} letter${creditor ? ` regarding ${creditor}` : ''}:

---
${letterContent}
---

Improve this letter to be more legally compelling and effective while preserving all factual information.`;

    console.log("Optimizing dispute letter");

    const encoder = new TextEncoder();
    const streamBody = stream ? new TransformStream() : null;
    const writer = streamBody ? streamBody.writable.getWriter() : null;

    const sendEvent = async (event: string, data: Record<string, unknown>) => {
      if (!writer) return;
      await writer.write(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      );
    };

    if (stream) {
      await sendEvent('status', { type: 'status', message: 'Optimizing letter...' });
    }

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        if (stream) {
          await sendEvent('error', { type: 'error', message: 'Rate limit exceeded. Please try again in a moment.' });
          await writer?.close();
          return new Response(streamBody?.readable, {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        if (stream) {
          await sendEvent('error', { type: 'error', message: 'AI credits exhausted.' });
          await writer?.close();
          return new Response(streamBody?.readable, {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (stream) {
        await sendEvent('error', { type: 'error', message: 'Failed to optimize letter.' });
        await writer?.close();
        return new Response(streamBody?.readable, {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      return new Response(
        JSON.stringify({ error: "Failed to optimize letter." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const optimizedLetter = aiResponse.choices?.[0]?.message?.content;

    if (!optimizedLetter) {
      if (stream) {
        await sendEvent('error', { type: 'error', message: 'No optimized letter generated' });
        await writer?.close();
        return new Response(streamBody?.readable, {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
      return new Response(
        JSON.stringify({ error: "No optimized letter generated" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Letter optimized successfully");

    if (stream) {
      await sendEvent('result', { type: 'result', result: { optimizedLetter } });
      await writer?.close();
      return new Response(streamBody?.readable, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        },
      });
    }

    return new Response(
      JSON.stringify({ optimizedLetter }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in optimize-dispute-letter function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
