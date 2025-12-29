import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DisputableItem {
  id: string;
  creditor: string;
  accountType: string;
  issueType: string;
  balance: number;
  disputeReason: string;
  deletionProbability: number;
  expectedScoreImpact: number;
  applicableLaw: string;
  strategy: string;
  priority: 'high' | 'medium' | 'low';
  bureaus: string[];
}

export interface AnalysisSummary {
  totalAccounts: number;
  disputableItems: number;
  estimatedScoreIncrease: number;
  highPriorityItems: number;
  avgDeletionProbability: number;
}

export interface AnalysisResult {
  summary: AnalysisSummary | null;
  items: DisputableItem[];
  recommendations: string[];
  error?: string;
}

export function useCreditAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeReport = async (reportText: string) => {
    if (!reportText || reportText.trim().length < 50) {
      toast({
        title: "Insufficient Data",
        description: "Please provide a credit report with more content to analyze.",
        variant: "destructive",
      });
      return null;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.functions.invoke('analyze-credit-report', {
        body: { 
          reportText,
          userId: user?.id 
        },
      });

      if (error) {
        console.error('Analysis error:', error);
        
        if (error.message?.includes('429')) {
          toast({
            title: "Rate Limited",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "Credits Exhausted",
            description: "AI credits have been exhausted. Please add more credits.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Analysis Failed",
            description: error.message || "Failed to analyze credit report.",
            variant: "destructive",
          });
        }
        return null;
      }

      if (data?.error) {
        toast({
          title: "Analysis Error",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      setAnalysisResult(data);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${data.items?.length || 0} disputable items.`,
      });

      return data;
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
  };

  return {
    isAnalyzing,
    analysisResult,
    analyzeReport,
    clearAnalysis,
  };
}
