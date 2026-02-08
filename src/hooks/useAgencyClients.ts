import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AgencyClient {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  disputeCount: number;
  latestScore: number | null;
}

export function useAgencyClients() {
  const { user, profile } = useAuth();
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (!user || !profile?.agency_id) {
      setIsLoading(false);
      return;
    }

    try {
      // Get all profiles in the agency
      const { data: agencyProfiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, phone')
        .eq('agency_id', profile.agency_id);

      if (!agencyProfiles?.length) {
        setClients([]);
        setIsLoading(false);
        return;
      }

      const allIds = agencyProfiles.map(p => p.user_id);

      // Filter to client-role users only
      const { data: clientRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client')
        .in('user_id', allIds);

      const clientUserIds = new Set(clientRoles?.map(r => r.user_id) || []);
      const clientProfiles = agencyProfiles.filter(p => clientUserIds.has(p.user_id));

      if (!clientProfiles.length) {
        setClients([]);
        setIsLoading(false);
        return;
      }

      const clientIds = clientProfiles.map(p => p.user_id);

      // Get dispute counts per client
      const { data: disputes } = await supabase
        .from('dispute_items')
        .select('client_id')
        .in('client_id', clientIds);

      const disputeCounts = new Map<string, number>();
      disputes?.forEach(d => {
        disputeCounts.set(d.client_id, (disputeCounts.get(d.client_id) || 0) + 1);
      });

      // Get latest scores per client
      const { data: scores } = await supabase
        .from('score_history')
        .select('user_id, equifax, experian, transunion, recorded_at')
        .in('user_id', clientIds)
        .order('recorded_at', { ascending: false });

      const latestScores = new Map<string, number>();
      scores?.forEach(s => {
        if (!latestScores.has(s.user_id)) {
          const vals = [s.equifax, s.experian, s.transunion].filter(Boolean) as number[];
          if (vals.length > 0) {
            latestScores.set(s.user_id, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
          }
        }
      });

      const enriched: AgencyClient[] = clientProfiles.map(p => ({
        user_id: p.user_id,
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        email: p.email,
        phone: p.phone,
        disputeCount: disputeCounts.get(p.user_id) || 0,
        latestScore: latestScores.get(p.user_id) || null,
      }));

      setClients(enriched);
    } catch (err) {
      console.error('Error fetching agency clients:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, profile?.agency_id]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { clients, isLoading, refetch: fetchClients };
}
