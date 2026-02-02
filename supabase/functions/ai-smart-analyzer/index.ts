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
    const { analysisType, items, bureau, stream } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const LOCAL_AI_BASE_URL = Deno.env.get("LOCAL_AI_BASE_URL");
    
    if (!LOCAL_AI_BASE_URL && !LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an elite credit repair analyst with 15+ years of experience and deep expertise in FCRA, FDCPA, HIPAA, and consumer protection laws. Provide data-driven, actionable analysis.`;

    let prompt = "";
    let toolSchema: any = {};

    if (analysisType === "success_prediction") {
      prompt = `Analyze dispute items and predict success probability:\n\n${JSON.stringify(items, null, 2)}\n\nEvaluate legal vulnerabilities, deletion probability factors, and provide strategic recommendations.`;
      toolSchema = {
        name: "predict_success",
        description: "Predict dispute success",
        parameters: {
          type: "object",
          properties: {
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  itemId: { type: "string" },
                  successProbability: { type: "number" },
                  confidence: { type: "string", enum: ["high", "medium", "low"] },
                  bestStrategy: { type: "string" },
                  estimatedDays: { type: "number" },
                  riskFactors: { type: "array", items: { type: "string" } },
                  recommendedLetterType: { type: "string" }
                },
                required: ["itemId", "successProbability", "confidence", "bestStrategy"]
              }
            }
          },
          required: ["predictions"]
        }
      };
    } else if (analysisType === "bureau_forecast") {
      prompt = `Forecast bureau responses for ${bureau}:\n\n${JSON.stringify(items, null, 2)}`;
      toolSchema = {
        name: "forecast_responses",
        description: "Forecast bureau responses",
        parameters: {
          type: "object",
          properties: {
            forecasts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  itemId: { type: "string" },
                  estimatedResponseDate: { type: "string" },
                  daysRemaining: { type: "number" },
                  likelyOutcome: { type: "string", enum: ["deleted", "verified", "updated", "investigating"] },
                  outcomeProbability: { type: "number" },
                  nextSteps: { type: "string" }
                },
                required: ["itemId", "estimatedResponseDate", "daysRemaining", "likelyOutcome"]
              }
            },
            bureauInsights: {
              type: "object",
              properties: {
                averageResponseDays: { type: "number" },
                currentBacklog: { type: "string", enum: ["low", "normal", "high"] },
                recommendations: { type: "array", items: { type: "string" } }
              }
            }
          },
          required: ["forecasts"]
        }
      };
    } else if (analysisType === "smart_priority") {
      prompt = `Prioritize disputable items by score impact:\n\n${JSON.stringify(items, null, 2)}`;
      toolSchema = {
        name: "prioritize_items",
        description: "Prioritize items by score impact",
        parameters: {
          type: "object",
          properties: {
            prioritizedItems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  itemId: { type: "string" },
                  rank: { type: "number" },
                  estimatedScoreImpact: { type: "number" },
                  priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  reasoning: { type: "string" },
                  recommendedAction: { type: "string" },
                  disputeNow: { type: "boolean" }
                },
                required: ["itemId", "rank", "estimatedScoreImpact", "priority", "reasoning"]
              }
            },
            summary: {
              type: "object",
              properties: {
                totalPotentialGain: { type: "number" },
                criticalItems: { type: "number" },
                quickWins: { type: "number" },
                recommendedBatchSize: { type: "number" }
              }
            }
          },
          required: ["prioritizedItems"]
        }
      };
    } else {
      throw new Error("Invalid analysis type");
    }

    const parseJson = (text: string) => {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(text);
    };

    if (stream) {
      const encoder = new TextEncoder();
      const streamBody = new TransformStream();
      const writer = streamBody.writable.getWriter();

      const sendEvent = async (event: string, data: Record<string, unknown>) => {
        await writer.write(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      await sendEvent('status', { type: 'status', message: 'Analyzing items...' });

      if (LOCAL_AI_BASE_URL) {
        try {
          const response = await fetch(`${LOCAL_AI_BASE_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system: systemPrompt,
              user: `${prompt}\n\nReturn JSON only for: ${JSON.stringify(toolSchema.parameters)}`,
              max_new_tokens: 700,
              temperature: 0.2
            })
          });

          if (!response.ok) {
            await sendEvent('error', { type: 'error', message: 'AI service error' });
            await writer.close();
            return new Response(streamBody.readable, {
              status: 502,
              headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
            });
          }

          const data = await response.json();
          const result = parseJson(data?.content || "{}");
          await sendEvent('result', { type: 'result', result, analysisType });
          await writer.close();
          return new Response(streamBody.readable, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive"
            },
          });
        } catch (error) {
          console.error("Local AI error:", error);
          await sendEvent('error', { type: 'error', message: 'AI service error' });
          await writer.close();
          return new Response(streamBody.readable, {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
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
            { role: "user", content: prompt },
          ],
          tools: [{ type: "function", function: toolSchema }],
          tool_choice: { type: "function", function: { name: toolSchema.name } },
          stream: true
        }),
      });

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          await sendEvent('error', { type: 'error', message: 'Rate limit exceeded' });
          await writer.close();
          return new Response(streamBody.readable, {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
        await sendEvent('error', { type: 'error', message: 'AI service error' });
        await writer.close();
        return new Response(streamBody.readable, {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let toolArgs = '';
      let streamComplete = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamComplete = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const toolCalls = parsed.choices?.[0]?.delta?.tool_calls || [];

            for (const call of toolCalls) {
              if (!call?.function) continue;
              if (call.function.name && call.function.name !== toolSchema.name) continue;
              if (call.function.arguments) {
                toolArgs += call.function.arguments;
              }
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }

        if (streamComplete) {
          await reader.cancel();
          break;
        }
      }

      await sendEvent('status', { type: 'status', message: 'Finalizing results...' });

      try {
        const result = JSON.parse(toolArgs);
        await sendEvent('result', { type: 'result', result, analysisType });
      } catch (error) {
        console.error('Tool parse error:', error);
        await sendEvent('error', { type: 'error', message: 'Failed to parse AI response' });
      }

      await writer.close();
      return new Response(streamBody.readable, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        },
      });
    }

    if (LOCAL_AI_BASE_URL) {
      const response = await fetch(`${LOCAL_AI_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          user: `${prompt}\n\nReturn JSON only for: ${JSON.stringify(toolSchema.parameters)}`,
          max_new_tokens: 700,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error("AI service error");
      }

      const data = await response.json();
      const result = parseJson(data?.content || "{}");
      return new Response(JSON.stringify({ result, analysisType }), {
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
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        tools: [{ type: "function", function: toolSchema }],
        tool_choice: { type: "function", function: { name: toolSchema.name } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ result, analysisType }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Failed to analyze");
  } catch (error: unknown) {
    console.error("Smart analyzer error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
