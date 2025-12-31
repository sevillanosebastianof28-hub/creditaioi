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
    const { analysisType, items, bureau } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let prompt = "";
    let toolSchema: any = {};

    if (analysisType === "success_prediction") {
      prompt = `Analyze these dispute items and predict success probability for each:

ITEMS TO ANALYZE:
${JSON.stringify(items, null, 2)}

For each item, consider:
- Type of negative item (collection, late payment, inquiry, etc.)
- Age of the item
- Whether documentation issues exist
- Bureau-specific patterns
- Legal violation potential (FCRA, FDCPA, etc.)

Provide realistic success predictions based on industry data.`;

      toolSchema = {
        name: "predict_success",
        description: "Predict dispute success for items",
        parameters: {
          type: "object",
          properties: {
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  itemId: { type: "string" },
                  successProbability: { type: "number", minimum: 0, maximum: 100 },
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
      prompt = `Predict bureau response timeline and likely outcomes for disputes sent to ${bureau}:

PENDING DISPUTES:
${JSON.stringify(items, null, 2)}

Consider:
- ${bureau}'s typical response patterns
- Current time of year (holiday delays, etc.)
- Item types and complexity
- Historical patterns for similar disputes

Provide realistic forecasts.`;

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
      prompt = `Analyze and prioritize these disputable items by potential score impact:

ITEMS:
${JSON.stringify(items, null, 2)}

Rank by:
1. Potential score impact (highest first)
2. Success probability
3. Strategic timing
4. Effort required

Consider item age, balance, type, and bureau reporting patterns.`;

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert credit repair analyst with deep knowledge of FCRA, FDCPA, and bureau patterns. Provide accurate, data-driven predictions." },
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
