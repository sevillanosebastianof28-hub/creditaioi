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
    const { action, clientData, scoreHistory, disputeResults, milestones } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "explain_score_change":
        systemPrompt = `You are a friendly Credit Score Explainer for clients. Your job is to explain credit score changes in simple, encouraging language that non-experts can understand.

Guidelines:
- Use simple, everyday language (no jargon)
- Be encouraging and positive even when explaining setbacks
- Explain the "why" behind score changes
- Provide actionable next steps
- Keep explanations concise (2-3 short paragraphs max)

Provide structured JSON output with:
- summary: One sentence summary of what happened
- explanation: 2-3 paragraph friendly explanation
- positives: Array of positive factors
- concerns: Array of any concerns (if applicable)
- nextSteps: Array of recommended actions
- motivationalMessage: A short encouraging message`;

        userPrompt = `Explain this credit score change to the client:

Previous Scores:
${JSON.stringify(scoreHistory?.previous || {}, null, 2)}

Current Scores:
${JSON.stringify(scoreHistory?.current || {}, null, 2)}

Recent Dispute Results:
${JSON.stringify(disputeResults || [], null, 2)}

Recent Activity:
${JSON.stringify(clientData?.recentActivity || [], null, 2)}

Provide a friendly, easy-to-understand explanation.`;
        break;

      case "generate_milestone_message":
        systemPrompt = `You are a celebratory Credit Repair Assistant. Generate personalized milestone celebration messages for clients achieving credit repair goals.

Be:
- Genuinely celebratory and warm
- Specific about the achievement
- Encouraging for continued progress
- Professional but friendly

Provide structured JSON output with:
- headline: Short celebratory headline
- message: Personalized congratulatory message (2-3 sentences)
- achievement: What they specifically accomplished
- impact: How this helps them
- nextMilestone: What to work toward next`;

        userPrompt = `Generate a milestone celebration for:

Client Name: ${clientData?.name || 'Client'}
Milestone: ${milestones?.achieved || 'Score improvement'}
Score Change: ${milestones?.scoreChange || 'N/A'}
Items Deleted: ${milestones?.itemsDeleted || 0}
Time Period: ${milestones?.timePeriod || 'N/A'}

Create an encouraging celebration message.`;
        break;

      case "explain_deletion":
        systemPrompt = `You are a Credit Repair Educator. Explain what a deletion means and its impact in simple terms.

Guidelines:
- Explain what was removed and why it matters
- Quantify the impact when possible
- Connect to the client's goals
- Be encouraging

Provide structured JSON output with:
- whatHappened: Simple explanation of the deletion
- whyItMatters: Impact on their credit
- expectedScoreImpact: Estimated point improvement
- nextSteps: What happens next
- celebrationNote: Brief congratulations`;

        userPrompt = `Explain this deletion to the client:

Deleted Item:
${JSON.stringify(disputeResults || {}, null, 2)}

Client's Goals:
${JSON.stringify(clientData?.goals || [], null, 2)}

Explain the impact in simple terms.`;
        break;

      case "generate_progress_report":
        systemPrompt = `You are a Credit Repair Progress Reporter. Generate a comprehensive but easy-to-understand progress report for clients.

The report should:
- Summarize overall progress
- Highlight wins and achievements
- Explain what's still in progress
- Set expectations for next steps
- Be encouraging and motivating

Provide structured JSON output with:
- overallSummary: 2-3 sentence overview
- scoreProgress: Object with startScore, currentScore, change, percentToGoal
- disputeProgress: Object with totalDisputed, deleted, pending, successRate
- timelineUpdate: Where they are in the process
- highlights: Array of key wins
- inProgress: Array of items still being worked on
- nextSteps: Array of upcoming actions
- estimatedCompletion: Projected timeline
- motivationalClose: Encouraging closing message`;

        userPrompt = `Generate a progress report for:

Client: ${clientData?.name || 'Client'}
Start Date: ${clientData?.startDate || 'N/A'}

Score History:
${JSON.stringify(scoreHistory || {}, null, 2)}

Dispute Results:
${JSON.stringify(disputeResults || [], null, 2)}

Current Round: ${clientData?.currentRound || 1}
Target Score: ${clientData?.targetScore || 720}

Generate a comprehensive progress report.`;
        break;

      case "explain_why_score_dropped":
        systemPrompt = `You are a supportive Credit Score Explainer. When a client's score drops, explain why in a non-alarming, educational way.

Guidelines:
- Don't panic the client
- Explain the likely cause
- Put it in perspective
- Provide reassurance when appropriate
- Give actionable advice

Provide structured JSON output with:
- summary: Brief explanation of what happened
- likelyCauses: Array of possible reasons
- perspective: Why this isn't necessarily bad
- whatWereDoing: How the team is addressing it
- clientActions: What the client can do
- reassurance: Encouraging message`;

        userPrompt = `The client's score dropped. Explain what might have happened:

Previous Score: ${scoreHistory?.previous || 'N/A'}
Current Score: ${scoreHistory?.current || 'N/A'}
Drop Amount: ${scoreHistory?.change || 'N/A'}

Recent Activity:
${JSON.stringify(clientData?.recentActivity || [], null, 2)}

Recent Credit Events:
${JSON.stringify(clientData?.creditEvents || [], null, 2)}

Explain the drop in a supportive, non-alarming way.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`AI Progress Explainer: Processing ${action}`);

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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    let result;
    try {
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        result = { message: aiResponse };
      }
    } catch {
      result = { message: aiResponse };
    }

    console.log(`AI Progress Explainer: Completed ${action}`);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in ai-progress-explainer:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
