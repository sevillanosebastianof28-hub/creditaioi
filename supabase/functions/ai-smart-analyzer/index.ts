import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreditItem {
  id: string;
  creditor: string;
  type: string;
  balance: number;
  status?: string;
  dateOpened?: string;
}

interface AnalyzerRequest {
  analysisType: string;
  items: CreditItem[];
  stream?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisType, items, stream = false }: AnalyzerRequest = await req.json();

    if (!analysisType || !items || !Array.isArray(items)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: analysisType, items (array)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (stream) {
      return streamAnalysis(analysisType, items);
    }

    // Non-streaming response
    const result = await analyzeItems(analysisType, items);
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

function streamAnalysis(analysisType: string, items: CreditItem[]): Response {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial status
        const statusEvent = `data: ${JSON.stringify({ 
          type: 'status', 
          message: `Analyzing ${items.length} items...` 
        })}\n\n`;
        controller.enqueue(encoder.encode(statusEvent));

        await new Promise(resolve => setTimeout(resolve, 300));

        // Send progress for each item
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const progressEvent = `data: ${JSON.stringify({ 
            type: 'progress',
            current: i + 1,
            total: items.length,
            item: item.creditor
          })}\n\n`;
          controller.enqueue(encoder.encode(progressEvent));
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Generate analysis
        const analysis = await analyzeItems(analysisType, items);

        // Send result
        const resultEvent = `data: ${JSON.stringify({ 
          type: 'result',
          analysisType,
          analysis
        })}\n\n`;
        controller.enqueue(encoder.encode(resultEvent));

        // Send completion
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

async function analyzeItems(analysisType: string, items: CreditItem[]) {
  switch (analysisType) {
    case 'success_prediction':
      return predictSuccess(items);
    case 'priority_ranking':
      return rankPriority(items);
    case 'strategy_recommendation':
      return recommendStrategy(items);
    default:
      return { message: `Analysis type "${analysisType}" completed`, items: items.length };
  }
}

function predictSuccess(items: CreditItem[]) {
  const predictions = items.map(item => {
    // Calculate success probability based on item characteristics
    let probability = 0.5; // Base 50%
    
    // Collections have higher success rate
    if (item.type.toLowerCase().includes('collection')) {
      probability += 0.2;
    }
    
    // Lower balances easier to dispute
    if (item.balance < 500) {
      probability += 0.15;
    } else if (item.balance > 2000) {
      probability -= 0.1;
    }
    
    // Cap between 0 and 1
    probability = Math.max(0.1, Math.min(0.9, probability));
    
    return {
      itemId: item.id,
      creditor: item.creditor,
      type: item.type,
      successProbability: Math.round(probability * 100),
      recommendation: probability > 0.6 ? 'High Priority' : probability > 0.4 ? 'Medium Priority' : 'Low Priority',
      strategy: generateStrategy(item, probability)
    };
  });

  return {
    totalItems: items.length,
    highPriority: predictions.filter(p => p.successProbability > 60).length,
    mediumPriority: predictions.filter(p => p.successProbability >= 40 && p.successProbability <= 60).length,
    lowPriority: predictions.filter(p => p.successProbability < 40).length,
    predictions
  };
}

function rankPriority(items: CreditItem[]) {
  const scored = items.map(item => {
    let score = 0;
    
    // Impact on credit score
    if (item.type.toLowerCase().includes('collection')) score += 30;
    if (item.type.toLowerCase().includes('charge') || item.type.toLowerCase().includes('off')) score += 25;
    if (item.type.toLowerCase().includes('late')) score += 15;
    
    // Balance consideration
    if (item.balance > 1000) score += 10;
    
    return { ...item, priorityScore: score };
  });

  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    rankedItems: scored.map((item, index) => ({
      rank: index + 1,
      ...item,
      action: index < 3 ? 'Dispute immediately' : 'Add to queue'
    }))
  };
}

function recommendStrategy(items: CreditItem[]) {
  const collections = items.filter(i => i.type.toLowerCase().includes('collection'));
  const chargeOffs = items.filter(i => i.type.toLowerCase().includes('charge') || i.type.toLowerCase().includes('off'));
  const latePayments = items.filter(i => i.type.toLowerCase().includes('late'));

  return {
    summary: {
      totalItems: items.length,
      collections: collections.length,
      chargeOffs: chargeOffs.length,
      latePayments: latePayments.length
    },
    strategy: {
      phase1: collections.length > 0 ? 'Focus on collections - highest impact' : 'Focus on charge-offs',
      phase2: 'Address late payments and inquiries',
      phase3: 'Validate remaining items',
      timeline: `${Math.max(3, items.length * 2)} months estimated`
    },
    recommendations: [
      collections.length > 0 && 'Start with debt validation letters for collections',
      chargeOffs.length > 0 && 'Dispute charge-offs for inaccuracies',
      latePayments.length > 0 && 'Request goodwill adjustments for late payments',
      'Monitor credit reports monthly',
      'Set up payment reminders to prevent new negatives'
    ].filter(Boolean)
  };
}

function generateStrategy(item: CreditItem, probability: number): string {
  if (probability > 0.6) {
    return 'Request debt validation and dispute inaccuracies';
  } else if (probability > 0.4) {
    return 'Gather documentation and prepare dispute letter';
  } else {
    return 'Consider pay-for-delete or wait for aging off';
  }
}
