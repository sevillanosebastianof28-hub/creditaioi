import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockMetrics, mockVAPerformance } from '@/data/mockData';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Users,
  MapPin,
  Plus,
  Settings,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
} from 'lucide-react';

const locations = [
  {
    id: 1,
    name: 'Main Office - Atlanta',
    clients: 145,
    vas: 3,
    revenue: 21600,
    deletionRate: 74,
  },
  {
    id: 2,
    name: 'Remote Team - West Coast',
    clients: 102,
    vas: 2,
    revenue: 15200,
    deletionRate: 71,
  },
];

const Agency = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              Agency Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your agency, locations, and team.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>

        {/* Agency Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockMetrics.totalClients}</p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
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
                <FileText className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockMetrics.lettersThisMonth}</p>
                <p className="text-sm text-muted-foreground">Letters This Month</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockMetrics.avgDaysToFirstDeletion}</p>
                <p className="text-sm text-muted-foreground">Avg Days to Delete</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="p-5 rounded-xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{location.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {location.vas} VAs · {location.clients} clients
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success">
                      Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <p className="text-xl font-bold">${location.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deletion Rate</p>
                      <div className="flex items-center gap-2">
                        <Progress value={location.deletionRate} className="w-16 h-2" />
                        <span className="font-semibold text-success">{location.deletionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockVAPerformance.map((va) => (
                <div
                  key={va.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {va.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{va.name}</p>
                      <p className="text-sm text-muted-foreground">Virtual Assistant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Clients</p>
                      <p className="font-semibold">{va.clientsManaged}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Tasks</p>
                      <p className="font-semibold">{va.tasksCompleted}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Deletion Rate</p>
                      <p className="font-semibold text-success">{va.deletionRate}%</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
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

export default Agency;
