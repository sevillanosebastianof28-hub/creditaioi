import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTasks, Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Filter,
  Plus,
  Play,
  Trash2,
  Sparkles,
  User,
} from 'lucide-react';

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info border-info/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
};

const TaskCard = ({ 
  task, 
  onUpdate, 
  onDelete
}: { 
  task: Task; 
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}) => {
  const handleStartTask = () => onUpdate(task.id, { status: 'in_progress' });
  const handleCompleteTask = () => onUpdate(task.id, { status: 'completed' });

  const aiGenerated = task.ai_generated ?? false;
  const clientName = task.client_name;

  return (
    <Card className="p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h4 className="font-medium">{task.title}</h4>
            <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
              {task.priority}
            </Badge>
            {aiGenerated && (
              <Badge variant="secondary" className="text-xs bg-gradient-primary text-primary-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                AI
              </Badge>
            )}
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span>Type: {task.task_type}</span>
            {clientName && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {clientName}
              </span>
            )}
            {task.due_date && (
              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {task.status === 'pending' && (
            <Button size="sm" variant="outline" onClick={handleStartTask}>
              <Play className="w-3 h-3 mr-1" />
              Start
            </Button>
          )}
          {task.status === 'in_progress' && (
            <Button size="sm" className="bg-gradient-primary" onClick={handleCompleteTask}>
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onDelete(task.id)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const Tasks = () => {
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    task_type: 'general'
  });

  const { 
    isLoading, 
    tasks: dbTasks, 
    pendingTasks: dbPendingTasks, 
    inProgressTasks: dbInProgressTasks, 
    completedTasks: dbCompletedTasks,
    createTask,
    updateTask,
    deleteTask 
  } = useTasks();

  const { tasks, pendingTasks, inProgressTasks, completedTasks } = {
    tasks: dbTasks,
    pendingTasks: dbPendingTasks,
    inProgressTasks: dbInProgressTasks,
    completedTasks: dbCompletedTasks
  };

  const filteredPending = priorityFilter === 'all' 
    ? pendingTasks 
    : pendingTasks.filter(t => t.priority === priorityFilter);
  
  const filteredInProgress = priorityFilter === 'all'
    ? inProgressTasks
    : inProgressTasks.filter(t => t.priority === priorityFilter);

  const filteredCompleted = priorityFilter === 'all'
    ? completedTasks.slice(0, 10)
    : completedTasks.filter(t => t.priority === priorityFilter).slice(0, 10);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    await createTask(newTask);
    setNewTask({ title: '', description: '', priority: 'medium', task_type: 'general' });
    setCreateDialogOpen(false);
  };

  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-12 w-full" />
              </Card>
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
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
            <h1 className="text-3xl font-bold text-foreground">VA Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all virtual assistant tasks.
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input 
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Task title..."
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select 
                      value={newTask.priority} 
                      onValueChange={(v) => setNewTask(prev => ({ ...prev, priority: v as Task['priority'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select 
                      value={newTask.task_type} 
                      onValueChange={(v) => setNewTask(prev => ({ ...prev, task_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="letter_review">Letter Review</SelectItem>
                        <SelectItem value="document_review">Document Review</SelectItem>
                        <SelectItem value="client_followup">Client Follow-up</SelectItem>
                        <SelectItem value="dispute_action">Dispute Action</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreateTask}>
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <AlertCircle className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressTasks.length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* No Data State */}
        {tasks.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Tasks Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first task or wait for AI-generated tasks from dispute workflows.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Task
            </Button>
          </Card>
        )}

        {/* Task Tabs */}
        {tasks.length > 0 && (
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                Pending
                <Badge variant="secondary" className="ml-1">
                  {filteredPending.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="gap-2">
                In Progress
                <Badge variant="secondary" className="ml-1">
                  {filteredInProgress.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <Badge variant="secondary" className="ml-1">
                  {filteredCompleted.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3">
              {filteredPending.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              ))}
              {filteredPending.length === 0 && (
                <Card className="p-8">
                  <div className="text-center text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No pending tasks!</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-3">
              {filteredInProgress.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              ))}
              {filteredInProgress.length === 0 && (
                <Card className="p-8">
                  <div className="text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No tasks in progress</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3">
              {filteredCompleted.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              ))}
              {filteredCompleted.length === 0 && (
                <Card className="p-8">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No completed tasks yet</p>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
