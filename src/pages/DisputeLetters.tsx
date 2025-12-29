import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useDisputeLetter, letterTemplates, LetterType } from '@/hooks/useDisputeLetter';
import { DisputableItem } from '@/hooks/useCreditAnalysis';
import { cn } from '@/lib/utils';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  ArrowRight,
  Loader2,
  Shield,
  X,
  ChevronDown,
  Printer,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Sample disputable items for demo (in production, these would come from analysis)
const sampleItems: DisputableItem[] = [
  {
    id: '1',
    creditor: 'Capital One',
    accountType: 'credit_card',
    issueType: 'late_payment',
    balance: 2450,
    disputeReason: 'Late payments reported during COVID hardship period',
    deletionProbability: 75,
    expectedScoreImpact: 25,
    applicableLaw: 'FCRA 611',
    strategy: 'Goodwill adjustment request citing temporary hardship',
    priority: 'high',
    bureaus: ['equifax', 'experian', 'transunion'],
  },
  {
    id: '2',
    creditor: 'Midland Credit Management',
    accountType: 'collection',
    issueType: 'collection',
    balance: 1850,
    disputeReason: 'Collection account with unverified debt ownership',
    deletionProbability: 85,
    expectedScoreImpact: 35,
    applicableLaw: 'FDCPA 809',
    strategy: 'Debt validation request demanding complete chain of ownership',
    priority: 'high',
    bureaus: ['equifax', 'transunion'],
  },
  {
    id: '3',
    creditor: 'Medical Collections LLC',
    accountType: 'collection',
    issueType: 'collection',
    balance: 750,
    disputeReason: 'Medical debt reported without HIPAA authorization',
    deletionProbability: 90,
    expectedScoreImpact: 20,
    applicableLaw: 'HIPAA',
    strategy: 'HIPAA violation dispute citing lack of authorization',
    priority: 'medium',
    bureaus: ['experian'],
  },
];

const DisputeLetters = () => {
  const [selectedItem, setSelectedItem] = useState<DisputableItem | null>(null);
  const [selectedLetterType, setSelectedLetterType] = useState<LetterType>('factual_dispute');
  const [customInstructions, setCustomInstructions] = useState('');
  const [showLetterDialog, setShowLetterDialog] = useState(false);
  
  const { 
    isGenerating, 
    generatedLetter, 
    generateLetter, 
    clearLetter,
    downloadLetter,
    copyLetter 
  } = useDisputeLetter();

  const handleGenerateLetter = async () => {
    if (!selectedItem) return;
    
    const result = await generateLetter(selectedLetterType, selectedItem, customInstructions);
    if (result) {
      setShowLetterDialog(true);
    }
  };

  const handleDownload = () => {
    if (!generatedLetter) return;
    const filename = `${generatedLetter.creditor.replace(/\s+/g, '_')}_dispute_letter.txt`;
    downloadLetter(generatedLetter.letter, filename);
  };

  const handlePrint = () => {
    if (!generatedLetter) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Dispute Letter - ${generatedLetter.creditor}</title>
            <style>
              body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; padding: 1in; }
              pre { white-space: pre-wrap; font-family: inherit; }
            </style>
          </head>
          <body>
            <pre>${generatedLetter.letter}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getSuggestedLetterType = (item: DisputableItem): LetterType => {
    if (item.applicableLaw?.includes('HIPAA')) return 'hipaa_medical';
    if (item.applicableLaw?.includes('FDCPA')) return 'debt_validation';
    if (item.issueType === 'collection') return 'collection_validation';
    if (item.issueType === 'late_payment') return 'goodwill';
    if (item.issueType === 'inquiry') return 'inquiry_removal';
    return 'factual_dispute';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            AI Dispute Letter Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate customized dispute letters with AI-powered legal language.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Disputable Items List */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Account to Dispute</CardTitle>
                <CardDescription>
                  Choose an account from your analysis results to generate a dispute letter.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sampleItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all cursor-pointer",
                      selectedItem?.id === item.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    )}
                    onClick={() => {
                      setSelectedItem(item);
                      setSelectedLetterType(getSuggestedLetterType(item));
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-semibold">{item.creditor}</span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              item.priority === 'high' && 'bg-destructive/10 text-destructive',
                              item.priority === 'medium' && 'bg-warning/10 text-warning',
                              item.priority === 'low' && 'bg-muted'
                            )}
                          >
                            {item.priority}
                          </Badge>
                          <Badge variant="secondary">
                            {item.deletionProbability}% deletion chance
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.disputeReason}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {item.applicableLaw}
                          </span>
                          <span>${item.balance.toLocaleString()}</span>
                          <span>{item.bureaus.join(', ')}</span>
                        </div>
                      </div>
                      {selectedItem?.id === item.id && (
                        <div className="text-primary">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Letter Configuration */}
            {selectedItem && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Configure Letter
                  </CardTitle>
                  <CardDescription>
                    Customize the dispute letter for {selectedItem.creditor}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Letter Type</label>
                    <Select
                      value={selectedLetterType}
                      onValueChange={(value) => setSelectedLetterType(value as LetterType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {letterTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex flex-col">
                              <span>{template.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {template.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Custom Instructions (Optional)
                    </label>
                    <Textarea
                      placeholder="Add any specific details or context you want included in the letter..."
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      className="min-h-24"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      className="flex-1 bg-gradient-primary"
                      onClick={handleGenerateLetter}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Letter
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Letter Templates Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {letterTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      "p-3 rounded-lg transition-colors cursor-pointer",
                      selectedLetterType === template.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-secondary/50"
                    )}
                    onClick={() => setSelectedLetterType(template.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.applicableLaws.map((law) => (
                            <Badge key={law} variant="secondary" className="text-xs">
                              {law}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-hero text-sidebar-foreground border-sidebar-border">
              <CardHeader>
                <CardTitle className="text-lg text-sidebar-accent-foreground">
                  💡 Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>• Send letters via certified mail with return receipt</p>
                <p>• Keep copies of all correspondence</p>
                <p>• Wait 30-45 days for bureau response</p>
                <p>• Follow up if no response received</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Generated Letter Dialog */}
      <Dialog open={showLetterDialog} onOpenChange={setShowLetterDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Generated Dispute Letter
            </DialogTitle>
            <DialogDescription>
              {generatedLetter && (
                <span>
                  {letterTemplates.find(t => t.id === generatedLetter.letterType)?.name} for{' '}
                  {generatedLetter.creditor}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {generatedLetter && (
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                {generatedLetter.letter}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => copyLetter(generatedLetter?.letter || '')}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" onClick={() => setShowLetterDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DisputeLetters;
