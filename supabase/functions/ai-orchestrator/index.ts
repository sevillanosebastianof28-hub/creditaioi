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
  "will be removed",
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
  confidenceScore?: number;
  tags?: {
    dispute_type?: string | null;
    eligibility_label?: string | null;
    confidence_level?: 'low' | 'medium' | 'high';
    refusal_reason?: string | null;
    compliance_risk?: 'low' | 'medium' | 'high';
  };
  modelVersions?: {
    classifier: string;
    core: string;
    retriever: string;
  };
  validation?: {
    missingSections: string[];
    forbiddenPhrases: string[];
    overrideAttempted: boolean;
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

    const LOCAL_AI_BASE_URL = Deno.env.get("LOCAL_AI_BASE_URL");
    if (!LOCAL_AI_BASE_URL && !LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    
    // Ensure we have an API key for AI calls
    const apiKey = LOVABLE_API_KEY || '';

    // Create Supabase client for logging
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const modelVersions = getModelVersions();
    const sanitizedInput = sanitizeInput(input);
    const injectionDetected = detectPromptInjection(input);

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
      const scopeValidation = validateScope(sanitizedInput);
      if (!scopeValidation.valid) {
        const response: OrchestratorResponse = {
          success: false,
          complianceFlags: ['out_of_scope'],
          wasRefused: true,
          refusalReason: scopeValidation.reason,
          confidenceScore: 0,
          tags: buildTags(context, undefined, 0, scopeValidation.reason, ['out_of_scope']),
          modelVersions,
          validation: { missingSections: [], forbiddenPhrases: [], overrideAttempted: false },
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

      if (injectionDetected) {
        const refusal = buildRefusalResponse('prompt_injection_detected');
        const response: OrchestratorResponse = {
          success: false,
          response: refusal.response,
          complianceFlags: ['prompt_injection_detected'],
          wasRefused: true,
          refusalReason: refusal.refusalReason,
          confidenceScore: 0,
          tags: buildTags(context, undefined, 0, refusal.refusalReason, ['prompt_injection_detected']),
          modelVersions,
          validation: { missingSections: [], forbiddenPhrases: [], overrideAttempted: false },
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

      const completeness = checkDataCompleteness(context);
      if (!completeness.complete) {
        const classification: ClassificationResult = {
          eligibility: 'insufficient_information',
          confidence: 0,
          reasoning: {
            factors: ["Missing required fields"],
            requiredEvidence: completeness.missingFields,
            complianceFlags: ["data_incomplete"]
          }
        };

        const refusal = buildAdditionalInfoResponse(completeness.missingFields);
        const response: OrchestratorResponse = {
          success: false,
          classification,
          response: refusal.response,
          complianceFlags: ['data_incomplete'],
          wasRefused: true,
          refusalReason: refusal.refusalReason,
          confidenceScore: 0,
          tags: buildTags(context, classification, 0, refusal.refusalReason, ['data_incomplete']),
          modelVersions,
          validation: { missingSections: [], forbiddenPhrases: [], overrideAttempted: false },
          processingTimeMs: Date.now() - startTime
        };

        await logInteraction(supabase, {
          userId,
          input,
          action,
          response,
          context,
          classification
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
      const retrievedContext = await retrieveKnowledge(action, context?.disputeType);
      if (!retrievedContext) {
        const refusal = buildRefusalResponse('rag_empty');
        const response: OrchestratorResponse = {
          success: false,
          response: refusal.response,
          complianceFlags: ['rag_empty'],
          wasRefused: true,
          refusalReason: refusal.refusalReason,
          confidenceScore: 0,
          tags: buildTags(context, undefined, 0, refusal.refusalReason, ['rag_empty']),
          modelVersions,
          validation: { missingSections: [], forbiddenPhrases: [], overrideAttempted: false },
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

      // Step 3: For dispute-related requests, run classifier first (Model 2 equivalent)
      let classification: ClassificationResult | undefined;
      if (action === 'classify_dispute' || action === 'full_orchestration') {
        await sendEvent('status', { type: 'status', message: 'Classifying request...' });
        classification = await runClassifier(apiKey, sanitizedInput, context, retrievedContext);
      }

      const disputeHistory = await getDisputeHistory(supabase as any, context, userId);
      if (disputeHistory.suppressRecommendation) {
        const classification: ClassificationResult = {
          eligibility: 'not_eligible',
          confidence: 0.6,
          reasoning: {
            factors: ["Recent dispute attempts within cooldown window"],
            requiredEvidence: [],
            complianceFlags: ["dispute_cooldown"]
          }
        };

        const responsePayload = buildCooldownResponse();
        const response: OrchestratorResponse = {
          success: true,
          classification,
          response: responsePayload,
          complianceFlags: ['dispute_cooldown'],
          wasRefused: false,
          confidenceScore: 0.55,
          tags: buildTags(context, classification, 0.55, null, ['dispute_cooldown']),
          modelVersions,
          validation: { missingSections: [], forbiddenPhrases: [], overrideAttempted: false },
          processingTimeMs: Date.now() - startTime
        };

        await logInteraction(supabase, {
          userId,
          input,
          action,
          response,
          context,
          classification
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

      // Step 4: Generate response using explainer model (Model 1 equivalent)
      await sendEvent('status', { type: 'status', message: 'Generating response...' });
      const response = await runExplainer(apiKey, sanitizedInput, context, retrievedContext, classification);

      // Step 5: Validate response for compliance
      await sendEvent('status', { type: 'status', message: 'Checking compliance...' });
      const validation = validateOutput(response, classification);
      const complianceFlags = validation.complianceFlags;

      let finalResponseContent = response;
      let wasRefused = false;
      let refusalReason: string | undefined;

      if (validation.shouldRefuse) {
        const refusal = buildRefusalResponse(validation.refusalReason || 'output_validation_failed');
        finalResponseContent = refusal.response;
        wasRefused = true;
        refusalReason = refusal.refusalReason;
      }

      if (classification && finalResponseContent) {
        finalResponseContent.eligibilityStatus = classification.eligibility;
      }

      const confidenceScore = computeConfidenceScore({
        retrievedContext,
        classification,
        missingSections: validation.missingSections,
        complianceFlags,
      });

      if (confidenceScore < 0.5 && !wasRefused) {
        const lowConfidence = buildAdditionalInfoResponse(validation.missingSections);
        finalResponseContent = lowConfidence.response;
        wasRefused = true;
        refusalReason = lowConfidence.refusalReason;
      }

      // Step 6: Build final response
      const finalResponse: OrchestratorResponse = {
        success: true,
        classification,
        response: finalResponseContent,
        complianceFlags,
        wasRefused,
        refusalReason,
        confidenceScore,
        tags: buildTags(context, classification, confidenceScore, refusalReason, complianceFlags),
        modelVersions,
        validation: {
          missingSections: validation.missingSections,
          forbiddenPhrases: validation.forbiddenPhrases,
          overrideAttempted: validation.overrideAttempted
        },
        processingTimeMs: Date.now() - startTime
      };

      emitModelAlert(finalResponse);

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
    const scopeValidation = validateScope(sanitizedInput);
    if (!scopeValidation.valid) {
      const response: OrchestratorResponse = {
        success: false,
        complianceFlags: ['out_of_scope'],
        wasRefused: true,
        refusalReason: scopeValidation.reason,
        confidenceScore: 0,
        tags: buildTags(context, undefined, 0, scopeValidation.reason, ['out_of_scope']),
        modelVersions,
        validation: { missingSections: [], forbiddenPhrases: [], overrideAttempted: false },
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

    if (injectionDetected) {
      const refusal = buildRefusalResponse('prompt_injection_detected');
      const response: OrchestratorResponse = {
        success: false,
        response: refusal.response,
        complianceFlags: ['prompt_injection_detected'],
        wasRefused: true,
        refusalReason: refusal.refusalReason,
        confidenceScore: 0,
        tags: buildTags(context, undefined, 0, refusal.refusalReason, ['prompt_injection_detected']),
        modelVersions,
        validation: { missingSections: [], forbiddenPhrases: [], overrideAttempted: false },
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

    const completeness = checkDataCompleteness(context);
    if (!completeness.complete) {
      const classification: ClassificationResult = {
        eligibility: 'insufficient_information',
        confidence: 0,
        reasoning: {
          factors: ["Missing required fields"],
          requiredEvidence: completeness.missingFields,
          complianceFlags: ["data_incomplete"]
        }
      };

      const refusal = buildAdditionalInfoResponse(completeness.missingFields);
      const response: OrchestratorResponse = {
        success: false,
        classification,
        response: refusal.response,
        complianceFlags: ['data_incomplete'],
        wasRefused: true,
        refusalReason: refusal.refusalReason,
        confidenceScore: 0,
        tags: buildTags(context, classification, 0, refusal.refusalReason, ['data_incomplete']),
        modelVersions,
        validation: { missingSections: [], forbiddenPhrases: [], overrideAttempted: false },
        processingTimeMs: Date.now() - startTime
      };

      await logInteraction(supabase, {
        userId,
        input,
        action,
        response,
        context,
        classification
      });

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Step 2: Retrieve relevant knowledge based on action type
    const retrievedContext = await retrieveKnowledge(action, context?.disputeType);
    if (!retrievedContext) {
      const refusal = buildRefusalResponse('rag_empty');
      const response: OrchestratorResponse = {
        success: false,
        response: refusal.response,
        complianceFlags: ['rag_empty'],
        wasRefused: true,
        refusalReason: refusal.refusalReason,
        confidenceScore: 0,
        tags: buildTags(context, undefined, 0, refusal.refusalReason, ['rag_empty']),
        modelVersions,
        validation: { missingSections: [], forbiddenPhrases: [], overrideAttempted: false },
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

    // Step 3: For dispute-related requests, run classifier first (Model 2 equivalent)
    let classification: ClassificationResult | undefined;
    if (action === 'classify_dispute' || action === 'full_orchestration') {
      classification = await runClassifier(apiKey, sanitizedInput, context, retrievedContext);
    }

    const disputeHistory = await getDisputeHistory(supabase as any, context, userId);
    if (disputeHistory.suppressRecommendation) {
      const classification: ClassificationResult = {
        eligibility: 'not_eligible',
        confidence: 0.6,
        reasoning: {
          factors: ["Recent dispute attempts within cooldown window"],
          requiredEvidence: [],
          complianceFlags: ["dispute_cooldown"]
        }
      };

      const responsePayload = buildCooldownResponse();
      const response: OrchestratorResponse = {
        success: true,
        classification,
        response: responsePayload,
        complianceFlags: ['dispute_cooldown'],
        wasRefused: false,
        confidenceScore: 0.55,
        tags: buildTags(context, classification, 0.55, null, ['dispute_cooldown']),
        modelVersions,
        validation: { missingSections: [], forbiddenPhrases: [], overrideAttempted: false },
        processingTimeMs: Date.now() - startTime
      };

      await logInteraction(supabase, {
        userId,
        input,
        action,
        response,
        context,
        classification
      });

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Step 4: Generate response using explainer model (Model 1 equivalent)
    const response = await runExplainer(apiKey, sanitizedInput, context, retrievedContext, classification);

    // Step 5: Validate response for compliance
    const validation = validateOutput(response, classification);
    const complianceFlags = validation.complianceFlags;

    let finalResponseContent = response;
    let wasRefused = false;
    let refusalReason: string | undefined;

    if (validation.shouldRefuse) {
      const refusal = buildRefusalResponse(validation.refusalReason || 'output_validation_failed');
      finalResponseContent = refusal.response;
      wasRefused = true;
      refusalReason = refusal.refusalReason;
    }

    if (classification && finalResponseContent) {
      finalResponseContent.eligibilityStatus = classification.eligibility;
    }

    const confidenceScore = computeConfidenceScore({
      retrievedContext,
      classification,
      missingSections: validation.missingSections,
      complianceFlags,
    });

    if (confidenceScore < 0.5 && !wasRefused) {
      const lowConfidence = buildAdditionalInfoResponse(validation.missingSections);
      finalResponseContent = lowConfidence.response;
      wasRefused = true;
      refusalReason = lowConfidence.refusalReason;
    }

    // Step 6: Build final response
    const finalResponse: OrchestratorResponse = {
      success: true,
      classification,
      response: finalResponseContent,
      complianceFlags,
      wasRefused,
      refusalReason,
      confidenceScore,
      tags: buildTags(context, classification, confidenceScore, refusalReason, complianceFlags),
      modelVersions,
      validation: {
        missingSections: validation.missingSections,
        forbiddenPhrases: validation.forbiddenPhrases,
        overrideAttempted: validation.overrideAttempted
      },
      processingTimeMs: Date.now() - startTime
    };

    emitModelAlert(finalResponse);

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

async function retrieveKnowledge(action: string, disputeType?: string): Promise<string> {
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

  const localBaseUrl = Deno.env.get("LOCAL_AI_BASE_URL");
  if (localBaseUrl) {
    try {
      const query = `${action} ${disputeType || ''}`.trim();
      const response = await fetch(`${localBaseUrl}/retrieve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 6 })
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.contexts?.length) {
          return truncateContext(data.contexts.join("\n\n"));
        }
      }
    } catch (error) {
      console.error("Local retrieval error:", error);
    }

    if ((Deno.env.get("REQUIRE_RAG") || "true").toLowerCase() === "true") {
      return "";
    }
  }

  // Return as context string (in production, this would fetch actual content)
  const fallbackContext = `Retrieved knowledge context from: ${relevantDocs.join(', ')}. 
  
KEY COMPLIANCE RULES:
- Never guarantee outcomes or specific score increases
- Never impersonate legal professionals
- Always provide factual, neutral information
- Use educational, empowering tone
- Reference FCRA rights when applicable

FORBIDDEN PHRASES: ${FORBIDDEN_PHRASES.join(', ')}`;

  if ((Deno.env.get("REQUIRE_RAG") || "true").toLowerCase() === "true") {
    return "";
  }

  return truncateContext(fallbackContext);
}

async function runClassifier(
  apiKey: string, 
  input: string, 
  context: OrchestratorRequest['context'],
  retrievedKnowledge: string
): Promise<ClassificationResult> {
  const localBaseUrl = Deno.env.get("LOCAL_AI_BASE_URL");
  if (localBaseUrl) {
    try {
      const response = await fetch(`${localBaseUrl}/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Local classifier error:", error);
    }
  }
  
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

USER REQUEST (sanitized):
${input}

Generate a response following this EXACT structure. Be concise but thorough.`;

  const localBaseUrl = Deno.env.get("LOCAL_AI_BASE_URL");
  if (localBaseUrl) {
    try {
      const response = await fetch(`${localBaseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: explainerPrompt,
          user: "Generate the response following the required structure. Respond with JSON only.",
          max_new_tokens: 700,
          temperature: 0.2
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.content || "";
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error("Local explainer error:", error);
    }
  }

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
    
    return buildSafeEducationalResponse(classification?.eligibility);
  }

  const result = await response.json();
  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    try {
      const parsed = JSON.parse(toolCall.function.arguments);
      return parsed;
    } catch {
      console.error("Failed to parse explainer response");
    }
  }

  return buildSafeEducationalResponse(classification?.eligibility);
}

function validateOutput(
  response: { summary: string; analysis: string; eligibilityStatus: string; recommendedAction: string; nextSteps: string[] },
  classification?: ClassificationResult
): {
  missingSections: string[];
  forbiddenPhrases: string[];
  complianceFlags: string[];
  overrideAttempted: boolean;
  shouldRefuse: boolean;
  refusalReason?: string;
} {
  const missingSections: string[] = [];
  const forbiddenMatches: string[] = [];
  const complianceFlags: string[] = [];

  if (!response.summary?.trim()) missingSections.push('summary');
  if (!response.analysis?.trim()) missingSections.push('analysis');
  if (!response.eligibilityStatus?.trim()) missingSections.push('eligibility_status');
  if (!response.recommendedAction?.trim()) missingSections.push('recommended_action');
  if (!response.nextSteps?.length) missingSections.push('next_steps');

  const responseText = JSON.stringify(response).toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (responseText.includes(phrase.toLowerCase())) {
      forbiddenMatches.push(phrase);
      complianceFlags.push(`forbidden_phrase:${phrase}`);
    }
  }

  if (/will (definitely|certainly|always)/.test(responseText)) {
    complianceFlags.push('guarantee_language_detected');
  }

  if (/increase.*(by )?\d+ points/.test(responseText)) {
    complianceFlags.push('specific_score_prediction');
  }

  const overrideAttempted = Boolean(
    classification && response.eligibilityStatus && response.eligibilityStatus !== classification.eligibility
  );
  if (overrideAttempted) {
    complianceFlags.push('eligibility_override_attempted');
  }

  const shouldRefuse = forbiddenMatches.length > 0 || missingSections.length > 0;
  const refusalReason = forbiddenMatches.length > 0
    ? 'forbidden_phrase_detected'
    : missingSections.length > 0
    ? 'missing_required_sections'
    : undefined;

  return {
    missingSections,
    forbiddenPhrases: forbiddenMatches,
    complianceFlags,
    overrideAttempted,
    shouldRefuse,
    refusalReason
  };
}

function sanitizeInput(input: string): string {
  return input
    .replace(/^(system|developer|assistant):/gim, '')
    .replace(/```[\s\S]*?```/g, '')
    .trim();
}

function detectPromptInjection(input: string): boolean {
  const lower = input.toLowerCase();
  const patterns = [
    'ignore previous instructions',
    'disregard above',
    'system prompt',
    'developer message',
    'you are now',
    'jailbreak',
    'act as',
  ];
  return patterns.some((pattern) => lower.includes(pattern));
}

function checkDataCompleteness(context?: OrchestratorRequest['context']): { complete: boolean; missingFields: string[] } {
  if (!context) return { complete: true, missingFields: [] };

  const requiredByAccount: Record<string, string[]> = {
    collection: ['creditor_name', 'bureau', 'dispute_reason'],
    charge_off: ['creditor_name', 'bureau', 'dispute_reason'],
    inquiry: ['bureau', 'dispute_reason'],
    credit_card: ['creditor_name', 'bureau', 'dispute_reason'],
    default: ['bureau', 'dispute_reason']
  };

  const accountType = (context.accountType || context.disputeType || 'default').toLowerCase();
  const required = requiredByAccount[accountType] || requiredByAccount.default;

  const item = context.disputeItems?.[0] || {};
  const missing = required.filter((field) => !item[field] && !(context as any)[field]);

  return {
    complete: missing.length === 0,
    missingFields: missing
  };
}

function computeConfidenceScore(params: {
  retrievedContext: string;
  classification?: ClassificationResult;
  missingSections: string[];
  complianceFlags: string[];
}): number {
  const contextScore = Math.min(1, params.retrievedContext.length / 1200);
  const classifierScore = params.classification ? params.classification.confidence : 0.2;
  const missingPenalty = params.missingSections.length > 0 ? 0.4 : 0;
  const compliancePenalty = params.complianceFlags.length > 0 ? 0.2 : 0;
  const score = Math.max(0, (contextScore * 0.4 + classifierScore * 0.6) - missingPenalty - compliancePenalty);
  return Number(score.toFixed(2));
}

function buildTags(
  context: OrchestratorRequest['context'] | undefined,
  classification: ClassificationResult | undefined,
  confidenceScore: number,
  refusalReason: string | null | undefined,
  complianceFlags: string[]
) {
  const confidence_level = confidenceScore < 0.5 ? 'low' : confidenceScore < 0.8 ? 'medium' : 'high';
  const compliance_risk = complianceFlags.length > 0 ? (complianceFlags.length > 2 ? 'high' : 'medium') : 'low';
  return {
    dispute_type: context?.disputeType || null,
    eligibility_label: classification?.eligibility || null,
    confidence_level,
    refusal_reason: refusalReason || null,
    compliance_risk,
  } as const;
}

function buildRefusalResponse(reason: string) {
  return {
    refusalReason: reason,
    response: {
      summary: "This request can't be completed as written.",
      analysis: "The request violates compliance rules or lacks required context.",
      eligibilityStatus: "insufficient_information",
      recommendedAction: "Provide additional details or rephrase the request to stay within compliance.",
      nextSteps: ["Add missing account details", "Avoid legal or guaranteed outcome language", "Retry with factual information"]
    }
  };
}

function buildAdditionalInfoResponse(missingFields: string[]) {
  return {
    refusalReason: "additional_information_required",
    response: {
      summary: "Additional information is required before we can proceed.",
      analysis: "Key details are missing, which prevents a compliant and accurate recommendation.",
      eligibilityStatus: "insufficient_information",
      recommendedAction: "Provide the missing fields and resubmit.",
      nextSteps: missingFields.length > 0 ? missingFields.map((field) => `Provide ${field.replace(/_/g, ' ')}`) : ["Provide account details"]
    }
  };
}

function buildCooldownResponse() {
  return {
    summary: "Recent dispute attempts require a cooldown period.",
    analysis: "Multiple disputes in a short window can reduce effectiveness and trigger compliance risk.",
    eligibilityStatus: "not_eligible",
    recommendedAction: "Wait for the cooldown period to expire before submitting another dispute.",
    nextSteps: ["Monitor bureau responses", "Gather additional evidence", "Reassess after 30 days"]
  };
}

function buildSafeEducationalResponse(eligibility?: string) {
  return {
    summary: "I can share general credit education while we gather more specifics.",
    analysis: "The system was unable to generate a detailed response, so here is a safe overview.",
    eligibilityStatus: eligibility || "insufficient_information",
    recommendedAction: "Provide more detailed account information for a tailored response.",
    nextSteps: ["Add account details", "Share bureau name", "Provide dispute reason"]
  };
}

async function getDisputeHistory(
  supabase: ReturnType<typeof createClient>,
  context: OrchestratorRequest['context'] | undefined,
  userId: string
): Promise<{ attempts: number; suppressRecommendation: boolean }> {
  const item = context?.disputeItems?.[0];
  const accountNumber = item?.account_number || item?.accountNumber || null;
  const creditorName = item?.creditor || item?.creditor_name || item?.creditorName || null;
  const bureau = item?.bureau || context?.bureau || null;
  const clientId = item?.client_id || context?.clientData?.id || userId;

  if (!bureau || (!accountNumber && !creditorName)) {
    return { attempts: 0, suppressRecommendation: false };
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from('dispute_items')
    .select('id, created_at')
    .eq('client_id', clientId)
    .eq('bureau', bureau)
    .gte('created_at', since);

  if (accountNumber) {
    query = query.eq('account_number', accountNumber);
  } else if (creditorName) {
    query = query.eq('creditor_name', creditorName);
  }

  const { data } = await query;
  const attempts = data?.length || 0;
  return { attempts, suppressRecommendation: attempts >= 2 };
}

function truncateContext(context: string): string {
  const maxChars = Number(Deno.env.get("MAX_CONTEXT_CHARS") || 3500);
  if (context.length <= maxChars) return context;
  return context.slice(0, maxChars);
}

function getModelVersions() {
  return {
    classifier: Deno.env.get("MODEL_VERSION_CLASSIFIER") || "distilbert-base-uncased",
    core: Deno.env.get("MODEL_VERSION_CORE") || "gemini-3-flash-preview",
    retriever: Deno.env.get("MODEL_VERSION_RETRIEVER") || "all-MiniLM-L6-v2"
  };
}

function emitModelAlert(response: OrchestratorResponse) {
  if (response.confidenceScore !== undefined && response.confidenceScore < 0.4) {
    console.warn("Low confidence response detected", {
      confidenceScore: response.confidenceScore,
      tags: response.tags,
      complianceFlags: response.complianceFlags
    });
  }

  if (response.complianceFlags.length > 2) {
    console.warn("High compliance risk response detected", {
      complianceFlags: response.complianceFlags,
      tags: response.tags
    });
  }
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
    const tags = data.response.tags || null;
    const validation = data.response.validation || null;
    const modelVersions = data.response.modelVersions || null;

    const agentNotes = {
      tags,
      validation,
      modelVersions,
      confidenceScore: data.response.confidenceScore ?? null,
      complianceFlags: data.response.complianceFlags || []
    };

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
      agent_notes: JSON.stringify(agentNotes),
      dispute_type: data.context?.disputeType || null,
      account_type: data.context?.accountType || null,
      bureau: data.context?.bureau || null,
      compliance_flags: data.response.complianceFlags || [],
      was_refused: data.response.wasRefused,
      refusal_reason: data.response.refusalReason || null,
      training_label: tags ? JSON.stringify(tags) : null,
      is_training_ready: data.response.wasRefused ? false : true,
      processing_time_ms: data.response.processingTimeMs
    });
  } catch (error) {
    console.error("Failed to log interaction:", error);
    // Don't throw - logging failure shouldn't break the response
  }
}
