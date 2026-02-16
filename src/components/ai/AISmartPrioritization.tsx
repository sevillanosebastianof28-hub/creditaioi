import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, ArrowUp } from 'lucide-react';
import { useCreditData } from '@/hooks/useCreditData';
import { useAIPredictionsRealtime } from '@/hooks/useAIPredictions';
import { toast } from 'sonner';

interface PrioritizedItem {
  itemId: string;
  rank: number;
  estimatedScoreImpact: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string;
  recommendedAction: string;
  disputeNow: boolean;
}

interface PrioritizationResult {
  prioritizedItems: PrioritizedItem[];
  summary: {
    totalPotentialGain: number;
    criticalItems: number;
    quickWins: number;
    recommendedBatchSize: number;
  };
}

export function AISmartPrioritization() {
  const { creditData } = useCreditData();
  const { getCachedPrediction, cachePrediction } = useAIPredictionsRealtime<PrioritizationResult>();
  const [result, setResult] = useState<PrioritizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load cached prediction on mount
  useEffect(() => {
    const loadCached = async () => {
      const cached = await getCachedPrediction('smart_priority');
      if (cached) {
        setResult(cached.prediction_data as PrioritizationResult);
      }
    };
    loadCached();
  }, [getCachedPrediction]);

  const analyzeItems = async () => {
    if (!creditData?.negativeItems?.length) {
      toast.error('No items to analyze');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Analyzing items...');
    try {
      const items = creditData.negativeItems.map((item, idx) => ({
        id: `item-${idx}`,
        creditor: item.creditor,
        type: item.type,
        balance: item.balance,
        status: item.status,
        bureau: item.bureau,
        deletionProbability: item.deletionProbability
      }));

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-smart-analyzer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          analysisType: 'smart_priority',
          items
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      const analysis = data.result || data;

      setResult(analysis);
      
      // Cache the prediction
      await cachePrediction('smart_priority', analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze items');
    } finally {
      setStatusMessage(null);
      setIsLoading(false);
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary/80 text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getItemDetails = (itemId: string) => {
    const idx = parseInt(itemId.replace('item-', ''));
    return creditData?.negativeItems?.[idx];
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>AI Smart Prioritization</CardTitle>
              <CardDescription>Focus on items with the highest score impact</CardDescription>
            </div>
          </div>
          <Button 
            onClick={analyzeItems} 
            disabled={isLoading || !creditData?.negativeItems?.length}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {statusMessage && (
              <p className="text-xs text-muted-foreground">{statusMessage}</p>
            )}
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
                <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
                <p className="text-2xl font-bold text-success">+{result.summary.totalPotentialGain}</p>
                <p className="text-xs text-muted-foreground">Potential Points</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-1" />
                <p className="text-2xl font-bold text-destructive">{result.summary.criticalItems}</p>
                <p className="text-xs text-muted-foreground">Critical Items</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-primary">{result.summary.quickWins}</p>
                <p className="text-xs text-muted-foreground">Quick Wins</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{result.summary.recommendedBatchSize}</p>
                <p className="text-xs text-muted-foreground">Batch Size</p>
              </div>
            </div>

            {/* Prioritized List */}
            <div className="space-y-3">
              {result.prioritizedItems.slice(0, 5).map((item) => {
                const details = getItemDetails(item.itemId);
                return (
                  <div 
                    key={item.itemId} 
                    className={`p-4 rounded-lg border ${item.disputeNow ? 'border-primary bg-primary/5' : 'bg-card'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                          #{item.rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{details?.creditor || 'Unknown'}</span>
                            <Badge className={getPriorityStyles(item.priority)}>
                              {item.priority}
                            </Badge>
                            {item.disputeNow && (
                              <Badge variant="outline" className="border-primary text-primary">
                                Dispute Now
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{details?.type}</p>
                          <p className="text-xs text-muted-foreground mt-2">{item.reasoning}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-success">
                          <ArrowUp className="w-4 h-4" />
                          <span className="font-bold">+{item.estimatedScoreImpact}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs"><span className="font-medium">Recommended:</span> {item.recommendedAction}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Click "Analyze" to prioritize your disputable items by potential score impact</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
