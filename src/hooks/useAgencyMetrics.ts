import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AgencyTeamMember {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  clientsManaged: number;
  tasksCompleted: number;
  deletionRate: number;
}

export interface RealAgencyMetrics {
  totalClients: number;
  activeDisputes: number;
  lettersThisMonth: number;
  deletionRate: number;
}

export function useAgencyMetrics() {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState<RealAgencyMetrics>({
    totalClients: 0,
    activeDisputes: 0,
    lettersThisMonth: 0,
    deletionRate: 0,
  });
  const [teamMembers, setTeamMembers] = useState<AgencyTeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    if (!user || !profile?.agency_id) {
      setIsLoading(false);
      return;
    }

    const agencyId = profile.agency_id;

    try {
      // Get all client profiles in the agency
      const { data: agencyProfiles } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('agency_id', agencyId);

      const allUserIds = agencyProfiles?.map(p => p.user_id) || [];

      // Get client role user IDs
      const { data: clientRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client');
      
      const clientUserIds = new Set(clientRoles?.map(r => r.user_id) || []);
      const agencyClientIds = allUserIds.filter(id => clientUserIds.has(id));
      const totalClients = agencyClientIds.length;

      // Get dispute items for agency clients
      const { data: disputes } = agencyClientIds.length > 0
        ? await supabase
            .from('dispute_items')
            .select('outcome, client_id')
            .in('client_id', agencyClientIds)
        : { data: [] };

      const activeDisputes = disputes?.filter(d => d.outcome === 'pending' || d.outcome === 'in_progress').length || 0;
      const deletedItems = disputes?.filter(d => d.outcome === 'deleted').length || 0;
      const totalDisputed = disputes?.length || 0;
      const deletionRate = totalDisputed > 0 ? Math.round((deletedItems / totalDisputed) * 100) : 0;

      // Get letters generated this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: lettersThisMonth } = agencyClientIds.length > 0
        ? await supabase
            .from('dispute_letters')
            .select('id', { count: 'exact', head: true })
            .in('user_id', agencyClientIds)
            .gte('created_at', startOfMonth.toISOString())
        : { count: 0 };

      setMetrics({
        totalClients,
        activeDisputes,
        lettersThisMonth: lettersThisMonth || 0,
        deletionRate,
      });

      // Fetch team members (VA staff in agency)
      const { data: vaRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'va_staff');

      const vaUserIds = new Set(vaRoles?.map(r => r.user_id) || []);
      const agencyVAIds = allUserIds.filter(id => vaUserIds.has(id));

      if (agencyVAIds.length > 0) {
        const { data: vaProfiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', agencyVAIds);

        // Get assignment counts
        const { data: assignments } = await supabase
          .from('va_assignments')
          .select('va_user_id')
          .eq('agency_id', agencyId);

        const assignmentCounts = new Map<string, number>();
        assignments?.forEach(a => {
          assignmentCounts.set(a.va_user_id, (assignmentCounts.get(a.va_user_id) || 0) + 1);
        });

        // Get completed tasks per VA
        const { data: completedTasks } = await supabase
          .from('tasks')
          .select('assigned_to')
          .eq('agency_id', agencyId)
          .eq('status', 'completed');

        const taskCounts = new Map<string, number>();
        completedTasks?.forEach(t => {
          if (t.assigned_to) {
            taskCounts.set(t.assigned_to, (taskCounts.get(t.assigned_to) || 0) + 1);
          }
        });

        const members: AgencyTeamMember[] = (vaProfiles || []).map(va => ({
          user_id: va.user_id,
          first_name: va.first_name || '',
          last_name: va.last_name || '',
          email: va.email,
          clientsManaged: assignmentCounts.get(va.user_id) || 0,
          tasksCompleted: taskCounts.get(va.user_id) || 0,
          deletionRate: 0, // Calculated per-VA would need more complex queries
        }));

        setTeamMembers(members);
      } else {
        setTeamMembers([]);
      }
    } catch (err) {
      console.error('Error fetching agency metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, profile?.agency_id]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, teamMembers, isLoading, refetch: fetchMetrics };
}
