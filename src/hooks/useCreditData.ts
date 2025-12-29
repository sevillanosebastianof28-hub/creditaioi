import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CreditScores {
  experian: number;
  equifax: number;
  transunion: number;
}

export interface NegativeItem {
  id: string;
  creditor: string;
  bureau: string;
  type: string;
  status: 'pending' | 'in_progress' | 'deleted' | 'verified';
  balance: number | null;
  dateOpened: string;
  disputeReason: string;
  deletionProbability: number;
}

export interface Inquiry {
  creditor: string;
  date: string;
  bureau: string;
}

export interface CreditSummary {
  totalAccounts: number;
  negativeAccounts: number;
  onTimePayments: number;
  creditUtilization: number;
  avgAccountAge: string;
  totalDebt: number;
}

export interface ScoreHistoryEntry {
  date: string;
  experian: number;
  equifax: number;
  transunion: number;
}

export interface CreditReportData {
  scores: CreditScores;
  previousScores: CreditScores;
  negativeItems: NegativeItem[];
  inquiries: Inquiry[];
  summary: CreditSummary;
  scoreHistory: ScoreHistoryEntry[];
}

export interface ConnectionStatus {
  status: 'not_connected' | 'pending' | 'connected' | 'disconnected' | 'error';
  connectedAt?: string;
  lastSyncAt?: string;
  hasReport?: boolean;
  reportUpdatedAt?: string;
}

export function useCreditData() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [creditData, setCreditData] = useState<CreditReportData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: 'not_connected' });
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCreditData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Get connection status and report
      const { data: statusData, error: statusError } = await supabase.functions.invoke('smartcredit-sync', {
        body: { action: 'get_status', userId: user.id }
      });

      if (statusError) throw statusError;

      setConnectionStatus({
        status: statusData.status,
        connectedAt: statusData.connectedAt,
        lastSyncAt: statusData.lastSyncAt,
        hasReport: statusData.hasReport,
        reportUpdatedAt: statusData.reportUpdatedAt
      });

      // If connected and has report, fetch the report data
      if (statusData.hasReport) {
        const { data: reportData, error: reportError } = await supabase.functions.invoke('smartcredit-sync', {
          body: { action: 'get_report', userId: user.id }
        });

        if (reportError) throw reportError;

        if (reportData.report) {
          setCreditData(reportData.report as CreditReportData);
        }
      }
    } catch (err) {
      console.error('Error fetching credit data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch credit data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    if (!user || connectionStatus.status !== 'connected') return;

    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('smartcredit-sync', {
        body: { action: 'sync_report', userId: user.id }
      });

      if (error) throw error;

      if (data.creditData) {
        setCreditData(data.creditData as CreditReportData);
        setConnectionStatus(prev => ({
          ...prev,
          lastSyncAt: data.lastSyncAt,
          hasReport: true
        }));
      }
    } catch (err) {
      console.error('Error refreshing credit data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, [user, connectionStatus.status]);

  useEffect(() => {
    fetchCreditData();
  }, [fetchCreditData]);

  // Computed values
  const averageScore = creditData?.scores 
    ? Math.round((creditData.scores.experian + creditData.scores.equifax + creditData.scores.transunion) / 3)
    : null;

  const averagePreviousScore = creditData?.previousScores
    ? Math.round((creditData.previousScores.experian + creditData.previousScores.equifax + creditData.previousScores.transunion) / 3)
    : null;

  const totalScoreIncrease = averageScore && averagePreviousScore 
    ? averageScore - averagePreviousScore 
    : 0;

  const disputeProgress = creditData?.negativeItems ? {
    total: creditData.negativeItems.length,
    deleted: creditData.negativeItems.filter(i => i.status === 'deleted').length,
    inProgress: creditData.negativeItems.filter(i => i.status === 'in_progress').length,
    pending: creditData.negativeItems.filter(i => i.status === 'pending').length,
    verified: creditData.negativeItems.filter(i => i.status === 'verified').length,
  } : null;

  return {
    isLoading,
    isRefreshing,
    creditData,
    connectionStatus,
    error,
    averageScore,
    averagePreviousScore,
    totalScoreIncrease,
    disputeProgress,
    refreshData,
    refetch: fetchCreditData
  };
}
