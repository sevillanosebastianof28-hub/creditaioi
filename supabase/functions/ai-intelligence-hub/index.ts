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
    const { action, creditData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";
    let toolSchema: any = {};

    switch (action) {
      case "generate_insights":
        systemPrompt = `You are an elite AI Credit Intelligence Analyst with expertise in FCRA, FDCPA, consumer protection laws, and credit scoring algorithms. Your role is to provide deep, actionable insights that go beyond surface-level analysis.

Your analysis should demonstrate:
1. PATTERN RECOGNITION: Identify hidden patterns in the credit data that indicate strategic opportunities
2. LEGAL INTELLIGENCE: Spot potential FCRA/FDCPA violations that create deletion leverage
3. TIMING OPTIMIZATION: Recommend optimal timing for disputes based on bureau patterns
4. SCORE IMPACT MODELING: Accurately predict point gains from specific actions
5. RISK ASSESSMENT: Flag potential obstacles and how to overcome them

Be specific, data-driven, and action-oriented. Avoid generic advice.`;

        userPrompt = `Analyze this client's complete credit profile and generate comprehensive AI insights:

CURRENT SCORES:
${JSON.stringify(creditData.scores, null, 2)}

AVERAGE SCORE: ${creditData.averageScore}

NEGATIVE ITEMS (${creditData.negativeItems?.length || 0} total):
${JSON.stringify(creditData.negativeItems?.slice(0, 15), null, 2)}

CREDIT SUMMARY:
${JSON.stringify(creditData.summary, null, 2)}

DISPUTE PROGRESS:
${JSON.stringify(creditData.disputeProgress, null, 2)}

Generate insights across these categories:
1. HIGH-IMPACT OPPORTUNITIES - Items with best deletion probability and score impact
2. WARNINGS - Time-sensitive issues or obstacles to address
3. PRO TIPS - Strategic recommendations based on patterns
4. MILESTONES - Celebrate progress and set next targets

Also calculate analytics on prediction accuracy and pending opportunities.`;

        toolSchema = {
          name: "generate_credit_insights",
          description: "Generate comprehensive AI-powered credit insights",
          parameters: {
            type: "object",
            properties: {
              insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    type: { type: "string", enum: ["opportunity", "warning", "tip", "milestone"] },
                    title: { type: "string", maxLength: 80 },
                    description: { type: "string", maxLength: 200 },
                    impact: { type: "string", enum: ["high", "medium", "low"] },
                    actionable: { type: "boolean" },
                    action: { type: "string" }
                  },
                  required: ["id", "type", "title", "description", "impact", "actionable"]
                }
              },
              analytics: {
                type: "object",
                properties: {
                  totalPredictions: { type: "number" },
                  accuracyRate: { type: "number" },
                  avgScoreImpact: { type: "number" },
                  successfulDisputes: { type: "number" },
                  pendingOpportunities: { type: "number" }
                }
              }
            },
            required: ["insights", "analytics"]
          }
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`AI Intelligence Hub: Processing ${action}`);

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
        tools: [{ type: "function", function: toolSchema }],
        tool_choice: { type: "function", function: { name: toolSchema.name } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Failed to generate insights");
  } catch (error: unknown) {
    console.error("AI Intelligence Hub error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
