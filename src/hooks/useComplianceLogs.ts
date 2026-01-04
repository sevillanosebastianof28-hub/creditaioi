import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ComplianceLog {
  id: string;
  agency_id?: string;
  user_id?: string;
  action_type: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
  user_profile?: {
    first_name: string;
    last_name: string;
  };
}

export function useComplianceLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ComplianceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('compliance_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user profiles
      if (data?.length) {
        const userIds = [...new Set(data.filter(l => l.user_id).map(l => l.user_id))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name')
            .in('user_id', userIds);

          const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
          
          const enriched = data.map(log => ({
            ...log,
            user_profile: log.user_id ? profileMap.get(log.user_id) : undefined
          }));
          setLogs(enriched);
        } else {
          setLogs(data);
        }
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Error fetching compliance logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const logAction = useCallback(async (
    actionType: string,
    entityType: string,
    entityId?: string,
    details?: any
  ) => {
    if (!user) return;

    try {
      // Get agency_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('user_id', user.id)
        .single();

      await supabase
        .from('compliance_logs')
        .insert({
          agency_id: profile?.agency_id,
          user_id: user.id,
          action_type: actionType,
          entity_type: entityType,
          entity_id: entityId,
          details
        });
    } catch (err) {
      console.error('Error logging action:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    logAction,
    refetch: fetchLogs
  };
}
