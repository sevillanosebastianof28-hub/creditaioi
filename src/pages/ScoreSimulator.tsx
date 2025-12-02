import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { mockTradelines } from '@/data/mockData';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { cn } from '@/lib/utils';
import {
  Calculator,
  TrendingUp,
  Home,
  Car,
  CreditCard,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const ScoreSimulator = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const baseScore = 598;

  const disputableItems = mockTradelines.filter((t) => t.disputable);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const calculateProjectedScore = () => {
    const totalImpact = disputableItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((acc, item) => acc + (item.expectedScoreImpact || 0), 0);
    return baseScore + totalImpact;
  };

  const projectedScore = calculateProjectedScore();
  const scoreIncrease = projectedScore - baseScore;

  const loanQualifications = [
    {
      type: 'FHA Mortgage',
      icon: Home,
      minScore: 580,
      currentStatus: baseScore >= 580,
      projectedStatus: projectedScore >= 580,
    },
    {
      type: 'Conventional Mortgage',
      icon: Home,
      minScore: 620,
      currentStatus: baseScore >= 620,
      projectedStatus: projectedScore >= 620,
    },
    {
      type: 'Prime Auto Loan',
      icon: Car,
      minScore: 660,
      currentStatus: baseScore >= 660,
      projectedStatus: projectedScore >= 660,
    },
    {
      type: 'Premium Credit Card',
      icon: CreditCard,
      minScore: 700,
      currentStatus: baseScore >= 700,
      projectedStatus: projectedScore >= 700,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Calculator className="w-8 h-8 text-primary" />
              Score Simulator
            </h1>
            <p className="text-muted-foreground mt-1">
              See how deletions could impact your client's credit score.
            </p>
          </div>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Current Score</p>
              <ScoreGauge score={baseScore} bureau="Average" size="lg" />
            </div>
          </Card>

          <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Projected Score</p>
              <ScoreGauge
                score={projectedScore}
                previousScore={baseScore}
                bureau="After Deletions"
                size="lg"
              />
              {scoreIncrease > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold">+{scoreIncrease} points potential</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg">Loan Qualifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {loanQualifications.map((loan) => (
                <div
                  key={loan.type}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    !loan.currentStatus && loan.projectedStatus && 'border-success/50 bg-success/5',
                    loan.currentStatus && 'border-border',
                    !loan.currentStatus && !loan.projectedStatus && 'border-border opacity-60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <loan.icon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{loan.type}</p>
                      <p className="text-xs text-muted-foreground">Min: {loan.minScore}</p>
                    </div>
                  </div>
                  {loan.projectedStatus ? (
                    <CheckCircle
                      className={cn(
                        'w-5 h-5',
                        loan.currentStatus ? 'text-success' : 'text-success animate-pulse'
                      )}
                    />
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Need +{loan.minScore - projectedScore}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Item Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Select Items to Simulate Deletion
              </span>
              <Badge variant="secondary">
                {selectedItems.length} of {disputableItems.length} selected
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {disputableItems.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    )}
                    onClick={() => toggleItem(item.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="data-[state=checked]:bg-primary"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold">{item.creditor}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            item.deletionProbability! >= 80 && 'bg-success/10 text-success',
                            item.deletionProbability! >= 50 &&
                              item.deletionProbability! < 80 &&
                              'bg-warning/10 text-warning'
                          )}
                        >
                          {item.deletionProbability}% likely
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${item.balance.toLocaleString()} · {item.accountType.replace('_', ' ')}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Score Impact</p>
                      <p
                        className={cn(
                          'text-lg font-bold',
                          isSelected ? 'text-success' : 'text-muted-foreground'
                        )}
                      >
                        +{item.expectedScoreImpact}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-secondary">
              <div>
                <p className="text-sm text-muted-foreground">Total Potential Increase</p>
                <p className="text-2xl font-bold text-success">+{scoreIncrease} points</p>
              </div>
              <Button className="bg-gradient-primary hover:opacity-90">
                Generate Dispute Letters
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ScoreSimulator;
