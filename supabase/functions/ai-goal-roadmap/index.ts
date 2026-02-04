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
    const { currentScore, targetScore, goalType, creditData, stream } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const LOCAL_AI_BASE_URL = Deno.env.get("LOCAL_AI_BASE_URL");
    
    if (!LOCAL_AI_BASE_URL && !LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `As an expert credit analyst, generate a detailed roadmap for this client to reach their credit score goal.

CURRENT SITUATION:
- Current Score: ${currentScore}
- Target Score: ${targetScore}
- Goal Type: ${goalType} (e.g., mortgage qualification, auto loan, general improvement)
${creditData ? `
- Active Negative Items: ${creditData.negativeItems || 0}
- Collections: ${creditData.collections || 0}
- Late Payments: ${creditData.latePayments || 0}
- Credit Utilization: ${creditData.utilization || 'Unknown'}%
- Average Account Age: ${creditData.avgAccountAge || 'Unknown'}
` : ''}

Generate a JSON response with this exact structure:
{
  "estimatedTimelineMonths": <number>,
  "pointsNeeded": <number>,
  "confidence": <"high" | "medium" | "low">,
  "milestones": [
    {
      "month": <number>,
      "action": "<specific action>",
      "expectedPoints": <number>,
      "priority": <"high" | "medium" | "low">
    }
  ],
  "keyActions": [
    {
      "action": "<action description>",
      "impact": "<high | medium | low>",
      "timeline": "<timeframe>"
    }
  ],
  "warnings": ["<any warnings or considerations>"],
  "qualificationProbability": <0-100>
}

Be realistic and conservative with estimates. Consider typical credit bureau timelines.`;

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
      await sendEvent('status', { type: 'status', message: 'Generating roadmap...' });
    }

    const parseJson = (text: string) => {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(text);
    };

    if (LOCAL_AI_BASE_URL) {
      const response = await fetch(`${LOCAL_AI_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: "You are an expert credit analyst. Always respond with valid JSON only, no markdown.",
          user: prompt,
          max_new_tokens: 700,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        if (stream) {
          await sendEvent('error', { type: 'error', message: 'AI service error' });
          await writer?.close();
          return new Response(streamBody?.readable, {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
        throw new Error("AI service error");
      }

      const data = await response.json();
      const roadmap = parseJson(data?.content || "{}");
      if (stream) {
        await sendEvent('result', { type: 'result', result: { roadmap } });
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
      return new Response(JSON.stringify({ roadmap }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
          { role: "system", content: "You are an expert credit analyst. Always respond with valid JSON only, no markdown." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_roadmap",
              description: "Generate a credit improvement roadmap",
              parameters: {
                type: "object",
                properties: {
                  estimatedTimelineMonths: { type: "number" },
                  pointsNeeded: { type: "number" },
                  confidence: { type: "string", enum: ["high", "medium", "low"] },
                  milestones: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        month: { type: "number" },
                        action: { type: "string" },
                        expectedPoints: { type: "number" },
                        priority: { type: "string", enum: ["high", "medium", "low"] }
                      },
                      required: ["month", "action", "expectedPoints", "priority"]
                    }
                  },
                  keyActions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        impact: { type: "string", enum: ["high", "medium", "low"] },
                        timeline: { type: "string" }
                      },
                      required: ["action", "impact", "timeline"]
                    }
                  },
                  warnings: { type: "array", items: { type: "string" } },
                  qualificationProbability: { type: "number" }
                },
                required: ["estimatedTimelineMonths", "pointsNeeded", "confidence", "milestones", "keyActions", "qualificationProbability"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_roadmap" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        if (stream) {
          await sendEvent('error', { type: 'error', message: 'Rate limit exceeded' });
          await writer?.close();
          return new Response(streamBody?.readable, {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (stream) {
        await sendEvent('error', { type: 'error', message: 'AI service error' });
        await writer?.close();
        return new Response(streamBody?.readable, {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const roadmap = JSON.parse(toolCall.function.arguments);
      if (stream) {
        await sendEvent('result', { type: 'result', result: { roadmap } });
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
      return new Response(JSON.stringify({ roadmap }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (stream) {
      await sendEvent('error', { type: 'error', message: 'Failed to generate roadmap' });
      await writer?.close();
      return new Response(streamBody?.readable, {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    throw new Error("Failed to generate roadmap");
  } catch (error: unknown) {
    console.error("Goal roadmap error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
