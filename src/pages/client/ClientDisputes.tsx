import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreditData } from '@/hooks/useCreditData';
import { FileText, Clock, CheckCircle2, AlertCircle, Eye, Send, Link2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground border-border', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-info/10 text-info border-info/20', icon: Clock },
  deleted: { label: 'Deleted', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  verified: { label: 'Verified', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertCircle },
};

export default function ClientDisputes() {
  const { 
    isLoading, 
    isRefreshing,
    creditData, 
    connectionStatus,
    disputeProgress,
    refreshData 
  } = useCreditData();

  // Loading state
  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="card-elevated">
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    );
  }

  // No data state
  if (!creditData?.negativeItems || connectionStatus.status !== 'connected') {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Disputes</h1>
            <p className="text-muted-foreground mt-1">Track the status of all your dispute letters</p>
          </div>

          <Card className="card-elevated border-primary/20">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Disputes Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Connect your SmartCredit account to identify disputable items on your credit report.
              </p>
              <Link to="/client-dashboard/smartcredit">
                <Button className="bg-gradient-primary hover:opacity-90">
                  <Link2 className="w-4 h-4 mr-2" />
                  Connect SmartCredit
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    );
  }

  const disputes = creditData.negativeItems;
  const activeDisputes = disputes.filter(d => d.status !== 'deleted');
  const currentRound = Math.max(1, disputes.filter(d => d.status === 'deleted').length > 0 ? 2 : 1);

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Disputes</h1>
            <p className="text-muted-foreground mt-1">Track the status of all your dispute letters</p>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{disputeProgress?.total || 0}</div>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-warning">{(disputeProgress?.inProgress || 0) + (disputeProgress?.pending || 0)}</div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">{disputeProgress?.deleted || 0}</div>
              <p className="text-sm text-muted-foreground">Deleted</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-info">{currentRound}</div>
              <p className="text-sm text-muted-foreground">Current Round</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Disputes */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              All Dispute Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {disputes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No dispute items found</p>
              ) : (
                disputes.map((dispute) => {
                  const config = statusConfig[dispute.status as keyof typeof statusConfig] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <div key={dispute.id} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-lg">{dispute.creditor || 'Unknown Creditor'}</h4>
                            <Badge variant="outline" className={config.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {config.label}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {dispute.bureau || 'Unknown Bureau'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Account Type: </span>
                              <span className="font-medium">{dispute.type || 'N/A'}</span>
                            </div>
                            {dispute.balance !== null && dispute.balance !== undefined && (
                              <div>
                                <span className="text-muted-foreground">Balance: </span>
                                <span className="font-medium text-destructive">${dispute.balance.toLocaleString()}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Date Opened: </span>
                              <span className="font-medium">
                                {dispute.dateOpened ? new Date(dispute.dateOpened).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Deletion Probability: </span>
                              <span className={`font-medium ${(dispute.deletionProbability || 0) >= 0.7 ? 'text-success' : (dispute.deletionProbability || 0) >= 0.4 ? 'text-warning' : 'text-destructive'}`}>
                                {Math.round((dispute.deletionProbability || 0) * 100)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-border/50">
                            <span className="text-muted-foreground text-sm">Dispute Reason: </span>
                            <p className="text-sm mt-1">{dispute.disputeReason || 'No reason specified'}</p>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" className="shrink-0">
                          <Eye className="w-4 h-4 mr-1" />
                          View Letter
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-primary">1</span>
                </div>
                <h4 className="font-medium mb-1">Bureau Review</h4>
                <p className="text-sm text-muted-foreground">Bureaus have 30-45 days to investigate</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-primary">2</span>
                </div>
                <h4 className="font-medium mb-1">Response Received</h4>
                <p className="text-sm text-muted-foreground">We'll notify you of any updates</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-primary">3</span>
                </div>
                <h4 className="font-medium mb-1">Next Round</h4>
                <p className="text-sm text-muted-foreground">AI generates new letters if needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
