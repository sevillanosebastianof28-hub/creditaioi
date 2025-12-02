import { useState } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Clock, CheckCircle2, AlertCircle, Brain, User, FileText } from 'lucide-react';

const mockTasks = [
  {
    id: '1',
    title: 'Review dispute letter for John Doe',
    description: 'AI has generated a Capital One late payment dispute letter. Review and approve.',
    client: 'John Doe',
    priority: 'high',
    status: 'pending',
    dueDate: '2024-05-21',
    type: 'letter_review',
    aiGenerated: true,
  },
  {
    id: '2',
    title: 'Verify uploaded documents',
    description: 'Jane Smith uploaded new proof of address. Verify document quality.',
    client: 'Jane Smith',
    priority: 'medium',
    status: 'pending',
    dueDate: '2024-05-22',
    type: 'document_review',
    aiGenerated: false,
  },
  {
    id: '3',
    title: 'Respond to client message',
    description: 'Mike Johnson has questions about his Round 4 progress.',
    client: 'Mike Johnson',
    priority: 'medium',
    status: 'pending',
    dueDate: '2024-05-21',
    type: 'communication',
    aiGenerated: false,
  },
  {
    id: '4',
    title: 'Approve Round 2 letters',
    description: 'AI has prepared Round 2 dispute bundle for Sarah Williams. 4 letters ready.',
    client: 'Sarah Williams',
    priority: 'high',
    status: 'pending',
    dueDate: '2024-05-20',
    type: 'letter_review',
    aiGenerated: true,
  },
  {
    id: '5',
    title: 'Update client credit report',
    description: 'New SmartCredit sync available for John Doe. Review changes.',
    client: 'John Doe',
    priority: 'low',
    status: 'completed',
    dueDate: '2024-05-19',
    type: 'report_update',
    aiGenerated: true,
  },
];

const priorityConfig = {
  high: { color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'High' },
  medium: { color: 'bg-warning/10 text-warning border-warning/20', label: 'Medium' },
  low: { color: 'bg-info/10 text-info border-info/20', label: 'Low' },
};

export default function VATasks() {
  const [tasks, setTasks] = useState(mockTasks);

  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
        : task
    ));
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const TaskCard = ({ task }: { task: typeof mockTasks[0] }) => {
    const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
    return (
      <Card className={`card-elevated hover:border-primary/30 transition-colors ${task.status === 'completed' ? 'opacity-60' : ''}`}>
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={() => toggleTaskComplete(task.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-semibold ${task.status === 'completed' ? 'line-through' : ''}`}>
                  {task.title}
                </h4>
                {task.aiGenerated && (
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
                  {task.client}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button size="sm" variant={task.status === 'completed' ? 'ghost' : 'default'}>
              {task.type === 'letter_review' ? 'Review Letter' : 
               task.type === 'document_review' ? 'View Document' :
               task.type === 'communication' ? 'Reply' : 'View'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

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
                {pendingTasks.filter(t => t.priority === 'high').length}
              </div>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-info">
                {tasks.filter(t => t.aiGenerated).length}
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

        {/* Tasks */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Pending ({pendingTasks.length})
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

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </TabsContent>
        </Tabs>
      </div>
    </RoleBasedLayout>
  );
}
