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

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
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
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/client-dashboard/smartcredit">
              <Button className="bg-gradient-primary hover:opacity-90">
                <Link2 className="w-4 h-4 mr-2" />
                Sync Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {clientScores.map((score) => (
            <Card key={score.bureau} className="card-elevated">
              <CardContent className="pt-6">
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
          ))}
        </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dispute Progress */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Dispute Progress
              </CardTitle>
              <CardDescription>Track your negative items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-1" />
                  <p className="text-2xl font-bold text-success">{disputeProgress?.deleted || 0}</p>
                  <p className="text-xs text-muted-foreground">Deleted</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-warning/10">
                  <Clock className="w-5 h-5 text-warning mx-auto mb-1" />
                  <p className="text-2xl font-bold text-warning">{disputeProgress?.inProgress || 0}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted">
                  <AlertCircle className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-2xl font-bold">{disputeProgress?.pending || 0}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>

              <Link to="/client-dashboard/disputes">
                <Button variant="outline" className="w-full mt-4">
                  View All Disputes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Credit Summary */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Credit Summary
              </CardTitle>
              <CardDescription>Your credit profile overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Total Accounts</span>
                  <span className="font-semibold">{creditData.summary.totalAccounts}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">On-Time Payments</span>
                  <span className="font-semibold text-success">{creditData.summary.onTimePayments}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Credit Utilization</span>
                  <span className="font-semibold">{creditData.summary.creditUtilization}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Average Account Age</span>
                  <span className="font-semibold">{creditData.summary.avgAccountAge}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Updates */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Recent Updates
                </CardTitle>
                <CardDescription>Latest activity on your account</CardDescription>
              </div>
              <Link to="/client-dashboard/messages">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUpdates.map((update) => (
                <div
                  key={update.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    update.type === 'deletion' ? 'bg-success/10 text-success' :
                    update.type === 'score' ? 'bg-primary/10 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {update.type === 'deletion' ? <CheckCircle2 className="w-4 h-4" /> :
                     update.type === 'score' ? <TrendingUp className="w-4 h-4" /> :
                     <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{update.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{update.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Explanation Card */}
        <Card className="card-elevated border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Why Your Score Increased</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {disputeProgress?.deleted && disputeProgress.deleted > 0 
                    ? `Your score improved because ${disputeProgress.deleted} negative item(s) were successfully removed from your credit report. Each removal typically improves your score by 10-50 points. With ${disputeProgress.inProgress + disputeProgress.pending} items still in dispute, we expect continued improvement.`
                    : `Your score is being actively monitored. Once disputes are processed and negative items are removed, you'll see significant improvements. Stay tuned for updates!`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Credit Coach Floating Button */}
        <AICreditCoach />
      </div>
    </RoleBasedLayout>
  );
}
