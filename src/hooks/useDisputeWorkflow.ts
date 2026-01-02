import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DisputeItem {
  id: string;
  creditor_name: string;
  bureau: 'experian' | 'equifax' | 'transunion';
  letter_type: string;
  dispute_reason: string;
  outcome: string;
  account_number?: string;
  letter_content?: string;
  sent_at?: string;
  response_received_at?: string;
}

export interface DisputeRound {
  id: string;
  round_number: number;
  status: string;
  started_at: string;
  completed_at?: string;
  notes?: string;
  ai_recommendations?: any;
  items: DisputeItem[];
}

export function useDisputeWorkflow() {
  const [isLoading, setIsLoading] = useState(false);
  const [rounds, setRounds] = useState<DisputeRound[]>([]);
  const [currentRound, setCurrentRound] = useState<DisputeRound | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRounds = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: roundsData, error: roundsError } = await supabase
        .from('dispute_rounds')
        .select('*')
        .eq('client_id', user.id)
        .order('round_number', { ascending: false });

      if (roundsError) throw roundsError;

      const roundsWithItems: DisputeRound[] = [];
      for (const round of roundsData || []) {
        const { data: items } = await supabase
          .from('dispute_items')
          .select('*')
          .eq('round_id', round.id);
        
        roundsWithItems.push({
          ...round,
          items: items || []
        });
      }

      setRounds(roundsWithItems);
      if (roundsWithItems.length > 0) {
        setCurrentRound(roundsWithItems[0]);
      }
    } catch (error) {
      console.error('Error fetching dispute rounds:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createRound = useCallback(async () => {
    if (!user) return null;
    try {
      const nextNumber = rounds.length > 0 ? Math.max(...rounds.map(r => r.round_number)) + 1 : 1;
      
      const { data, error } = await supabase
        .from('dispute_rounds')
        .insert({
          client_id: user.id,
          round_number: nextNumber,
          status: 'pending',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const newRound: DisputeRound = { ...data, items: [] };
      setRounds(prev => [newRound, ...prev]);
      setCurrentRound(newRound);
      
      toast({ title: "Round Created", description: `Dispute Round ${nextNumber} has been created.` });
      return newRound;
    } catch (error: any) {
      console.error('Error creating round:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
  }, [user, rounds, toast]);

  const addItemToRound = useCallback(async (
    roundId: string,
    item: Omit<DisputeItem, 'id'>
  ) => {
    if (!user) return null;
    try {
      const insertData = {
        round_id: roundId,
        client_id: user.id,
        creditor_name: item.creditor_name,
        bureau: item.bureau,
        letter_type: item.letter_type,
        dispute_reason: item.dispute_reason,
        outcome: (item.outcome || 'pending') as 'pending' | 'in_progress' | 'responded' | 'verified' | 'deleted' | 'updated' | 'failed',
        account_number: item.account_number,
        letter_content: item.letter_content
      };
      
      const { data, error } = await supabase
        .from('dispute_items')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      setRounds(prev => prev.map(r => {
        if (r.id === roundId) {
          return { ...r, items: [...r.items, data as DisputeItem] };
        }
        return r;
      }));

      if (currentRound?.id === roundId) {
        setCurrentRound(prev => prev ? { ...prev, items: [...prev.items, data as DisputeItem] } : null);
      }

      return data;
    } catch (error: any) {
      console.error('Error adding dispute item:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
  }, [user, currentRound, toast]);

  const updateItemOutcome = useCallback(async (itemId: string, outcome: 'pending' | 'in_progress' | 'responded' | 'verified' | 'deleted' | 'updated' | 'failed', details?: any) => {
    try {
      const { error } = await supabase
        .from('dispute_items')
        .update({ 
          outcome, 
          outcome_details: details,
          response_received_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      setRounds(prev => prev.map(r => ({
        ...r,
        items: r.items.map(i => i.id === itemId ? { ...i, outcome } : i)
      })));

      toast({ title: "Outcome Updated", description: `Item marked as ${outcome}.` });
    } catch (error: any) {
      console.error('Error updating outcome:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [toast]);

  const createDisputesFromAnalysis = useCallback(async (negativeItems: any[]) => {
    if (!user || negativeItems.length === 0) return;

    try {
      let round = currentRound;
      if (!round || round.status === 'completed') {
        round = await createRound();
      }
      if (!round) return;

      for (const item of negativeItems) {
        await addItemToRound(round.id, {
          creditor_name: item.creditor || 'Unknown',
          bureau: (item.bureau?.toLowerCase() || 'experian') as 'experian' | 'equifax' | 'transunion',
          letter_type: 'factual_dispute',
          dispute_reason: item.disputeReason || item.reason || 'Inaccurate information',
          outcome: 'pending',
          account_number: item.accountNumber
        });
      }

      toast({ 
        title: "Disputes Created", 
        description: `${negativeItems.length} items added to Round ${round.round_number}.` 
      });

      await fetchRounds();
    } catch (error: any) {
      console.error('Error creating disputes from analysis:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [user, currentRound, createRound, addItemToRound, fetchRounds, toast]);

  return {
    isLoading,
    rounds,
    currentRound,
    fetchRounds,
    createRound,
    addItemToRound,
    updateItemOutcome,
    createDisputesFromAnalysis
  };
}
