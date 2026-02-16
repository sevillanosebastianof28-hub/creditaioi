import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DisputableItem {
  id: string;
  creditor: string;
  accountNumber?: string;
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
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
    setStatusMessage('Analyzing credit report...');
    setAnalysisResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-credit-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || publishableKey}`,
          apikey: publishableKey
        },
        body: JSON.stringify({
          reportText,
          userId: user?.id,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();

      const normalizedItems = (data.items || []).map((item: any) => ({
        ...item,
        accountNumber:
          item.accountNumber ||
          item.account_number ||
          item.accountNo ||
          item.account_no ||
          item.account ||
          item.acct ||
          undefined,
      }));

      setAnalysisResult({
        ...data,
        items: normalizedItems,
      });
      
      toast({
        title: "Analysis Complete",
        description: `Found ${normalizedItems.length || 0} disputable items.`,
      });

        return { ...data, items: normalizedItems };
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setStatusMessage(null);
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
  };

  return {
    isAnalyzing,
    analysisResult,
    statusMessage,
    analyzeReport,
    clearAnalysis,
  };
}
