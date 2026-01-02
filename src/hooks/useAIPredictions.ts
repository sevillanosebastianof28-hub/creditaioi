import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CachedPrediction {
  id: string;
  prediction_type: string;
  item_id?: string;
  prediction_data: any;
  created_at: string;
  expires_at: string;
}

export function useAIPredictions() {
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<CachedPrediction[]>([]);
  const { user } = useAuth();

  const fetchPredictions = useCallback(async (type?: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('ai_predictions')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString());

      if (type) {
        query = query.eq('prediction_type', type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPredictions((data || []) as CachedPrediction[]);
      return data as CachedPrediction[];
    } catch (error) {
      console.error('Error fetching predictions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getCachedPrediction = useCallback(async (
    type: string,
    itemId?: string
  ): Promise<CachedPrediction | null> => {
    if (!user) return null;
    try {
      let query = supabase
        .from('ai_predictions')
        .select('*')
        .eq('user_id', user.id)
        .eq('prediction_type', type)
        .gte('expires_at', new Date().toISOString());

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data as CachedPrediction | null;
    } catch (error) {
      console.error('Error getting cached prediction:', error);
      return null;
    }
  }, [user]);

  const cachePrediction = useCallback(async (
    type: string,
    predictionData: any,
    itemId?: string,
    expiresInHours: number = 24
  ): Promise<CachedPrediction | null> => {
    if (!user) return null;
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      // Check for existing prediction
      const existing = await getCachedPrediction(type, itemId);
      
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('ai_predictions')
          .update({
            prediction_data: predictionData,
            expires_at: expiresAt.toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as CachedPrediction;
      }

      // Insert new
      const { data, error } = await supabase
        .from('ai_predictions')
        .insert({
          user_id: user.id,
          prediction_type: type,
          item_id: itemId,
          prediction_data: predictionData,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as CachedPrediction;
    } catch (error) {
      console.error('Error caching prediction:', error);
      return null;
    }
  }, [user, getCachedPrediction]);

  const clearExpiredPredictions = useCallback(async () => {
    if (!user) return;
    try {
      await supabase
        .from('ai_predictions')
        .delete()
        .eq('user_id', user.id)
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Error clearing expired predictions:', error);
    }
  }, [user]);

  return {
    isLoading,
    predictions,
    fetchPredictions,
    getCachedPrediction,
    cachePrediction,
    clearExpiredPredictions
  };
}
