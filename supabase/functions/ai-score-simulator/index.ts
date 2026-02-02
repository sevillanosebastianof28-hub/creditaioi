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
    const { action, currentScores, tradelines, selectedDeletions, loanType, loanAmount, stream } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const LOCAL_AI_BASE_URL = Deno.env.get("LOCAL_AI_BASE_URL");
    
    if (!LOCAL_AI_BASE_URL && !LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "simulate_deletions":
        systemPrompt = `You are a Credit Score Simulator AI. Calculate the estimated impact of removing negative items from a credit report.

Use these general guidelines for score impact estimation:
- Collections: 20-100 points per item (higher for recent, lower for old)
- Late payments: 10-50 points per item (30 days = less, 90+ days = more)
- Charge-offs: 30-80 points per item
- Inquiries: 5-15 points per inquiry (recent only)
- Public records: 50-150 points
- High utilization reduction: 20-50 points

Consider:
- Age of the negative item (older = less impact)
- Current score (lower scores see bigger gains)
- Number of remaining negative items
- Credit mix and history length

Provide structured JSON output with:
- currentScore: Starting score
- projectedScore: Estimated score after deletions
- pointsGained: Total points increase
- breakdown: Array of {item, pointsImpact, confidence}
- timeline: Estimated time for score to reflect changes
- confidence: Overall confidence level (high/medium/low)
- caveats: Important notes about the estimate`;

        userPrompt = `Simulate the impact of removing these items:

Current Credit Scores:
${JSON.stringify(currentScores, null, 2)}

Items Selected for Deletion:
${JSON.stringify(selectedDeletions, null, 2)}

Full Credit Profile:
${JSON.stringify(tradelines, null, 2)}

Calculate the estimated score improvement.`;
        break;

      case "check_loan_qualification":
        systemPrompt = `You are a Loan Qualification Advisor AI. Analyze whether a client would qualify for specific loans based on their credit profile.

Consider these typical requirements:
- Conventional mortgage: 620+ (ideal 740+)
- FHA mortgage: 580+ (3.5% down) or 500-579 (10% down)
- VA mortgage: No minimum but 620+ preferred
- Auto loan prime: 660+
- Auto loan subprime: 500-659
- Personal loan: 600+ (varies by lender)
- Credit cards (prime): 670+
- Business loans: 680+

Provide structured JSON output with:
- qualified: boolean
- loanType: Type of loan analyzed
- minimumRequired: Minimum score typically needed
- currentScore: Client's current score
- gap: Points needed to qualify (if any)
- probability: Likelihood of approval (percentage)
- estimatedRate: Approximate interest rate range
- recommendations: Array of steps to improve chances
- alternativeOptions: Other loan options they might qualify for`;

        userPrompt = `Check loan qualification for:

Current Scores:
${JSON.stringify(currentScores, null, 2)}

Loan Type: ${loanType}
Loan Amount: ${loanAmount}

Credit Profile:
${JSON.stringify(tradelines, null, 2)}

Analyze qualification likelihood.`;
        break;

      case "optimize_deletion_order":
        systemPrompt = `You are a Credit Repair Strategist AI. Determine the optimal order to dispute items for maximum score improvement.

Prioritization factors:
1. Items with highest point impact
2. Items most likely to be deleted
3. Items blocking specific goals (mortgage, auto loan)
4. Legal vulnerabilities (FCRA violations, age, inaccuracies)
5. Strategic bureau targeting

Provide structured JSON output with:
- optimizedOrder: Array of items in recommended dispute order
- phases: Array of {phase, items, expectedGain, reasoning}
- totalProjectedGain: Points expected from full removal
- quickWins: Items likely to be removed quickly
- hardCases: Items that may require escalation
- estimatedTimeline: Total time to complete all phases
- strategyNotes: Additional strategic recommendations`;

        userPrompt = `Optimize the deletion order for:

Current Scores:
${JSON.stringify(currentScores, null, 2)}

All Negative Items:
${JSON.stringify(tradelines, null, 2)}

Client Goals:
- Target Score: 720
- Timeline: 6 months
- Goal: Mortgage qualification

Determine optimal dispute order.`;
        break;

      case "project_timeline":
        systemPrompt = `You are a Credit Repair Timeline Projector. Create a realistic timeline projection for credit improvement.

Consider:
- Typical dispute response times (30-45 days per round)
- Success rates by item type
- Score update frequency
- Seasonal variations in bureau processing
- Client's starting point and goals

Provide structured JSON output with:
- startingScore: Current average score
- targetScore: Goal score
- estimatedMonths: Time to reach target
- monthlyProjections: Array of {month, projectedScore, actions, expectedDeletions}
- milestones: Key achievements along the way
- risks: Factors that could delay progress
- accelerators: Ways to speed up the process
- confidenceLevel: How confident we are in this projection`;

        userPrompt = `Project the timeline for:

Current Scores:
${JSON.stringify(currentScores, null, 2)}

Negative Items:
${JSON.stringify(tradelines, null, 2)}

Goal: Reach 720+ for mortgage
Starting Round: 1

Create a realistic timeline projection.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`AI Score Simulator: Processing ${action}`);

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
      await sendEvent('status', { type: 'status', message: 'Running simulation...' });
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

    console.log(`AI Score Simulator: Completed ${action}`);

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
    console.error("Error in ai-score-simulator:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
