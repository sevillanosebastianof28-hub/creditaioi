import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PatternAnalysis {
  bureauPatterns?: Record<string, any>;
  creditorPatterns?: Record<string, any>;
  letterTypeEffectiveness?: Record<string, any>;
  recommendations?: string[];
  trends?: string[];
  keyMetrics?: {
    deletionRate: number;
    avgDaysToResolution: number;
    clientRetention: number;
    letterEfficiency: number;
  };
  topInsights?: string[];
  actionItems?: string[];
  forecasts?: string[];
  predictions?: any[];
  analysis?: string;
}

export function useOutcomeTracker() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState<PatternAnalysis | null>(null);
  const { toast } = useToast();

  const analyzePatterns = async (outcomes: any[], bureau?: string, letterType?: string, timeframe?: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-outcome-tracker', {
        body: {
          action: 'analyze_patterns',
          outcomes,
          bureau,
          letterType,
          timeframe
        }
      });

      if (error) throw error;
      
      setInsights(data.result);
      toast({
        title: "Pattern Analysis Complete",
        description: "AI has identified patterns in your dispute outcomes.",
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error analyzing patterns:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze outcome patterns.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const predictSuccess = async (outcomes: any[]) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-outcome-tracker', {
        body: {
          action: 'predict_success',
          outcomes
        }
      });

      if (error) throw error;
      
      toast({
        title: "Predictions Generated",
        description: "AI has predicted success rates for potential disputes.",
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error predicting success:', error);
      toast({
        title: "Prediction Failed",
        description: error.message || "Failed to generate success predictions.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateInsights = async (outcomes: any[], timeframe?: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-outcome-tracker', {
        body: {
          action: 'generate_insights',
          outcomes,
          timeframe
        }
      });

      if (error) throw error;
      
      setInsights(data.result);
      toast({
        title: "Insights Generated",
        description: "AI has generated business insights from your data.",
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate insights.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const learnFromOutcome = async (outcome: any) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-outcome-tracker', {
        body: {
          action: 'learn_from_outcome',
          outcomes: outcome
        }
      });

      if (error) throw error;
      
      toast({
        title: "Learning Complete",
        description: "AI has extracted patterns from this outcome.",
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error learning from outcome:', error);
      toast({
        title: "Learning Failed",
        description: error.message || "Failed to learn from outcome.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearInsights = () => setInsights(null);

  return {
    isProcessing,
    insights,
    analyzePatterns,
    predictSuccess,
    generateInsights,
    learnFromOutcome,
    clearInsights
  };
}
