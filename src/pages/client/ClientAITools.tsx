import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { AICreditCoach } from '@/components/ai/AICreditCoach';
import { AIGoalRoadmap } from '@/components/ai/AIGoalRoadmap';
import { AISmartPrioritization } from '@/components/ai/AISmartPrioritization';
import { AIDisputePredictor } from '@/components/ai/AIDisputePredictor';
import { AIBureauForecaster } from '@/components/ai/AIBureauForecaster';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Target, BarChart3, Calendar, MessageSquare } from 'lucide-react';

export default function ClientAITools() {
  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">AI Credit Tools</h1>
                <p className="text-muted-foreground">
                  Powered by advanced AI to accelerate your credit repair journey
                </p>
              </div>
            </div>
          </div>
          <Badge className="bg-gradient-primary text-white border-0 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            5 AI Tools Available
          </Badge>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
            <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs font-medium">Credit Coach</p>
            <p className="text-[10px] text-muted-foreground">24/7 AI Chat</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5 border border-success/20 text-center">
            <Target className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-xs font-medium">Goal Roadmap</p>
            <p className="text-[10px] text-muted-foreground">Score Planning</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 text-center">
            <BarChart3 className="w-6 h-6 text-warning mx-auto mb-2" />
            <p className="text-xs font-medium">Smart Priority</p>
            <p className="text-[10px] text-muted-foreground">Impact Ranking</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-info/10 to-info/5 border border-info/20 text-center">
            <Sparkles className="w-6 h-6 text-info mx-auto mb-2" />
            <p className="text-xs font-medium">Success Predictor</p>
            <p className="text-[10px] text-muted-foreground">Win Probability</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20 text-center">
            <Calendar className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-xs font-medium">Response Forecast</p>
            <p className="text-[10px] text-muted-foreground">Timeline Predict</p>
          </div>
        </div>

        {/* AI Goal Roadmap - Full Width */}
        <AIGoalRoadmap />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Smart Prioritization */}
          <AISmartPrioritization />

          {/* Dispute Success Predictor */}
          <AIDisputePredictor />
        </div>

        {/* Bureau Forecaster - Full Width */}
        <AIBureauForecaster />

        {/* Floating AI Coach */}
        <AICreditCoach />
      </div>
    </RoleBasedLayout>
  );
}
