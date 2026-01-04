import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useInvoices } from '@/hooks/useInvoices';

const Analytics = () => {
  const { data: analytics, isLoading } = useAnalytics();
  const { stats: invoiceStats } = useInvoices();

  const bureauColors = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--warning))'];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Analytics
            </h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const bureauData = analytics?.bureauStats.map((b, i) => ({
    name: b.bureau,
    value: b.deleted,
    color: bureauColors[i % bureauColors.length]
  })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your agency performance and key metrics.
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">${invoiceStats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics?.deletionRate || 0}%</p>
                <p className="text-sm text-muted-foreground">Deletion Rate</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <FileText className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics?.totalDeletions || 0}</p>
                <p className="text-sm text-muted-foreground">Total Deletions</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics?.avgDaysToResponse || 0}</p>
                <p className="text-sm text-muted-foreground">Avg Days to Response</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Dispute Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="disputes" name="Total Disputes" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deletions" name="Deletions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Deletions by Bureau */}
          <Card>
            <CardHeader>
              <CardTitle>Deletions by Bureau</CardTitle>
            </CardHeader>
            <CardContent>
              {bureauData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={bureauData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {bureauData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Letter Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Letter Type Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.letterTypeStats && analytics.letterTypeStats.length > 0 ? (
              <div className="space-y-4">
                {analytics.letterTypeStats.map((letter) => (
                  <div key={letter.type} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium truncate">{letter.type}</div>
                    <div className="flex-1">
                      <Progress value={letter.rate} className="h-3" />
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-sm font-semibold text-success">{letter.rate}%</span>
                      <span className="text-xs text-muted-foreground ml-1">success</span>
                    </div>
                    <div className="w-16 text-right text-sm text-muted-foreground">
                      {letter.total} sent
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No letter data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Improvements */}
        <Card>
          <CardHeader>
            <CardTitle>Average Score Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Experian', value: analytics?.scoreImprovements.avgExperian || 0 },
                { name: 'Equifax', value: analytics?.scoreImprovements.avgEquifax || 0 },
                { name: 'TransUnion', value: analytics?.scoreImprovements.avgTransUnion || 0 },
              ].map((bureau) => (
                <div key={bureau.name} className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">{bureau.name}</p>
                  <p className={`text-2xl font-bold ${bureau.value > 0 ? 'text-success' : bureau.value < 0 ? 'text-destructive' : ''}`}>
                    {bureau.value > 0 ? '+' : ''}{bureau.value} pts
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
