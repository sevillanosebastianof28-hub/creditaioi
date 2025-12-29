import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useCreditAnalysis, DisputableItem } from '@/hooks/useCreditAnalysis';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  Sparkles,
  Upload,
  FileText,
  Zap,
  TrendingUp,
  Shield,
  ArrowRight,
  RefreshCw,
  X,
  File,
  Loader2,
} from 'lucide-react';

const AIEngine = () => {
  const [reportText, setReportText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAnalyzing, analysisResult, analyzeReport, clearAnalysis } = useCreditAnalysis();
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'text/plain', 'image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, text file, or image (PNG, JPEG, WebP).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // For text files, read content directly
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setReportText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (selectedFile && selectedFile.type !== 'text/plain') {
      // For non-text files, we need to extract text first
      // For now, we'll show a message that PDFs/images need text extraction
      toast({
        title: "PDF/Image Analysis",
        description: "For best results with PDFs and images, please paste the extracted text. Full file parsing coming soon!",
      });
      return;
    }

    if (!reportText.trim()) {
      toast({
        title: "No Content",
        description: "Please paste your credit report text or upload a text file.",
        variant: "destructive",
      });
      return;
    }

    await analyzeReport(reportText);
  };

  const handleNewAnalysis = () => {
    clearAnalysis();
    setReportText('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/10 text-warning border-warning/30';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDeletionColor = (probability: number) => {
    if (probability >= 80) return 'bg-success/10 text-success';
    if (probability >= 50) return 'bg-warning/10 text-warning';
    return 'bg-muted text-muted-foreground';
  };

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
          {analysisResult && (
            <Button variant="outline" onClick={handleNewAnalysis}>
              <RefreshCw className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          )}
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
            {!analysisResult ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Credit Report Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Upload Zone */}
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                      selectedFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <File className="w-8 h-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="font-medium mb-1">Upload Credit Report</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Support for SmartCredit, IdentityIQ, PrivacyGuard, PDF, and screenshots
                        </p>
                        <Button variant="outline" type="button">Choose File</Button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">or paste text</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <Textarea
                    placeholder="Paste credit report text here for instant AI analysis...

Example format:
EQUIFAX CREDIT REPORT
---
TRADELINE: Chase Credit Card
Account Status: Collection
Balance: $2,450
Date Opened: 01/2019
Last Activity: 06/2023
---
INQUIRY: Auto Loan Check
Date: 03/2024
Creditor: Capital One"
                    className="min-h-48 font-mono text-sm"
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                  />

                  <Button
                    className="w-full bg-gradient-primary hover:opacity-90"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!reportText.trim() && !selectedFile)}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing with AI...
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
            ) : (
              /* Analysis Results */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary */}
                  {analysisResult.summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-secondary/50">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">
                          {analysisResult.summary.disputableItems}
                        </p>
                        <p className="text-sm text-muted-foreground">Disputable Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-success">
                          {analysisResult.summary.avgDeletionProbability}%
                        </p>
                        <p className="text-sm text-muted-foreground">Avg Deletion Prob</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-info">
                          +{analysisResult.summary.estimatedScoreIncrease}
                        </p>
                        <p className="text-sm text-muted-foreground">Potential Points</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-warning">
                          {analysisResult.summary.highPriorityItems}
                        </p>
                        <p className="text-sm text-muted-foreground">High Priority</p>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Recommendations
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {analysisResult.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Disputable Items */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">AI-Identified Disputable Items</h4>
                    {analysisResult.items && analysisResult.items.length > 0 ? (
                      analysisResult.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="font-semibold">{item.creditor}</span>
                                <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                  {item.priority} priority
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={getDeletionColor(item.deletionProbability)}
                                >
                                  {item.deletionProbability}% deletion chance
                                </Badge>
                                {item.expectedScoreImpact > 0 && (
                                  <Badge variant="secondary">
                                    +{item.expectedScoreImpact} points
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.disputeReason}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  {item.applicableLaw}
                                </span>
                                <span>
                                  ${item.balance?.toLocaleString() || 0} balance
                                </span>
                                <span>
                                  {item.bureaus?.join(', ')}
                                </span>
                              </div>
                              <p className="text-xs text-primary mt-2">
                                Strategy: {item.strategy}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              Generate Letter
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No disputable items found in this report.</p>
                        <p className="text-sm">The credit report appears to be clean!</p>
                      </div>
                    )}
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
