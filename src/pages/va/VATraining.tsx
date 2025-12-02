import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, BookOpen, PlayCircle, CheckCircle2, Clock, Award, Lightbulb, FileText } from 'lucide-react';

const trainingModules = [
  {
    id: '1',
    title: 'Understanding Credit Reports',
    description: 'Learn how to read and interpret 3-bureau credit reports',
    duration: '45 min',
    completed: true,
    lessons: 8,
    completedLessons: 8,
  },
  {
    id: '2',
    title: 'FCRA Regulations',
    description: 'Master the Fair Credit Reporting Act and consumer rights',
    duration: '1 hr',
    completed: true,
    lessons: 12,
    completedLessons: 12,
  },
  {
    id: '3',
    title: 'Dispute Letter Writing',
    description: 'How to write effective dispute letters that get results',
    duration: '1.5 hr',
    completed: false,
    lessons: 15,
    completedLessons: 10,
  },
  {
    id: '4',
    title: 'AI-Assisted Dispute Strategies',
    description: 'Using AI tools to identify and prioritize disputable items',
    duration: '30 min',
    completed: false,
    lessons: 6,
    completedLessons: 0,
  },
];

const aiInsights = [
  {
    id: '1',
    title: 'Why We Dispute Late Payments',
    description: 'Late payments have the highest negative impact on credit scores. Even one 30-day late payment can drop a score by 60-110 points.',
    category: 'Strategy',
  },
  {
    id: '2',
    title: 'Collection Account Tactics',
    description: 'Debt validation letters are effective because many collection agencies lack proper documentation.',
    category: 'Technique',
  },
  {
    id: '3',
    title: 'Bureau Response Patterns',
    description: 'Experian typically responds faster (15-20 days) while Equifax often takes the full 30 days.',
    category: 'Insight',
  },
];

export default function VATraining() {
  const totalLessons = trainingModules.reduce((acc, m) => acc + m.lessons, 0);
  const completedLessons = trainingModules.reduce((acc, m) => acc + m.completedLessons, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Training</h1>
          <p className="text-muted-foreground mt-1">Learn credit repair strategies and understand AI decisions</p>
        </div>

        {/* Progress Overview */}
        <Card className="card-elevated border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Training Progress</h3>
                  <p className="text-sm text-muted-foreground">{completedLessons} of {totalLessons} lessons completed</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">{overallProgress}%</span>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* Training Modules */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Training Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainingModules.map((module) => {
                const progress = Math.round((module.completedLessons / module.lessons) * 100);
                return (
                  <div key={module.id} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{module.title}</h4>
                          {module.completed && (
                            <Badge className="bg-success/10 text-success border-success/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      </div>
                      <Button variant={module.completed ? 'outline' : 'default'} size="sm">
                        {module.completed ? (
                          <>
                            <BookOpen className="w-4 h-4 mr-1" />
                            Review
                          </>
                        ) : module.completedLessons > 0 ? (
                          <>
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Continue
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={progress} className="h-1.5" />
                      </div>
                      <span className="text-sm text-muted-foreground">{module.completedLessons}/{module.lessons} lessons</span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {module.duration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Insights: Why We Dispute
            </CardTitle>
            <CardDescription>
              Understand the reasoning behind AI dispute recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge variant="outline">{insight.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Quick Reference Guides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-auto py-4">
                <FileText className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">FCRA Letter Templates</p>
                  <p className="text-xs text-muted-foreground">12 templates</p>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4">
                <FileText className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Bureau Contact Info</p>
                  <p className="text-xs text-muted-foreground">Addresses & fax numbers</p>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4">
                <FileText className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Statute of Limitations</p>
                  <p className="text-xs text-muted-foreground">By state reference</p>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4">
                <FileText className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Response Handling Guide</p>
                  <p className="text-xs text-muted-foreground">Next steps for each response type</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
