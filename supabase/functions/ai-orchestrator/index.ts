import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrchestratorRequest {
  action: string;
  input: string;
  userId: string;
  stream?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, input, userId, stream = false }: OrchestratorRequest = await req.json();

    if (!action || !input) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action, input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (stream) {
      return streamResponse(action, input, userId);
    }

    // Non-streaming response
    const result = await processAction(action, input);
    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function streamResponse(action: string, input: string, userId: string): Response {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send status event
        const statusEvent = `data: ${JSON.stringify({ type: 'status', message: 'Processing your request...' })}\n\n`;
        controller.enqueue(encoder.encode(statusEvent));

        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 500));

        // Send progress event
        const progressEvent = `data: ${JSON.stringify({ type: 'status', message: 'Analyzing credit data...' })}\n\n`;
        controller.enqueue(encoder.encode(progressEvent));

        await new Promise(resolve => setTimeout(resolve, 500));

        // Generate result based on action
        const result = await processAction(action, input);

        // Send result event
        const resultEvent = `data: ${JSON.stringify({ 
          type: 'result', 
          action,
          userId,
          content: result 
        })}\n\n`;
        controller.enqueue(encoder.encode(resultEvent));

        // Send completion event
        const doneEvent = `data: ${JSON.stringify({ type: 'done' })}\n\n`;
        controller.enqueue(encoder.encode(doneEvent));

        controller.close();
      } catch (error: unknown) {
        const errorEvent = `data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function processAction(action: string, input: string): Promise<string> {
  switch (action) {
    case 'explain_credit':
      return explainCredit(input);
    case 'analyze_dispute':
      return analyzeDispute(input);
    case 'generate_strategy':
      return generateStrategy(input);
    default:
      return `Processed action "${action}" with input: ${input}`;
  }
}

function explainCredit(question: string): string {
  const responses: Record<string, string> = {
    'credit utilization': `Credit utilization is the ratio of your credit card balances to your credit limits. It's one of the most important factors in your credit score, accounting for about 30% of your FICO score.

Key points:
• Keep utilization below 30% on each card
• Below 10% is ideal for best scores
• Both per-card and overall utilization matter
• Paying down balances before statement date helps
• High utilization can drop your score by 50+ points`,

    'default': `That's a great question about credit! Understanding credit fundamentals is key to improving your score. 

Credit scores are calculated based on:
• Payment history (35%)
• Credit utilization (30%)
• Length of credit history (15%)
• Credit mix (10%)
• New credit inquiries (10%)

The most impactful actions you can take are:
1. Always pay on time
2. Keep utilization below 30%
3. Avoid closing old accounts
4. Limit new credit applications`
  };

  const lowerQuestion = question.toLowerCase();
  if (lowerQuestion.includes('utilization')) {
    return responses['credit utilization'];
  }
  return responses['default'];
}

function analyzeDispute(input: string): string {
  return `Based on the dispute information provided, here's my analysis:

✓ Recommended Actions:
1. Request validation of debt
2. Check reporting dates for accuracy  
3. Verify creditor information
4. Document all communications

⚠️ Important Considerations:
• Ensure all documentation is accurate
• Follow FCRA guidelines strictly
• Allow 30-45 days for bureau response
• Keep copies of all correspondence`;
}

function generateStrategy(input: string): string {
  return `Here's your personalized credit repair strategy:

Phase 1 (Months 1-2): Foundation
• Pull all 3 credit reports
• Identify inaccurate items
• Dispute obvious errors
• Set up payment reminders

Phase 2 (Months 3-4): Optimization
• Reduce utilization below 30%
• Establish payment history
• Request credit limit increases
• Become authorized user if possible

Phase 3 (Months 5-6): Growth
• Monitor score improvements
• Address remaining negatives
• Build positive credit mix
• Plan for score milestones`;
}
