import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useDisputeWorkflow, DisputeItem, DisputeRound } from '@/hooks/useDisputeWorkflow';
import { useLetterTracking } from '@/hooks/useLetterTracking';
import { supabase } from '@/integrations/supabase/client';
import { readAiStream } from '@/lib/aiStream';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Plus,
  Mail,
  Download,
  Eye,
  Loader2,
  Save,
  User,
} from 'lucide-react';

const Disputes = () => {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [bureauFilter, setBureauFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<DisputeItem | null>(null);
  const [letterContent, setLetterContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRoundDialogOpen, setNewRoundDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');

  const { 
    isLoading, 
    rounds, 
    currentRound, 
    fetchRounds, 
    createRound,
    updateItemOutcome 
  } = useDisputeWorkflow();

  const { saveLetter, updateLetterStatus } = useLetterTracking();

  // Fetch clients for agency owners
  const { data: clients = [] } = useQuery({
    queryKey: ['clients-for-disputes', user?.id],
    queryFn: async () => {
      if (!user || role !== 'agency_owner') return [];
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.agency_id) return [];

      const { data: agencyProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('agency_id', profile.agency_id);

      const { data: clientRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client');

      const clientUserIds = new Set(clientRoles?.map(r => r.user_id));
      return (agencyProfiles || []).filter(p => clientUserIds.has(p.user_id));
    },
    enabled: !!user && role === 'agency_owner'
  });

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  // Flatten all items from all rounds
  const allItems = rounds.flatMap(round => 
    round.items.map(item => ({ ...item, round_number: round.round_number, round_status: round.status }))
  );

  const filteredItems = allItems.filter((item) => {
    const matchesBureau = bureauFilter === 'all' || item.bureau === bureauFilter;
    const matchesStatus = statusFilter === 'all' || item.outcome === statusFilter;
    return matchesBureau && matchesStatus;
  });

  const pendingItems = allItems.filter((d) => d.outcome === 'pending');
  const inProgressItems = allItems.filter((d) => d.outcome === 'in_progress');
  const respondedItems = allItems.filter((d) => ['responded', 'deleted', 'verified', 'updated'].includes(d.outcome));

  const statusColors: Record<string, string> = {
    pending: 'bg-muted text-muted-foreground',
    in_progress: 'bg-warning/10 text-warning border-warning/20',
    responded: 'bg-info/10 text-info border-info/20',
    deleted: 'bg-success/10 text-success border-success/20',
    verified: 'bg-destructive/10 text-destructive border-destructive/20',
    updated: 'bg-primary/10 text-primary border-primary/20',
    failed: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const handleViewLetter = async (item: DisputeItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
    
    if (item.letter_content) {
      setLetterContent(item.letter_content);
      return;
    }

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
          letterType: item.letter_type || 'factual_dispute',
          disputableItem: {
            creditor: item.creditor_name,
            accountNumber: item.account_number,
            issueType: item.dispute_reason,
            disputeReason: item.dispute_reason,
            applicableLaw: 'FCRA',
            bureaus: [item.bureau]
          },
          stream: true
        })
      });

      const data = await readAiStream<{ letter: string }>(response, (event) => {
        if (event.type === 'status') {
          setStatusMessage(event.message || null);
        }
      });

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

  const handleSaveLetter = async () => {
    if (!selectedItem || !letterContent) return;
    
    const saved = await saveLetter(
      selectedItem.letter_type || 'factual_dispute',
      letterContent,
      selectedItem.id
    );

    if (saved) {
      toast({ title: "Letter Saved", description: "Letter saved to database successfully." });
    }
  };

  const handleMarkAsSent = async () => {
    if (!selectedItem) return;
    await updateItemOutcome(selectedItem.id, 'in_progress');
    setDialogOpen(false);
    toast({ title: "Marked as Sent", description: "Dispute item marked as sent to bureau." });
  };

  const handleNewRound = async () => {
    if (role === 'agency_owner') {
      setNewRoundDialogOpen(true);
    } else {
      // Client creating their own round
      await createRound();
    }
  };

  const handleCreateRoundForClient = async () => {
    if (!selectedClientId) {
      toast({ title: "Error", description: "Please select a client", variant: "destructive" });
      return;
    }
    await createRound(selectedClientId);
    setNewRoundDialogOpen(false);
    setSelectedClientId('');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-12 w-full" />
              </Card>
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Disputes</h1>
            <p className="text-muted-foreground mt-1">
              Manage all dispute letters and track bureau responses.
            </p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90" onClick={handleNewRound}>
            <Plus className="w-4 h-4 mr-2" />
            New Dispute Round
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingItems.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressItems.length}</p>
                <p className="text-sm text-muted-foreground">Sent to Bureaus</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{respondedItems.length}</p>
                <p className="text-sm text-muted-foreground">Responses</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <FileText className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rounds.length}</p>
                <p className="text-sm text-muted-foreground">Total Rounds</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select value={bureauFilter} onValueChange={setBureauFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Bureau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bureaus</SelectItem>
                <SelectItem value="equifax">Equifax</SelectItem>
                <SelectItem value="experian">Experian</SelectItem>
                <SelectItem value="transunion">TransUnion</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* No Data State */}
        {allItems.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Dispute Items Yet</h3>
            <p className="text-muted-foreground mb-4">
              Import a credit report to automatically create dispute items, or create a new round manually.
            </p>
            <Button onClick={handleNewRound}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Round
            </Button>
          </Card>
        )}

        {/* Disputes List */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="p-5 hover:border-primary/30 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{item.creditor_name}</h3>
                    <Badge
                      variant="outline"
                      className={cn('capitalize', statusColors[item.outcome] || statusColors.pending)}
                    >
                      {item.outcome.replace('_', ' ')}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {item.bureau}
                    </Badge>
                    <Badge variant="outline">Round {(item as any).round_number}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium text-foreground">{item.letter_type}</span>
                    {' · '}
                    {item.dispute_reason}
                  </p>

                  <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground">
                    {item.account_number && (
                      <span className="flex items-center gap-1">
                        Account: {item.account_number}
                      </span>
                    )}
                    {item.sent_at && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Sent {new Date(item.sent_at).toLocaleDateString()}
                      </span>
                    )}
                    {item.response_received_at && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Response {new Date(item.response_received_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewLetter(item)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View Letter
                    </Button>
                    {item.outcome === 'pending' && (
                      <Button 
                        size="sm" 
                        className="bg-gradient-primary"
                        onClick={() => {
                          handleViewLetter(item);
                        }}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Generate & Send
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Letter View Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Dispute Letter - {selectedItem?.creditor_name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">{statusMessage || 'Generating dispute letter...'}</p>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{letterContent}</pre>
                </div>
              )}
            </div>
            {!isGenerating && letterContent && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={handleSaveLetter}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Letter
                </Button>
                <Button onClick={handleMarkAsSent}>
                  <Send className="w-4 h-4 mr-2" />
                  Mark as Sent
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* New Round Dialog for Agency Owners */}
        <Dialog open={newRoundDialogOpen} onOpenChange={setNewRoundDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Dispute Round</DialogTitle>
              <DialogDescription>
                Select a client to create a new dispute round for.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Client</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client.user_id} value={client.user_id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {client.first_name} {client.last_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {clients.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No clients found. Add clients first before creating dispute rounds.
                </p>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setNewRoundDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRoundForClient} 
                  disabled={!selectedClientId} 
                  className="bg-gradient-primary"
                >
                  Create Round
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Disputes;
