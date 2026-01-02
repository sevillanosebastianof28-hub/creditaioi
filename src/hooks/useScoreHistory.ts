import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ScoreEntry {
  id: string;
  experian: number | null;
  equifax: number | null;
  transunion: number | null;
  recorded_at: string;
  source: string;
}

export function useScoreHistory() {
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ScoreEntry[]>([]);
  const { user } = useAuth();

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('score_history')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      setHistory((data || []) as ScoreEntry[]);
    } catch (error) {
      console.error('Error fetching score history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const recordScore = useCallback(async (
    experian: number | null,
    equifax: number | null,
    transunion: number | null,
    source: string = 'sync'
  ): Promise<ScoreEntry | null> => {
    if (!user) return null;
    try {
      // Check if we already have a score for today
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('score_history')
        .select('id')
        .eq('user_id', user.id)
        .gte('recorded_at', today)
        .lt('recorded_at', today + 'T23:59:59.999Z')
        .maybeSingle();

      if (existing) {
        // Update existing entry for today
        const { data, error } = await supabase
          .from('score_history')
          .update({ experian, equifax, transunion, source })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        
        setHistory(prev => prev.map(h => h.id === existing.id ? data as ScoreEntry : h));
        return data as ScoreEntry;
      } else {
        // Insert new entry
        const { data, error } = await supabase
          .from('score_history')
          .insert({
            user_id: user.id,
            experian,
            equifax,
            transunion,
            source
          })
          .select()
          .single();

        if (error) throw error;
        
        setHistory(prev => [...prev, data as ScoreEntry]);
        return data as ScoreEntry;
      }
    } catch (error) {
      console.error('Error recording score:', error);
      return null;
    }
  }, [user]);

  const getScoreChange = useCallback((days: number = 30) => {
    if (history.length < 2) return { experian: 0, equifax: 0, transunion: 0 };
    
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const oldEntry = history.find(h => new Date(h.recorded_at) >= cutoff) || history[0];
    const latestEntry = history[history.length - 1];

    return {
      experian: (latestEntry.experian || 0) - (oldEntry.experian || 0),
      equifax: (latestEntry.equifax || 0) - (oldEntry.equifax || 0),
      transunion: (latestEntry.transunion || 0) - (oldEntry.transunion || 0)
    };
  }, [history]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    isLoading,
    history,
    fetchHistory,
    recordScore,
    getScoreChange,
    latestScores: history.length > 0 ? history[history.length - 1] : null
  };
}
