import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle2, AlertCircle, Eye, Send } from 'lucide-react';

const mockDisputes = [
  {
    id: '1',
    creditor: 'Capital One',
    bureau: 'Experian',
    type: 'Late Payment',
    status: 'in_progress',
    dateSent: '2024-05-01',
    expectedResponse: '2024-06-01',
    round: 1,
  },
  {
    id: '2',
    creditor: 'Collection Agency XYZ',
    bureau: 'Equifax',
    type: 'Collection Account',
    status: 'awaiting_response',
    dateSent: '2024-05-10',
    expectedResponse: '2024-06-10',
    round: 1,
  },
  {
    id: '3',
    creditor: 'Old Credit Card',
    bureau: 'TransUnion',
    type: 'Charge-Off',
    status: 'deleted',
    dateSent: '2024-03-15',
    expectedResponse: '2024-04-15',
    round: 2,
  },
  {
    id: '4',
    creditor: 'Medical Debt Inc',
    bureau: 'All Three',
    type: 'Medical Collection',
    status: 'verified',
    dateSent: '2024-04-01',
    expectedResponse: '2024-05-01',
    round: 1,
  },
];

const statusConfig = {
  in_progress: { label: 'In Progress', color: 'bg-info/10 text-info border-info/20', icon: Clock },
  awaiting_response: { label: 'Awaiting Response', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  deleted: { label: 'Deleted', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  verified: { label: 'Verified', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertCircle },
};

export default function ClientDisputes() {
  const activeDisputes = mockDisputes.filter(d => d.status !== 'deleted');
  const successfulDisputes = mockDisputes.filter(d => d.status === 'deleted');

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Disputes</h1>
          <p className="text-muted-foreground mt-1">Track the status of all your dispute letters</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{mockDisputes.length}</div>
              <p className="text-sm text-muted-foreground">Total Disputes</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-warning">{activeDisputes.length}</div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">{successfulDisputes.length}</div>
              <p className="text-sm text-muted-foreground">Deleted</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-info">2</div>
              <p className="text-sm text-muted-foreground">Current Round</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Disputes */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Active Disputes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDisputes.map((dispute) => {
                const config = statusConfig[dispute.status as keyof typeof statusConfig];
                const StatusIcon = config.icon;
                return (
                  <div key={dispute.id} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{dispute.creditor}</h4>
                          <Badge variant="outline" className={config.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{dispute.type} • {dispute.bureau}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Send className="w-3 h-3" />
                            Sent: {new Date(dispute.dateSent).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expected: {new Date(dispute.expectedResponse).toLocaleDateString()}
                          </span>
                          <Badge variant="secondary" className="text-xs">Round {dispute.round}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Letter
                      </Button>
                    </div>
                  </div>
                );
              })}
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
