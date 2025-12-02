import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockDisputes, mockClients } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  FileText,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Plus,
  Mail,
  Calendar,
  Sparkles,
  Download,
  Eye,
} from 'lucide-react';

const Disputes = () => {
  const [bureauFilter, setBureauFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredDisputes = mockDisputes.filter((dispute) => {
    const matchesBureau = bureauFilter === 'all' || dispute.bureau === bureauFilter;
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    return matchesBureau && matchesStatus;
  });

  const pendingApproval = mockDisputes.filter((d) => d.status === 'pending_approval');
  const sent = mockDisputes.filter((d) => d.status === 'sent' || d.status === 'approved');
  const responses = mockDisputes.filter((d) => d.status === 'response_received');

  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    pending_approval: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-info/10 text-info border-info/20',
    sent: 'bg-primary/10 text-primary border-primary/20',
    response_received: 'bg-success/10 text-success border-success/20',
    closed: 'bg-muted text-muted-foreground',
  };

  const getClientName = (clientId: string) => {
    const client = mockClients.find((c) => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown';
  };

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
          <Button className="bg-gradient-primary hover:opacity-90">
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
                <p className="text-2xl font-bold">{pendingApproval.length}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sent.length}</p>
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
                <p className="text-2xl font-bold">{responses.length}</p>
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
                <p className="text-2xl font-bold">324</p>
                <p className="text-sm text-muted-foreground">Total This Month</p>
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
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="response_received">Response Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Disputes List */}
        <div className="space-y-4">
          {filteredDisputes.map((dispute) => (
            <Card key={dispute.id} className="p-5 hover:border-primary/30 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{dispute.letterType}</h3>
                    <Badge
                      variant="outline"
                      className={cn('capitalize', statusColors[dispute.status])}
                    >
                      {dispute.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {dispute.bureau}
                    </Badge>
                    <Badge variant="outline">Round {dispute.round}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium text-foreground">{getClientName(dispute.clientId)}</span>
                    {' · '}
                    {dispute.reason}
                  </p>

                  {dispute.aiRecommendation && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 mb-3">
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-accent-foreground">{dispute.aiRecommendation}</p>
                    </div>
                  )}

                  <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Created {dispute.createdDate}
                    </span>
                    {dispute.sentDate && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Sent {dispute.sentDate}
                      </span>
                    )}
                    {dispute.responseDate && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Response {dispute.responseDate}
                      </span>
                    )}
                    {dispute.documents.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {dispute.documents.length} docs attached
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Deletion Probability</p>
                    <div className="flex items-center gap-2">
                      <Progress value={dispute.deletionProbability} className="w-24 h-2" />
                      <span className="text-lg font-bold text-success">
                        {dispute.deletionProbability}%
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {dispute.status === 'pending_approval' && (
                      <Button size="sm" className="bg-gradient-primary">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {dispute.status === 'approved' && (
                      <Button size="sm" className="bg-gradient-primary">
                        <Send className="w-4 h-4 mr-1" />
                        Send
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Disputes;
