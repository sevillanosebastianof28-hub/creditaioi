import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RoundRecommendation {
  creditorName: string;
  bureau: string;
  letterType: string;
  disputeReason: string;
  priority: string;
}

interface RoundAnalysis {
  nextRoundRecommendations?: RoundRecommendation[];
  escalationItems?: any[];
  strategyChanges?: any[];
  timing?: string;
  insights?: string[];
  items?: RoundRecommendation[];
  excludedItems?: any[];
  estimatedSuccessRate?: number;
  analysis?: string;
}

export function useRoundManager() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<RoundAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeRound = async (clientId: string, roundId: string, disputeItems: any[], bureauResponses: any[]) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-round-manager', {
        body: {
          action: 'analyze_round',
          clientId,
          roundId,
          disputeItems,
          bureauResponses
        }
      });

      if (error) throw error;
      
      setAnalysis(data.result);
      toast({
        title: "Round Analysis Complete",
        description: "AI has analyzed the current round and provided recommendations.",
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error analyzing round:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the dispute round.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateNextRound = async (clientId: string, previousItems: any[], responses: any[]) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-round-manager', {
        body: {
          action: 'generate_next_round',
          clientId,
          disputeItems: previousItems,
          bureauResponses: responses
        }
      });

      if (error) throw error;
      
      setAnalysis(data.result);
      toast({
        title: "Next Round Generated",
        description: `AI has prepared ${data.result.items?.length || 0} items for the next round.`,
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error generating next round:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate next round strategy.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const detectResponses = async (responseData: any) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-round-manager', {
        body: {
          action: 'detect_responses',
          bureauResponses: responseData
        }
      });

      if (error) throw error;
      
      toast({
        title: "Responses Detected",
        description: "Bureau responses have been parsed and outcomes extracted.",
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error detecting responses:', error);
      toast({
        title: "Detection Failed",
        description: error.message || "Failed to parse bureau responses.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAnalysis = () => setAnalysis(null);

  return {
    isProcessing,
    analysis,
    analyzeRound,
    generateNextRound,
    detectResponses,
    clearAnalysis
  };
}
