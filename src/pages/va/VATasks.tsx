import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Clock, CheckCircle2, Brain, User, FileText } from 'lucide-react';
import { useTasks, Task } from '@/hooks/useTasks';

const priorityConfig = {
  high: { color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'High' },
  medium: { color: 'bg-warning/10 text-warning border-warning/20', label: 'Medium' },
  low: { color: 'bg-info/10 text-info border-info/20', label: 'Low' },
  urgent: { color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Urgent' },
};

export default function VATasks() {
  const { 
    isLoading, 
    tasks, 
    pendingTasks, 
    completedTasks, 
    inProgressTasks,
    updateTask 
  } = useTasks();

  const toggleTaskComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateTask(taskId, { status: newStatus });
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return (
      <Card className={`card-elevated hover:border-primary/30 transition-colors ${task.status === 'completed' ? 'opacity-60' : ''}`}>
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-semibold ${task.status === 'completed' ? 'line-through' : ''}`}>
                  {task.title}
                </h4>
                {task.ai_generated && (
                  <Badge className="bg-gradient-primary text-primary-foreground text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className={priority.color}>
                  {priority.label}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {task.task_type}
                </span>
                {task.due_date && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <Button size="sm" variant={task.status === 'completed' ? 'ghost' : 'default'}>
              {task.task_type === 'letter_review' ? 'Review Letter' : 
               task.task_type === 'document_review' ? 'View Document' :
               task.task_type === 'client_followup' ? 'Reply' : 'View'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">AI-generated tasks and client follow-ups</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{pendingTasks.length}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-destructive">
                {pendingTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length}
              </div>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-info">
                {tasks.filter(t => t.ai_generated).length}
              </div>
              <p className="text-sm text-muted-foreground">AI Generated</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">{completedTasks.length}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* No tasks state */}
        {tasks.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Tasks Yet</h3>
            <p className="text-muted-foreground">
              Tasks will appear here when assigned or generated by AI.
            </p>
          </Card>
        )}

        {/* Tasks */}
        {tasks.length > 0 && (
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Pending ({pendingTasks.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                In Progress ({inProgressTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Completed ({completedTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3 mt-4">
              {pendingTasks.length === 0 ? (
                <Card className="card-elevated">
                  <CardContent className="py-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                    <h3 className="font-semibold">All caught up!</h3>
                    <p className="text-muted-foreground">No pending tasks at the moment.</p>
                  </CardContent>
                </Card>
              ) : (
                pendingTasks.map(task => <TaskCard key={task.id} task={task} />)
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-3 mt-4">
              {inProgressTasks.length === 0 ? (
                <Card className="card-elevated">
                  <CardContent className="py-8 text-center">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No tasks in progress.</p>
                  </CardContent>
                </Card>
              ) : (
                inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3 mt-4">
              {completedTasks.length === 0 ? (
                <Card className="card-elevated">
                  <CardContent className="py-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No completed tasks yet.</p>
                  </CardContent>
                </Card>
              ) : (
                completedTasks.map(task => <TaskCard key={task.id} task={task} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </RoleBasedLayout>
  );
}
