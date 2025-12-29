import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDisputeLetter, letterTemplates, LetterType } from '@/hooks/useDisputeLetter';
import { DisputableItem } from '@/hooks/useCreditAnalysis';
import { mockClients, mockTradelines } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  ArrowRight,
  Loader2,
  Shield,
  Search,
  Users,
  ChevronLeft,
  Printer,
  AlertCircle,
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

// Convert mock tradelines to disputable items for a client
const getClientDisputableItems = (clientId: string): DisputableItem[] => {
  // In production, this would fetch from credit_report_analyses table
  return mockTradelines
    .filter((t) => t.disputable)
    .map((t) => ({
      id: t.id,
      creditor: t.creditor,
      accountType: t.accountType,
      issueType: t.status === 'collection' ? 'collection' : t.paymentStatus?.includes('late') ? 'late_payment' : 'inaccuracy',
      balance: t.balance,
      disputeReason: t.disputeReason || 'Data inaccuracy identified',
      deletionProbability: t.deletionProbability || 50,
      expectedScoreImpact: t.expectedScoreImpact || 20,
      applicableLaw: t.accountType === 'collection' ? 'FDCPA' : 'FCRA 611',
      strategy: t.disputeReason || 'Standard dispute process',
      priority: (t.deletionProbability || 50) > 75 ? 'high' : (t.deletionProbability || 50) > 50 ? 'medium' : 'low',
      bureaus: t.bureaus,
    }));
};

const DisputeLetters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
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

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return mockClients.filter((c) => 
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectedClient = useMemo(() => 
    mockClients.find((c) => c.id === selectedClientId),
    [selectedClientId]
  );

  const clientDisputableItems = useMemo(() => 
    selectedClientId ? getClientDisputableItems(selectedClientId) : [],
    [selectedClientId]
  );

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

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedItem(null);
  };

  const handleBackToClients = () => {
    setSelectedClientId(null);
    setSelectedItem(null);
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
            Select a client to view their issues and generate customized dispute letters.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Client List / Issues Panel */}
          <div className="xl:col-span-2 space-y-4">
            {!selectedClientId ? (
              /* Client Selection */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Select Client
                  </CardTitle>
                  <CardDescription>
                    Choose a client to view their disputable items.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Client List */}
                  <ScrollArea className="h-[500px] pr-2">
                    <div className="space-y-2">
                      {filteredClients.map((client) => {
                        const avgScore = Math.round(
                          client.currentScores.reduce((a, b) => a + b.score, 0) / client.currentScores.length
                        );
                        
                        return (
                          <div
                            key={client.id}
                            className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                            onClick={() => handleSelectClient(client.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {client.firstName[0]}{client.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">
                                  {client.firstName} {client.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {client.email}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-lg">{avgScore}</p>
                                <p className="text-xs text-muted-foreground">Avg Score</p>
                              </div>
                              <Badge 
                                variant="outline"
                                className={cn(
                                  client.status === 'active' && 'bg-success/10 text-success border-success/30',
                                  client.status === 'lead' && 'bg-warning/10 text-warning border-warning/30',
                                  client.status === 'completed' && 'bg-primary/10 text-primary border-primary/30'
                                )}
                              >
                                {client.status}
                              </Badge>
                              <ArrowRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Round {client.currentRound}</span>
                              <span>{client.itemsDeleted}/{client.totalItemsDisputed} deleted</span>
                              {client.assignedVA && <span>VA: {client.assignedVA}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              /* Client Issues */
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleBackToClients}
                        className="mr-2"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedClient?.firstName[0]}{selectedClient?.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>
                          {selectedClient?.firstName} {selectedClient?.lastName}
                        </CardTitle>
                        <CardDescription>{selectedClient?.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {clientDisputableItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No disputable items found for this client.</p>
                        <p className="text-sm mt-1">Run an AI analysis to identify issues.</p>
                      </div>
                    ) : (
                      clientDisputableItems.map((item) => (
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
                      ))
                    )}
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
              </>
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
