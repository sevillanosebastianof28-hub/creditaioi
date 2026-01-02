import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SavedLetter {
  id: string;
  dispute_item_id?: string;
  letter_type: string;
  letter_content: string;
  status: 'draft' | 'ready' | 'sent' | 'delivered';
  sent_at?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export function useLetterTracking() {
  const [isLoading, setIsLoading] = useState(false);
  const [letters, setLetters] = useState<SavedLetter[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLetters = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('dispute_letters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLetters((data || []) as SavedLetter[]);
    } catch (error) {
      console.error('Error fetching letters:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveLetter = useCallback(async (
    letterType: string,
    letterContent: string,
    disputeItemId?: string
  ): Promise<SavedLetter | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('dispute_letters')
        .insert({
          user_id: user.id,
          dispute_item_id: disputeItemId,
          letter_type: letterType,
          letter_content: letterContent,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      const savedLetter = data as SavedLetter;
      setLetters(prev => [savedLetter, ...prev]);
      
      toast({ title: "Letter Saved", description: "Your dispute letter has been saved." });
      return savedLetter;
    } catch (error: any) {
      console.error('Error saving letter:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
  }, [user, toast]);

  const updateLetterStatus = useCallback(async (
    letterId: string,
    status: SavedLetter['status'],
    trackingNumber?: string
  ) => {
    try {
      const updateData: any = { status };
      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      }
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      const { error } = await supabase
        .from('dispute_letters')
        .update(updateData)
        .eq('id', letterId);

      if (error) throw error;

      setLetters(prev => prev.map(l => 
        l.id === letterId ? { ...l, ...updateData } : l
      ));

      toast({ title: "Status Updated", description: `Letter marked as ${status}.` });
    } catch (error: any) {
      console.error('Error updating letter status:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [toast]);

  const deleteLetter = useCallback(async (letterId: string) => {
    try {
      const { error } = await supabase
        .from('dispute_letters')
        .delete()
        .eq('id', letterId);

      if (error) throw error;

      setLetters(prev => prev.filter(l => l.id !== letterId));
      toast({ title: "Letter Deleted", description: "The letter has been removed." });
    } catch (error: any) {
      console.error('Error deleting letter:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [toast]);

  return {
    isLoading,
    letters,
    fetchLetters,
    saveLetter,
    updateLetterStatus,
    deleteLetter
  };
}
