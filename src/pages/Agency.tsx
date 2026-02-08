import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgencyMetrics } from '@/hooks/useAgencyMetrics';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  Plus,
  Settings,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

const Agency = () => {
  const { metrics, teamMembers, isLoading } = useAgencyMetrics();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const stats = [
    { label: 'Total Clients', value: metrics.totalClients, icon: Users, gradient: 'from-primary/20 to-primary/5' },
    { label: 'Deletion Rate', value: `${metrics.deletionRate}%`, icon: TrendingUp, gradient: 'from-success/20 to-success/5' },
    { label: 'Letters This Month', value: metrics.lettersThisMonth, icon: FileText, gradient: 'from-blue-500/20 to-blue-500/5' },
    { label: 'Active Disputes', value: metrics.activeDisputes, icon: Clock, gradient: 'from-warning/20 to-warning/5' },
  ];

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
              Manage your agency and team.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-border/50 hover:border-primary/50 transition-all">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </motion.div>

        {/* Agency Overview */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={itemVariants}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg group p-4">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-center gap-3 relative">
                  <motion.div 
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <stat.icon className="w-5 h-5 text-foreground" />
                  </motion.div>
                  <div>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <motion.p 
                        className="text-2xl font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                      >
                        {stat.value}
                      </motion.p>
                    )}
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
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
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No team members yet</p>
                  <p className="text-sm mt-1">Add VA staff to your agency to see them here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((va, index) => (
                    <motion.div
                      key={va.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 ring-2 ring-background group-hover:ring-primary/20 transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-500/20 text-foreground font-semibold">
                            {va.first_name?.[0] || ''}{va.last_name?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{va.first_name} {va.last_name}</p>
                          <p className="text-sm text-muted-foreground">Virtual Assistant</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center hidden sm:block">
                          <p className="text-sm text-muted-foreground">Clients</p>
                          <p className="font-semibold">{va.clientsManaged}</p>
                        </div>
                        <div className="text-center hidden sm:block">
                          <p className="text-sm text-muted-foreground">Tasks Done</p>
                          <p className="font-semibold">{va.tasksCompleted}</p>
                        </div>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Agency;
