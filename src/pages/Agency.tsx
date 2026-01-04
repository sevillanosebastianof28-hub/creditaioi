import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockMetrics, mockVAPerformance } from '@/data/mockData';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
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
  Sparkles,
  ArrowRight,
  DollarSign,
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3">
              <motion.div 
                className="p-2 rounded-xl bg-gradient-to-br from-primary to-emerald-500 shadow-lg shadow-primary/25"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Building2 className="w-6 h-6 text-white" />
              </motion.div>
              Agency Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your agency, locations, and team.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-border/50 hover:border-primary/50 transition-all">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-gradient-to-r from-primary to-emerald-500 hover:opacity-90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </motion.div>

        {/* Agency Overview */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={itemVariants}
        >
          {[
            { label: 'Total Clients', value: mockMetrics.totalClients, icon: Users, color: 'primary', gradient: 'from-primary/20 to-primary/5' },
            { label: 'Deletion Rate', value: `${mockMetrics.deletionRate}%`, icon: TrendingUp, color: 'success', gradient: 'from-success/20 to-success/5' },
            { label: 'Letters This Month', value: mockMetrics.lettersThisMonth, icon: FileText, color: 'info', gradient: 'from-blue-500/20 to-blue-500/5' },
            { label: 'Avg Days to Delete', value: mockMetrics.avgDaysToFirstDeletion, icon: Clock, color: 'warning', gradient: 'from-warning/20 to-warning/5' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden border-border/50 hover:border-${stat.color}/30 transition-all duration-300 hover:shadow-lg group p-4`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-center gap-3 relative">
                  <motion.div 
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-2xl font-bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Locations */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-border/50">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {locations.map((location, index) => (
                  <motion.div
                    key={location.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{location.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {location.vas} VAs · {location.clients} clients
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 animate-pulse" />
                        Active
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Monthly Revenue
                        </p>
                        <p className="text-xl font-bold text-emerald-500">${location.revenue.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Deletion Rate
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${location.deletionRate}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                          <span className="font-semibold text-primary">{location.deletionRate}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Members */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-border/50">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between relative">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Users className="w-5 h-5 text-emerald-500" />
                </div>
                Team Members
              </CardTitle>
              <Button variant="outline" size="sm" className="hover:border-primary/50">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockVAPerformance.map((va, index) => (
                  <motion.div
                    key={va.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 ring-2 ring-background group-hover:ring-primary/20 transition-all">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-500/20 text-foreground font-semibold">
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
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Agency;
