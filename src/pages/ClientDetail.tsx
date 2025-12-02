import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockClients, mockTradelines, mockDisputes, mockScoreHistory } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = mockClients.find((c) => c.id === id);

  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Client not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const clientDisputes = mockDisputes.filter((d) => d.clientId === id);

  const statusColors = {
    lead: 'bg-info/10 text-info border-info/20',
    active: 'bg-success/10 text-success border-success/20',
    paused: 'bg-warning/10 text-warning border-warning/20',
    completed: 'bg-primary/10 text-primary border-primary/20',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                {client.firstName} {client.lastName}
              </h1>
              <Badge variant="outline" className={cn('capitalize', statusColors[client.status])}>
                {client.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" /> {client.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" /> {client.phone}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Started {client.startDate}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Brain className="w-4 h-4 mr-2" />
              Generate Letters
            </Button>
          </div>
        </div>

        {/* Credit Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Credit Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around items-center">
              {client.currentScores.map((score) => (
                <ScoreGauge
                  key={score.bureau}
                  score={score.score}
                  previousScore={score.previousScore}
                  bureau={score.bureau}
                  size="lg"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{client.currentRound}</p>
                <p className="text-sm text-muted-foreground">Current Round</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {client.itemsDeleted}/{client.totalItemsDisputed}
                </p>
                <p className="text-sm text-muted-foreground">Items Deleted</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <TrendingUp className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{client.targetScore}</p>
                <p className="text-sm text-muted-foreground">Target Score</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <DollarSign className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">${client.totalPaid}</p>
                <p className="text-sm text-muted-foreground">Total Paid</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tradelines" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tradelines">Tradelines</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="history">Score History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="tradelines" className="space-y-4">
            {mockTradelines.map((tradeline) => (
              <Card key={tradeline.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{tradeline.creditor}</h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          tradeline.status === 'collection' && 'bg-destructive/10 text-destructive',
                          tradeline.status === 'open' && 'bg-success/10 text-success',
                          tradeline.status === 'closed' && 'bg-muted text-muted-foreground'
                        )}
                      >
                        {tradeline.status}
                      </Badge>
                      {tradeline.disputable && (
                        <Badge className="bg-primary/10 text-primary border-0">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Disputable
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-medium">${tradeline.balance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Account Type</p>
                        <p className="font-medium capitalize">{tradeline.accountType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bureaus</p>
                        <div className="flex gap-1">
                          {tradeline.bureaus.map((b) => (
                            <Badge key={b} variant="secondary" className="text-xs capitalize">
                              {b.slice(0, 2)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {tradeline.deletionProbability && (
                        <div>
                          <p className="text-muted-foreground">Deletion Probability</p>
                          <div className="flex items-center gap-2">
                            <Progress value={tradeline.deletionProbability} className="w-20 h-2" />
                            <span className="font-medium text-success">
                              {tradeline.deletionProbability}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    {tradeline.disputeReason && (
                      <div className="mt-3 p-2 rounded-lg bg-accent/50">
                        <p className="text-xs text-accent-foreground">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          AI Reason: {tradeline.disputeReason}
                        </p>
                      </div>
                    )}
                  </div>
                  {tradeline.disputable && (
                    <Button size="sm" variant="outline">
                      Add to Dispute
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="disputes" className="space-y-4">
            {clientDisputes.map((dispute) => (
              <Card key={dispute.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{dispute.letterType}</h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          dispute.status === 'pending_approval' && 'bg-warning/10 text-warning',
                          dispute.status === 'approved' && 'bg-info/10 text-info',
                          dispute.status === 'sent' && 'bg-primary/10 text-primary',
                          dispute.status === 'response_received' && 'bg-success/10 text-success'
                        )}
                      >
                        {dispute.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {dispute.bureau}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{dispute.reason}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                      {dispute.outcome && (
                        <span
                          className={cn(
                            'flex items-center gap-1 font-medium',
                            dispute.outcome === 'deleted' && 'text-success'
                          )}
                        >
                          <CheckCircle className="w-3 h-3" />
                          {dispute.outcome}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Deletion Probability</p>
                    <p className="text-xl font-bold text-success">{dispute.deletionProbability}%</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Score Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockScoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[550, 650]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="equifax"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="experian"
                      stroke="hsl(var(--info))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="transunion"
                      stroke="hsl(var(--warning))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Document management coming soon</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetail;
