import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Invoice {
  id: string;
  agency_id?: string;
  client_id: string;
  amount: number;
  status: string;
  description?: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  client_profile?: {
    first_name: string;
    last_name: string;
  };
}

export function useInvoices() {
  const { user, role } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      // Clients only see their own invoices (RLS handles this)
      if (role === 'client') {
        query = query.eq('client_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch client profiles for agency owners
      if (role === 'agency_owner' && data?.length) {
        const clientIds = [...new Set(data.map(i => i.client_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', clientIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
        
        const enriched = data.map(inv => ({
          ...inv,
          client_profile: profileMap.get(inv.client_id)
        }));
        setInvoices(enriched);
      } else {
        setInvoices(data || []);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, role]);

  const createInvoice = useCallback(async (
    clientId: string,
    amount: number,
    description: string,
    dueDate?: string
  ) => {
    if (!user) return null;

    try {
      // Get agency_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          agency_id: profile?.agency_id,
          client_id: clientId,
          amount,
          description,
          due_date: dueDate,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      await fetchInvoices();
      return data;
    } catch (err) {
      console.error('Error creating invoice:', err);
      return null;
    }
  }, [user, fetchInvoices]);

  const updateInvoiceStatus = useCallback(async (invoiceId: string, status: string) => {
    try {
      const updateData: { status: string; paid_at?: string } = { status };
      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId);

      if (error) throw error;
      await fetchInvoices();
    } catch (err) {
      console.error('Error updating invoice:', err);
    }
  }, [fetchInvoices]);

  useEffect(() => {
    if (!user) return;

    fetchInvoices();

    const channel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices' },
        () => {
          fetchInvoices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchInvoices]);

  // Calculate stats
  const stats = {
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount), 0),
    pendingAmount: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + Number(i.amount), 0),
    overdueCount: invoices.filter(i => i.status === 'overdue').length,
    thisMonthRevenue: invoices
      .filter(i => i.status === 'paid' && new Date(i.paid_at || '').getMonth() === new Date().getMonth())
      .reduce((sum, i) => sum + Number(i.amount), 0)
  };

  return {
    invoices,
    isLoading,
    stats,
    createInvoice,
    updateInvoiceStatus,
    refetch: fetchInvoices
  };
}
