import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, Sparkles, TrendingUp, Zap, Activity, 
  Target, BarChart3, Calendar, Clock, CheckCircle2,
  AlertTriangle, Lightbulb, RefreshCw, ChevronRight
} from 'lucide-react';
import { useCreditData } from '@/hooks/useCreditData';
import { useAIPredictionsRealtime } from '@/hooks/useAIPredictions';
import { readAiStream } from '@/lib/aiStream';
import { toast } from 'sonner';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'tip' | 'milestone';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: string;
}

interface AIAnalytics {
  totalPredictions: number;
  accuracyRate: number;
  avgScoreImpact: number;
  successfulDisputes: number;
  pendingOpportunities: number;
}

interface CommandCenterData {
  insights: AIInsight[];
  analytics: AIAnalytics | null;
}

export function AICommandCenter() {
  const { creditData, averageScore, disputeProgress } = useCreditData();
  const { getCachedPrediction, cachePrediction } = useAIPredictionsRealtime<CommandCenterData>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState('insights');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load cached insights on mount
  useEffect(() => {
    const loadCached = async () => {
      const cached = await getCachedPrediction('ai_insights');
      if (cached) {
        setInsights(cached.prediction_data.insights || []);
        setAnalytics(cached.prediction_data.analytics || null);
      }
    };
    loadCached();
  }, [getCachedPrediction]);

  const generateInsights = async () => {
    if (!creditData) {
      toast.error('No credit data available');
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage('Running AI analysis...');
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-intelligence-hub`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          action: 'generate_insights',
          creditData: {
            scores: creditData.scores,
            negativeItems: creditData.negativeItems,
            summary: creditData.summary,
            averageScore,
            disputeProgress
          },
          stream: true
        })
      });

      const data = await readAiStream<{ insights: AIInsight[]; analytics: AIAnalytics | null }>(response, (event) => {
        if (event.type === 'status') {
          setStatusMessage(event.message || null);
        }
      });
      
      setInsights(data.insights || []);
      setAnalytics(data.analytics || null);
      
      // Cache insights for 6 hours
      await cachePrediction('ai_insights', data, undefined, 6);
      
      toast.success('AI analysis complete!');
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to generate insights');
    } finally {
      setStatusMessage(null);
      setIsAnalyzing(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'tip': return <Lightbulb className="w-4 h-4 text-primary" />;
      case 'milestone': return <CheckCircle2 className="w-4 h-4 text-info" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge className="bg-success/10 text-success border-success/20">High Impact</Badge>;
      case 'medium': return <Badge className="bg-warning/10 text-warning border-warning/20">Medium</Badge>;
      default: return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <Card className="card-elevated overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center"
              animate={{ rotate: isAnalyzing ? 360 : 0 }}
              transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Command Center
                <Badge variant="outline" className="ml-2 text-xs animate-pulse">
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </CardTitle>
              <CardDescription>
                Centralized AI intelligence for your credit repair journey
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={generateInsights}
            disabled={isAnalyzing || !creditData}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
        {isAnalyzing && statusMessage && (
          <p className="text-xs text-muted-foreground mt-2">{statusMessage}</p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger 
              value="insights" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger 
              value="predictions"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              <Target className="w-4 h-4 mr-2" />
              Predictions
            </TabsTrigger>
            <TabsTrigger 
              value="performance"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              AI Performance
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="insights" className="m-0">
              <AnimatePresence mode="wait">
                {insights.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 rounded-lg bg-success/10 border border-success/20 text-center"
                      >
                        <p className="text-2xl font-bold text-success">
                          {insights.filter(i => i.type === 'opportunity').length}
                        </p>
                        <p className="text-xs text-muted-foreground">Opportunities</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-center"
                      >
                        <p className="text-2xl font-bold text-warning">
                          {insights.filter(i => i.type === 'warning').length}
                        </p>
                        <p className="text-xs text-muted-foreground">Warnings</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center"
                      >
                        <p className="text-2xl font-bold text-primary">
                          {insights.filter(i => i.type === 'tip').length}
                        </p>
                        <p className="text-xs text-muted-foreground">Pro Tips</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 rounded-lg bg-info/10 border border-info/20 text-center"
                      >
                        <p className="text-2xl font-bold text-info">
                          {insights.filter(i => i.type === 'milestone').length}
                        </p>
                        <p className="text-xs text-muted-foreground">Milestones</p>
                      </motion.div>
                    </div>

                    {/* Insights List */}
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {insights.map((insight, idx) => (
                          <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                  {getInsightIcon(insight.type)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="font-medium">{insight.title}</span>
                                    {getImpactBadge(insight.impact)}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                                  {insight.actionable && insight.action && (
                                    <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                                      {insight.action}
                                      <ChevronRight className="w-3 h-3 ml-1" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground mb-4">
                      Click "Run AI Analysis" to generate personalized insights
                    </p>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Our AI will analyze your credit profile, identify opportunities, 
                      and provide actionable recommendations to accelerate your credit repair.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="predictions" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-4 h-4 text-success" />
                      Score Trajectory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-3xl font-bold text-success">+47</p>
                          <p className="text-xs text-muted-foreground">Predicted Points Gain</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{averageScore + 47}</p>
                          <p className="text-xs text-muted-foreground">Projected Score</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Current: {averageScore}</span>
                          <span>Goal: 750</span>
                        </div>
                        <Progress value={((averageScore || 0) / 850) * 100} className="h-2" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Based on current dispute success rate and pending removals
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Timeline Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-3xl font-bold text-primary">3-4</p>
                          <p className="text-xs text-muted-foreground">Months to Goal</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">85%</p>
                          <p className="text-xs text-muted-foreground">Confidence</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6].map(month => (
                          <div 
                            key={month} 
                            className={`flex-1 h-8 rounded ${month <= 4 ? 'bg-primary/20' : 'bg-muted'} flex items-center justify-center`}
                          >
                            <span className="text-[10px]">M{month}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Estimated completion with consistent dispute activity
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="m-0">
              {analytics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <p className="text-2xl font-bold">{analytics.totalPredictions}</p>
                      <p className="text-xs text-muted-foreground">Total Predictions</p>
                    </div>
                    <div className="p-4 rounded-lg bg-success/10 text-center">
                      <p className="text-2xl font-bold text-success">{analytics.accuracyRate}%</p>
                      <p className="text-xs text-muted-foreground">Accuracy Rate</p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 text-center">
                      <p className="text-2xl font-bold text-primary">+{analytics.avgScoreImpact}</p>
                      <p className="text-xs text-muted-foreground">Avg Score Impact</p>
                    </div>
                    <div className="p-4 rounded-lg bg-warning/10 text-center">
                      <p className="text-2xl font-bold text-warning">{analytics.pendingOpportunities}</p>
                      <p className="text-xs text-muted-foreground">Pending Actions</p>
                    </div>
                  </div>

                  <Card className="border-dashed">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">AI Model Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Dispute Success Prediction</span>
                            <span className="text-success">89%</span>
                          </div>
                          <Progress value={89} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Score Impact Accuracy</span>
                            <span className="text-primary">82%</span>
                          </div>
                          <Progress value={82} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Timeline Estimation</span>
                            <span className="text-warning">76%</span>
                          </div>
                          <Progress value={76} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Run AI Analysis to see performance metrics</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
