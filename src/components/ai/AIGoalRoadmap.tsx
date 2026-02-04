import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Sparkles, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useCreditData } from '@/hooks/useCreditData';
import { useAIPredictionsRealtime } from '@/hooks/useAIPredictions';
import { readAiStream } from '@/lib/aiStream';
import { toast } from 'sonner';

interface Milestone {
  month: number;
  action: string;
  expectedPoints: number;
  priority: 'high' | 'medium' | 'low';
}

interface KeyAction {
  action: string;
  impact: 'high' | 'medium' | 'low';
  timeline: string;
}

interface Roadmap {
  estimatedTimelineMonths: number;
  pointsNeeded: number;
  confidence: 'high' | 'medium' | 'low';
  milestones: Milestone[];
  keyActions: KeyAction[];
  warnings: string[];
  qualificationProbability: number;
}

export function AIGoalRoadmap() {
  const { averageScore, creditData } = useCreditData();
  const { getCachedPrediction, cachePrediction } = useAIPredictionsRealtime<{ roadmap: Roadmap }>();
  const [targetScore, setTargetScore] = useState('700');
  const [goalType, setGoalType] = useState('general');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load cached roadmap on mount or when goal changes
  useEffect(() => {
    const loadCached = async () => {
      const cacheKey = `${goalType}_${targetScore}`;
      const cached = await getCachedPrediction('goal_roadmap', cacheKey);
      if (cached) {
        setRoadmap(cached.prediction_data.roadmap);
      }
    };
    loadCached();
  }, [getCachedPrediction, goalType, targetScore]);

  const generateRoadmap = async () => {
    if (!targetScore) return;

    setIsLoading(true);
    setStatusMessage('Generating roadmap...');
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-goal-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          currentScore: averageScore || 600,
          targetScore: parseInt(targetScore),
          goalType,
          creditData: creditData ? {
            negativeItems: creditData.negativeItems?.length || 0,
            collections: creditData.negativeItems?.filter(i => i.type === 'Collection').length || 0,
            latePayments: creditData.negativeItems?.filter(i => i.type === 'Late Payment').length || 0,
            utilization: creditData.summary?.creditUtilization || 30
          } : null,
          stream: true
        })
      });

      const result = await readAiStream<{ roadmap: Roadmap }>(response, (event) => {
        if (event.type === 'status') {
          setStatusMessage(event.message || null);
        }
      });

      setRoadmap(result.roadmap);
      
      // Cache the roadmap for 24 hours with goal type and target as itemId
      const cacheKey = `${goalType}_${targetScore}`;
      await cachePrediction('goal_roadmap', result, cacheKey, 24);
      
      toast.success('Roadmap generated successfully!');
    } catch (error) {
      console.error('Roadmap error:', error);
      toast.error('Failed to generate roadmap');
    } finally {
      setStatusMessage(null);
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-success';
      case 'medium': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>AI Goal Roadmap</CardTitle>
            <CardDescription>Set your target and get a personalized plan</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goal Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Current Score</Label>
            <div className="h-10 px-3 rounded-md border flex items-center bg-muted/50">
              <span className="font-semibold">{averageScore || 'N/A'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Target Score</Label>
            <Input
              id="target"
              type="number"
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              min={300}
              max={850}
            />
          </div>
          <div className="space-y-2">
            <Label>Goal Type</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Improvement</SelectItem>
                <SelectItem value="mortgage">Mortgage Qualification</SelectItem>
                <SelectItem value="auto">Auto Loan</SelectItem>
                <SelectItem value="credit_card">Premium Credit Card</SelectItem>
                <SelectItem value="rental">Rental Application</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={generateRoadmap} 
          disabled={isLoading}
          className="w-full bg-gradient-primary hover:opacity-90"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? 'Generating Roadmap...' : 'Generate AI Roadmap'}
        </Button>
        {isLoading && statusMessage && (
          <p className="text-xs text-muted-foreground">{statusMessage}</p>
        )}

        {/* Roadmap Display */}
        {roadmap && (
          <div className="space-y-6 pt-4 border-t">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <p className="text-2xl font-bold text-primary">{roadmap.estimatedTimelineMonths}</p>
                <p className="text-xs text-muted-foreground">Months</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/10">
                <p className="text-2xl font-bold text-success">+{roadmap.pointsNeeded}</p>
                <p className="text-xs text-muted-foreground">Points Needed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/10">
                <p className="text-2xl font-bold text-warning capitalize">{roadmap.confidence}</p>
                <p className="text-xs text-muted-foreground">Confidence</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{roadmap.qualificationProbability}%</p>
                <p className="text-xs text-muted-foreground">Success Chance</p>
              </div>
            </div>

            {/* Key Actions */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Key Actions
              </h4>
              <div className="space-y-2">
                {roadmap.keyActions.map((action, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <span className="text-sm">{action.action}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{action.timeline}</Badge>
                      <span className={`text-xs font-medium ${getImpactColor(action.impact)}`}>
                        {action.impact.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones Timeline */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Monthly Milestones
              </h4>
              <div className="space-y-3">
                {roadmap.milestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">M{milestone.month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{milestone.action}</span>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(milestone.priority)}`}>
                          {milestone.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-success mt-1">+{milestone.expectedPoints} points expected</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {roadmap.warnings && roadmap.warnings.length > 0 && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <h4 className="font-semibold text-warning flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Important Considerations
                </h4>
                <ul className="text-sm space-y-1">
                  {roadmap.warnings.map((warning, idx) => (
                    <li key={idx} className="text-muted-foreground">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
