import { useEffect } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { useCreditData } from '@/hooks/useCreditData';
import { useScoreHistory } from '@/hooks/useScoreHistory';
import { TrendingUp, TrendingDown, Calendar, Target, Link2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientScores() {
  const { 
    isLoading: isCreditLoading, 
    isRefreshing,
    creditData, 
    connectionStatus,
    averageScore,
    refreshData 
  } = useCreditData();

  const { 
    isLoading: isHistoryLoading, 
    history, 
    fetchHistory,
    getScoreChange 
  } = useScoreHistory();

  const isLoading = isCreditLoading || isHistoryLoading;

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Loading state
  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

  // No data state
  if (!creditData?.scores || connectionStatus.status !== 'connected') {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Score Progress</h1>
            <p className="text-muted-foreground mt-1">Track your credit score improvements over time</p>
          </div>

          <Card className="card-elevated border-primary/20">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Score Data Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Connect your SmartCredit account to view your credit scores and track improvements.
              </p>
              <Link to="/client-dashboard/smartcredit">
                <Button className="bg-gradient-primary hover:opacity-90">
                  <Link2 className="w-4 h-4 mr-2" />
                  Connect SmartCredit
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

  const currentScores = {
    experian: getNumericScore(creditData.scores?.experian),
    equifax: getNumericScore(creditData.scores?.equifax),
    transunion: getNumericScore(creditData.scores?.transunion),
  };
  
  const previousScores = {
    experian: getNumericScore(creditData.previousScores?.experian),
    equifax: getNumericScore(creditData.previousScores?.equifax),
    transunion: getNumericScore(creditData.previousScores?.transunion),
  };

  // Use real history from database
  const scoreHistory = history.length > 0 
    ? history.map(h => ({
        date: h.recorded_at,
        experian: h.experian || 0,
        equifax: h.equifax || 0,
        transunion: h.transunion || 0,
      }))
    : [];

  const scoreChanges = getScoreChange(30);

  const getChange = (current: number, previous: number) => current - previous;
  const targetScore = 720;
  const avgScore = Math.round((currentScores.experian + currentScores.equifax + currentScores.transunion) / 3);
  const pointsToGo = Math.max(0, targetScore - avgScore);
  const progressToTarget = Math.min(100, Math.max(0, Math.round((avgScore - 550) / (targetScore - 550) * 100)));

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Score Progress</h1>
            <p className="text-muted-foreground mt-1">Track your credit score improvements over time</p>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Current Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Experian
                <Badge variant={getChange(currentScores.experian, previousScores.experian) >= 0 ? 'default' : 'destructive'} className="text-xs">
                  {getChange(currentScores.experian, previousScores.experian) >= 0 ? '+' : ''}{getChange(currentScores.experian, previousScores.experian)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreGauge score={currentScores.experian} previousScore={previousScores.experian} />
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Equifax
                <Badge variant={getChange(currentScores.equifax, previousScores.equifax) >= 0 ? 'default' : 'destructive'} className="text-xs">
                  {getChange(currentScores.equifax, previousScores.equifax) >= 0 ? '+' : ''}{getChange(currentScores.equifax, previousScores.equifax)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreGauge score={currentScores.equifax} previousScore={previousScores.equifax} />
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                TransUnion
                <Badge variant={getChange(currentScores.transunion, previousScores.transunion) >= 0 ? 'default' : 'destructive'} className="text-xs">
                  {getChange(currentScores.transunion, previousScores.transunion) >= 0 ? '+' : ''}{getChange(currentScores.transunion, previousScores.transunion)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreGauge score={currentScores.transunion} previousScore={previousScores.transunion} />
            </CardContent>
          </Card>
        </div>

        {/* 30-Day Score Changes */}
        {history.length > 1 && (
          <Card className="card-elevated bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4">30-Day Score Changes</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Experian</p>
                  <p className={`text-2xl font-bold ${scoreChanges.experian >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {scoreChanges.experian >= 0 ? '+' : ''}{scoreChanges.experian}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Equifax</p>
                  <p className={`text-2xl font-bold ${scoreChanges.equifax >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {scoreChanges.equifax >= 0 ? '+' : ''}{scoreChanges.equifax}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">TransUnion</p>
                  <p className={`text-2xl font-bold ${scoreChanges.transunion >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {scoreChanges.transunion >= 0 ? '+' : ''}{scoreChanges.transunion}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score History */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Score History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scoreHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No score history yet. History will be recorded with each credit report sync.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scoreHistory.slice().reverse().map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-sm text-muted-foreground">Synced report</p>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">EXP</p>
                        <p className="font-semibold">{entry.experian}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">EQF</p>
                        <p className="font-semibold">{entry.equifax}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">TU</p>
                        <p className="font-semibold">{entry.transunion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Your Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Target Score</span>
                  <Badge>{targetScore}+</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progressToTarget}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{pointsToGo} points to go</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Estimated Timeline</span>
                  <Badge variant="outline">3-4 months</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Based on current progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
