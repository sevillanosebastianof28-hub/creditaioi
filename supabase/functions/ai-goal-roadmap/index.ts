import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RoadmapRequest {
  currentScore: number;
  targetScore: number;
  goalType?: string;
  stream?: boolean;
  timeframe?: number; // months
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      currentScore, 
      targetScore, 
      goalType = 'general', 
      stream = false,
      timeframe = 12
    }: RoadmapRequest = await req.json();

    if (!currentScore || !targetScore) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: currentScore, targetScore' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (currentScore < 300 || currentScore > 850 || targetScore < 300 || targetScore > 850) {
      return new Response(
        JSON.stringify({ error: 'Scores must be between 300 and 850' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (targetScore <= currentScore) {
      return new Response(
        JSON.stringify({ error: 'Target score must be higher than current score' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (stream) {
      return streamRoadmap(currentScore, targetScore, goalType, timeframe);
    }

    // Non-streaming response
    const roadmap = await generateRoadmap(currentScore, targetScore, goalType, timeframe);
    return new Response(
      JSON.stringify({ roadmap }),
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

function streamRoadmap(
  currentScore: number, 
  targetScore: number, 
  goalType: string,
  timeframe: number
): Response {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial status
        const statusEvent = `data: ${JSON.stringify({ 
          type: 'status', 
          message: `Creating roadmap from ${currentScore} to ${targetScore}...` 
        })}\n\n`;
        controller.enqueue(encoder.encode(statusEvent));

        await new Promise(resolve => setTimeout(resolve, 500));

        // Send planning steps
        const steps = [
          'Analyzing current credit profile',
          'Identifying improvement opportunities',
          'Calculating milestone targets',
          'Creating actionable timeline'
        ];

        for (const step of steps) {
          const stepEvent = `data: ${JSON.stringify({ 
            type: 'status',
            message: step
          })}\n\n`;
          controller.enqueue(encoder.encode(stepEvent));
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        // Generate roadmap
        const roadmap = await generateRoadmap(currentScore, targetScore, goalType, timeframe);

        // Send result
        const resultEvent = `data: ${JSON.stringify({ 
          type: 'result',
          roadmap
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

async function generateRoadmap(
  currentScore: number,
  targetScore: number,
  goalType: string,
  timeframe: number
) {
  const pointsToGain = targetScore - currentScore;
  const monthlyGoal = Math.ceil(pointsToGain / timeframe);
  
  // Calculate realistic timeframe
  const realisticMonths = estimateRealisticTimeframe(pointsToGain);
  const isAggressive = timeframe < realisticMonths;
  
  // Generate milestones
  const milestones = generateMilestones(currentScore, targetScore, timeframe);
  
  // Generate phase-based action plan
  const phases = generatePhases(currentScore, pointsToGain, timeframe);
  
  // Calculate success factors
  const successFactors = analyzeSuccessFactors(pointsToGain);

  return {
    overview: {
      currentScore,
      targetScore,
      pointsToGain,
      proposedTimeframe: `${timeframe} months`,
      realisticTimeframe: `${realisticMonths} months`,
      difficulty: getDifficulty(pointsToGain),
      isAggressive,
      monthlyTarget: `+${monthlyGoal} points`
    },
    milestones,
    phases,
    keyActions: generateKeyActions(currentScore, pointsToGain),
    successFactors,
    warnings: generateWarnings(currentScore, pointsToGain, timeframe),
    tips: generateTips(goalType, pointsToGain)
  };
}

function generateMilestones(current: number, target: number, months: number) {
  const milestones = [];
  const increment = Math.floor((target - current) / 4);
  
  for (let i = 1; i <= 4; i++) {
    const score = current + (increment * i);
    const month = Math.floor((months / 4) * i);
    
    milestones.push({
      milestone: i,
      targetScore: i === 4 ? target : score,
      timeframe: `Month ${month}`,
      actions: getMilestoneActions(i, score),
      focus: getMilestoneFocus(i)
    });
  }
  
  return milestones;
}

function generatePhases(current: number, pointsNeeded: number, months: number) {
  const phase1Duration = Math.ceil(months * 0.3);
  const phase2Duration = Math.ceil(months * 0.4);
  const phase3Duration = months - phase1Duration - phase2Duration;

  return [
    {
      phase: 1,
      name: 'Foundation & Error Correction',
      duration: `${phase1Duration} months`,
      goals: [
        'Pull all three credit reports',
        'Identify and dispute errors',
        'Set up payment automation',
        'Reduce credit utilization below 30%'
      ],
      expectedGain: `${Math.floor(pointsNeeded * 0.3)} points`,
      priority: 'Critical'
    },
    {
      phase: 2,
      name: 'Optimization & Building',
      duration: `${phase2Duration} months`,
      goals: [
        'Lower utilization to below 10%',
        'Request credit limit increases',
        'Become authorized user if possible',
        'Build consistent payment history'
      ],
      expectedGain: `${Math.floor(pointsNeeded * 0.4)} points`,
      priority: 'High'
    },
    {
      phase: 3,
      name: 'Refinement & Maintenance',
      duration: `${phase3Duration} months`,
      goals: [
        'Maintain perfect payment record',
        'Optimize credit mix',
        'Let positive history build',
        'Monitor and adjust strategy'
      ],
      expectedGain: `${Math.floor(pointsNeeded * 0.3)} points`,
      priority: 'Medium'
    }
  ];
}

function generateKeyActions(currentScore: number, pointsNeeded: number): string[] {
  const actions = [];

  // Universal actions
  actions.push('✓ Pay all bills on time, every time (set up auto-pay)');
  actions.push('✓ Check credit reports monthly for errors');
  
  if (currentScore < 670) {
    actions.push('✓ Dispute all inaccurate negative items immediately');
    actions.push('✓ Reduce utilization to below 30% ASAP');
    actions.push('✓ Focus on payment history - no new missed payments');
  }
  
  if (pointsNeeded > 50) {
    actions.push('✓ Request goodwill adjustments for isolated late payments');
    actions.push('✓ Pay down revolving debt aggressively');
    actions.push('✓ Request credit limit increases after 6 months of good behavior');
  }
  
  if (currentScore >= 670) {
    actions.push('✓ Optimize credit utilization to below 10%');
    actions.push('✓ Maintain age of accounts - don\'t close old cards');
    actions.push('✓ Diversify credit mix if too limited');
  }
  
  actions.push('✓ Avoid new credit applications during this period');
  actions.push('✓ Set score check reminders for monthly monitoring');

  return actions;
}

function analyzeSuccessFactors(pointsNeeded: number) {
  return {
    paymentHistory: {
      impact: 'Highest (35%)',
      action: 'Never miss a payment',
      potential: `Up to ${Math.floor(pointsNeeded * 0.35)} points`
    },
    creditUtilization: {
      impact: 'Very High (30%)',
      action: 'Keep below 10%',
      potential: `Up to ${Math.floor(pointsNeeded * 0.30)} points`
    },
    creditAge: {
      impact: 'Medium (15%)',
      action: 'Keep old accounts open',
      potential: `Up to ${Math.floor(pointsNeeded * 0.15)} points`
    },
    creditMix: {
      impact: 'Low (10%)',
      action: 'Diversify account types',
      potential: `Up to ${Math.floor(pointsNeeded * 0.10)} points`
    },
    newCredit: {
      impact: 'Low (10%)',
      action: 'Minimize applications',
      potential: `Up to ${Math.floor(pointsNeeded * 0.10)} points`
    }
  };
}

function generateWarnings(current: number, pointsNeeded: number, months: number): string[] {
  const warnings = [];
  const realisticMonths = estimateRealisticTimeframe(pointsNeeded);

  if (months < realisticMonths) {
    warnings.push(`⚠️ Your timeframe is aggressive. Realistic goal: ${realisticMonths} months`);
  }

  if (pointsNeeded > 100) {
    warnings.push('⚠️ Large score increases take time - be patient and consistent');
  }

  if (current < 580) {
    warnings.push('⚠️ Focus on payment history first - it has the biggest impact');
  }

  warnings.push('⚠️ Avoid quick-fix schemes - they don\'t work and may harm your credit');
  warnings.push('⚠️ Don\'t close old accounts - this hurts your credit age');

  return warnings;
}

function generateTips(goalType: string, pointsNeeded: number): string[] {
  const tips = [
    '💡 Pay bills before statement date to show lower utilization',
    '💡 Use annualcreditreport.com for free reports',
    '💡 Credit monitoring services can catch errors quickly'
  ];

  if (goalType === 'mortgage' || goalType === 'home') {
    tips.push('💡 Lenders look at middle score of all three bureaus');
    tips.push('💡 Aim for 740+ for best mortgage rates');
  }

  if (goalType === 'auto' || goalType === 'car') {
    tips.push('💡 Car loans are more forgiving - 650+ often qualifies');
    tips.push('💡 Get pre-approved to negotiate better');
  }

  if (pointsNeeded > 75) {
    tips.push('💡 Consider credit counseling for debt management');
    tips.push('💡 Authorized user status can boost score faster');
  }

  return tips;
}

function getMilestoneActions(milestone: number, score: number): string[] {
  switch (milestone) {
    case 1:
      return ['Dispute errors', 'Set up auto-pay', 'Lower utilization'];
    case 2:
      return ['Request limit increases', 'Build payment history', 'Optimize utilization'];
    case 3:
      return ['Add credit mix', 'Maintain perfect payments', 'Monitor progress'];
    case 4:
      return ['Final optimizations', 'Maintain gains', 'Prepare for goal'];
    default:
      return ['Continue good habits'];
  }
}

function getMilestoneFocus(milestone: number): string {
  const focuses = [
    'Error Correction & Foundation',
    'Utilization Optimization',
    'History Building',
    'Final Push & Maintenance'
  ];
  return focuses[milestone - 1] || focuses[0];
}

function estimateRealisticTimeframe(pointsNeeded: number): number {
  if (pointsNeeded < 30) return 3;
  if (pointsNeeded < 50) return 6;
  if (pointsNeeded < 100) return 9;
  if (pointsNeeded < 150) return 12;
  return 18;
}

function getDifficulty(pointsNeeded: number): string {
  if (pointsNeeded < 30) return 'Easy';
  if (pointsNeeded < 70) return 'Moderate';
  if (pointsNeeded < 120) return 'Challenging';
  return 'Very Challenging';
}
