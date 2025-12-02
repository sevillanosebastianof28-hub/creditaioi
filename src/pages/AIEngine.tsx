import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { mockTradelines, mockClients } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  Brain,
  Sparkles,
  Upload,
  FileText,
  Zap,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const AIEngine = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(true);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  const disputableItems = mockTradelines.filter((t) => t.disputable);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              AI Credit Intelligence Engine
            </h1>
            <p className="text-muted-foreground mt-1">
              Advanced AI-powered credit analysis and dispute automation.
            </p>
          </div>
        </div>

        {/* AI Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Report Parsing</h3>
                <p className="text-sm text-muted-foreground">
                  Parse any credit report format: SmartCredit, IdentityIQ, PDF, screenshots.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-success/20 bg-gradient-to-br from-success/5 to-transparent">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Zap className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Error Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically identify errors, inaccuracies, and legally disputable items.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-info/20 bg-gradient-to-br from-info/5 to-transparent">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <TrendingUp className="w-5 h-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Score Prediction</h3>
                <p className="text-sm text-muted-foreground">
                  Predict score impact and optimal dispute order for maximum results.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Upload & Analysis */}
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Credit Report Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium mb-1">Upload Credit Report</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Support for SmartCredit, IdentityIQ, PrivacyGuard, PDF, and screenshots
                  </p>
                  <Button variant="outline">Choose File</Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Textarea
                  placeholder="Paste credit report text here for instant analysis..."
                  className="min-h-32"
                />

                <Button
                  className="w-full bg-gradient-primary hover:opacity-90"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisComplete && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{disputableItems.length}</p>
                      <p className="text-sm text-muted-foreground">Disputable Items</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-success">82%</p>
                      <p className="text-sm text-muted-foreground">Avg Deletion Prob</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-info">+65</p>
                      <p className="text-sm text-muted-foreground">Potential Points</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-warning">3</p>
                      <p className="text-sm text-muted-foreground">High Priority</p>
                    </div>
                  </div>

                  {/* Disputable Items */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">AI-Identified Disputable Items</h4>
                    {disputableItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{item.creditor}</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  item.deletionProbability! >= 80 && 'bg-success/10 text-success',
                                  item.deletionProbability! >= 50 &&
                                    item.deletionProbability! < 80 &&
                                    'bg-warning/10 text-warning',
                                  item.deletionProbability! < 50 && 'bg-muted text-muted-foreground'
                                )}
                              >
                                {item.deletionProbability}% deletion chance
                              </Badge>
                              {item.expectedScoreImpact && (
                                <Badge variant="secondary">
                                  +{item.expectedScoreImpact} points
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.disputeReason}
                            </p>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={item.deletionProbability}
                                className="w-32 h-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                ${item.balance.toLocaleString()} balance
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Generate Letter
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Training & Tips */}
          <div className="space-y-4">
            <Card className="bg-gradient-hero text-sidebar-foreground border-sidebar-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-sidebar-accent-foreground">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Training Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-sidebar-foreground">
                  Learn why items are being disputed and understand the applicable laws.
                </p>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-sidebar-accent-foreground">
                        FCRA Section 605
                      </span>
                    </div>
                    <p className="text-xs text-sidebar-foreground">
                      Time limits on reporting negative information. Most negative items must be
                      removed after 7 years.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-info" />
                      <span className="text-sm font-medium text-sidebar-accent-foreground">
                        FDCPA Validation
                      </span>
                    </div>
                    <p className="text-xs text-sidebar-foreground">
                      Debt collectors must validate the debt upon request. Failure to do so requires
                      removal.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-sidebar-accent-foreground">
                        HIPAA Medical Debts
                      </span>
                    </div>
                    <p className="text-xs text-sidebar-foreground">
                      Medical providers cannot share debt information without proper authorization.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Letter Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'FCRA 605b Deletion',
                  'Debt Validation Request',
                  'HIPAA Medical Dispute',
                  'Goodwill Adjustment',
                  'Data Breach Letter',
                  'Identity Theft Affidavit',
                ].map((template) => (
                  <div
                    key={template}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{template}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIEngine;
