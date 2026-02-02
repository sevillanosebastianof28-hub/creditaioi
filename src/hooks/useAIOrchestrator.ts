import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { readAiStream } from '@/lib/aiStream';

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
  error?: string;
}

interface OrchestratorContext {
  disputeType?: 'collections' | 'late_payments' | 'charge_offs' | 'inquiries' | 'closed_accounts';
  accountType?: 'revolving' | 'installment' | 'collection' | 'mortgage' | 'auto';
  bureau?: 'experian' | 'equifax' | 'transunion';
  clientData?: {
    name?: string;
    scores?: {
      experian?: number;
      equifax?: number;
      transunion?: number;
    };
  };
  scoreHistory?: Array<{
    date: string;
    experian?: number;
    equifax?: number;
    transunion?: number;
  }>;
  disputeItems?: Array<{
    id: string;
    creditor: string;
    type: string;
    status: string;
  }>;
}

type ActionType = 'classify_dispute' | 'explain_credit' | 'generate_letter' | 'analyze_report' | 'full_orchestration';

export function useAIOrchestrator() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<OrchestratorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const orchestrate = useCallback(async (
    action: ActionType,
    input: string,
    context?: OrchestratorContext
  ): Promise<OrchestratorResponse | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
      }

      const { data: { session } } = await supabase.auth.getSession();
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-orchestrator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || publishableKey}`,
          apikey: publishableKey
        },
        body: JSON.stringify({
          action,
          input,
          context,
          userId: user.id,
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to process AI request');
      }

      const parsed = await readAiStream<OrchestratorResponse>(response, (event) => {
        if (event.type === 'status') {
          setStatusMessage(event.message || null);
        }
      });

      setStatusMessage(null);
      const responseData = parsed as OrchestratorResponse;
      setLastResponse(responseData);

      // Handle refused requests
      if (responseData.wasRefused) {
        toast({
          title: "Request Outside Scope",
          description: responseData.refusalReason || "This request cannot be processed.",
          variant: "destructive"
        });
        return responseData;
      }

      // Handle compliance flags
      if (responseData.complianceFlags && responseData.complianceFlags.length > 0) {
        console.warn("Compliance flags detected:", responseData.complianceFlags);
      }

      // Success feedback
      if (responseData.success && responseData.response) {
        toast({
          title: "Analysis Complete",
          description: responseData.response.summary.slice(0, 100) + (responseData.response.summary.length > 100 ? '...' : ''),
        });
      }

      return responseData;
    } catch (err: unknown) {
      console.error("AI Orchestrator error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to process AI request";
      const status = typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status?: number }).status
        : undefined;
      setStatusMessage(null);
      setError(errorMessage);
      
      // Handle rate limits
      if (status === 429) {
        toast({
          title: "Rate Limited",
          description: "Please wait a moment before trying again.",
          variant: "destructive"
        });
      } else if (status === 402) {
        toast({
          title: "AI Credits Exhausted",
          description: "Please contact support to add more credits.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "AI Processing Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
      return null;
    } finally {
      setStatusMessage(null);
      setIsProcessing(false);
    }
  }, [toast]);

  // Convenience methods for specific actions
  const classifyDispute = useCallback(async (
    description: string,
    context?: OrchestratorContext
  ) => {
    return orchestrate('classify_dispute', description, context);
  }, [orchestrate]);

  const explainCredit = useCallback(async (
    question: string,
    context?: OrchestratorContext
  ) => {
    return orchestrate('explain_credit', question, context);
  }, [orchestrate]);

  const generateLetter = useCallback(async (
    disputeDetails: string,
    context?: OrchestratorContext
  ) => {
    return orchestrate('generate_letter', disputeDetails, context);
  }, [orchestrate]);

  const analyzeReport = useCallback(async (
    reportSummary: string,
    context?: OrchestratorContext
  ) => {
    return orchestrate('analyze_report', reportSummary, context);
  }, [orchestrate]);

  const fullOrchestration = useCallback(async (
    request: string,
    context?: OrchestratorContext
  ) => {
    return orchestrate('full_orchestration', request, context);
  }, [orchestrate]);

  // Provide user feedback for fine-tuning
  const provideFeedback = useCallback(async (
    interactionId: string,
    feedback: 'helpful' | 'not_helpful' | 'incorrect' | 'unclear',
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('ai_interaction_logs')
        .update({
          user_feedback: feedback,
          agent_notes: notes
        })
        .eq('id', interactionId);

      if (error) throw error;

      toast({
        title: "Feedback Recorded",
        description: "Thank you for helping improve our AI.",
      });
    } catch (err) {
      console.error("Failed to record feedback:", err);
    }
  }, [toast]);

  return {
    // State
    isProcessing,
    lastResponse,
    error,
    statusMessage,
    
    // Actions
    orchestrate,
    classifyDispute,
    explainCredit,
    generateLetter,
    analyzeReport,
    fullOrchestration,
    provideFeedback,
    
    // Utilities
    clearResponse: () => setLastResponse(null),
    clearError: () => setError(null)
  };
}

// Export types for consumers
export type { 
  OrchestratorResponse, 
  OrchestratorContext, 
  ClassificationResult,
  ActionType 
};
