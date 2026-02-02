import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { readAiStream } from '@/lib/aiStream';

interface ProgressExplanation {
  summary?: string;
  explanation?: string;
  positives?: string[];
  concerns?: string[];
  nextSteps?: string[];
  motivationalMessage?: string;
  headline?: string;
  message?: string;
  achievement?: string;
  impact?: string;
  nextMilestone?: string;
  whatHappened?: string;
  whyItMatters?: string;
  expectedScoreImpact?: string;
  celebrationNote?: string;
  overallSummary?: string;
  scoreProgress?: any;
  disputeProgress?: any;
  highlights?: string[];
  inProgress?: string[];
  estimatedCompletion?: string;
  motivationalClose?: string;
  likelyCauses?: string[];
  perspective?: string;
  whatWereDoing?: string;
  clientActions?: string[];
  reassurance?: string;
}

export function useProgressExplainer() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [explanation, setExplanation] = useState<ProgressExplanation | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const invokeExplainer = async (payload: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-progress-explainer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || publishableKey}`,
        apikey: publishableKey
      },
      body: JSON.stringify({
        ...payload,
        stream: true
      })
    });

    return readAiStream<{ result: ProgressExplanation }>(response, (event) => {
      if (event.type === 'status') {
        setStatusMessage(event.message || null);
      }
    });
  };

  const explainScoreChange = async (scoreHistory: any, disputeResults?: any[], clientData?: any) => {
    setIsProcessing(true);
    try {
      const data = await invokeExplainer({
        action: 'explain_score_change',
        scoreHistory,
        disputeResults,
        clientData
      });

      setExplanation(data.result);
      return data.result;
    } catch (error: any) {
      console.error('Error explaining score change:', error);
      toast({
        title: "Explanation Failed",
        description: error.message || "Failed to generate explanation.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setStatusMessage(null);
      setIsProcessing(false);
    }
  };

  const generateMilestoneMessage = async (clientData: any, milestones: any) => {
    setIsProcessing(true);
    try {
      const data = await invokeExplainer({
        action: 'generate_milestone_message',
        clientData,
        milestones
      });

      setExplanation(data.result);
      toast({
        title: "🎉 Milestone Achieved!",
        description: data.result.headline || "Congratulations on your progress!",
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error generating milestone message:', error);
      throw error;
    } finally {
      setStatusMessage(null);
      setIsProcessing(false);
    }
  };

  const explainDeletion = async (disputeResults: any, clientData?: any) => {
    setIsProcessing(true);
    try {
      const data = await invokeExplainer({
        action: 'explain_deletion',
        disputeResults,
        clientData
      });

      setExplanation(data.result);
      return data.result;
    } catch (error: any) {
      console.error('Error explaining deletion:', error);
      throw error;
    } finally {
      setStatusMessage(null);
      setIsProcessing(false);
    }
  };

  const generateProgressReport = async (clientData: any, scoreHistory: any, disputeResults?: any[]) => {
    setIsProcessing(true);
    try {
      const data = await invokeExplainer({
        action: 'generate_progress_report',
        clientData,
        scoreHistory,
        disputeResults
      });

      setExplanation(data.result);
      toast({
        title: "Progress Report Generated",
        description: "Your personalized progress report is ready.",
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error generating progress report:', error);
      throw error;
    } finally {
      setStatusMessage(null);
      setIsProcessing(false);
    }
  };

  const explainScoreDrop = async (scoreHistory: any, clientData?: any) => {
    setIsProcessing(true);
    try {
      const data = await invokeExplainer({
        action: 'explain_why_score_dropped',
        scoreHistory,
        clientData
      });

      setExplanation(data.result);
      return data.result;
    } catch (error: any) {
      console.error('Error explaining score drop:', error);
      throw error;
    } finally {
      setStatusMessage(null);
      setIsProcessing(false);
    }
  };

  const clearExplanation = () => setExplanation(null);

  return {
    isProcessing,
    explanation,
    statusMessage,
    explainScoreChange,
    generateMilestoneMessage,
    explainDeletion,
    generateProgressReport,
    explainScoreDrop,
    clearExplanation
  };
}
