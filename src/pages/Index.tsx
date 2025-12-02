import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { ClientCard } from '@/components/dashboard/ClientCard';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { mockClients, mockTasks, mockMetrics, mockScoreHistory } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const activeClients = mockClients.filter((c) => c.status === 'active');
  const pendingTasks = mockTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');

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
            value={mockMetrics.activeClients}
            change={12}
            changeLabel="vs last month"
            icon={<Users className="w-6 h-6" />}
            variant="primary"
          />
          <StatsCard
            title="Avg Score Increase"
            value={`+${mockMetrics.averageScoreIncrease}`}
            change={8}
            changeLabel="points"
            icon={<TrendingUp className="w-6 h-6" />}
            variant="success"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${mockMetrics.monthlyRecurring.toLocaleString()}`}
            change={15}
            changeLabel="vs last month"
            icon={<DollarSign className="w-6 h-6" />}
            variant="primary"
          />
          <StatsCard
            title="Deletion Rate"
            value={`${mockMetrics.deletionRate}%`}
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
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View Details
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={mockScoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis domain={[550, 650]} className="text-xs" />
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
                  5 clients have medical collections with 90%+ deletion probability. Consider
                  prioritizing these disputes.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                <p className="text-sm font-medium text-sidebar-accent-foreground mb-1">
                  Revenue Alert
                </p>
                <p className="text-xs text-sidebar-foreground">
                  3 clients have payments due this week. Total: $447
                </p>
              </div>
              <div className="p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                <p className="text-sm font-medium text-sidebar-accent-foreground mb-1">
                  Round Completion
                </p>
                <p className="text-xs text-sidebar-foreground">
                  8 clients are ready for next dispute round. AI has pre-generated letters.
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
              {pendingTasks.slice(0, 3).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
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
              {activeClients.slice(0, 3).map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => navigate(`/clients/${client.id}`)}
                />
              ))}
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
