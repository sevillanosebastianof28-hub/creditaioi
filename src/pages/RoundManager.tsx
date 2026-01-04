import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDisputeWorkflow, DisputeRound, DisputeItem } from '@/hooks/useDisputeWorkflow';
import { useBureauResponses } from '@/hooks/useBureauResponses';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  TrendingUp,
  Send,
  Inbox,
  RotateCcw,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-warning/10 text-warning border-warning/20',
  responded: 'bg-info/10 text-info border-info/20',
  deleted: 'bg-success/10 text-success border-success/20',
  verified: 'bg-destructive/10 text-destructive border-destructive/20',
  updated: 'bg-primary/10 text-primary border-primary/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function RoundManager() {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedBureau, setSelectedBureau] = useState<string>('experian');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const {
    isLoading,
    rounds,
    currentRound,
    fetchRounds,
    createRound,
    updateItemOutcome
  } = useDisputeWorkflow();

  const {
    responses,
    fetchResponses,
    uploadResponseDocument,
    getResponseStats
  } = useBureauResponses();

  useEffect(() => {
    fetchRounds();
    fetchResponses();
  }, [fetchRounds, fetchResponses]);

  const handleNewRound = async () => {
    await createRound();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadResponseDocument(file, selectedBureau, selectedItemId || undefined);
      setUploadDialogOpen(false);
      toast({ title: "Response Uploaded", description: "Bureau response has been processed." });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const responseStats = getResponseStats();
  const allItems = rounds.flatMap(r => r.items);

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
            <h1 className="text-3xl font-bold text-foreground">Round Manager</h1>
            <p className="text-muted-foreground mt-1">
              Manage dispute rounds and track bureau responses.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Response
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Bureau Response</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Bureau</label>
                    <Select value={selectedBureau} onValueChange={setSelectedBureau}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="experian">Experian</SelectItem>
                        <SelectItem value="equifax">Equifax</SelectItem>
                        <SelectItem value="transunion">TransUnion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Link to Dispute Item (Optional)</label>
                    <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific item</SelectItem>
                        {allItems.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.creditor_name} - {item.bureau}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Response Document</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:opacity-90"
                    />
                  </div>
                  {isUploading && (
                    <p className="text-sm text-muted-foreground">Processing document...</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button className="bg-gradient-primary hover:opacity-90" onClick={handleNewRound}>
              <Plus className="w-4 h-4 mr-2" />
              New Round
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <RotateCcw className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rounds.length}</p>
                <p className="text-sm text-muted-foreground">Total Rounds</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Send className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allItems.filter(i => i.outcome === 'in_progress').length}</p>
                <p className="text-sm text-muted-foreground">Sent</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Inbox className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{responseStats.total}</p>
                <p className="text-sm text-muted-foreground">Responses</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{responseStats.deleted}</p>
                <p className="text-sm text-muted-foreground">Deletions</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{responseStats.verified}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </Card>
        </div>

        {/* No Data State */}
        {rounds.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Dispute Rounds Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first dispute round to start tracking progress.
            </p>
            <Button onClick={handleNewRound}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Round
            </Button>
          </Card>
        )}

        {/* Rounds List */}
        {rounds.map((round) => {
          const pendingCount = round.items.filter(i => i.outcome === 'pending').length;
          const inProgressCount = round.items.filter(i => i.outcome === 'in_progress').length;
          const completedCount = round.items.filter(i => ['deleted', 'verified', 'updated'].includes(i.outcome)).length;
          const progress = round.items.length > 0 
            ? Math.round((completedCount / round.items.length) * 100) 
            : 0;

          return (
            <Card key={round.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Round {round.round_number}
                      <Badge variant="outline" className={cn(statusColors[round.status])}>
                        {round.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Started {new Date(round.started_at).toLocaleDateString()} · {round.items.length} items
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold">{progress}%</p>
                  </div>
                </div>
                <Progress value={progress} className="mt-4" />
              </CardHeader>
              <CardContent className="pt-4">
                {round.items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No items in this round</p>
                ) : (
                  <div className="space-y-3">
                    {round.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={cn('capitalize', statusColors[item.outcome])}>
                            {item.outcome}
                          </Badge>
                          <div>
                            <p className="font-medium">{item.creditor_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.bureau} · {item.letter_type}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {item.outcome === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateItemOutcome(item.id, 'in_progress')}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Mark Sent
                            </Button>
                          )}
                          {item.outcome === 'in_progress' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-success"
                                onClick={() => updateItemOutcome(item.id, 'deleted')}
                              >
                                Deleted
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-destructive"
                                onClick={() => updateItemOutcome(item.id, 'verified')}
                              >
                                Verified
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Recent Responses */}
        {responses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-primary" />
                Recent Bureau Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {responses.slice(0, 5).map((response) => (
                  <div key={response.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {response.bureau}
                      </Badge>
                      <div>
                        <p className="font-medium capitalize">{response.response_type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(response.response_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {response.ai_analysis && (
                      <Badge variant="secondary" className="text-xs">AI Analyzed</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
