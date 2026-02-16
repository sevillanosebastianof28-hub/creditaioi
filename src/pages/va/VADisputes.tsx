import { useState } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Search, Eye, Edit, Send, CheckCircle2, Clock, AlertCircle, Brain, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import LetterDocumentEditor from '@/components/disputes/LetterDocumentEditor';

const mockLetters = [
  {
    id: '1',
    client: 'John Doe',
    creditor: 'Capital One',
    bureau: 'Experian',
    type: 'Late Payment Dispute',
    status: 'pending_review',
    aiGenerated: true,
    createdAt: '2024-05-20',
    round: 2,
  },
  {
    id: '2',
    client: 'John Doe',
    creditor: 'Collection Agency XYZ',
    bureau: 'Equifax',
    type: 'Collection Validation',
    status: 'pending_review',
    aiGenerated: true,
    createdAt: '2024-05-20',
    round: 2,
  },
  {
    id: '3',
    client: 'Sarah Williams',
    creditor: 'Old Credit Card',
    bureau: 'TransUnion',
    type: 'Charge-Off Dispute',
    status: 'approved',
    aiGenerated: true,
    createdAt: '2024-05-19',
    round: 2,
  },
  {
    id: '4',
    client: 'Sarah Williams',
    creditor: 'Medical Collections',
    bureau: 'All Three',
    type: 'HIPAA Letter',
    status: 'sent',
    aiGenerated: true,
    createdAt: '2024-05-15',
    round: 1,
  },
  {
    id: '5',
    client: 'Jane Smith',
    creditor: 'Bank of America',
    bureau: 'Experian',
    type: 'Inquiry Removal',
    status: 'response_received',
    aiGenerated: true,
    createdAt: '2024-05-10',
    round: 1,
  },
];

const statusConfig = {
  pending_review: { label: 'Pending Review', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  approved: { label: 'Approved', color: 'bg-info/10 text-info border-info/20', icon: CheckCircle2 },
  sent: { label: 'Sent', color: 'bg-primary/10 text-primary border-primary/20', icon: Send },
  response_received: { label: 'Response Received', color: 'bg-success/10 text-success border-success/20', icon: AlertCircle },
};

export default function VADisputes() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<typeof mockLetters[0] | null>(null);
  const [letterContent, setLetterContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewLetter = async (letter: typeof mockLetters[0]) => {
    setSelectedLetter(letter);
    setDialogOpen(true);
    setIsGenerating(true);
    setStatusMessage('Generating dispute letter...');
    setLetterContent('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-dispute-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          letterType: 'factual_dispute',
          disputableItem: {
            creditor: letter.creditor,
            accountType: letter.type,
            balance: 0,
            issueType: letter.type,
            disputeReason: letter.type,
            applicableLaw: 'FCRA',
            bureaus: [letter.bureau]
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Letter generation failed');
      }

      const data = await response.json();

      setLetterContent(data.letter || 'Unable to generate letter');
    } catch (err: any) {
      console.error('Letter generation error:', err);
      setLetterContent('Failed to generate letter. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to generate dispute letter',
        variant: 'destructive'
      });
    } finally {
      setStatusMessage(null);
      setIsGenerating(false);
    }
  };

  const handleApprove = (letterId: string) => {
    toast({
      title: 'Letter Approved',
      description: 'The dispute letter has been approved and queued for sending.',
    });
  };

  const handleSaveLetter = (content: string) => {
    setLetterContent(content);
    toast({
      title: 'Letter Saved',
      description: 'Your changes have been saved.',
    });
  };

  const handleDownload = (content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispute-letter-${selectedLetter?.creditor?.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLetters = mockLetters.filter(letter =>
    letter.client.toLowerCase().includes(search.toLowerCase()) ||
    letter.creditor.toLowerCase().includes(search.toLowerCase())
  );

  const pendingLetters = filteredLetters.filter(l => l.status === 'pending_review');
  const otherLetters = filteredLetters.filter(l => l.status !== 'pending_review');

  const LetterCard = ({ letter }: { letter: typeof mockLetters[0] }) => {
    const config = statusConfig[letter.status as keyof typeof statusConfig];
    const StatusIcon = config.icon;

    return (
      <Card className="card-elevated hover:border-primary/30 transition-colors">
        <CardContent className="py-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{letter.creditor}</h4>
                {letter.aiGenerated && (
                  <Badge className="bg-gradient-primary text-primary-foreground text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{letter.type}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className={config.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {letter.client}
                </span>
                <Badge variant="secondary">{letter.bureau}</Badge>
                <Badge variant="outline">Round {letter.round}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleViewLetter(letter)}>
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              {letter.status === 'pending_review' && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => handleViewLetter(letter)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" className="bg-gradient-primary" onClick={() => handleApprove(letter.id)}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dispute Letters</h1>
          <p className="text-muted-foreground mt-1">Review, edit, and approve AI-generated dispute letters</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-warning">{pendingLetters.length}</div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">
                {mockLetters.filter(l => l.status === 'sent').length}
              </div>
              <p className="text-sm text-muted-foreground">Sent This Week</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">
                {mockLetters.filter(l => l.status === 'response_received').length}
              </div>
              <p className="text-sm text-muted-foreground">Responses</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-info">{mockLetters.length}</div>
              <p className="text-sm text-muted-foreground">Total Letters</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by client or creditor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Letters */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Review ({pendingLetters.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              All Letters ({filteredLetters.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {pendingLetters.length === 0 ? (
              <Card className="card-elevated">
                <CardContent className="py-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="font-semibold">All letters reviewed!</h3>
                  <p className="text-muted-foreground">No pending letters at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              pendingLetters.map(letter => <LetterCard key={letter.id} letter={letter} />)
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-3 mt-4">
            {filteredLetters.map(letter => <LetterCard key={letter.id} letter={letter} />)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Letter Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Dispute Letter - {selectedLetter?.creditor}
              {selectedLetter?.aiGenerated && (
                <Badge className="bg-gradient-primary text-primary-foreground text-xs ml-2">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Generated
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-4">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">{statusMessage || 'Generating dispute letter...'}</p>
              </div>
            ) : (
              <LetterDocumentEditor
                content={letterContent}
                creditor={selectedLetter?.creditor}
                letterType={selectedLetter?.type}
                bureaus={selectedLetter?.bureau ? [selectedLetter.bureau] : []}
                onSave={handleSaveLetter}
                onDownload={handleDownload}
                onChange={(content) => setLetterContent(content)}
                showOptimize={true}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </RoleBasedLayout>
  );
}
