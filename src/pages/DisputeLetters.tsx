import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useDisputeLetter, letterTemplates, LetterType } from '@/hooks/useDisputeLetter';
import { useLetterTracking } from '@/hooks/useLetterTracking';
import { useAgencyClients } from '@/hooks/useAgencyClients';
import { DisputableItem } from '@/hooks/useCreditAnalysis';
import { cn } from '@/lib/utils';
import LetterDocumentEditor from '@/components/disputes/LetterDocumentEditor';
import {
  FileText,
  Sparkles,
  ArrowRight,
  Loader2,
  Shield,
  Search,
  Users,
  ChevronLeft,
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
import { supabase } from '@/integrations/supabase/client';

const DisputeLetters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DisputableItem | null>(null);
  const [selectedLetterType, setSelectedLetterType] = useState<LetterType>('factual_dispute');
  const [customInstructions, setCustomInstructions] = useState('');
  const [showLetterDialog, setShowLetterDialog] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [clientDisputableItems, setClientDisputableItems] = useState<DisputableItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const { clients, isLoading: isLoadingClients } = useAgencyClients();

  const { 
    isGenerating, 
    generatedLetter, 
    draftLetter,
    statusMessage,
    generateLetter, 
    clearLetter,
    downloadLetter
  } = useDisputeLetter();

  const { saveLetter } = useLetterTracking();

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return clients.filter((c) => 
      c.first_name.toLowerCase().includes(query) ||
      c.last_name.toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query)
    );
  }, [searchQuery, clients]);

  const selectedClient = useMemo(() => 
    clients.find((c) => c.user_id === selectedClientId),
    [selectedClientId, clients]
  );

  // Fetch disputable items from credit_report_analyses when a client is selected
  useEffect(() => {
    if (!selectedClientId) {
      setClientDisputableItems([]);
      return;
    }

    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const { data, error } = await supabase
          .from('credit_report_analyses')
          .select('disputable_items')
          .eq('user_id', selectedClientId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data?.disputable_items && Array.isArray(data.disputable_items)) {
          const items: DisputableItem[] = (data.disputable_items as any[]).map((item: any, idx: number) => ({
            id: item.id || `item-${idx}`,
            creditor: item.creditor || 'Unknown',
            accountType: item.accountType || 'unknown',
            issueType: item.issueType || 'inaccuracy',
            balance: item.balance || 0,
            disputeReason: item.disputeReason || 'Data inaccuracy identified',
            deletionProbability: item.deletionProbability || 50,
            expectedScoreImpact: item.expectedScoreImpact || 20,
            applicableLaw: item.applicableLaw || 'FCRA 611',
            strategy: item.strategy || 'Standard dispute process',
            priority: item.priority || 'medium',
            bureaus: item.bureaus || ['experian'],
          }));
          setClientDisputableItems(items);
        } else {
          // If no credit analysis, check dispute_items table directly
          const { data: disputes } = await supabase
            .from('dispute_items')
            .select('*')
            .eq('client_id', selectedClientId);

          if (disputes?.length) {
            const items: DisputableItem[] = disputes.map(d => ({
              id: d.id,
              creditor: d.creditor_name,
              accountType: 'unknown',
              issueType: 'inaccuracy',
              balance: 0,
              disputeReason: d.dispute_reason,
              deletionProbability: 50,
              expectedScoreImpact: 20,
              applicableLaw: 'FCRA 611',
              strategy: d.dispute_reason,
              priority: 'medium',
              bureaus: [d.bureau],
            }));
            setClientDisputableItems(items);
          } else {
            setClientDisputableItems([]);
          }
        }
      } catch (err) {
        console.error('Error fetching disputable items:', err);
        setClientDisputableItems([]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [selectedClientId]);

  useEffect(() => {
    if (isEditingLetter) return;
    if (draftLetter) {
      setLetterContent(draftLetter);
      return;
    }
    if (generatedLetter?.letter) {
      setLetterContent(generatedLetter.letter);
      return;
    }
    setLetterContent('');
  }, [draftLetter, generatedLetter, isEditingLetter]);

  const handleGenerateLetter = async () => {
    if (!selectedItem) return;

    setIsEditingLetter(false);
    setLetterContent('');
    setShowLetterDialog(true);
    await generateLetter(selectedLetterType, selectedItem, customInstructions);
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
                      {isLoadingClients ? (
                        [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)
                      ) : filteredClients.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">No clients found</p>
                          <p className="text-sm mt-1">
                            {searchQuery ? 'Try a different search term.' : 'Add clients to your agency first.'}
                          </p>
                        </div>
                      ) : (
                        filteredClients.map((client) => (
                          <div
                            key={client.user_id}
                            className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                            onClick={() => handleSelectClient(client.user_id)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {client.first_name?.[0] || ''}{client.last_name?.[0] || ''}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">
                                  {client.first_name} {client.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {client.email || 'No email'}
                                </p>
                              </div>
                              <div className="text-right">
                                {client.latestScore ? (
                                  <>
                                    <p className="font-semibold text-lg">{client.latestScore}</p>
                                    <p className="text-xs text-muted-foreground">Avg Score</p>
                                  </>
                                ) : (
                                  <p className="text-xs text-muted-foreground">No scores</p>
                                )}
                              </div>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                {client.disputeCount} disputes
                              </Badge>
                              <ArrowRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>
                        ))
                      )}
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
                          {selectedClient?.first_name?.[0] || ''}{selectedClient?.last_name?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>
                          {selectedClient?.first_name} {selectedClient?.last_name}
                        </CardTitle>
                        <CardDescription>{selectedClient?.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[60vh] pr-2">
                      <div className="space-y-3">
                        {loadingItems ? (
                          [1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)
                        ) : clientDisputableItems.length === 0 ? (
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
                                    {item.balance > 0 && <span>${item.balance.toLocaleString()}</span>}
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
                      </div>
                    </ScrollArea>
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
                      {isGenerating && statusMessage && (
                        <p className="text-xs text-muted-foreground">{statusMessage}</p>
                      )}
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
      <Dialog
        open={showLetterDialog}
        onOpenChange={(open) => {
          setShowLetterDialog(open);
          if (!open) {
            setIsEditingLetter(false);
            setLetterContent('');
            clearLetter();
          }
        }}
      >
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col min-h-0">
          <DialogHeader className="sr-only">
            <DialogTitle>
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

          {(letterContent || isGenerating) && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <LetterDocumentEditor
                content={letterContent}
                creditor={generatedLetter?.creditor || selectedItem?.creditor}
                letterType={letterTemplates.find(t => t.id === generatedLetter?.letterType)?.name}
                bureaus={generatedLetter?.bureaus || selectedItem?.bureaus}
                onDownload={(content) => {
                  const name = (generatedLetter?.creditor || selectedItem?.creditor || 'dispute_letter')
                    .replace(/\s+/g, '_');
                  downloadLetter(content, `${name}_dispute_letter.txt`);
                }}
                onSave={(content) => {
                  if (!generatedLetter?.letterType) return;
                  saveLetter(
                    generatedLetter.letterType,
                    content,
                    selectedItem?.id
                  );
                }}
                onChange={(content) => {
                  setIsEditingLetter(true);
                  setLetterContent(content);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DisputeLetters;
