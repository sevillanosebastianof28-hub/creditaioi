import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';

const scoreHistory = [
  { date: '2024-01-15', experian: 580, equifax: 575, transunion: 582 },
  { date: '2024-02-15', experian: 595, equifax: 590, transunion: 598 },
  { date: '2024-03-15', experian: 612, equifax: 608, transunion: 615 },
  { date: '2024-04-15', experian: 628, equifax: 625, transunion: 630 },
  { date: '2024-05-15', experian: 645, equifax: 640, transunion: 648 },
];

export default function ClientScores() {
  const currentScores = scoreHistory[scoreHistory.length - 1];
  const previousScores = scoreHistory[scoreHistory.length - 2];

  const getChange = (current: number, previous: number) => current - previous;

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Score Progress</h1>
          <p className="text-muted-foreground mt-1">Track your credit score improvements over time</p>
        </div>

        {/* Current Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Experian
                <Badge variant={getChange(currentScores.experian, previousScores.experian) > 0 ? 'default' : 'destructive'} className="text-xs">
                  {getChange(currentScores.experian, previousScores.experian) > 0 ? '+' : ''}{getChange(currentScores.experian, previousScores.experian)}
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
                <Badge variant={getChange(currentScores.equifax, previousScores.equifax) > 0 ? 'default' : 'destructive'} className="text-xs">
                  {getChange(currentScores.equifax, previousScores.equifax) > 0 ? '+' : ''}{getChange(currentScores.equifax, previousScores.equifax)}
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
                <Badge variant={getChange(currentScores.transunion, previousScores.transunion) > 0 ? 'default' : 'destructive'} className="text-xs">
                  {getChange(currentScores.transunion, previousScores.transunion) > 0 ? '+' : ''}{getChange(currentScores.transunion, previousScores.transunion)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreGauge score={currentScores.transunion} previousScore={previousScores.transunion} />
            </CardContent>
          </Card>
        </div>

        {/* Score History */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Score History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoreHistory.slice().reverse().map((entry, index) => (
                <div key={entry.date} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{new Date(entry.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    <p className="text-sm text-muted-foreground">Monthly report</p>
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
                  <Badge>720+</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">72 points to go</p>
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
