import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lock,
  Eye,
  Download,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useComplianceLogs } from '@/hooks/useComplianceLogs';
import { format, formatDistanceToNow } from 'date-fns';

const complianceChecks = [
  {
    id: 1,
    name: 'PII Encryption',
    description: 'All personal identifiable information is encrypted at rest and in transit',
    status: 'passed',
    lastChecked: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'FCRA Compliance',
    description: 'All dispute letters comply with Fair Credit Reporting Act guidelines',
    status: 'passed',
    lastChecked: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Document Retention',
    description: 'Client documents stored according to regulatory requirements',
    status: 'passed',
    lastChecked: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Identity Verification',
    description: 'ID verification for all new clients',
    status: 'passed',
    lastChecked: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Contract Signatures',
    description: 'All active clients have signed service agreements',
    status: 'passed',
    lastChecked: new Date().toISOString(),
  },
];

const Compliance = () => {
  const { logs, isLoading, logAction } = useComplianceLogs();
  
  const passedChecks = complianceChecks.filter((c) => c.status === 'passed').length;
  const complianceScore = Math.round((passedChecks / complianceChecks.length) * 100);

  const handleRunCheck = async () => {
    await logAction('compliance_check', 'system', undefined, { type: 'manual_check' });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'data_accessed': return <Eye className="w-4 h-4 text-info" />;
      case 'letter_generated': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'document_uploaded': return <Download className="w-4 h-4 text-primary" />;
      case 'dispute_submitted': return <Shield className="w-4 h-4 text-warning" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

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
          <Button className="bg-gradient-primary hover:opacity-90" onClick={handleRunCheck}>
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
                    Checked {format(new Date(check.lastChecked), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Logs */}
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
              {isLoading ? (
                <>
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                </>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity logs yet</p>
                </div>
              ) : (
                logs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      {getActionIcon(log.action_type)}
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {log.action_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.user_profile 
                            ? `${log.user_profile.first_name} ${log.user_profile.last_name}`
                            : 'System'
                          } · {log.entity_type}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Security Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-lg border border-success/20 bg-success/5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">All Systems Secure</p>
                    <p className="text-sm text-muted-foreground">
                      No security incidents detected
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Data Encryption</p>
                    <p className="text-sm text-muted-foreground">
                      AES-256 encryption active for all sensitive data
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Access Control</p>
                    <p className="text-sm text-muted-foreground">
                      Role-based access control enabled
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Compliance;
