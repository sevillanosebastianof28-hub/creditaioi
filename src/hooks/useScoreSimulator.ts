import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimulationResult {
  currentScore?: number;
  projectedScore?: number;
  pointsGained?: number;
  breakdown?: Array<{ item: string; pointsImpact: number; confidence: string }>;
  timeline?: string;
  confidence?: string;
  caveats?: string[];
  qualified?: boolean;
  loanType?: string;
  minimumRequired?: number;
  gap?: number;
  probability?: number;
  estimatedRate?: string;
  recommendations?: string[];
  alternativeOptions?: string[];
  optimizedOrder?: any[];
  phases?: any[];
  totalProjectedGain?: number;
  quickWins?: any[];
  hardCases?: any[];
  strategyNotes?: string;
  monthlyProjections?: any[];
  milestones?: any[];
  risks?: string[];
  accelerators?: string[];
  analysis?: string;
}

export function useScoreSimulator() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const { toast } = useToast();

  const simulateDeletions = async (currentScores: any, selectedDeletions: any[], tradelines?: any[]) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-score-simulator', {
        body: {
          action: 'simulate_deletions',
          currentScores,
          selectedDeletions,
          tradelines
        }
      });

      if (error) throw error;
      
      setSimulation(data.result);
      toast({
        title: "Simulation Complete",
        description: `Projected gain: +${data.result.pointsGained || 0} points`,
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error simulating deletions:', error);
      toast({
        title: "Simulation Failed",
        description: error.message || "Failed to simulate score impact.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const checkLoanQualification = async (currentScores: any, loanType: string, loanAmount?: number, tradelines?: any[]) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-score-simulator', {
        body: {
          action: 'check_loan_qualification',
          currentScores,
          loanType,
          loanAmount,
          tradelines
        }
      });

      if (error) throw error;
      
      setSimulation(data.result);
      
      if (data.result.qualified) {
        toast({
          title: "You May Qualify!",
          description: `${data.result.probability}% chance of approval for ${loanType}`,
        });
      } else {
        toast({
          title: "Not Yet Qualified",
          description: `Need ${data.result.gap} more points for ${loanType}`,
          variant: "destructive",
        });
      }
      
      return data.result;
    } catch (error: any) {
      console.error('Error checking loan qualification:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const optimizeDeletionOrder = async (currentScores: any, tradelines: any[]) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-score-simulator', {
        body: {
          action: 'optimize_deletion_order',
          currentScores,
          tradelines
        }
      });

      if (error) throw error;
      
      setSimulation(data.result);
      toast({
        title: "Strategy Optimized",
        description: `${data.result.phases?.length || 0} phases planned for maximum impact`,
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error optimizing deletion order:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const projectTimeline = async (currentScores: any, tradelines: any[]) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-score-simulator', {
        body: {
          action: 'project_timeline',
          currentScores,
          tradelines
        }
      });

      if (error) throw error;
      
      setSimulation(data.result);
      toast({
        title: "Timeline Projected",
        description: `Estimated ${data.result.estimatedMonths || 'N/A'} months to reach target`,
      });
      
      return data.result;
    } catch (error: any) {
      console.error('Error projecting timeline:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSimulation = () => setSimulation(null);

  return {
    isProcessing,
    simulation,
    simulateDeletions,
    checkLoanQualification,
    optimizeDeletionOrder,
    projectTimeline,
    clearSimulation
  };
}
