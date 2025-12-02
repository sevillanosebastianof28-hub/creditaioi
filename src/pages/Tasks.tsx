import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockTasks, mockVAPerformance } from '@/data/mockData';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  FileText,
  Filter,
} from 'lucide-react';

const Tasks = () => {
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const filteredTasks = mockTasks.filter((task) => {
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee =
      assigneeFilter === 'all' || task.assignedTo === assigneeFilter || (!task.assignedTo && assigneeFilter === 'unassigned');
    return matchesPriority && matchesAssignee;
  });

  const pendingTasks = filteredTasks.filter((t) => t.status === 'pending');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

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
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Tasks List */}
          <div className="xl:col-span-2 space-y-4">
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
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger className="w-48">
                    <Users className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {mockVAPerformance.map((va) => (
                      <SelectItem key={va.id} value={va.name}>
                        {va.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Task Tabs */}
            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pending" className="gap-2">
                  Pending
                  <Badge variant="secondary" className="ml-1">
                    {pendingTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="gap-2">
                  In Progress
                  <Badge variant="secondary" className="ml-1">
                    {inProgressTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-3">
                {pendingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
                {pendingTasks.length === 0 && (
                  <Card className="p-8">
                    <div className="text-center text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>All tasks completed!</p>
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="in_progress" className="space-y-3">
                {inProgressTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-3">
                <Card className="p-8">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Completed tasks history</p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* VA Performance */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">VA Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockVAPerformance.map((va) => (
                  <div key={va.id} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {va.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{va.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {va.clientsManaged} clients managed
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Deletion Rate</span>
                        <span className="font-medium text-success">{va.deletionRate}%</span>
                      </div>
                      <Progress value={va.deletionRate} className="h-2" />
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div className="p-2 rounded bg-secondary">
                          <p className="text-muted-foreground">Tasks</p>
                          <p className="font-semibold">{va.tasksCompleted}</p>
                        </div>
                        <div className="p-2 rounded bg-secondary">
                          <p className="text-muted-foreground">Letters</p>
                          <p className="font-semibold">{va.lettersGenerated}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
