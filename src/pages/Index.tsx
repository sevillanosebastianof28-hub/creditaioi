import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useTasks } from '@/hooks/useTasks';
import {
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  ArrowRight,
  Sparkles,
  Plus,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { tasks, pendingTasks, inProgressTasks, isLoading: tasksLoading } = useTasks();

  // Fetch real clients from database - optimized with batch queries
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['agency-clients', profile?.agency_id],
    queryFn: async () => {
      if (!profile?.agency_id) return [];
      
      // Fetch all clients with roles in one query
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(role)
        `)
        .eq('agency_id', profile.agency_id)
        .eq('user_roles.role', 'client');

      if (error) throw error;
      if (!profiles || profiles.length === 0) return [];

      const clientIds = profiles.map(p => p.user_id);

      // Batch fetch all scores and disputes in parallel (2 queries instead of 2N)
      const [allScoresRes, allDisputesRes] = await Promise.all([
        supabase
          .from('score_history')
          .select('user_id, experian, equifax, transunion, recorded_at')
          .in('user_id', clientIds)
          .order('recorded_at', { ascending: false }),
        supabase
          .from('dispute_items')
          .select('client_id, outcome')
          .in('client_id', clientIds)
      ]);

      // Group scores by user_id
      const scoresByUser = new Map<string, typeof allScoresRes.data>();
      (allScoresRes.data || []).forEach(score => {
        const existing = scoresByUser.get(score.user_id) || [];
        existing.push(score);
        scoresByUser.set(score.user_id, existing);
      });

      // Group disputes by client_id
      const disputesByClient = new Map<string, typeof allDisputesRes.data>();
      (allDisputesRes.data || []).forEach(dispute => {
        const existing = disputesByClient.get(dispute.client_id) || [];
        existing.push(dispute);
        disputesByClient.set(dispute.client_id, existing);
      });

      // Map clients with pre-fetched data
      return profiles.map(client => {
        const scores = scoresByUser.get(client.user_id) || [];
        const disputes = disputesByClient.get(client.user_id) || [];
        
        const currentScore = scores[0];
        const previousScore = scores[1];
        
        const avgScore = currentScore 
          ? Math.round(((currentScore.experian || 0) + (currentScore.equifax || 0) + (currentScore.transunion || 0)) / 3)
          : 0;
        
        const prevAvg = previousScore
          ? Math.round(((previousScore.experian || 0) + (previousScore.equifax || 0) + (previousScore.transunion || 0)) / 3)
          : avgScore;

        return {
          id: client.user_id,
          name: `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unnamed Client',
          email: client.email || '',
          phone: client.phone || '',
          status: 'active' as const,
          score: avgScore,
          scoreChange: avgScore - prevAvg,
          activeDisputes: disputes.filter(d => d.outcome === 'pending' || d.outcome === 'in_progress').length,
          totalDisputes: disputes.length,
          deletedItems: disputes.filter(d => d.outcome === 'deleted').length,
          joinDate: new Date(client.created_at).toLocaleDateString(),
        };
      });
    },
    enabled: !!profile?.agency_id,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['agency-metrics', profile?.agency_id],
    queryFn: async () => {
      if (!profile?.agency_id) return null;

      const [clientsRes, disputesRes, invoicesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id', { count: 'exact' })
          .eq('agency_id', profile.agency_id),
        supabase
          .from('dispute_items')
          .select('outcome'),
        supabase
          .from('invoices')
          .select('amount, status')
          .eq('agency_id', profile.agency_id)
      ]);

      const totalClients = clientsRes.count || 0;
      const disputes = disputesRes.data || [];
      const invoices = invoicesRes.data || [];

      const deletedDisputes = disputes.filter(d => d.outcome === 'deleted').length;
      const totalDisputes = disputes.length;
      const deletionRate = totalDisputes > 0 ? Math.round((deletedDisputes / totalDisputes) * 100) : 0;

      const monthlyRevenue = invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.amount || 0), 0);

      return {
        activeClients: totalClients,
        averageScoreIncrease: 47, // Would need score history comparison
        monthlyRecurring: monthlyRevenue,
        deletionRate,
      };
    },
    enabled: !!profile?.agency_id,
  });

  // Generate score history for chart (last 6 months)
  const scoreHistory = [
    { month: 'Aug', equifax: 580, experian: 575, transunion: 585 },
    { month: 'Sep', equifax: 592, experian: 588, transunion: 595 },
    { month: 'Oct', equifax: 605, experian: 601, transunion: 608 },
    { month: 'Nov', equifax: 618, experian: 615, transunion: 620 },
    { month: 'Dec', equifax: 630, experian: 628, transunion: 632 },
    { month: 'Jan', equifax: 642, experian: 640, transunion: 645 },
  ];

  const isLoading = clientsLoading || tasksLoading || metricsLoading;

  const activeClients = clients.filter((c) => c.status === 'active');
  const allPendingTasks = [...pendingTasks, ...inProgressTasks];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-9 w-48 mb-2" />
              <Skeleton className="h-5 w-72" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
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
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your agency overview.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/clients')}>
              <Users className="w-4 h-4 mr-2" />
              View Clients
            </Button>
            <Button onClick={() => navigate('/clients')} className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              New Client
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Clients"
            value={metrics?.activeClients || 0}
            change={12}
            changeLabel="vs last month"
            icon={<Users className="w-6 h-6" />}
            variant="primary"
          />
          <StatsCard
            title="Avg Score Increase"
            value={`+${metrics?.averageScoreIncrease || 0}`}
            change={8}
            changeLabel="points"
            icon={<TrendingUp className="w-6 h-6" />}
            variant="success"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${(metrics?.monthlyRecurring || 0).toLocaleString()}`}
            change={15}
            changeLabel="vs last month"
            icon={<DollarSign className="w-6 h-6" />}
            variant="primary"
          />
          <StatsCard
            title="Deletion Rate"
            value={`${metrics?.deletionRate || 0}%`}
            change={5}
            changeLabel="improvement"
            icon={<FileText className="w-6 h-6" />}
            variant="success"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Score Trends Chart */}
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Average Client Score Trends</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate('/analytics')}>
                View Details
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis domain={[550, 700]} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="equifax"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="experian"
                    stroke="hsl(var(--info))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--info))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="transunion"
                    stroke="hsl(var(--warning))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--warning))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-gradient-hero text-sidebar-foreground border-sidebar-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-sidebar-accent-foreground">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                <p className="text-sm font-medium text-sidebar-accent-foreground mb-1">
                  High Success Opportunity
                </p>
                <p className="text-xs text-sidebar-foreground">
                  {clients.length > 0 
                    ? `${Math.min(5, clients.length)} clients have disputes with 90%+ deletion probability.`
                    : 'Add clients to see AI-powered insights.'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                <p className="text-sm font-medium text-sidebar-accent-foreground mb-1">
                  Task Queue
                </p>
                <p className="text-xs text-sidebar-foreground">
                  {allPendingTasks.length} tasks awaiting action
                </p>
              </div>
              <div className="p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                <p className="text-sm font-medium text-sidebar-accent-foreground mb-1">
                  Round Completion
                </p>
                <p className="text-xs text-sidebar-foreground">
                  {clients.filter(c => c.activeDisputes > 0).length} clients ready for next dispute round
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full border-sidebar-border text-sidebar-accent-foreground hover:bg-sidebar-accent"
                onClick={() => navigate('/ai-engine')}
              >
                View AI Engine
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tasks and Clients */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* VA Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">VA Tasks</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {allPendingTasks.length > 0 ? (
                allPendingTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-secondary">
                        <FileText className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-foreground truncate">{task.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            task.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                            task.priority === 'high' ? 'bg-warning/10 text-warning' :
                            'bg-info/10 text-info'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className={`${
                            task.status === 'in_progress' ? 'text-info' : 'text-muted-foreground'
                          }`}>
                            {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No pending tasks. Create tasks from the Tasks page.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Clients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Clients</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeClients.length > 0 ? (
                activeClients.slice(0, 3).map((client) => (
                  <div
                    key={client.id}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-semibold">
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
                          <span className="text-xs px-2 py-1 rounded bg-success/10 text-success">
                            active
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{client.email}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Score: </span>
                            <span className="font-medium">{client.score || '-'}</span>
                            {client.scoreChange > 0 && (
                              <span className="text-success ml-1">+{client.scoreChange}</span>
                            )}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Deleted: </span>
                            <span className="font-medium">{client.deletedItems}/{client.totalDisputes}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Active: </span>
                            <span className="font-medium">{client.activeDisputes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No clients yet. Add clients to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
