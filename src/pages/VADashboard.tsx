import { useAuth } from '@/contexts/AuthContext';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Brain,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Mock data for VA dashboard
const vaStats = {
  assignedClients: 12,
  pendingTasks: 8,
  completedToday: 5,
  lettersToReview: 3,
};

const priorityTasks = [
  {
    id: '1',
    client: 'Sarah Johnson',
    task: 'Review AI-generated dispute letter for Equifax',
    priority: 'high',
    dueDate: 'Today',
    aiSuggestion: true,
  },
  {
    id: '2',
    client: 'Marcus Williams',
    task: 'Upload bureau response documents',
    priority: 'medium',
    dueDate: 'Tomorrow',
    aiSuggestion: false,
  },
  {
    id: '3',
    client: 'Jennifer Chen',
    task: 'Prepare Round 3 letters - data breach strategy',
    priority: 'high',
    dueDate: 'Today',
    aiSuggestion: true,
  },
  {
    id: '4',
    client: 'Robert Davis',
    task: 'Verify identity documents',
    priority: 'low',
    dueDate: 'Dec 5',
    aiSuggestion: false,
  },
];

const assignedClients = [
  { id: '1', name: 'Sarah Johnson', score: 642, round: 2, status: 'active' },
  { id: '2', name: 'Marcus Williams', score: 598, round: 1, status: 'active' },
  { id: '3', name: 'Jennifer Chen', score: 675, round: 3, status: 'active' },
  { id: '4', name: 'Robert Davis', score: 520, round: 1, status: 'pending' },
];

const aiTrainingTips = [
  {
    id: '1',
    title: 'Why we dispute this item',
    description: 'FCRA § 611(a) requires bureaus to investigate disputed items within 30 days.',
    type: 'legal',
  },
  {
    id: '2',
    title: 'Best strategy for collections',
    description: 'Debt validation letters are most effective for accounts under $500.',
    type: 'strategy',
  },
];

export default function VADashboard() {
  const { profile } = useAuth();

  const priorityColors = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              VA Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {profile?.first_name || 'Team Member'}. Here's your task overview.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/va-dashboard/tasks">
              <Button variant="outline">
                <ClipboardList className="w-4 h-4 mr-2" />
                All Tasks
              </Button>
            </Link>
            <Link to="/va-dashboard/disputes">
              <Button className="bg-gradient-primary hover:opacity-90">
                <FileText className="w-4 h-4 mr-2" />
                Review Letters
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Clients</p>
                  <p className="text-3xl font-bold">{vaStats.assignedClients}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Tasks</p>
                  <p className="text-3xl font-bold text-warning">{vaStats.pendingTasks}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-3xl font-bold text-success">{vaStats.completedToday}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Letters to Review</p>
                  <p className="text-3xl font-bold text-info">{vaStats.lettersToReview}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Priority Tasks */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      Priority Tasks
                    </CardTitle>
                    <CardDescription>Tasks requiring your attention</CardDescription>
                  </div>
                  <Link to="/va-dashboard/tasks">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {priorityTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{task.client}</p>
                          {task.aiSuggestion && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                              <Brain className="w-3 h-3 mr-1" />
                              AI Task
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{task.task}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={cn('text-xs capitalize', priorityColors[task.priority as keyof typeof priorityColors])}
                          >
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Training Tips */}
            <Card className="card-elevated border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Training Mode
                </CardTitle>
                <CardDescription>Learn why we dispute certain items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiTrainingTips.map((tip) => (
                    <div key={tip.id} className="p-4 rounded-lg bg-background border border-border">
                      <p className="font-medium text-sm">{tip.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                    </div>
                  ))}
                </div>
                <Link to="/va-dashboard/training">
                  <Button variant="outline" className="w-full mt-4">
                    View Training Library
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Assigned Clients */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                My Clients
              </CardTitle>
              <CardDescription>Clients assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignedClients.map((client) => (
                  <Link
                    key={client.id}
                    to={`/va-dashboard/clients/${client.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-secondary text-foreground font-semibold text-sm">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{client.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">Score: {client.score}</span>
                        <Badge variant="secondary" className="text-xs">Round {client.round}</Badge>
                      </div>
                    </div>
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      client.status === 'active' ? 'bg-success' : 'bg-warning'
                    )} />
                  </Link>
                ))}
              </div>
              <Link to="/va-dashboard/clients">
                <Button variant="outline" className="w-full mt-4">
                  View All Clients
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
