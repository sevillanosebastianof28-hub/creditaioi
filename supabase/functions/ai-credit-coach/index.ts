import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CreditContext {
  scores?: {
    experian?: number;
    equifax?: number;
    transunion?: number;
  };
  negativeItems?: number;
  utilization?: number;
}

interface CoachRequest {
  messages: Message[];
  creditContext?: CreditContext;
  stream?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, creditContext, stream = true }: CoachRequest = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return new Response(
        JSON.stringify({ error: 'Last message must be from user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (stream) {
      return streamCoaching(lastMessage.content, creditContext, messages);
    }

    // Non-streaming response
    const response = await generateCoachResponse(lastMessage.content, creditContext);
    return new Response(
      JSON.stringify({ message: response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function streamCoaching(userMessage: string, context?: CreditContext, history: Message[] = []): Response {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Generate response
        const response = await generateCoachResponse(userMessage, context);
        const words = response.split(' ');

        // Stream word by word for natural feel
        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
          const event = `data: ${JSON.stringify({ 
            type: 'chunk',
            content: chunk
          })}\n\n`;
          controller.enqueue(encoder.encode(event));
          
          // Slight delay between words
          await new Promise(resolve => setTimeout(resolve, 30));
        }

        // Send completion
        const doneEvent = `data: ${JSON.stringify({ type: 'done' })}\n\n`;
        controller.enqueue(encoder.encode(doneEvent));

        controller.close();
      } catch (error) {
        const errorEvent = `data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`;
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

async function generateCoachResponse(userMessage: string, context?: CreditContext): Promise<string> {
  const lowerMessage = userMessage.toLowerCase();

  // Context-aware personalization
  let scoreContext = '';
  if (context?.scores) {
    const avgScore = Math.round(
      ((context.scores.experian || 0) + 
       (context.scores.equifax || 0) + 
       (context.scores.transunion || 0)) / 3
    );
    
    if (avgScore > 0) {
      scoreContext = `\n\nBased on your current average score of ${avgScore}, `;
      if (avgScore < 580) {
        scoreContext += "you're in the 'Poor' range. The good news is there's significant room for improvement with the right strategy.";
      } else if (avgScore < 670) {
        scoreContext += "you're in the 'Fair' range. You're making progress, and with focused effort, you can reach 'Good' territory soon.";
      } else if (avgScore < 740) {
        scoreContext += "you're in the 'Good' range. Keep up the great work, and you'll be in 'Very Good' range before you know it.";
      } else if (avgScore < 800) {
        scoreContext += "you're in the 'Very Good' range. You're doing excellent! Just a bit more to reach exceptional status.";
      } else {
        scoreContext += "you're in the 'Exceptional' range. Outstanding work! Focus on maintaining these habits.";
      }
    }
  }

  // Pattern matching for common questions
  if (lowerMessage.includes('good credit score') || lowerMessage.includes('what is a good')) {
    return `A good credit score depends on the scoring model, but here's the general breakdown:

**FICO Score Ranges:**
• 800-850: Exceptional
• 740-799: Very Good
• 670-739: Good
• 580-669: Fair
• 300-579: Poor

For most lenders:
• 670+ qualifies you for most credit products
• 740+ gets you the best interest rates
• 800+ is considered excellent${scoreContext}

**What matters most:**
✓ Payment history (35% of score)
✓ Credit utilization (30%)
✓ Length of credit history (15%)
✓ Credit mix (10%)
✓ New credit (10%)`;
  }

  if (lowerMessage.includes('improve') || lowerMessage.includes('increase') || lowerMessage.includes('raise')) {
    return `Here's your action plan to improve your credit score:

**Immediate Actions (This Month):**
1. Pay all bills on time - set up auto-pay if possible
2. Pay down credit card balances below 30% utilization
3. Check credit reports for errors (annualcreditreport.com)
4. Dispute any inaccuracies you find

**Short-term (3-6 Months):**
1. Keep utilization below 10% for best results
2. Don't close old credit cards (hurts average age)
3. Become an authorized user on someone's good account
4. Request credit limit increases (if you won't spend more)

**Long-term Strategy:**
1. Build a mix of credit types (cards, loans)
2. Avoid applying for too much new credit
3. Let negative items age off naturally
4. Build positive payment history${scoreContext}

**Expected Timeline:**
• 30-60 days: See impact from utilization changes
• 3-6 months: Notice score improvements
• 12+ months: Significant score increases possible`;
  }

  if (lowerMessage.includes('utilization') || lowerMessage.includes('debt')) {
    return `Credit utilization is crucial for your score (30% impact)!

**How it works:**
Utilization = (Total Balances) ÷ (Total Credit Limits) × 100

**Optimal ranges:**
• Below 10%: Excellent - Maximum score benefit
• 10-30%: Good - Minimal negative impact
• 30-50%: Fair - Starts hurting your score
• 50%+: Poor - Significant score damage

**Pro tips:**
✓ Pay before statement closing date (not just due date)
✓ Make multiple payments per month
✓ Request credit limit increases
✓ Don't close cards - keeps denominator higher
✓ Spread balances across multiple cards if needed${scoreContext}

**Quick wins:**
If you have $1,000 on a $5,000 limit (20% utilization), paying down $500 could boost your score 10-20 points in 30 days!`;
  }

  if (lowerMessage.includes('dispute') || lowerMessage.includes('error') || lowerMessage.includes('remove')) {
    return `Disputing credit report errors is your right under the FCRA:

**Step-by-step process:**

1. **Get your reports** (free annually)
   • AnnualCreditReport.com
   • Check all 3 bureaus (Experian, Equifax, TransUnion)

2. **Identify errors:**
   • Accounts not yours
   • Incorrect balances or limits
   • Wrong payment history
   • Closed accounts showing open
   • Duplicate entries

3. **Gather evidence:**
   • Bank statements
   • Payment records
   • Identity documents
   • Supporting correspondence

4. **File disputes:**
   • Online (fastest - 30 days)
   • By mail (certified with return receipt)
   • Include photocopies, not originals

5. **Follow up:**
   • Bureaus must investigate within 30-45 days
   • If item can't be verified, it must be removed
   • Get results in writing${scoreContext}

**Important:** Only dispute actual errors. Fraudulent disputes can be illegal and counterproductive.`;
  }

  if (lowerMessage.includes('late payment') || lowerMessage.includes('missed payment')) {
    return `Late payments hurt, but here's how to handle them:

**If recently late:**
• Pay immediately - minimize damage
• Call creditor and ask for goodwill adjustment
• Set up auto-pay to prevent future lates

**If already on credit report:**
• 30-day late: -60 to -110 points
• 90-day late: Even more severe
• Impact decreases over time

**Goodwill letter strategy:**
1. Explain the situation honestly
2. Emphasize your positive history
3. Show it was one-time circumstance
4. Request removal as courtesy

**Timeline for recovery:**
• Recent lates hurt most
• Impact fades after 2 years
• Removed completely after 7 years
• Keep building positive history${scoreContext}

Prevention is key - one late payment can erase months of progress!`;
  }

  if (lowerMessage.includes('collections') || lowerMessage.includes('collector')) {
    return `Collections accounts need careful handling:

**Your rights under FDCPA:**
✓ Request debt validation (within 30 days of first contact)
✓ Dispute inaccurate information
✓ Request written communication only
✓ Report violations to CFPB

**Strategy options:**

1. **Validate first**
   • Demand proof you owe the debt
   • Verify amount is correct
   • Confirm they own the debt
   • 30% of collections have errors!

2. **Pay-for-delete negotiation**
   • Offer payment in exchange for removal
   • Get agreement in writing FIRST
   • Not guaranteed, but worth trying
   • Usually 30-50% of balance

3. **Let it age**
   • Collections fall off after 7 years
   • Impact decreases over time
   • Sometimes best option for old debts${scoreContext}

**Never:**
❌ Acknowledge debt without validation
❌ Pay before negotiating removal
❌ Restart statute of limitations
❌ Give electronic access to your bank`;
  }

  // Default helpful response
  return `I'm here to help with your credit journey! I can assist you with:

• Understanding credit scores and how they work
• Creating strategies to improve your credit
• Disputing errors on your credit reports
• Managing debt and credit utilization
• Dealing with collections and late payments
• Planning for major purchases (home, car, etc.)
• Building credit from scratch${scoreContext}

What specific credit question can I help you with today?`;
}
