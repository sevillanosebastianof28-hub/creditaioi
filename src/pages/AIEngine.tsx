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

  const parseFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    // Handle PDF and image files through OCR parser - uses faster model
    if (selectedFile && selectedFile.type !== 'text/plain') {
      setIsUploading(true);
      try {
        const base64 = await parseFileToBase64(selectedFile);
        
        toast({
          title: "Analyzing Document",
          description: "AI is extracting and analyzing your credit report...",
        });

        const { data, error } = await supabase.functions.invoke('ocr-document-parser', {
          body: {
            action: 'parse_credit_report',
            imageBase64: base64
          }
        });

        if (error) throw error;

        // Check if OCR returned structured data or raw text
        if (data?.result?.negativeItems && data.result.negativeItems.length > 0) {
          // Format structured OCR data for analysis
          const formattedText = formatOCRResultToText(data.result);
          await analyzeReport(formattedText);
        } else if (data?.result?.rawText) {
          // Use the extracted text for analysis
          await analyzeReport(data.result.rawText);
        } else if (data?.result?.tradelines || data?.result?.collections) {
          // Has structured data but no negative items - still format and analyze
          const formattedText = formatOCRResultToText(data.result);
          await analyzeReport(formattedText);
        } else {
          toast({
            title: "No Content Extracted",
            description: "Could not extract readable content from the file. Please try pasting the text directly.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('File parsing error:', error);
        toast({
          title: "File Processing Failed",
          description: error.message || "Failed to process the file. Please try pasting the text instead.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
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

  // Helper to safely extract a numeric/string value from potentially complex objects
  const extractValue = (val: any): string => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      // Handle date-stamped objects like {date: "2024-01-01", score: 650}
      if (val.score !== undefined) return extractValue(val.score);
      if (val.value !== undefined) return extractValue(val.value);
      if (val.amount !== undefined) return extractValue(val.amount);
      // Handle bureau-specific objects like {Equifax: 650, Experian: 640}
      const keys = Object.keys(val);
      if (keys.length > 0) {
        const values = keys.map(k => `${k}: ${extractValue(val[k])}`).join(', ');
        return values;
      }
    }
    return 'N/A';
  };

  const extractNumericValue = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof val === 'object') {
      if (val.score !== undefined) return extractNumericValue(val.score);
      if (val.value !== undefined) return extractNumericValue(val.value);
      if (val.amount !== undefined) return extractNumericValue(val.amount);
      // Average bureau values
      const keys = Object.keys(val);
      if (keys.length > 0) {
        const sum = keys.reduce((acc, k) => acc + extractNumericValue(val[k]), 0);
        return Math.round(sum / keys.length);
      }
    }
    return 0;
  };

  const formatOCRResultToText = (result: any): string => {
    let text = "CREDIT REPORT ANALYSIS\n\n";
    
    if (result.personalInfo) {
      const pi = result.personalInfo;
      text += "PERSONAL INFO:\n";
      if (pi.name) text += `  Name: ${extractValue(pi.name)}\n`;
      if (pi.address) text += `  Address: ${extractValue(pi.address)}\n`;
      if (pi.ssn4 || pi.ssn) text += `  SSN (last 4): ${extractValue(pi.ssn4 || pi.ssn)}\n`;
      if (pi.dob) text += `  DOB: ${extractValue(pi.dob)}\n`;
      text += "\n";
    }
    
    if (result.scores && result.scores.length > 0) {
      text += "CREDIT SCORES:\n";
      result.scores.forEach((score: any) => {
        const bureau = extractValue(score.bureau);
        const scoreVal = extractNumericValue(score.score);
        text += `  - ${bureau}: ${scoreVal}\n`;
      });
      text += "\n";
    }
    
    if (result.negativeItems && result.negativeItems.length > 0) {
      text += "NEGATIVE ITEMS:\n";
      result.negativeItems.forEach((item: any, index: number) => {
        const creditor = extractValue(item.creditor || item.accountName || item.creditorName);
        text += `\n  ${index + 1}. Creditor: ${creditor}\n`;
        text += `     Account Type: ${extractValue(item.accountType || item.type)}\n`;
        text += `     Status: ${extractValue(item.status)}\n`;
        text += `     Balance: $${extractNumericValue(item.balance)}\n`;
        text += `     Original Balance: $${extractNumericValue(item.originalBalance || item.highBalance)}\n`;
        if (item.dateOpened) text += `     Date Opened: ${extractValue(item.dateOpened)}\n`;
        if (item.dateOfFirstDelinquency || item.dofd) text += `     DOFD: ${extractValue(item.dateOfFirstDelinquency || item.dofd)}\n`;
        if (item.bureaus) {
          const bureaus = Array.isArray(item.bureaus) ? item.bureaus.join(', ') : extractValue(item.bureaus);
          text += `     Bureaus: ${bureaus}\n`;
        }
        if (item.paymentHistory) text += `     Payment History: ${extractValue(item.paymentHistory)}\n`;
      });
      text += "\n";
    }
    
    if (result.tradelines && result.tradelines.length > 0) {
      text += "TRADELINES:\n";
      result.tradelines.forEach((item: any, index: number) => {
        const creditor = extractValue(item.creditor || item.accountName || item.creditorName);
        text += `\n  ${index + 1}. Creditor: ${creditor}\n`;
        text += `     Account Type: ${extractValue(item.accountType || item.type)}\n`;
        text += `     Balance: $${extractNumericValue(item.balance)}\n`;
        text += `     Credit Limit: $${extractNumericValue(item.creditLimit || item.limit)}\n`;
        text += `     Status: ${extractValue(item.status)}\n`;
        if (item.dateOpened) text += `     Date Opened: ${extractValue(item.dateOpened)}\n`;
        if (item.paymentHistory) text += `     Payment History: ${extractValue(item.paymentHistory)}\n`;
      });
      text += "\n";
    }
    
    if (result.collections && result.collections.length > 0) {
      text += "COLLECTIONS:\n";
      result.collections.forEach((item: any, index: number) => {
        const creditor = extractValue(item.creditor || item.collector || item.collectionAgency);
        const originalCreditor = extractValue(item.originalCreditor);
        text += `\n  ${index + 1}. Collection Agency: ${creditor}\n`;
        if (originalCreditor !== 'N/A') text += `     Original Creditor: ${originalCreditor}\n`;
        text += `     Balance: $${extractNumericValue(item.balance)}\n`;
        text += `     Original Amount: $${extractNumericValue(item.originalAmount || item.originalBalance)}\n`;
        if (item.dateOpened || item.datePlaced) text += `     Date Placed: ${extractValue(item.dateOpened || item.datePlaced)}\n`;
        if (item.dateOfFirstDelinquency || item.dofd) text += `     DOFD: ${extractValue(item.dateOfFirstDelinquency || item.dofd)}\n`;
      });
      text += "\n";
    }

    if (result.inquiries && result.inquiries.length > 0) {
      text += "INQUIRIES:\n";
      result.inquiries.forEach((item: any, index: number) => {
        text += `\n  ${index + 1}. Creditor: ${extractValue(item.creditor || item.inquiryBy)}\n`;
        text += `     Date: ${extractValue(item.date || item.inquiryDate)}\n`;
        text += `     Type: ${extractValue(item.type || 'Hard Inquiry')}\n`;
      });
      text += "\n";
    }
    
    return text;
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
                    disabled={isAnalyzing || isUploading || (!reportText.trim() && !selectedFile)}
                  >
                    {isAnalyzing || isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isUploading ? 'Processing File...' : 'Analyzing with AI...'}
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
