import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lock,
  FileText,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const complianceChecks = [
  {
    id: 1,
    name: 'PII Encryption',
    description: 'All personal identifiable information is encrypted at rest and in transit',
    status: 'passed',
    lastChecked: '2024-01-19',
  },
  {
    id: 2,
    name: 'FCRA Compliance',
    description: 'All dispute letters comply with Fair Credit Reporting Act guidelines',
    status: 'passed',
    lastChecked: '2024-01-19',
  },
  {
    id: 3,
    name: 'Document Retention',
    description: 'Client documents stored according to regulatory requirements',
    status: 'passed',
    lastChecked: '2024-01-19',
  },
  {
    id: 4,
    name: 'Identity Verification',
    description: 'ID verification for all new clients',
    status: 'warning',
    lastChecked: '2024-01-19',
    issue: '2 clients pending ID verification',
  },
  {
    id: 5,
    name: 'Contract Signatures',
    description: 'All active clients have signed service agreements',
    status: 'passed',
    lastChecked: '2024-01-19',
  },
];

const recentAuditLogs = [
  { id: 1, action: 'Client data accessed', user: 'Sarah Chen', client: 'Marcus Johnson', time: '10 min ago' },
  { id: 2, action: 'Letter generated', user: 'System AI', client: 'Jennifer Williams', time: '25 min ago' },
  { id: 3, action: 'Document uploaded', user: 'Mike Torres', client: 'David Martinez', time: '1 hour ago' },
  { id: 4, action: 'Dispute submitted', user: 'Sarah Chen', client: 'Marcus Johnson', time: '2 hours ago' },
  { id: 5, action: 'SSN verified', user: 'System', client: 'Ashley Thompson', time: '3 hours ago' },
];

const blockedActions = [
  { id: 1, type: 'Disputed open account', client: 'Test Client', reason: 'Cannot dispute accounts in good standing', time: '1 day ago' },
  { id: 2, type: 'Missing documentation', client: 'John Doe', reason: 'ID verification required before dispute', time: '2 days ago' },
];

const Compliance = () => {
  const passedChecks = complianceChecks.filter((c) => c.status === 'passed').length;
  const complianceScore = Math.round((passedChecks / complianceChecks.length) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Compliance & Security
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor compliance status and security measures.
            </p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90">
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Compliance Check
          </Button>
        </div>

        {/* Compliance Score */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Overall Compliance Score</h3>
              <p className="text-sm text-muted-foreground">
                {passedChecks} of {complianceChecks.length} checks passed
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Progress value={complianceScore} className="w-48 h-4" />
              <span className={cn(
                'text-3xl font-bold',
                complianceScore >= 90 ? 'text-success' : complianceScore >= 70 ? 'text-warning' : 'text-destructive'
              )}>
                {complianceScore}%
              </span>
            </div>
          </div>
        </Card>

        {/* Compliance Checks */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {complianceChecks.map((check) => (
              <div
                key={check.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border',
                  check.status === 'passed' && 'border-success/20 bg-success/5',
                  check.status === 'warning' && 'border-warning/20 bg-warning/5',
                  check.status === 'failed' && 'border-destructive/20 bg-destructive/5'
                )}
              >
                <div className="flex items-center gap-4">
                  {check.status === 'passed' && <CheckCircle className="w-5 h-5 text-success" />}
                  {check.status === 'warning' && <AlertTriangle className="w-5 h-5 text-warning" />}
                  {check.status === 'failed' && <XCircle className="w-5 h-5 text-destructive" />}
                  <div>
                    <p className="font-medium">{check.name}</p>
                    <p className="text-sm text-muted-foreground">{check.description}</p>
                    {check.issue && (
                      <p className="text-sm text-warning mt-1">{check.issue}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={cn(
                      check.status === 'passed' && 'bg-success/10 text-success',
                      check.status === 'warning' && 'bg-warning/10 text-warning',
                      check.status === 'failed' && 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {check.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Checked {check.lastChecked}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audit Logs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Activity Logs
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAuditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.user} · {log.client}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Blocked Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Blocked Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {blockedActions.map((action) => (
                <div key={action.id} className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{action.type}</p>
                      <p className="text-sm text-muted-foreground">{action.client}</p>
                      <p className="text-sm text-destructive mt-1">{action.reason}</p>
                      <p className="text-xs text-muted-foreground mt-2">{action.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              {blockedActions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No blocked actions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Compliance;
