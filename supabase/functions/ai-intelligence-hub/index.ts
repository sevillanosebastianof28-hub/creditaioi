import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreditData {
  scores: {
    experian?: number;
    equifax?: number;
    transunion?: number;
  };
  averageScore: number;
  negativeItems: any[];
  summary: any;
  disputeProgress?: any;
}

interface HubRequest {
  action: string;
  creditData: CreditData;
  stream?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, creditData, stream = false }: HubRequest = await req.json();

    if (!action || !creditData) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action, creditData' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (stream) {
      return streamInsights(action, creditData);
    }

    // Non-streaming response
    const insights = await generateInsights(action, creditData);
    return new Response(
      JSON.stringify({ insights }),
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

function streamInsights(action: string, creditData: CreditData): Response {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send analyzing status
        const statusEvent = `data: ${JSON.stringify({ 
          type: 'status', 
          message: 'Analyzing your credit data...' 
        })}\n\n`;
        controller.enqueue(encoder.encode(statusEvent));

        await new Promise(resolve => setTimeout(resolve, 500));

        // Send processing steps
        const steps = [
          'Evaluating credit scores across bureaus',
          'Analyzing negative account impacts',
          'Calculating score potential',
          'Generating personalized insights'
        ];

        for (const step of steps) {
          const stepEvent = `data: ${JSON.stringify({ 
            type: 'status',
            message: step
          })}\n\n`;
          controller.enqueue(encoder.encode(stepEvent));
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        // Generate insights
        const insights = await generateInsights(action, creditData);

        // Send result
        const resultEvent = `data: ${JSON.stringify({ 
          type: 'result',
          action,
          insights
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

async function generateInsights(action: string, creditData: CreditData) {
  switch (action) {
    case 'generate_insights':
      return comprehensiveInsights(creditData);
    case 'score_analysis':
      return scoreAnalysis(creditData);
    case 'impact_assessment':
      return impactAssessment(creditData);
    default:
      return basicInsights(creditData);
  }
}

function comprehensiveInsights(creditData: CreditData) {
  const { scores, averageScore, negativeItems } = creditData;
  
  // Calculate score variance
  const allScores = [
    scores.experian || 0,
    scores.equifax || 0,
    scores.transunion || 0
  ].filter(s => s > 0);
  
  const variance = allScores.length > 1 
    ? Math.max(...allScores) - Math.min(...allScores)
    : 0;

  // Determine score category
  let category = 'Poor';
  let nextCategory = 'Fair';
  let pointsToNext = 0;
  
  if (averageScore >= 800) {
    category = 'Exceptional';
    nextCategory = 'Maintain';
    pointsToNext = 0;
  } else if (averageScore >= 740) {
    category = 'Very Good';
    nextCategory = 'Exceptional';
    pointsToNext = 800 - averageScore;
  } else if (averageScore >= 670) {
    category = 'Good';
    nextCategory = 'Very Good';
    pointsToNext = 740 - averageScore;
  } else if (averageScore >= 580) {
    category = 'Fair';
    nextCategory = 'Good';
    pointsToNext = 670 - averageScore;
  } else {
    category = 'Poor';
    nextCategory = 'Fair';
    pointsToNext = 580 - averageScore;
  }

  return {
    overview: {
      averageScore,
      category,
      bureauScores: scores,
      scoreVariance: variance,
      negativeItemCount: negativeItems.length
    },
    progress: {
      currentCategory: category,
      nextCategory,
      pointsNeeded: pointsToNext,
      estimatedTimeframe: estimateTimeframe(pointsToNext, negativeItems.length)
    },
    keyInsights: [
      variance > 30 ? {
        type: 'warning',
        title: 'Score Variance Detected',
        message: `Your scores vary by ${variance} points across bureaus. This could indicate reporting differences.`,
        action: 'Review each bureau report for discrepancies'
      } : {
        type: 'success',
        title: 'Consistent Scores',
        message: 'Your scores are consistent across all three bureaus.',
        action: 'Continue current credit habits'
      },
      negativeItems.length > 0 ? {
        type: 'alert',
        title: `${negativeItems.length} Negative ${negativeItems.length === 1 ? 'Item' : 'Items'} Found`,
        message: `These accounts are impacting your score. Each negative item can reduce your score by 50-150 points.`,
        action: 'Prioritize disputing inaccuracies and addressing valid items'
      } : {
        type: 'success',
        title: 'Clean Credit Report',
        message: 'No negative items detected! Focus on maintaining positive habits.',
        action: 'Keep utilization low and payments on time'
      },
      {
        type: 'info',
        title: 'Score Potential',
        message: `Based on your current profile, you could reach ${Math.min(850, averageScore + estimateMaxGain(creditData))} with optimal credit management.`,
        action: 'Follow your personalized roadmap to maximize gains'
      }
    ],
    recommendations: generateRecommendations(creditData),
    scoringFactors: analyzeFactors(creditData)
  };
}

function scoreAnalysis(creditData: CreditData) {
  const { scores, averageScore } = creditData;
  
  return {
    current: {
      average: averageScore,
      experian: scores.experian || 'N/A',
      equifax: scores.equifax || 'N/A',
      transunion: scores.transunion || 'N/A'
    },
    analysis: {
      trend: averageScore >= 670 ? 'Positive' : 'Needs Improvement',
      stability: 'Moderate',
      riskLevel: averageScore < 580 ? 'High' : averageScore < 670 ? 'Medium' : 'Low'
    },
    breakdown: {
      paymentHistory: '35% impact',
      creditUtilization: '30% impact',
      creditAge: '15% impact',
      creditMix: '10% impact',
      newCredit: '10% impact'
    }
  };
}

function impactAssessment(creditData: CreditData) {
  const { negativeItems, averageScore } = creditData;
  
  const potentialGain = negativeItems.reduce((sum, item) => {
    // Estimate impact of each negative item type
    const type= item.type?.toLowerCase() || '';
    if (type.includes('collection')) return sum + 100;
    if (type.includes('charge') || type.includes('off')) return sum + 90;
    if (type.includes('late')) return sum + 60;
    return sum + 40;
  }, 0);

  return {
    currentImpact: {
      negativeItems: negativeItems.length,
      estimatedPointLoss: Math.min(300, potentialGain),
      scorewithoutNegatives: Math.min(850, averageScore + potentialGain)
    },
    itemBreakdown: negativeItems.map(item => ({
      type: item.type ||'Unknown',
      estimatedImpact: item.type?.toLowerCase().includes('collection') ? '80-120 points' : '40-80 points',
      ageMonths: item.dateOpened ? calculateAge(item.dateOpened) : 'Unknown',
      priority: item.type?.toLowerCase().includes('collection') ? 'High' : 'Medium'
    })),
    recoveryPotential: {
      immediate: Math.floor(potentialGain * 0.3),
      threeMonths: Math.floor(potentialGain * 0.5),
      sixMonths: Math.floor(potentialGain * 0.7),
      oneYear: Math.floor(potentialGain * 0.9)
    }
  };
}

function basicInsights(creditData: CreditData) {
  return {
    score: creditData.averageScore,
    message: 'Basic insights generated',
    negativeItems: creditData.negativeItems.length
  };
}

function generateRecommendations(creditData: CreditData): string[] {
  const { averageScore, negativeItems } = creditData;
  const recs = [];

  if (averageScore < 670) {
    recs.push('Focus on payment history - set up auto-pay for all accounts');
    recs.push('Reduce credit utilization to below 30% immediately');
  }

  if (negativeItems.length > 0) {
    recs.push(`Dispute ${negativeItems.length} negative ${negativeItems.length === 1 ? 'item' : 'items'} for inaccuracies`);
    recs.push('Request goodwill adjustments from creditors for accounts in good standing');
  }

  if (averageScore >= 670 && averageScore < 740) {
    recs.push('Request credit limit increases to improve utilization ratio');
    recs.push('Consider becoming an authorized user on a well-managed account');
  }

  recs.push('Monitor your credit reports monthly for changes and errors');
  recs.push('Avoid applying for new credit for the next 6 months');

  return recs;
}

function analyzeFactors(creditData: CreditData) {
  return {
    paymentHistory: 'Positive',
    amounts: 'Needs Improvement',
    creditAge: 'Moderate',
    creditMix: 'Limited',
    newCredit: 'Minimal Impact'
  };
}

function estimateTimeframe(pointsNeeded: number, negativeItems: number): string {
  if (pointsNeeded === 0) return 'Maintain current level';
  if (pointsNeeded < 30 && negativeItems === 0) return '1-3 months';
  if (pointsNeeded < 50) return '3-6 months';
  if (pointsNeeded < 100) return '6-12 months';
  return '12-18 months';
}

function estimateMaxGain(creditData: CreditData): number {
  const { averageScore, negativeItems } = creditData;
  let maxGain = 0;

  // Potential from removing negatives
  maxGain += Math.min(200, negativeItems.length * 70);

  // Potential from optimization
  if (averageScore < 740) maxGain += 50;

  return maxGain;
}

function calculateAge(dateString: string): number {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    return months;
  } catch {
    return 0;
  }
}
