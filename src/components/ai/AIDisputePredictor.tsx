import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCreditData } from '@/hooks/useCreditData';
import { toast } from 'sonner';

interface Prediction {
  itemId: string;
  successProbability: number;
  confidence: 'high' | 'medium' | 'low';
  bestStrategy: string;
  estimatedDays: number;
  riskFactors: string[];
  recommendedLetterType: string;
}

export function AIDisputePredictor() {
  const { creditData } = useCreditData();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getPredictions = async () => {
    if (!creditData?.negativeItems?.length) {
      toast.error('No items to analyze');
      return;
    }

    setIsLoading(true);
    try {
      const items = creditData.negativeItems
        .filter(item => item.status !== 'deleted')
        .map((item, idx) => ({
          id: `item-${idx}`,
          creditor: item.creditor,
          type: item.type,
          balance: item.balance,
          status: item.status,
          bureau: item.bureau,
          dateOpened: item.dateOpened,
          disputeReason: item.disputeReason
        }));

      const { data, error } = await supabase.functions.invoke('ai-smart-analyzer', {
        body: {
          analysisType: 'success_prediction',
          items
        }
      });

      if (error) throw error;
      setPredictions(data.result.predictions || []);
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error('Failed to generate predictions');
    } finally {
      setIsLoading(false);
    }
  };

  const getSuccessColor = (probability: number) => {
    if (probability >= 70) return 'text-success';
    if (probability >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (probability: number) => {
    if (probability >= 70) return 'bg-success';
    if (probability >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getItemDetails = (itemId: string) => {
    const idx = parseInt(itemId.replace('item-', ''));
    return creditData?.negativeItems?.filter(item => item.status !== 'deleted')[idx];
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>AI Dispute Success Predictor</CardTitle>
              <CardDescription>Predict deletion probability before disputing</CardDescription>
            </div>
          </div>
          <Button 
            onClick={getPredictions} 
            disabled={isLoading || !creditData?.negativeItems?.length}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading ? 'Predicting...' : 'Predict Success'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : predictions.length > 0 ? (
          <div className="space-y-4">
            {predictions.map((prediction) => {
              const details = getItemDetails(prediction.itemId);
              return (
                <div key={prediction.itemId} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-medium">{details?.creditor || 'Unknown'}</span>
                        <Badge variant="outline">{details?.type}</Badge>
                        <Badge variant="outline" className="capitalize">{prediction.confidence} confidence</Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Success Probability</span>
                            <span className={`font-bold ${getSuccessColor(prediction.successProbability)}`}>
                              {prediction.successProbability}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${getProgressColor(prediction.successProbability)}`}
                              style={{ width: `${prediction.successProbability}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Est. Days</p>
                          <p className="font-semibold">{prediction.estimatedDays || 30}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Best Strategy</p>
                          <p className="text-foreground">{prediction.bestStrategy}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Recommended Letter</p>
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-primary" />
                            <span className="capitalize">{prediction.recommendedLetterType?.replace(/_/g, ' ') || 'Factual Dispute'}</span>
                          </div>
                        </div>
                      </div>

                      {prediction.riskFactors && prediction.riskFactors.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Risk Factors
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {prediction.riskFactors.slice(0, 3).map((risk, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-warning/10 border-warning/20">
                                {risk}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Click "Predict Success" to see deletion probability for each item</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
