import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ConnectionStatus {
  status: 'not_connected' | 'pending' | 'connected' | 'disconnected' | 'error';
  connectedAt?: string;
  lastSyncAt?: string;
}

export function useSmartCredit() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: 'not_connected' });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkStatus();
    }
  }, [user]);

  const checkStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('smartcredit-sync', {
        body: {
          action: 'get_status',
          userId: user.id
        }
      });

      if (error) throw error;
      
      setConnectionStatus({
        status: data.status,
        connectedAt: data.connectedAt,
        lastSyncAt: data.lastSyncAt
      });
    } catch (error) {
      console.error('Error checking SmartCredit status:', error);
    }
  };

  const initConnection = async () => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "Please log in to connect SmartCredit.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('smartcredit-sync', {
        body: {
          action: 'init_connection',
          userId: user.id
        }
      });

      if (error) throw error;
      
      setConnectionStatus({ status: 'pending' });
      
      toast({
        title: "Connection Initiated",
        description: "Complete the SmartCredit authorization to continue.",
      });

      // In production, redirect to OAuth URL
      // window.location.href = data.oauthUrl;
      
      // For demo, simulate successful connection
      setTimeout(async () => {
        await completeConnection({ accessToken: 'demo_token' });
      }, 2000);

      return data;
    } catch (error: any) {
      console.error('Error initializing SmartCredit:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to initialize SmartCredit connection.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const completeConnection = async (connectionData: { accessToken: string }) => {
    if (!user) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('smartcredit-sync', {
        body: {
          action: 'complete_connection',
          userId: user.id,
          connectionData
        }
      });

      if (error) throw error;
      
      setConnectionStatus({ 
        status: 'connected',
        connectedAt: new Date().toISOString()
      });
      
      toast({
        title: "SmartCredit Connected!",
        description: "Your credit data will now sync automatically.",
      });

      // Trigger initial sync
      await syncReport();
    } catch (error: any) {
      console.error('Error completing SmartCredit connection:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const syncReport = async (reportData?: any) => {
    if (!user) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('smartcredit-sync', {
        body: {
          action: 'sync_report',
          userId: user.id,
          reportData
        }
      });

      if (error) throw error;
      
      setConnectionStatus(prev => ({
        ...prev,
        lastSyncAt: data.lastSyncAt
      }));
      
      toast({
        title: "Report Synced",
        description: "Your credit report has been updated.",
      });

      return data;
    } catch (error: any) {
      console.error('Error syncing report:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync credit report.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const disconnect = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('smartcredit-sync', {
        body: {
          action: 'disconnect',
          userId: user.id
        }
      });

      if (error) throw error;
      
      setConnectionStatus({ status: 'disconnected' });
      
      toast({
        title: "Disconnected",
        description: "SmartCredit has been disconnected.",
      });
    } catch (error: any) {
      console.error('Error disconnecting SmartCredit:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    connectionStatus,
    initConnection,
    completeConnection,
    syncReport,
    disconnect,
    checkStatus
  };
}
