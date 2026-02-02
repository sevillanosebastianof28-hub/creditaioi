import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  agency_id?: string;
  assigned_to?: string;
  client_id?: string;
  client_name?: string;
  title: string;
  description?: string;
  task_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  completed_at?: string;
  ai_generated: boolean;
  related_dispute_id?: string;
  related_letter_id?: string;
  created_at: string;
  updated_at: string;
}

export function useTasks() {
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user, role } = useAuth();
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter based on role
      if (role === 'va_staff') {
        query = query.eq('assigned_to', user.id);
      } else if (role === 'client') {
        query = query.eq('client_id', user.id);
      }
      // agency_owner sees all via RLS

      const { data, error } = await query;

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, role]);

  const createTask = useCallback(async (task: Partial<Task>): Promise<Task | null> => {
    if (!user) return null;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          agency_id: profile?.agency_id,
          title: task.title || 'New Task',
          description: task.description,
          task_type: task.task_type || 'general',
          priority: task.priority || 'medium',
          status: 'pending',
          assigned_to: task.assigned_to,
          client_id: task.client_id,
          due_date: task.due_date,
          ai_generated: task.ai_generated || false,
          related_dispute_id: task.related_dispute_id,
          related_letter_id: task.related_letter_id
        })
        .select()
        .single();

      if (error) throw error;

      const newTask = data as Task;
      setTasks(prev => [newTask, ...prev]);
      toast({ title: "Task Created", description: task.title });
      return newTask;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating task:', error);
      toast({ title: "Error", description: message, variant: "destructive" });
      return null;
    }
  }, [user, toast]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const updateData: Partial<Task> & { completed_at?: string } = { ...updates };
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, ...updateData } : t
      ));

      toast({ title: "Task Updated" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating task:', error);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  }, [toast]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast({ title: "Task Deleted" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting task:', error);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  }, [toast]);

  // Real-time subscription for VAs
  useEffect(() => {
    if (!user) return;

    fetchTasks();

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchTasks]);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return {
    isLoading,
    tasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  };
}
