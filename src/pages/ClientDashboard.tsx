import { useAuth } from '@/contexts/AuthContext';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreditData } from '@/hooks/useCreditData';
import { AICreditCoach } from '@/components/ai/AICreditCoach';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Link2,
  Calendar,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Shield,
  Target,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  const { profile } = useAuth();
  const { 
    isLoading, 
    isRefreshing,
    creditData, 
    connectionStatus,
    averageScore,
    averagePreviousScore,
    totalScoreIncrease,
    disputeProgress,
    refreshData
  } = useCreditData();

  const progressPercent = disputeProgress 
    ? Math.round((disputeProgress.deleted / Math.max(disputeProgress.total, 1)) * 100)
    : 0;

  // Loading state
  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="card-elevated">
                <CardContent className="pt-6">
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  // No data state - check for scores specifically
  if (!creditData?.scores || connectionStatus.status !== 'connected') {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome, {profile?.first_name || 'there'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect your credit report to get started with your credit repair journey.
            </p>
          </div>

          <Card className="card-elevated border-primary/20">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {connectionStatus.status === 'connected' ? 'Sync Your Credit Report' : 'Connect SmartCredit'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {connectionStatus.status === 'connected' 
                  ? 'Your account is connected. Click below to sync your credit report and view your data.'
                  : 'Link your SmartCredit account to automatically sync your credit reports and start tracking your progress.'}
              </p>
              <Link to="/client-dashboard/smartcredit">
                <Button className="bg-gradient-primary hover:opacity-90">
                  <Link2 className="w-4 h-4 mr-2" />
                  {connectionStatus.status === 'connected' ? 'Sync Report' : 'Connect Now'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    );
  }

  // Safely extract numeric scores (handle both number and {date, score} formats)
  const getNumericScore = (value: any): number => {
    if (typeof value === 'number') return value;
    if (value && typeof value === 'object' && 'score' in value) return Number(value.score) || 0;
    return Number(value) || 0;
  };

  const clientScores = [
    { bureau: 'Experian', score: getNumericScore(creditData.scores.experian), previousScore: getNumericScore(creditData.previousScores.experian) },
    { bureau: 'Equifax', score: getNumericScore(creditData.scores.equifax), previousScore: getNumericScore(creditData.previousScores.equifax) },
    { bureau: 'TransUnion', score: getNumericScore(creditData.scores.transunion), previousScore: getNumericScore(creditData.previousScores.transunion) },
  ];

  // Recent updates based on actual data
  const recentUpdates = [
    ...(creditData.negativeItems
      .filter(item => item.status === 'deleted')
      .slice(0, 2)
      .map((item, idx) => ({
        id: `del-${idx}`,
        type: 'deletion' as const,
        message: `${item.creditor} ${item.type.toLowerCase()} deleted from ${item.bureau}`,
        date: 'Recently'
      }))),
    {
      id: 'sync',
      type: 'update' as const,
      message: 'Credit report synced successfully',
      date: connectionStatus.lastSyncAt 
        ? new Date(connectionStatus.lastSyncAt).toLocaleDateString()
        : 'Recently'
    },
    {
      id: 'score',
      type: 'score' as const,
      message: `Your average score increased by ${totalScoreIncrease} points!`,
      date: 'This month'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

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
              Welcome back, {profile?.first_name || 'there'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Your credit repair journey is progressing well. Here's your latest update.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={isRefreshing}
              className="border-border/50 hover:border-primary/50 transition-all"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/client-dashboard/smartcredit">
              <Button className="bg-gradient-to-r from-primary to-emerald-500 hover:opacity-90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
                <Link2 className="w-4 h-4 mr-2" />
                Sync Report
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Score Overview */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          {clientScores.map((score, index) => (
            <motion.div
              key={score.bureau}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="pt-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{score.bureau}</h3>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{score.score - score.previousScore}
                    </Badge>
                  </div>
                  <ScoreGauge score={score.score} size="sm" />
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Previous: {score.previousScore}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Score Summary Card */}
        <Card className="card-elevated bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Score Increase</p>
                  <p className="text-4xl font-bold text-primary">+{totalScoreIncrease} pts</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-muted-foreground">Current Average Score</p>
                <p className="text-3xl font-bold text-foreground">{averageScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress & Updates Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={itemVariants}
        >
          {/* Dispute Progress */}
          <Card className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                Dispute Progress
              </CardTitle>
              <CardDescription>Track your negative items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-medium text-primary">{progressPercent}%</span>
              </div>
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <motion.div 
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-success">{disputeProgress?.deleted || 0}</p>
                  <p className="text-xs text-muted-foreground">Deleted</p>
                </motion.div>
                <motion.div 
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-warning">{disputeProgress?.inProgress || 0}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </motion.div>
                <motion.div 
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-muted to-muted/50 border border-border"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold">{disputeProgress?.pending || 0}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </motion.div>
              </div>

              <Link to="/client-dashboard/disputes">
                <Button variant="outline" className="w-full mt-4 group hover:border-primary/50 transition-all">
                  View All Disputes
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Credit Summary */}
          <Card className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                Credit Summary
              </CardTitle>
              <CardDescription>Your credit profile overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Total Accounts', value: creditData.summary.totalAccounts, icon: Target },
                  { label: 'On-Time Payments', value: `${creditData.summary.onTimePayments}%`, icon: CheckCircle2, color: 'text-success' },
                  { label: 'Credit Utilization', value: `${creditData.summary.creditUtilization}%`, icon: Zap },
                  { label: 'Average Account Age', value: creditData.summary.avgAccountAge, icon: Calendar },
                ].map((item, index) => (
                  <motion.div 
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-muted/50 to-transparent border border-border/50 hover:border-primary/20 transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className={`font-semibold ${item.color || ''}`}>{item.value}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Updates */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    Recent Updates
                  </CardTitle>
                  <CardDescription>Latest activity on your account</CardDescription>
                </div>
                <Link to="/client-dashboard/messages">
                  <Button variant="outline" size="sm" className="hover:border-primary/50">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUpdates.map((update, index) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/20 hover:bg-muted/30 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                      update.type === 'deletion' ? 'bg-gradient-to-br from-success/20 to-success/10 text-success' :
                      update.type === 'score' ? 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {update.type === 'deletion' ? <CheckCircle2 className="w-5 h-5" /> :
                       update.type === 'score' ? <TrendingUp className="w-5 h-5" /> :
                       <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{update.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{update.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Explanation Card */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <CardContent className="py-6 relative">
              <div className="flex items-start gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg">Why Your Score Increased</h4>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {disputeProgress?.deleted && disputeProgress.deleted > 0 
                      ? `Your score improved because ${disputeProgress.deleted} negative item(s) were successfully removed from your credit report. Each removal typically improves your score by 10-50 points. With ${disputeProgress.inProgress + disputeProgress.pending} items still in dispute, we expect continued improvement.`
                      : `Your score is being actively monitored. Once disputes are processed and negative items are removed, you'll see significant improvements. Stay tuned for updates!`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Credit Coach Floating Button */}
        <AICreditCoach />
      </motion.div>
    </RoleBasedLayout>
  );
}
