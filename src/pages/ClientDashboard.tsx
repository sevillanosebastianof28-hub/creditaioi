import { useAuth } from '@/contexts/AuthContext';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for client dashboard
const clientScores = [
  { bureau: 'Experian', score: 642, previousScore: 598 },
  { bureau: 'Equifax', score: 635, previousScore: 590 },
  { bureau: 'TransUnion', score: 628, previousScore: 585 },
];

const disputeProgress = {
  total: 12,
  deleted: 5,
  inProgress: 4,
  pending: 3,
};

const recentUpdates = [
  { id: 1, type: 'deletion', message: 'Collection account from ABC Collections deleted from Experian', date: '2 days ago' },
  { id: 2, type: 'letter', message: 'Round 2 dispute letters sent to all bureaus', date: '5 days ago' },
  { id: 3, type: 'score', message: 'Your Experian score increased by 22 points!', date: '1 week ago' },
  { id: 4, type: 'update', message: 'Credit report synced successfully', date: '1 week ago' },
];

const upcomingMilestones = [
  { id: 1, title: 'Bureau Response Expected', date: 'Dec 15, 2024', status: 'upcoming' },
  { id: 2, title: 'Round 3 Letters Ready', date: 'Dec 20, 2024', status: 'upcoming' },
  { id: 3, title: 'Estimated 700+ Score', date: 'Jan 2025', status: 'goal' },
];

export default function ClientDashboard() {
  const { profile } = useAuth();
  const avgScore = Math.round(clientScores.reduce((acc, s) => acc + s.score, 0) / clientScores.length);
  const avgPrevScore = Math.round(clientScores.reduce((acc, s) => acc + s.previousScore, 0) / clientScores.length);
  const totalIncrease = avgScore - avgPrevScore;
  const progressPercent = Math.round((disputeProgress.deleted / disputeProgress.total) * 100);

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
          <Link to="/client-dashboard/smartcredit">
            <Button className="bg-gradient-primary hover:opacity-90">
              <Link2 className="w-4 h-4 mr-2" />
              Sync Credit Report
            </Button>
          </Link>
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
                  <p className="text-4xl font-bold text-primary">+{totalIncrease} pts</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-muted-foreground">Current Average Score</p>
                <p className="text-3xl font-bold text-foreground">{avgScore}</p>
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
                  <p className="text-2xl font-bold text-success">{disputeProgress.deleted}</p>
                  <p className="text-xs text-muted-foreground">Deleted</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-warning/10">
                  <Clock className="w-5 h-5 text-warning mx-auto mb-1" />
                  <p className="text-2xl font-bold text-warning">{disputeProgress.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted">
                  <AlertCircle className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-2xl font-bold">{disputeProgress.pending}</p>
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

          {/* Upcoming Milestones */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Your Roadmap
              </CardTitle>
              <CardDescription>Upcoming milestones in your journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      milestone.status === 'goal' ? 'bg-primary' : 'bg-info'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{milestone.title}</p>
                      <p className="text-xs text-muted-foreground">{milestone.date}</p>
                    </div>
                  </div>
                ))}
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
                    update.type === 'letter' ? 'bg-info/10 text-info' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {update.type === 'deletion' ? <CheckCircle2 className="w-4 h-4" /> :
                     update.type === 'score' ? <TrendingUp className="w-4 h-4" /> :
                     update.type === 'letter' ? <FileText className="w-4 h-4" /> :
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
                  Your Experian score jumped 22 points because the ABC Collections account 
                  was successfully removed. This collection was weighing down your score by 
                  approximately 40-60 points. With continued progress on your other disputes, 
                  we estimate you could reach 700+ by January 2025.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
