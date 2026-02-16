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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const invokeOutcomeTracker = async (payload: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-outcome-tracker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || publishableKey}`,
        apikey: publishableKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Outcome tracker request failed');
    }

    return response.json();
  };

  const analyzePatterns = async (outcomes: any[], bureau?: string, letterType?: string, timeframe?: string) => {
    setIsProcessing(true);
    try {
      const data = await invokeOutcomeTracker({
        action: 'analyze_patterns',
        outcomes,
        bureau,
        letterType,
        timeframe
      });

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
      setStatusMessage(null);
      setIsProcessing(false);
    }
  };

  const predictSuccess = async (outcomes: any[]) => {
    setIsProcessing(true);
    try {
      const data = await invokeOutcomeTracker({
        action: 'predict_success',
        outcomes
      });

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
      setStatusMessage(null);
      setIsProcessing(false);
    }
  };

  const generateInsights = async (outcomes: any[], timeframe?: string) => {
    setIsProcessing(true);
    try {
      const data = await invokeOutcomeTracker({
        action: 'generate_insights',
        outcomes,
        timeframe
      });

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
      setStatusMessage(null);
      setIsProcessing(false);
    }
  };

  const learnFromOutcome = async (outcome: any) => {
    setIsProcessing(true);
    try {
      const data = await invokeOutcomeTracker({
        action: 'learn_from_outcome',
        outcomes: outcome
      });

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
      setStatusMessage(null);
      setIsProcessing(false);
    }
  };

  const clearInsights = () => setInsights(null);

  return {
    isProcessing,
    insights,
    statusMessage,
    analyzePatterns,
    predictSuccess,
    generateInsights,
    learnFromOutcome,
    clearInsights
  };
}
