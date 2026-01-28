import { useAuth } from '@/contexts/AuthContext';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import {
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  FileText,
  Brain,
  ArrowRight,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/useTasks';
import { useVAAssignments } from '@/hooks/useVAAssignments';

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
  const { profile, user } = useAuth();
  const { tasks, pendingTasks, inProgressTasks, completedTasks, isLoading: tasksLoading } = useTasks();
  const { assignments, isLoading: assignmentsLoading } = useVAAssignments();

  const isLoading = tasksLoading || assignmentsLoading;

  // Filter assignments for this VA
  const myAssignments = assignments.filter(a => a.va_user_id === user?.id);
  const myClients = myAssignments.map(a => ({
    id: a.client_user_id,
    name: a.client_profile 
      ? `${a.client_profile.first_name || ''} ${a.client_profile.last_name || ''}`.trim() || 'Unknown'
      : 'Unknown Client',
    email: a.client_profile?.email,
    status: 'active' as const,
  }));

  // Calculate stats from real data
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const completedToday = completedTasks.filter(t => 
    new Date(t.completed_at || t.updated_at) >= todayStart
  ).length;

  const vaStats = {
    assignedClients: myClients.length,
    pendingTasks: pendingTasks.length + inProgressTasks.length,
    completedToday,
    lettersToReview: tasks.filter(t => 
      t.task_type === 'review_dispute' || t.task_type === 'generate_letters'
    ).length,
  };

  // Priority tasks for display
  const priorityTasksList = [...pendingTasks, ...inProgressTasks]
    .slice(0, 4)
    .map(task => ({
      id: task.id,
      client: myClients.find(c => c.id === task.client_id)?.name || 'General',
      task: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.due_date 
        ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'No due date',
      aiSuggestion: task.ai_generated,
      status: task.status,
    }));

  const priorityColors = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    urgent: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-muted text-muted-foreground border-border',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <motion.div 
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Welcome Header */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              VA Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {profile?.first_name || 'Team Member'}. Here's your task overview.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/va-dashboard/tasks">
              <Button variant="outline" className="border-border/50 hover:border-primary/50 transition-all">
                <ClipboardList className="w-4 h-4 mr-2" />
                All Tasks
              </Button>
            </Link>
            <Link to="/va-dashboard/disputes">
              <Button className="bg-gradient-to-r from-primary to-emerald-500 hover:opacity-90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
                <FileText className="w-4 h-4 mr-2" />
                Review Letters
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={itemVariants}
        >
          {[
            { label: 'Assigned Clients', value: vaStats.assignedClients, icon: Users, color: 'primary', gradient: 'from-primary/20 to-primary/5' },
            { label: 'Pending Tasks', value: vaStats.pendingTasks, icon: Clock, color: 'warning', gradient: 'from-warning/20 to-warning/5' },
            { label: 'Completed Today', value: vaStats.completedToday, icon: CheckCircle2, color: 'success', gradient: 'from-success/20 to-success/5' },
            { label: 'Letters to Review', value: vaStats.lettersToReview, icon: FileText, color: 'info', gradient: 'from-blue-500/20 to-blue-500/5' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden border-border/50 hover:border-${stat.color}/30 transition-all duration-300 hover:shadow-lg group`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <CardContent className="pt-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <motion.p 
                        className={`text-3xl font-bold text-${stat.color}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                    <motion.div 
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          {/* Priority Tasks */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="relative overflow-hidden border-border/50">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ClipboardList className="w-5 h-5 text-primary" />
                      </div>
                      Priority Tasks
                    </CardTitle>
                    <CardDescription>Tasks requiring your attention</CardDescription>
                  </div>
                  <Link to="/va-dashboard/tasks">
                    <Button variant="ghost" size="sm" className="group">
                      View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {priorityTasksList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No pending tasks</p>
                    <p className="text-sm">Great job! You're all caught up.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {priorityTasksList.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{task.client}</p>
                            {task.aiSuggestion && (
                              <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-emerald-500/10 text-primary border-primary/20 text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
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
                        <Link to="/va-dashboard/tasks">
                          <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground">
                            Start
                          </Button>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Training Tips */}
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <motion.div 
                    className="p-2 rounded-lg bg-gradient-to-br from-primary to-emerald-500 shadow-lg shadow-primary/25"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Brain className="w-5 h-5 text-white" />
                  </motion.div>
                  AI Training Mode
                </CardTitle>
                <CardDescription>Learn why we dispute certain items</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  {aiTrainingTips.map((tip, index) => (
                    <motion.div 
                      key={tip.id} 
                      className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <p className="font-medium text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        {tip.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                    </motion.div>
                  ))}
                </div>
                <Link to="/va-dashboard/training">
                  <Button variant="outline" className="w-full mt-4 group hover:border-primary/50">
                    View Training Library
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Assigned Clients */}
          <Card className="relative overflow-hidden border-border/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Users className="w-5 h-5 text-emerald-500" />
                </div>
                My Clients
              </CardTitle>
              <CardDescription>Clients assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              {myClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No clients assigned</p>
                  <p className="text-sm">Contact your agency owner for assignments.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myClients.slice(0, 5).map((client, index) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <Link
                        to={`/va-dashboard/clients/${client.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all group"
                      >
                        <Avatar className="w-10 h-10 ring-2 ring-background group-hover:ring-primary/20 transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-500/20 text-foreground font-semibold text-sm">
                            {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{client.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{client.email || 'No email'}</p>
                        </div>
                        <div className={cn(
                          'w-2.5 h-2.5 rounded-full ring-2 ring-background',
                          client.status === 'active' ? 'bg-success' : 'bg-warning'
                        )} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
              <Link to="/va-dashboard/clients">
                <Button variant="outline" className="w-full mt-4 group hover:border-primary/50">
                  View All Clients
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </RoleBasedLayout>
  );
}
