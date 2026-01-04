import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VAAssignment {
  id: string;
  va_user_id: string;
  client_user_id: string;
  agency_id: string;
  assigned_at: string;
  va_profile?: {
    first_name: string;
    last_name: string;
  };
  client_profile?: {
    first_name: string;
    last_name: string;
    email?: string;
  };
}

export interface VAStaff {
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  assignedClients?: number;
}

export function useVAAssignments() {
  const { user, role } = useAuth();
  const [assignments, setAssignments] = useState<VAAssignment[]>([]);
  const [vaStaff, setVAStaff] = useState<VAStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('va_assignments')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for VAs and clients
      if (data?.length) {
        const vaIds = [...new Set(data.map(a => a.va_user_id))];
        const clientIds = [...new Set(data.map(a => a.client_user_id))];
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', [...vaIds, ...clientIds]);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
        
        const enriched = data.map(assignment => ({
          ...assignment,
          va_profile: profileMap.get(assignment.va_user_id),
          client_profile: profileMap.get(assignment.client_user_id)
        }));
        setAssignments(enriched);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchVAStaff = useCallback(async () => {
    if (!user || role !== 'agency_owner') return;

    try {
      // Get all users with va_staff role in the same agency
      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.agency_id) return;

      // Get VA staff in agency
      const { data: agencyProfiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .eq('agency_id', profile.agency_id);

      // Filter to only VAs
      const { data: vaRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'va_staff');

      const vaUserIds = new Set(vaRoles?.map(r => r.user_id));
      const vas = (agencyProfiles || []).filter(p => vaUserIds.has(p.user_id));

      // Count assignments per VA
      const assignmentCounts = new Map<string, number>();
      assignments.forEach(a => {
        assignmentCounts.set(a.va_user_id, (assignmentCounts.get(a.va_user_id) || 0) + 1);
      });

      const enrichedVAs = vas.map(va => ({
        ...va,
        assignedClients: assignmentCounts.get(va.user_id) || 0
      }));

      setVAStaff(enrichedVAs);
    } catch (err) {
      console.error('Error fetching VA staff:', err);
    }
  }, [user, role, assignments]);

  const assignVAToClient = useCallback(async (vaUserId: string, clientUserId: string) => {
    if (!user) return null;

    try {
      // Get agency_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.agency_id) throw new Error('No agency found');

      // Check if assignment already exists
      const { data: existing } = await supabase
        .from('va_assignments')
        .select('id')
        .eq('va_user_id', vaUserId)
        .eq('client_user_id', clientUserId)
        .maybeSingle();

      if (existing) {
        throw new Error('Assignment already exists');
      }

      const { data, error } = await supabase
        .from('va_assignments')
        .insert({
          agency_id: profile.agency_id,
          va_user_id: vaUserId,
          client_user_id: clientUserId
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAssignments();
      return data;
    } catch (err) {
      console.error('Error assigning VA:', err);
      return null;
    }
  }, [user, fetchAssignments]);

  const removeAssignment = useCallback(async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('va_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      await fetchAssignments();
    } catch (err) {
      console.error('Error removing assignment:', err);
    }
  }, [fetchAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    fetchVAStaff();
  }, [fetchVAStaff]);

  return {
    assignments,
    vaStaff,
    isLoading,
    assignVAToClient,
    removeAssignment,
    refetch: fetchAssignments
  };
}
