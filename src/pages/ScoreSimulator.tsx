import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { cn } from '@/lib/utils';
import { useScoreSimulator } from '@/hooks/useScoreSimulator';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calculator,
  TrendingUp,
  Home,
  Car,
  CreditCard,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Loader2,
  Brain,
} from 'lucide-react';

// Default disputable items for simulation
const defaultDisputableItems = [
  {
    id: 't1',
    creditor: 'Capital One',
    accountNumber: '****4532',
    accountType: 'credit_card',
    status: 'collection',
    balance: 2450,
    bureaus: ['equifax', 'experian', 'transunion'],
    disputable: true,
    disputeReason: 'Account sold to collection agency - original creditor data outdated',
    deletionProbability: 78,
    expectedScoreImpact: 35,
  },
  {
    id: 't2',
    creditor: 'Midland Credit Management',
    accountNumber: '****7891',
    accountType: 'collection',
    status: 'collection',
    balance: 1890,
    bureaus: ['equifax', 'transunion'],
    disputable: true,
    disputeReason: 'Unable to validate debt - missing original contract',
    deletionProbability: 85,
    expectedScoreImpact: 42,
  },
  {
    id: 't3',
    creditor: 'Chase Bank',
    accountNumber: '****2345',
    accountType: 'credit_card',
    status: 'open',
    balance: 1200,
    bureaus: ['equifax', 'experian', 'transunion'],
    disputable: true,
    disputeReason: 'Late payment during COVID - goodwill adjustment possible',
    deletionProbability: 45,
    expectedScoreImpact: 18,
  },
  {
    id: 't4',
    creditor: 'Medical Center Collections',
    accountNumber: '****9012',
    accountType: 'collection',
    status: 'collection',
    balance: 425,
    bureaus: ['experian'],
    disputable: true,
    disputeReason: 'Medical debt under HIPAA - privacy violation potential',
    deletionProbability: 92,
    expectedScoreImpact: 28,
  },
];

const ScoreSimulator = () => {
  const { user } = useAuth();
  const { isProcessing, simulation, simulateDeletions, clearSimulation, statusMessage } = useScoreSimulator();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [disputableItems, setDisputableItems] = useState(defaultDisputableItems);
  const baseScore = 598;

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Calculate projected score from local selection or AI simulation
  const calculateProjectedScore = () => {
    if (simulation?.projectedScore) {
      return simulation.projectedScore;
    }
    
    const totalImpact = disputableItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((acc, item) => acc + (item.expectedScoreImpact || 0), 0);
    return baseScore + totalImpact;
  };

  const projectedScore = calculateProjectedScore();
  const scoreIncrease = projectedScore - baseScore;

  const handleRunSimulation = async () => {
    const itemsToSimulate = disputableItems.filter(item => selectedItems.includes(item.id));
    
    if (itemsToSimulate.length === 0) {
      return;
    }

    const selectedDeletions = itemsToSimulate.map(item => ({
      id: item.id,
      creditor: item.creditor,
      accountType: item.accountType,
      balance: item.balance,
      status: item.status,
      bureaus: item.bureaus,
    }));

    const currentScores = {
      experian: baseScore,
      equifax: baseScore + 5,
      transunion: baseScore - 3,
      average: baseScore,
    };

    await simulateDeletions(currentScores, selectedDeletions, disputableItems);
  };

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
              AI Score Simulator
            </h1>
            <p className="text-muted-foreground mt-1">
              See how deletions could impact your client's credit score with AI predictions.
            </p>
          </div>
          {simulation && (
            <Button variant="outline" onClick={clearSimulation}>
              Clear Simulation
            </Button>
          )}
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

        {/* AI Simulation Results */}
        {simulation && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Simulation Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-background">
                  <p className="text-sm text-muted-foreground">Confidence Level</p>
                  <p className="text-2xl font-bold text-primary">{simulation.confidence || 'High'}</p>
                </div>
                <div className="p-4 rounded-lg bg-background">
                  <p className="text-sm text-muted-foreground">Projected Score</p>
                  <p className="text-2xl font-bold text-success">{simulation.projectedScore}</p>
                </div>
                <div className="p-4 rounded-lg bg-background">
                  <p className="text-sm text-muted-foreground">Points Gained</p>
                  <p className="text-lg font-bold text-success">
                    +{simulation.pointsGained || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background">
                  <p className="text-sm text-muted-foreground">Analysis</p>
                  <p className="text-sm">{simulation.analysis?.slice(0, 100) || 'Ready for next steps'}...</p>
                </div>
              </div>
              
              {simulation.breakdown && simulation.breakdown.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium">Item-by-Item Breakdown:</p>
                  {simulation.breakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background">
                      <span className="font-medium">{item.item}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{item.confidence}</span>
                        <Badge variant="outline" className="text-success">+{item.pointsImpact} pts</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                            item.deletionProbability >= 80 && 'bg-success/10 text-success',
                            item.deletionProbability >= 50 &&
                              item.deletionProbability < 80 &&
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
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleRunSimulation}
                  disabled={selectedItems.length === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  Run AI Simulation
                </Button>
                <Button 
                  className="bg-gradient-primary hover:opacity-90"
                  disabled={selectedItems.length === 0}
                >
                  Generate Dispute Letters
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
            {isProcessing && statusMessage && (
              <p className="text-xs text-muted-foreground mt-2">{statusMessage}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ScoreSimulator;
