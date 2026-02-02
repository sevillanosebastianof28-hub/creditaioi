// @ts-nocheck
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
    const { action, clientId, roundId, disputeItems, bureauResponses, stream } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const LOCAL_AI_BASE_URL = Deno.env.get("LOCAL_AI_BASE_URL");
    
    if (!LOCAL_AI_BASE_URL && !LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "analyze_round":
        systemPrompt = `You are an AI Credit Repair Round Manager. Analyze the current dispute round and provide strategic recommendations.
        
Your role is to:
1. Evaluate which items need escalation
2. Suggest letter type changes for next round
3. Identify patterns in bureau responses
4. Recommend timing for next round
5. Flag items that may need alternative strategies

Provide structured JSON output with:
- nextRoundRecommendations: array of item-specific recommendations
- escalationItems: items needing aggressive follow-up
- strategyChanges: suggested letter type changes
- timing: recommended wait time before next round
- insights: key patterns observed`;

        userPrompt = `Analyze this dispute round:

Round ID: ${roundId}
Client ID: ${clientId}

Current Dispute Items:
${JSON.stringify(disputeItems, null, 2)}

Bureau Responses Received:
${JSON.stringify(bureauResponses, null, 2)}

Provide your analysis and next-round strategy.`;
        break;

      case "generate_next_round":
        systemPrompt = `You are an AI Credit Repair Round Manager. Generate the next round of disputes based on previous outcomes.
        
Your role is to:
1. Select items that need continued dispute
2. Choose optimal letter types based on previous responses
3. Adjust dispute reasons if needed
4. Prioritize items by likelihood of success
5. Suggest which bureaus to target

Provide structured JSON output with:
- items: array of items for next round with {creditorName, bureau, letterType, disputeReason, priority}
- excludedItems: items to skip this round and why
- newStrategies: any new approaches to try
- estimatedSuccessRate: predicted success percentage`;

        userPrompt = `Generate next round strategy based on:

Previous Round Results:
${JSON.stringify(disputeItems, null, 2)}

Bureau Response Patterns:
${JSON.stringify(bureauResponses, null, 2)}

Generate the optimal next round plan.`;
        break;

      case "detect_responses":
        systemPrompt = `You are an AI Credit Repair Response Detector. Analyze bureau response letters to extract outcomes.
        
Parse the response and identify:
1. Which items were addressed
2. The outcome for each item (verified, deleted, updated, under investigation)
3. Any new information provided
4. Required follow-up actions
5. Response timing patterns

Provide structured JSON output with:
- itemOutcomes: array of {creditorName, bureau, outcome, details}
- newInformation: any new data from the bureau
- requiredActions: follow-up steps needed
- responseTime: days since dispute sent`;

        userPrompt = `Parse this bureau response:

${JSON.stringify(bureauResponses, null, 2)}

Extract all outcomes and required actions.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`AI Round Manager: Processing ${action} for client ${clientId}`);

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
      await sendEvent('status', { type: 'status', message: 'Analyzing round data...' });
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

    // Try to parse as JSON, otherwise return as text
    let result;
    try {
      // Extract JSON from the response
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

    console.log(`AI Round Manager: Completed ${action}`);

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
    console.error("Error in ai-round-manager:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
