import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Lightbulb,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
  Brain
} from "lucide-react";
import { useOutcomeTracker } from "@/hooks/useOutcomeTracker";

// Mock outcome data for analysis
const mockOutcomes = [
  { bureau: "experian", letterType: "FCRA", creditorName: "Capital One", outcome: "deleted", daysToResponse: 28 },
  { bureau: "equifax", letterType: "FDCPA", creditorName: "Chase Bank", outcome: "verified", daysToResponse: 35 },
  { bureau: "transunion", letterType: "FCRA", creditorName: "Discover", outcome: "deleted", daysToResponse: 21 },
  { bureau: "experian", letterType: "Goodwill", creditorName: "Bank of America", outcome: "updated", daysToResponse: 30 },
  { bureau: "equifax", letterType: "FCRA", creditorName: "Wells Fargo", outcome: "deleted", daysToResponse: 25 },
  { bureau: "transunion", letterType: "Collection Validation", creditorName: "Midland Credit", outcome: "deleted", daysToResponse: 18 },
  { bureau: "experian", letterType: "HIPAA", creditorName: "Medical Collections", outcome: "verified", daysToResponse: 45 },
  { bureau: "equifax", letterType: "Identity Theft", creditorName: "Unknown Creditor", outcome: "deleted", daysToResponse: 14 },
];

const bureauStats = [
  { bureau: "Experian", total: 45, deleted: 28, successRate: 62 },
  { bureau: "Equifax", total: 38, deleted: 21, successRate: 55 },
  { bureau: "TransUnion", total: 41, deleted: 25, successRate: 61 },
];

const letterTypeStats = [
  { type: "FCRA", used: 52, success: 35, rate: 67 },
  { type: "FDCPA", used: 28, success: 16, rate: 57 },
  { type: "Goodwill", used: 15, success: 8, rate: 53 },
  { type: "Collection Validation", used: 22, success: 18, rate: 82 },
  { type: "HIPAA", used: 12, success: 6, rate: 50 },
];

export default function OutcomeTracker() {
  const [timeframe, setTimeframe] = useState("90days");
  const [bureauFilter, setBureauFilter] = useState("all");
  const { isProcessing, insights, analyzePatterns, predictSuccess, generateInsights, clearInsights, statusMessage } = useOutcomeTracker();

  const handleAnalyzePatterns = async () => {
    await analyzePatterns(
      mockOutcomes,
      bureauFilter !== "all" ? bureauFilter : undefined,
      undefined,
      timeframe
    );
  };

  const handlePredictSuccess = async () => {
    await predictSuccess(mockOutcomes);
  };

  const handleGenerateInsights = async () => {
    await generateInsights(mockOutcomes, timeframe);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              AI Outcome Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Track dispute outcomes and learn patterns to optimize future success
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearInsights} disabled={!insights}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">74</p>
                  <p className="text-xs text-muted-foreground">Items Deleted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">59%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">27</p>
                  <p className="text-xs text-muted-foreground">Avg Days to Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">51</p>
                  <p className="text-xs text-muted-foreground">Items Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isProcessing && statusMessage && (
          <p className="text-xs text-muted-foreground">{statusMessage}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bureau Performance */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Bureau Performance
              </CardTitle>
              <CardDescription>Success rates by credit bureau</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bureauStats.map((bureau) => (
                <div key={bureau.bureau} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{bureau.bureau}</span>
                    <span className="text-sm text-muted-foreground">
                      {bureau.deleted}/{bureau.total} ({bureau.successRate}%)
                    </span>
                  </div>
                  <Progress value={bureau.successRate} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Letter Type Effectiveness */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Letter Type Effectiveness</CardTitle>
              <CardDescription>Which letter types work best</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {letterTypeStats.map((letter) => (
                <div key={letter.type} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div>
                    <span className="font-medium text-sm">{letter.type}</span>
                    <p className="text-xs text-muted-foreground">{letter.used} letters sent</p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={letter.rate >= 70 ? "text-green-400 border-green-500/30" : 
                              letter.rate >= 50 ? "text-yellow-400 border-yellow-500/30" : 
                              "text-red-400 border-red-500/30"}
                  >
                    {letter.rate}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Analysis Actions */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Analysis
              </CardTitle>
              <CardDescription>Get AI-powered insights from your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={bureauFilter} onValueChange={setBureauFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by bureau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bureaus</SelectItem>
                  <SelectItem value="experian">Experian</SelectItem>
                  <SelectItem value="equifax">Equifax</SelectItem>
                  <SelectItem value="transunion">TransUnion</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleAnalyzePatterns} disabled={isProcessing} className="w-full">
                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                Analyze Patterns
              </Button>
              
              <Button onClick={handlePredictSuccess} disabled={isProcessing} variant="outline" className="w-full">
                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
                Predict Success Rates
              </Button>
              
              <Button onClick={handleGenerateInsights} disabled={isProcessing} variant="outline" className="w-full">
                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lightbulb className="h-4 w-4 mr-2" />}
                Generate Business Insights
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Panel */}
        {insights && (
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                AI Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="insights" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="insights">Key Insights</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  <TabsTrigger value="patterns">Patterns</TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="space-y-3">
                  {insights.topInsights?.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <ChevronRight className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                  {insights.analysis && (
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm whitespace-pre-wrap">{insights.analysis}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-3">
                  {insights.recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
                      <Target className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                  {insights.actionItems?.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
                      <p className="text-sm">{action}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="patterns" className="space-y-3">
                  {insights.trends?.map((trend, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">{trend}</p>
                    </div>
                  ))}
                  {insights.keyMetrics && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/30 text-center">
                        <p className="text-2xl font-bold text-primary">{insights.keyMetrics.deletionRate}%</p>
                        <p className="text-xs text-muted-foreground">Deletion Rate</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 text-center">
                        <p className="text-2xl font-bold text-primary">{insights.keyMetrics.avgDaysToResolution}</p>
                        <p className="text-xs text-muted-foreground">Avg Days to Resolution</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
