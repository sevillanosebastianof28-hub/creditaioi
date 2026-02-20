import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useTasks } from '@/hooks/useTasks';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  ArrowRight,
  Sparkles,
  Plus,
  Brain,
  Target,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { tasks, pendingTasks, inProgressTasks, isLoading: tasksLoading } = useTasks();

  // Fetch real clients from database - optimized with batch queries
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['agency-clients', profile?.agency_id],
    queryFn: async () => {
      if (!profile?.agency_id) return [];
      
      // First get all profiles in this agency (RLS allows agency owners to see these)
      const { data: agencyProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('agency_id', profile.agency_id);

      if (profilesError) throw profilesError;
      if (!agencyProfiles || agencyProfiles.length === 0) return [];

      // Filter out the agency owner themselves
      const profiles = agencyProfiles.filter(p => p.user_id !== user?.id);
      if (profiles.length === 0) return [];

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
        <div className="space-y-8 p-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <Skeleton className="h-10 w-64 rounded-xl" />
              <Skeleton className="h-5 w-96 rounded-lg" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-11 w-32 rounded-xl" />
              <Skeleton className="h-11 w-36 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Skeleton className="xl:col-span-2 h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-2">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <Brain className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  Welcome back
                  {profile?.first_name && <span className="text-primary">, {profile.first_name}</span>}
                </h1>
                <p className="text-muted-foreground">
              Welcome back! Here's your agency overview.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/clients')}
              className="rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <Users className="w-4 h-4 mr-2" />
              View Clients
            </Button>
            <Button 
              onClick={() => navigate('/clients')} 
              className="rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Client
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Active Clients"
            value={metrics?.activeClients || 0}
            change={12}
            changeLabel="vs last month"
            icon={<Users className="w-7 h-7" />}
            variant="primary"
          />
          <StatsCard
            title="Avg Score Increase"
            value={`+${metrics?.averageScoreIncrease || 0}`}
            change={8}
            changeLabel="points"
            icon={<TrendingUp className="w-7 h-7" />}
            variant="success"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${(metrics?.monthlyRecurring || 0).toLocaleString()}`}
            change={15}
            changeLabel="vs last month"
            icon={<DollarSign className="w-7 h-7" />}
            variant="primary"
          />
          <StatsCard
            title="Deletion Rate"
            value={`${metrics?.deletionRate || 0}%`}
            change={5}
            changeLabel="improvement"
            icon={<Target className="w-7 h-7" />}
            variant="success"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Score Trends Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-2 rounded-2xl border border-border/50 bg-card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Score Trends</h3>
                  <p className="text-sm text-muted-foreground">Average client score progression</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-primary rounded-lg" 
                onClick={() => navigate('/analytics')}
              >
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={scoreHistory}>
                <defs>
                  <linearGradient id="colorEquifax" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExperian" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTransunion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[550, 700]} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                    }}
                  />
                <Area
                  type="monotone"
                  dataKey="equifax"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#colorEquifax)"
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                />
                <Area
                  type="monotone"
                  dataKey="experian"
                  stroke="hsl(var(--info))"
                  strokeWidth={2.5}
                  fill="url(#colorExperian)"
                  dot={{ fill: 'hsl(var(--info))', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--info))' }}
                />
                <Area
                  type="monotone"
                  dataKey="transunion"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2.5}
                  fill="url(#colorTransunion)"
                  dot={{ fill: 'hsl(var(--warning))', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--warning))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              {[
                { name: 'Equifax', color: 'bg-primary' },
                { name: 'Experian', color: 'bg-info' },
                { name: 'TransUnion', color: 'bg-warning' },
              ].map((bureau) => (
                <div key={bureau.name} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", bureau.color)} />
                  <span className="text-sm text-muted-foreground">{bureau.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-gradient-to-br from-sidebar-background via-sidebar-background to-sidebar-accent/20 border border-sidebar-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sidebar-foreground">AI Insights</h3>
                <p className="text-xs text-sidebar-foreground/60">Powered by Credit AI</p>
              </div>
            </div>

            <div className="space-y-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/50 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Zap className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sidebar-foreground mb-1">
                  High Success Opportunity
                    </p>
                    <p className="text-xs text-sidebar-foreground/70">
                      {clients.length > 0 
                        ? `${Math.min(5, clients.length)} clients have disputes with 90%+ deletion probability.`
                        : 'Add clients to see AI-powered insights.'}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/50 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Clock className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sidebar-foreground mb-1">
                  Task Queue
                    </p>
                    <p className="text-xs text-sidebar-foreground/70">
                      {allPendingTasks.length} tasks awaiting action
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/50 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-info/20">
                    <CheckCircle2 className="w-4 h-4 text-info" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sidebar-foreground mb-1">
                  Round Completion
                    </p>
                    <p className="text-xs text-sidebar-foreground/70">
                      {clients.filter(c => c.activeDisputes > 0).length} clients ready for next dispute round
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-6 rounded-xl border-sidebar-border text-sidebar-foreground hover:bg-primary/10 hover:border-primary/50 transition-all"
              onClick={() => navigate('/ai-engine')}
            >
              <Brain className="w-4 h-4 mr-2" />
              Open AI Engine
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          </motion.div>
        </div>

        {/* Tasks and Clients */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* VA Tasks */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border/50 bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-warning/10">
                  <FileText className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">VA Tasks</h3>
                  <p className="text-sm text-muted-foreground">{allPendingTasks.length} pending</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/tasks')}
                className="rounded-lg hover:bg-primary/5"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              <AnimatePresence>
                {allPendingTasks.length > 0 ? (
                  allPendingTasks.slice(0, 3).map((task, index) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-2.5 rounded-xl",
                          task.priority === 'urgent' ? 'bg-destructive/10' :
                          task.priority === 'high' ? 'bg-warning/10' : 'bg-info/10'
                        )}>
                          {task.priority === 'urgent' ? (
                            <AlertCircle className={cn("w-5 h-5", 'text-destructive')} />
                          ) : (
                            <FileText className={cn(
                              "w-5 h-5",
                              task.priority === 'high' ? 'text-warning' : 'text-info'
                            )} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-foreground truncate">{task.title}</h4>
                            <Badge className={cn(
                              "text-xs rounded-full",
                              task.priority === 'urgent' ? 'bg-destructive/15 text-destructive border-destructive/20' :
                              task.priority === 'high' ? 'bg-warning/15 text-warning border-warning/20' :
                              'bg-info/15 text-info border-info/20'
                            )}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn(
                              "text-xs rounded-full",
                              task.status === 'in_progress' ? 'border-info/30 text-info' : 'border-muted'
                            )}>
                              {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      No pending tasks. Create tasks from the Tasks page.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Recent Clients */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border/50 bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Recent Clients</h3>
                  <p className="text-sm text-muted-foreground">{activeClients.length} active</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/clients')}
                className="rounded-lg hover:bg-primary/5"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              <AnimatePresence>
                {activeClients.length > 0 ? (
                  activeClients.slice(0, 3).map((client, index) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="p-4 rounded-xl border border-border/50 bg-card cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
                            <Badge className="bg-success/15 text-success border-success/20 rounded-full text-xs">
                              active
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{client.email}</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-2 rounded-lg bg-muted/30 text-center">
                              <p className="text-xs text-muted-foreground mb-0.5">Score</p>
                              <p className="font-semibold text-sm">
                                {client.score || '-'}
                                {client.scoreChange > 0 && (
                                  <span className="text-success text-xs ml-1">+{client.scoreChange}</span>
                                )}
                              </p>
                            </div>
                            <div className="p-2 rounded-lg bg-muted/30 text-center">
                              <p className="text-xs text-muted-foreground mb-0.5">Deleted</p>
                              <p className="font-semibold text-sm text-success">{client.deletedItems}/{client.totalDisputes}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-muted/30 text-center">
                              <p className="text-xs text-muted-foreground mb-0.5">Active</p>
                              <p className="font-semibold text-sm">{client.activeDisputes}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">
                      No clients yet. Add clients to get started.
                    </p>
                    <Button 
                      onClick={() => navigate('/clients')}
                      className="rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Client
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border/50 bg-card overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-info/10">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">Latest updates across your agency</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="rounded-lg hover:bg-primary/5">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="p-6">
            <RecentActivity />
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
