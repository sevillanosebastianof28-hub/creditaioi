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
    const { action, outcomes, bureau, letterType, timeframe, stream } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const LOCAL_AI_BASE_URL = Deno.env.get("LOCAL_AI_BASE_URL");
    
    if (!LOCAL_AI_BASE_URL && !LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "analyze_patterns":
        systemPrompt = `You are an AI Outcome Analyst for credit repair. Analyze dispute outcomes to identify patterns and optimize future strategies.
        
Your role is to:
1. Identify which letter types work best for each bureau
2. Find patterns in successful vs failed disputes
3. Detect creditor-specific response patterns
4. Calculate success rates by category
5. Recommend strategy adjustments

Provide structured JSON output with:
- bureauPatterns: {bureau: {successRate, avgResponseTime, bestLetterTypes, commonFailures}}
- creditorPatterns: {creditorName: {successRate, effectiveStrategies}}
- letterTypeEffectiveness: {letterType: {overallSuccess, bureauBreakdown}}
- recommendations: array of actionable insights
- trends: emerging patterns over time`;

        userPrompt = `Analyze these dispute outcomes:

Timeframe: ${timeframe || 'Last 90 days'}
${bureau ? `Bureau Filter: ${bureau}` : 'All Bureaus'}
${letterType ? `Letter Type Filter: ${letterType}` : 'All Letter Types'}

Outcome Data:
${JSON.stringify(outcomes, null, 2)}

Provide pattern analysis and strategic recommendations.`;
        break;

      case "predict_success":
        systemPrompt = `You are an AI Success Predictor for credit repair. Based on historical outcomes, predict the likelihood of success for new disputes.
        
Analyze factors including:
1. Bureau response patterns
2. Creditor history
3. Account type and age
4. Dispute reason strength
5. Letter type effectiveness
6. Timing patterns

Provide structured JSON output with:
- predictions: array of {item, successProbability, confidence, reasoning, suggestedApproach}
- highPriorityItems: items with >70% success chance
- riskyItems: items with <30% success chance
- strategyAdjustments: recommended changes`;

        userPrompt = `Predict success for these potential disputes based on historical data:

Historical Outcomes:
${JSON.stringify(outcomes, null, 2)}

Provide success predictions with confidence levels.`;
        break;

      case "generate_insights":
        systemPrompt = `You are an AI Insights Generator for credit repair agencies. Generate actionable business insights from outcome data.
        
Generate insights on:
1. Overall performance metrics
2. Staff effectiveness patterns
3. Client outcome trends
4. Revenue optimization opportunities
5. Process improvement suggestions
6. Competitive advantages identified

Provide structured JSON output with:
- keyMetrics: {deletionRate, avgDaysToResolution, clientRetention, letterEfficiency}
- topInsights: array of important findings
- actionItems: prioritized list of improvements
- benchmarks: how performance compares to industry standards
- forecasts: predictions for next period`;

        userPrompt = `Generate business insights from outcome data:

Timeframe: ${timeframe || 'Last 30 days'}

Outcome Data:
${JSON.stringify(outcomes, null, 2)}

Provide actionable business insights.`;
        break;

      case "learn_from_outcome":
        systemPrompt = `You are an AI Learning System for credit repair. Process a new outcome to update pattern knowledge.
        
Extract learnings:
1. What made this dispute succeed/fail
2. Bureau response characteristics
3. Timing factors
4. Letter type effectiveness
5. Creditor behavior patterns

Provide structured JSON output with:
- successFactors: what contributed to success
- failureFactors: what led to failure
- bureauBehavior: observed bureau patterns
- creditorProfile: insights about this creditor
- recommendedAdjustments: changes for future similar disputes`;

        userPrompt = `Learn from this dispute outcome:

${JSON.stringify(outcomes, null, 2)}

Extract patterns to improve future disputes.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`AI Outcome Tracker: Processing ${action}`);

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
      await sendEvent('status', { type: 'status', message: 'Analyzing outcomes...' });
    }

    let response: Response;
    if (LOCAL_AI_BASE_URL) {
      response = await fetch(`${LOCAL_AI_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          user: `${userPrompt}\n\nReturn JSON only.`,
          max_new_tokens: 700,
          temperature: 0.2
        })
      });
    } else {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        }),
      });
    }

    if (!response.ok) {
      if (response.status === 429) {
        if (stream) {
          await sendEvent('error', { type: 'error', message: 'Rate limit exceeded. Please try again later.' });
          await writer?.close();
          return new Response(streamBody?.readable, {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        if (stream) {
          await sendEvent('error', { type: 'error', message: 'AI credits exhausted. Please add more credits.' });
          await writer?.close();
          return new Response(streamBody?.readable, {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (stream) {
        await sendEvent('error', { type: 'error', message: `AI gateway error: ${response.status}` });
        await writer?.close();
        return new Response(streamBody?.readable, {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data?.content || data.choices?.[0]?.message?.content;

    // Try to parse as JSON
    let result;
    try {
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        result = { analysis: aiResponse };
      }
    } catch {
      result = { analysis: aiResponse };
    }

    console.log(`AI Outcome Tracker: Completed ${action}`);

    if (stream) {
      await sendEvent('result', { type: 'result', result });
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

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in ai-outcome-tracker:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
