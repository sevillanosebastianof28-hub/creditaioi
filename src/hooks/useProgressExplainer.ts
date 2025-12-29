import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const explainScoreChange = async (scoreHistory: any, disputeResults?: any[], clientData?: any) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-progress-explainer', {
        body: {
          action: 'explain_score_change',
          scoreHistory,
          disputeResults,
          clientData
        }
      });

      if (error) throw error;
      
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
      setIsProcessing(false);
    }
  };

  const generateMilestoneMessage = async (clientData: any, milestones: any) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-progress-explainer', {
        body: {
          action: 'generate_milestone_message',
          clientData,
          milestones
        }
      });

      if (error) throw error;
      
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
      setIsProcessing(false);
    }
  };

  const explainDeletion = async (disputeResults: any, clientData?: any) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-progress-explainer', {
        body: {
          action: 'explain_deletion',
          disputeResults,
          clientData
        }
      });

      if (error) throw error;
      
      setExplanation(data.result);
      return data.result;
    } catch (error: any) {
      console.error('Error explaining deletion:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateProgressReport = async (clientData: any, scoreHistory: any, disputeResults?: any[]) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-progress-explainer', {
        body: {
          action: 'generate_progress_report',
          clientData,
          scoreHistory,
          disputeResults
        }
      });

      if (error) throw error;
      
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
      setIsProcessing(false);
    }
  };

  const explainScoreDrop = async (scoreHistory: any, clientData?: any) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-progress-explainer', {
        body: {
          action: 'explain_why_score_dropped',
          scoreHistory,
          clientData
        }
      });

      if (error) throw error;
      
      setExplanation(data.result);
      return data.result;
    } catch (error: any) {
      console.error('Error explaining score drop:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearExplanation = () => setExplanation(null);

  return {
    isProcessing,
    explanation,
    explainScoreChange,
    generateMilestoneMessage,
    explainDeletion,
    generateProgressReport,
    explainScoreDrop,
    clearExplanation
  };
}
