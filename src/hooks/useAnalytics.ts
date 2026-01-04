import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsData {
  totalDeletions: number;
  deletionRate: number;
  avgDaysToResponse: number;
  bureauStats: {
    bureau: string;
    total: number;
    deleted: number;
    rate: number;
  }[];
  letterTypeStats: {
    type: string;
    total: number;
    success: number;
    rate: number;
  }[];
  monthlyData: {
    month: string;
    deletions: number;
    disputes: number;
  }[];
  scoreImprovements: {
    avgExperian: number;
    avgEquifax: number;
    avgTransUnion: number;
  };
}

export function useAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    
    try {
      // Fetch outcome tracking data
      const { data: outcomes, error: outcomeError } = await supabase
        .from('outcome_tracking')
        .select('*');

      if (outcomeError) throw outcomeError;

      // Fetch dispute items
      const { data: disputes, error: disputeError } = await supabase
        .from('dispute_items')
        .select('*');

      if (disputeError) throw disputeError;

      // Fetch score history for improvements
      const { data: scores, error: scoreError } = await supabase
        .from('score_history')
        .select('*')
        .order('recorded_at', { ascending: true });

      if (scoreError) throw scoreError;

      // Calculate bureau stats
      const bureauMap = new Map<string, { total: number; deleted: number }>();
      (outcomes || []).forEach(o => {
        const current = bureauMap.get(o.bureau) || { total: 0, deleted: 0 };
        current.total++;
        if (o.outcome === 'deleted') current.deleted++;
        bureauMap.set(o.bureau, current);
      });

      const bureauStats = Array.from(bureauMap.entries()).map(([bureau, stats]) => ({
        bureau,
        total: stats.total,
        deleted: stats.deleted,
        rate: stats.total > 0 ? Math.round((stats.deleted / stats.total) * 100) : 0
      }));

      // Calculate letter type stats
      const letterMap = new Map<string, { total: number; success: number }>();
      (outcomes || []).forEach(o => {
        const current = letterMap.get(o.letter_type) || { total: 0, success: 0 };
        current.total++;
        if (o.outcome === 'deleted') current.success++;
        letterMap.set(o.letter_type, current);
      });

      const letterTypeStats = Array.from(letterMap.entries()).map(([type, stats]) => ({
        type,
        total: stats.total,
        success: stats.success,
        rate: stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0
      }));

      // Calculate monthly data (last 6 months)
      const monthlyMap = new Map<string, { deletions: number; disputes: number }>();
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleString('default', { month: 'short' });
        monthlyMap.set(key, { deletions: 0, disputes: 0 });
      }

      (disputes || []).forEach(d => {
        const month = new Date(d.created_at).toLocaleString('default', { month: 'short' });
        if (monthlyMap.has(month)) {
          const current = monthlyMap.get(month)!;
          current.disputes++;
          if (d.outcome === 'deleted') current.deletions++;
        }
      });

      const monthlyData = Array.from(monthlyMap.entries()).map(([month, stats]) => ({
        month,
        ...stats
      }));

      // Calculate score improvements
      const userScoreMap = new Map<string, { first: any; last: any }>();
      (scores || []).forEach(s => {
        if (!userScoreMap.has(s.user_id)) {
          userScoreMap.set(s.user_id, { first: s, last: s });
        } else {
          userScoreMap.get(s.user_id)!.last = s;
        }
      });

      let totalExperian = 0, totalEquifax = 0, totalTransUnion = 0, count = 0;
      userScoreMap.forEach(({ first, last }) => {
        if (first.experian && last.experian) totalExperian += (last.experian - first.experian);
        if (first.equifax && last.equifax) totalEquifax += (last.equifax - first.equifax);
        if (first.transunion && last.transunion) totalTransUnion += (last.transunion - first.transunion);
        count++;
      });

      // Calculate totals
      const totalDeletions = (outcomes || []).filter(o => o.outcome === 'deleted').length;
      const totalOutcomes = (outcomes || []).length;
      const deletionRate = totalOutcomes > 0 ? Math.round((totalDeletions / totalOutcomes) * 100) : 0;
      const avgDaysToResponse = Math.round(
        (outcomes || []).reduce((sum, o) => sum + (o.days_to_response || 0), 0) / (totalOutcomes || 1)
      );

      setData({
        totalDeletions,
        deletionRate,
        avgDaysToResponse,
        bureauStats,
        letterTypeStats,
        monthlyData,
        scoreImprovements: {
          avgExperian: count > 0 ? Math.round(totalExperian / count) : 0,
          avgEquifax: count > 0 ? Math.round(totalEquifax / count) : 0,
          avgTransUnion: count > 0 ? Math.round(totalTransUnion / count) : 0
        }
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    isLoading,
    refetch: fetchAnalytics
  };
}
