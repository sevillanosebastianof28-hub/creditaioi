import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Sparkles, Clock, CheckCircle2, AlertCircle, FileSearch } from 'lucide-react';
import { useCreditData } from '@/hooks/useCreditData';
import { useAIPredictionsRealtime } from '@/hooks/useAIPredictions';
import { readAiStream } from '@/lib/aiStream';
import { toast } from 'sonner';

interface Forecast {
  itemId: string;
  estimatedResponseDate: string;
  daysRemaining: number;
  likelyOutcome: 'deleted' | 'verified' | 'updated' | 'investigating';
  outcomeProbability: number;
  nextSteps: string;
}

interface BureauInsights {
  averageResponseDays: number;
  currentBacklog: 'low' | 'normal' | 'high';
  recommendations: string[];
}

interface ForecastResult {
  forecasts: Forecast[];
  bureauInsights?: BureauInsights;
}

export function AIBureauForecaster() {
  const { creditData } = useCreditData();
  const { getCachedPrediction, cachePrediction } = useAIPredictionsRealtime<ForecastResult>();
  const [selectedBureau, setSelectedBureau] = useState<string>('experian');
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load cached forecast on mount or when bureau changes
  useEffect(() => {
    const loadCached = async () => {
      const cached = await getCachedPrediction('bureau_forecast', selectedBureau);
      if (cached) {
        setResult(cached.prediction_data as ForecastResult);
      }
    };
    loadCached();
  }, [getCachedPrediction, selectedBureau]);

  const getForecast = async () => {
    if (!creditData?.negativeItems?.length) {
      toast.error('No items to forecast');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Forecasting responses...');
    try {
      const items = creditData.negativeItems
        .filter(item => item.status === 'in_progress' && item.bureau.toLowerCase() === selectedBureau)
        .map((item, idx) => ({
          id: `item-${idx}`,
          creditor: item.creditor,
          type: item.type,
          bureau: item.bureau,
          status: item.status,
          disputeReason: item.disputeReason
        }));

      if (items.length === 0) {
        toast.info(`No active disputes with ${selectedBureau}`);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-smart-analyzer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          analysisType: 'bureau_forecast',
          items,
          bureau: selectedBureau,
          stream: true
        })
      });

      const forecast = await readAiStream<ForecastResult>(response, (event) => {
        if (event.type === 'status') {
          setStatusMessage(event.message || null);
        }
      });

      setResult(forecast);
      
      // Cache the forecast for 6 hours with bureau as itemId
      await cachePrediction('bureau_forecast', forecast, selectedBureau, 6);
    } catch (error) {
      console.error('Forecast error:', error);
      toast.error('Failed to generate forecast');
    } finally {
      setStatusMessage(null);
      setIsLoading(false);
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'deleted': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'verified': return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'updated': return <FileSearch className="w-4 h-4 text-primary" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'deleted': return 'bg-success/10 text-success border-success/20';
      case 'verified': return 'bg-warning/10 text-warning border-warning/20';
      case 'updated': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getBacklogColor = (backlog: string) => {
    switch (backlog) {
      case 'low': return 'text-success';
      case 'high': return 'text-destructive';
      default: return 'text-warning';
    }
  };

  const pendingItems = creditData?.negativeItems?.filter(item => item.status === 'in_progress') || [];

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>AI Bureau Response Forecaster</CardTitle>
              <CardDescription>Predict when bureaus will respond</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedBureau} onValueChange={setSelectedBureau}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="experian">Experian</SelectItem>
                <SelectItem value="equifax">Equifax</SelectItem>
                <SelectItem value="transunion">TransUnion</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={getForecast} 
              disabled={isLoading || pendingItems.length === 0}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isLoading ? 'Forecasting...' : 'Forecast'}
            </Button>
          </div>
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
            {/* Bureau Insights */}
            {result.bureauInsights && (
              <div className="p-4 rounded-lg bg-muted/50 border">
                <h4 className="font-semibold mb-3 capitalize">{selectedBureau} Insights</h4>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Response Time</p>
                    <p className="font-semibold">{result.bureauInsights.averageResponseDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Backlog</p>
                    <p className={`font-semibold capitalize ${getBacklogColor(result.bureauInsights.currentBacklog)}`}>
                      {result.bureauInsights.currentBacklog}
                    </p>
                  </div>
                </div>
                {result.bureauInsights.recommendations && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Recommendations</p>
                    <ul className="text-sm space-y-1">
                      {result.bureauInsights.recommendations.slice(0, 2).map((rec, idx) => (
                        <li key={idx} className="text-muted-foreground">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Forecasts */}
            <div className="space-y-3">
              {result.forecasts.map((forecast) => (
                <div key={forecast.itemId} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {getOutcomeIcon(forecast.likelyOutcome)}
                        <span className="font-medium capitalize">{forecast.likelyOutcome}</span>
                        <Badge variant="outline" className={getOutcomeColor(forecast.likelyOutcome)}>
                          {forecast.outcomeProbability}% likely
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Expected Response</p>
                          <p className="font-medium">{forecast.estimatedResponseDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Days Remaining</p>
                          <p className={`font-medium ${forecast.daysRemaining < 7 ? 'text-warning' : ''}`}>
                            {forecast.daysRemaining} days
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Next:</span> {forecast.nextSteps}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            {pendingItems.length === 0 ? (
              <p>No active disputes to forecast</p>
            ) : (
              <p>Select a bureau and click "Forecast" to predict response timelines</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
