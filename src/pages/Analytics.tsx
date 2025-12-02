import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMetrics, mockVAPerformance } from '@/data/mockData';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

const monthlyData = [
  { month: 'Jul', revenue: 22400, clients: 165, deletions: 234 },
  { month: 'Aug', revenue: 24100, clients: 178, deletions: 267 },
  { month: 'Sep', revenue: 25800, clients: 185, deletions: 289 },
  { month: 'Oct', revenue: 26500, clients: 192, deletions: 312 },
  { month: 'Nov', revenue: 27200, clients: 201, deletions: 345 },
  { month: 'Dec', revenue: 28350, clients: 189, deletions: 378 },
];

const deletionByBureau = [
  { name: 'Equifax', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Experian', value: 38, color: 'hsl(var(--info))' },
  { name: 'TransUnion', value: 27, color: 'hsl(var(--warning))' },
];

const letterTypes = [
  { type: 'FCRA 605b', count: 156, success: 78 },
  { type: 'Debt Validation', count: 134, success: 71 },
  { type: 'HIPAA Medical', count: 89, success: 92 },
  { type: 'Goodwill', count: 67, success: 45 },
  { type: 'Data Breach', count: 45, success: 85 },
];

const Analytics = () => {
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
                <p className="text-2xl font-bold">${mockMetrics.totalRevenue.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{mockMetrics.deletionRate}%</p>
                <p className="text-sm text-muted-foreground">Deletion Rate</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Users className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockMetrics.clientRetention}%</p>
                <p className="text-sm text-muted-foreground">Client Retention</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockMetrics.avgDaysToFirstDeletion}</p>
                <p className="text-sm text-muted-foreground">Days to 1st Deletion</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={deletionByBureau}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deletionByBureau.map((entry, index) => (
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
            <div className="space-y-4">
              {letterTypes.map((letter) => (
                <div key={letter.type} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">{letter.type}</div>
                  <div className="flex-1">
                    <Progress value={letter.success} className="h-3" />
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm font-semibold text-success">{letter.success}%</span>
                    <span className="text-xs text-muted-foreground ml-1">success</span>
                  </div>
                  <div className="w-16 text-right text-sm text-muted-foreground">
                    {letter.count} sent
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* VA Performance */}
        <Card>
          <CardHeader>
            <CardTitle>VA Performance Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockVAPerformance.map((va, index) => (
                <div
                  key={va.id}
                  className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {va.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-warning text-warning-foreground text-xs font-bold rounded-full flex items-center justify-center">
                          1
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{va.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {va.clientsManaged} clients
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 rounded bg-secondary">
                      <p className="text-muted-foreground text-xs">Deletion Rate</p>
                      <p className="font-semibold text-success">{va.deletionRate}%</p>
                    </div>
                    <div className="p-2 rounded bg-secondary">
                      <p className="text-muted-foreground text-xs">Response Time</p>
                      <p className="font-semibold">{va.avgResponseTime}</p>
                    </div>
                    <div className="p-2 rounded bg-secondary">
                      <p className="text-muted-foreground text-xs">Tasks Done</p>
                      <p className="font-semibold">{va.tasksCompleted}</p>
                    </div>
                    <div className="p-2 rounded bg-secondary">
                      <p className="text-muted-foreground text-xs">Letters</p>
                      <p className="font-semibold">{va.lettersGenerated}</p>
                    </div>
                  </div>
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
