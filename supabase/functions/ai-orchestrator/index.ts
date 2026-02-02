import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Knowledge base documents for RAG context
const KNOWLEDGE_BASE = {
  compliance: [
    "Compliance_Restrictions.md",
    "FCRA_Summary.md", 
    "FDCPA_Guidelines.md",
    "Metro2_Reporting_Standards.md"
  ],
  bureaus: [
    "Credit_Bureau_Overview.md",
    "Account_Type_Definitions.md"
  ],
  disputes: [
    "Dispute_Collections.md",
    "Dispute_Late_Payments.md",
    "Dispute_Charge_Offs.md",
    "Dispute_Inquiries.md",
    "Dispute_Closed_Accounts.md"
  ],
  workflows: [
    "Credit_Report_Analysis_Workflow.md",
    "Dispute_Eligibility_Decision_Tree.md",
    "Escalation_Rules.md"
  ],
  tone: [
    "Tone_Guidelines.md",
    "Do_Not_Say_List.md"
  ],
  templates: [
    "Dispute_Letter_Generation_Rules.md",
    "Dispute_Letter_Templates.md"
  ]
};

// Forbidden phrases from Do_Not_Say_List
const FORBIDDEN_PHRASES = [
  "guaranteed",
  "we guarantee",
  "100% success",
  "always works",
  "illegal but works",
  "trick the bureaus",
  "instant score boost",
  "remove anything",
  "delete everything",
  "erase your debt",
  "legal loophole",
  "the bureaus hate this",
  "secret method",
  "they don't want you to know",
  "beat the system",
  "file bankruptcy and dispute",
  "we are attorneys",
  "we are lawyers",
  "legal advice"
];

interface OrchestratorRequest {
  action: 'classify_dispute' | 'explain_credit' | 'generate_letter' | 'analyze_report' | 'full_orchestration';
  input: string;
  context?: {
    disputeType?: string;
    accountType?: string;
    bureau?: string;
    clientData?: any;
    scoreHistory?: any;
    disputeItems?: any[];
  };
  userId: string;
}

interface ClassificationResult {
  eligibility: 'eligible' | 'conditionally_eligible' | 'not_eligible' | 'insufficient_information';
  confidence: number;
  reasoning: {
    factors: string[];
    requiredEvidence: string[];
    complianceFlags: string[];
  };
}

interface OrchestratorResponse {
  success: boolean;
  classification?: ClassificationResult;
  response?: {
    summary: string;
    analysis: string;
    eligibilityStatus: string;
    recommendedAction: string;
    nextSteps: string[];
  };
  complianceFlags: string[];
  wasRefused: boolean;
  refusalReason?: string;
  processingTimeMs: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { action, input, context, userId, stream } = await req.json() as OrchestratorRequest & { stream?: boolean };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client for logging
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    if (stream) {
      const encoder = new TextEncoder();
      const streamBody = new TransformStream();
      const writer = streamBody.writable.getWriter();

      const sendEvent = async (event: string, data: Record<string, unknown>) => {
        await writer.write(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      await sendEvent('status', { type: 'status', message: 'Validating request scope...' });

      // Step 1: Validate scope - Check if request is within credit domain
      const scopeValidation = validateScope(input);
      if (!scopeValidation.valid) {
        const response: OrchestratorResponse = {
          success: false,
          complianceFlags: ['out_of_scope'],
          wasRefused: true,
          refusalReason: scopeValidation.reason,
          processingTimeMs: Date.now() - startTime
        };

        await logInteraction(supabase, {
          userId,
          input,
          action,
          response,
          context
        });

        await sendEvent('result', { type: 'result', result: response });
        await writer.close();

        return new Response(streamBody.readable, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
          }
        });
      }

      await sendEvent('status', { type: 'status', message: 'Retrieving knowledge context...' });

      // Step 2: Retrieve relevant knowledge based on action type
      const retrievedContext = retrieveKnowledge(action, context?.disputeType);

      // Step 3: For dispute-related requests, run classifier first (Model 2 equivalent)
      let classification: ClassificationResult | undefined;
      if (action === 'classify_dispute' || action === 'full_orchestration') {
        await sendEvent('status', { type: 'status', message: 'Classifying request...' });
        classification = await runClassifier(LOVABLE_API_KEY, input, context, retrievedContext);
      }

      // Step 4: Generate response using explainer model (Model 1 equivalent)
      await sendEvent('status', { type: 'status', message: 'Generating response...' });
      const response = await runExplainer(LOVABLE_API_KEY, input, context, retrievedContext, classification);

      // Step 5: Validate response for compliance
      await sendEvent('status', { type: 'status', message: 'Checking compliance...' });
      const complianceFlags = validateCompliance(response);

      // Step 6: Build final response
      const finalResponse: OrchestratorResponse = {
        success: true,
        classification,
        response,
        complianceFlags,
        wasRefused: false,
        processingTimeMs: Date.now() - startTime
      };

      // Step 7: Log interaction for fine-tuning
      await sendEvent('status', { type: 'status', message: 'Saving interaction...' });
      await logInteraction(supabase, {
        userId,
        input,
        action,
        response: finalResponse,
        context,
        classification
      });

      await sendEvent('result', { type: 'result', result: finalResponse });
      await writer.close();

      return new Response(streamBody.readable, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    }

    // Step 1: Validate scope - Check if request is within credit domain
    const scopeValidation = validateScope(input);
    if (!scopeValidation.valid) {
      const response: OrchestratorResponse = {
        success: false,
        complianceFlags: ['out_of_scope'],
        wasRefused: true,
        refusalReason: scopeValidation.reason,
        processingTimeMs: Date.now() - startTime
      };

      await logInteraction(supabase, {
        userId,
        input,
        action,
        response,
        context
      });

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Step 2: Retrieve relevant knowledge based on action type
    const retrievedContext = retrieveKnowledge(action, context?.disputeType);

    // Step 3: For dispute-related requests, run classifier first (Model 2 equivalent)
    let classification: ClassificationResult | undefined;
    if (action === 'classify_dispute' || action === 'full_orchestration') {
      classification = await runClassifier(LOVABLE_API_KEY, input, context, retrievedContext);
    }

    // Step 4: Generate response using explainer model (Model 1 equivalent)
    const response = await runExplainer(LOVABLE_API_KEY, input, context, retrievedContext, classification);

    // Step 5: Validate response for compliance
    const complianceFlags = validateCompliance(response);

    // Step 6: Build final response
    const finalResponse: OrchestratorResponse = {
      success: true,
      classification,
      response,
      complianceFlags,
      wasRefused: false,
      processingTimeMs: Date.now() - startTime
    };

    // Step 7: Log interaction for fine-tuning
    await logInteraction(supabase, {
      userId,
      input,
      action,
      response: finalResponse,
      context,
      classification
    });

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: unknown) {
    console.error("AI Orchestrator error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ 
      success: false,
      error: message,
      processingTimeMs: Date.now() - startTime
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

function validateScope(input: string): { valid: boolean; reason?: string } {
  const inputLower = input.toLowerCase();
  
  // Non-credit topics to reject
  const offTopicKeywords = [
    'stock', 'crypto', 'bitcoin', 'investment advice', 'tax advice',
    'medical', 'health insurance', 'lawsuit', 'sue someone',
    'gambling', 'lottery', 'bet on'
  ];

  for (const keyword of offTopicKeywords) {
    if (inputLower.includes(keyword)) {
      return { 
        valid: false, 
        reason: "This request is outside the scope of credit-related assistance. I can only help with credit reports, disputes, scores, and related topics." 
      };
    }
  }

  return { valid: true };
}

function retrieveKnowledge(action: string, disputeType?: string): string {
  let relevantDocs: string[] = [];
  
  // Always include compliance docs
  relevantDocs.push(...KNOWLEDGE_BASE.compliance);
  relevantDocs.push(...KNOWLEDGE_BASE.tone);

  // Add action-specific docs
  switch (action) {
    case 'classify_dispute':
    case 'full_orchestration':
      relevantDocs.push(...KNOWLEDGE_BASE.workflows);
      relevantDocs.push(...KNOWLEDGE_BASE.disputes);
      if (disputeType) {
        // Prioritize specific dispute type doc
        const specificDoc = `Dispute_${disputeType.charAt(0).toUpperCase() + disputeType.slice(1)}.md`;
        if (!relevantDocs.includes(specificDoc)) {
          relevantDocs.unshift(specificDoc);
        }
      }
      break;
    case 'generate_letter':
      relevantDocs.push(...KNOWLEDGE_BASE.templates);
      relevantDocs.push(...KNOWLEDGE_BASE.disputes);
      break;
    case 'explain_credit':
      relevantDocs.push(...KNOWLEDGE_BASE.bureaus);
      break;
    case 'analyze_report':
      relevantDocs.push(...KNOWLEDGE_BASE.workflows);
      relevantDocs.push(...KNOWLEDGE_BASE.bureaus);
      break;
  }

  // Return as context string (in production, this would fetch actual content)
  return `Retrieved knowledge context from: ${relevantDocs.join(', ')}. 
  
KEY COMPLIANCE RULES:
- Never guarantee outcomes or specific score increases
- Never impersonate legal professionals
- Always provide factual, neutral information
- Use educational, empowering tone
- Reference FCRA rights when applicable

FORBIDDEN PHRASES: ${FORBIDDEN_PHRASES.join(', ')}`;
}

async function runClassifier(
  apiKey: string, 
  input: string, 
  context: OrchestratorRequest['context'],
  retrievedKnowledge: string
): Promise<ClassificationResult> {
  
  const classifierPrompt = `You are a DISPUTE ELIGIBILITY CLASSIFIER. Your ONLY job is to determine if a credit item is eligible for dispute.

CLASSIFICATION RULES (from Dispute_Eligibility_Decision_Tree.md):

OUTPUT ONE OF THESE EXACTLY:
- "eligible" - Clear inaccuracy with evidence basis
- "conditionally_eligible" - Possible inaccuracy, needs verification  
- "not_eligible" - Information appears accurate or no dispute basis
- "insufficient_information" - Cannot determine eligibility

DECISION FACTORS:
1. Is there a factual inaccuracy claimed?
2. Is there evidence or reasonable basis?
3. Is the item within statute of limitations?
4. Does the item type support dispute (not all do)?

CONTEXT PROVIDED:
${retrievedKnowledge}

ACCOUNT CONTEXT:
${context ? JSON.stringify(context, null, 2) : 'No additional context provided'}

USER INPUT:
${input}

Respond ONLY with a JSON object containing your classification.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: classifierPrompt },
        { role: "user", content: "Classify this dispute request and return JSON with eligibility, confidence (0-1), and reasoning object with factors array, requiredEvidence array, and complianceFlags array." }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "classify_dispute",
            description: "Classify dispute eligibility",
            parameters: {
              type: "object",
              properties: {
                eligibility: { 
                  type: "string", 
                  enum: ["eligible", "conditionally_eligible", "not_eligible", "insufficient_information"] 
                },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                reasoning: {
                  type: "object",
                  properties: {
                    factors: { type: "array", items: { type: "string" } },
                    requiredEvidence: { type: "array", items: { type: "string" } },
                    complianceFlags: { type: "array", items: { type: "string" } }
                  },
                  required: ["factors", "requiredEvidence", "complianceFlags"]
                }
              },
              required: ["eligibility", "confidence", "reasoning"]
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "classify_dispute" } }
    }),
  });

  if (!response.ok) {
    console.error("Classifier error:", await response.text());
    // Return conservative default
    return {
      eligibility: 'insufficient_information',
      confidence: 0,
      reasoning: {
        factors: ["Classification failed - defaulting to conservative response"],
        requiredEvidence: ["Unable to determine required evidence"],
        complianceFlags: ["classification_error"]
      }
    };
  }

  const result = await response.json();
  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    try {
      return JSON.parse(toolCall.function.arguments);
    } catch {
      console.error("Failed to parse classifier response");
    }
  }

  return {
    eligibility: 'insufficient_information',
    confidence: 0,
    reasoning: {
      factors: ["Could not parse classification result"],
      requiredEvidence: [],
      complianceFlags: ["parse_error"]
    }
  };
}

async function runExplainer(
  apiKey: string,
  input: string,
  context: OrchestratorRequest['context'],
  retrievedKnowledge: string,
  classification?: ClassificationResult
): Promise<{
  summary: string;
  analysis: string;
  eligibilityStatus: string;
  recommendedAction: string;
  nextSteps: string[];
}> {

  const explainerPrompt = `You are the CREDIT AI EXPLAINER - you generate clear, compliant, helpful responses about credit topics.

YOU MUST NEVER:
- Guarantee specific outcomes or score increases
- Impersonate attorneys or give legal advice
- Use any forbidden phrases: ${FORBIDDEN_PHRASES.join(', ')}
- Bypass or trick credit bureaus
- Make claims about illegal but effective methods

YOU MUST ALWAYS:
- Be factual and educational
- Reference consumer rights under FCRA when relevant
- Provide realistic expectations
- Use empowering but honest language
- Follow the required response structure

${classification ? `
CLASSIFIER DECISION (from dispute eligibility classifier):
Eligibility: ${classification.eligibility}
Confidence: ${(classification.confidence * 100).toFixed(0)}%
Factors: ${classification.reasoning.factors.join(', ')}
Required Evidence: ${classification.reasoning.requiredEvidence.join(', ')}
` : ''}

KNOWLEDGE CONTEXT:
${retrievedKnowledge}

ACCOUNT CONTEXT:
${context ? JSON.stringify(context, null, 2) : 'No additional context'}

USER REQUEST:
${input}

Generate a response following this EXACT structure. Be concise but thorough.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: explainerPrompt },
        { role: "user", content: "Generate the response following the required structure." }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_response",
            description: "Generate structured credit response",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "Brief factual overview (1-2 sentences)" },
                analysis: { type: "string", description: "Explanation based on retrieved context" },
                eligibilityStatus: { type: "string", description: "Must match classifier output exactly if available" },
                recommendedAction: { type: "string", description: "Only if supported by retrieved knowledge" },
                nextSteps: { type: "array", items: { type: "string" }, description: "Clear, realistic next steps" }
              },
              required: ["summary", "analysis", "eligibilityStatus", "recommendedAction", "nextSteps"]
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "generate_response" } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Explainer error:", errorText);
    
    return {
      summary: "I encountered an issue processing your request.",
      analysis: "The system was unable to generate a complete analysis at this time.",
      eligibilityStatus: classification?.eligibility || "unable_to_determine",
      recommendedAction: "Please try again or contact support if the issue persists.",
      nextSteps: ["Retry your request", "Contact support if issues continue"]
    };
  }

  const result = await response.json();
  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    try {
      const parsed = JSON.parse(toolCall.function.arguments);
      // Ensure eligibility status matches classifier
      if (classification) {
        parsed.eligibilityStatus = classification.eligibility;
      }
      return parsed;
    } catch {
      console.error("Failed to parse explainer response");
    }
  }

  return {
    summary: "I don't have enough verified information to answer this accurately based on the provided context.",
    analysis: "The system could not generate a complete analysis.",
    eligibilityStatus: classification?.eligibility || "insufficient_information",
    recommendedAction: "Please provide more specific details about your situation.",
    nextSteps: ["Provide more context", "Upload relevant documents", "Speak with your credit specialist"]
  };
}

function validateCompliance(response: any): string[] {
  const flags: string[] = [];
  const responseText = JSON.stringify(response).toLowerCase();

  for (const phrase of FORBIDDEN_PHRASES) {
    if (responseText.includes(phrase.toLowerCase())) {
      flags.push(`forbidden_phrase: ${phrase}`);
    }
  }

  // Check for guarantee language
  if (/will (definitely|certainly|always)/.test(responseText)) {
    flags.push('guarantee_language_detected');
  }

  // Check for specific point predictions
  if (/increase.*(by )?\d+ points/.test(responseText)) {
    flags.push('specific_score_prediction');
  }

  return flags;
}

async function logInteraction(
  supabase: any,
  data: {
    userId: string;
    input: string;
    action: string;
    response: OrchestratorResponse;
    context?: any;
    classification?: ClassificationResult;
  }
) {
  try {
    await supabase.from('ai_interaction_logs').insert({
      user_id: data.userId,
      interaction_type: data.action,
      user_input: data.input,
      context_retrieved: data.context || null,
      eligibility_decision: data.classification?.eligibility || null,
      classifier_confidence: data.classification?.confidence || null,
      classifier_reasoning: data.classification?.reasoning || null,
      response_generated: data.response.response ? JSON.stringify(data.response.response) : null,
      response_structure: data.response.response || null,
      dispute_type: data.context?.disputeType || null,
      account_type: data.context?.accountType || null,
      bureau: data.context?.bureau || null,
      compliance_flags: data.response.complianceFlags || [],
      was_refused: data.response.wasRefused,
      refusal_reason: data.response.refusalReason || null,
      processing_time_ms: data.response.processingTimeMs
    });
  } catch (error) {
    console.error("Failed to log interaction:", error);
    // Don't throw - logging failure shouldn't break the response
  }
}
