import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ArrowRight, CheckCircle2, BarChart3, Target, Gauge, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const ProductScoreSimulator = () => {
  const navigate = useNavigate();

  const features = [
    'Predict score changes before sending disputes',
    'Model different dispute scenarios side by side',
    'Bureau-specific score impact projections (Experian, Equifax, TransUnion)',
    'Understand which items have the highest score impact',
    'Timeline estimates for score improvement milestones',
    'Data-driven strategy recommendations based on simulations',
  ];

  const scenarios = [
    { label: 'Remove Collection', impact: '+45 to +85 pts', confidence: '92%' },
    { label: 'Delete Late Payment', impact: '+25 to +55 pts', confidence: '88%' },
    { label: 'Remove Inquiry', impact: '+5 to +15 pts', confidence: '95%' },
    { label: 'Delete Charge-Off', impact: '+50 to +100 pts', confidence: '85%' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-10 w-auto cursor-pointer" onClick={() => navigate('/')} />
          <Button variant="ghost" onClick={() => navigate('/')}>← Back to Home</Button>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Product</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Score Simulator</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Predict the impact of disputes before you send them. Prioritize the highest-impact items and show clients their projected outcomes.</p>
            </div>
          </ScrollReveal>

          {/* Simulation Preview */}
          <ScrollReveal delay={0.05}>
            <Card className="border-primary/20 mb-16">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2"><Calculator className="w-5 h-5 text-primary" /> Sample Score Projections</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {scenarios.map((s, i) => (
                    <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                      <p className="text-sm font-medium text-foreground mb-1">{s.label}</p>
                      <p className="text-xl font-bold text-primary">{s.impact}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.confidence} confidence</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-10 h-10 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Know Your Outcomes in Advance</h2>
              </div>
              <ul className="space-y-4 mb-8">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" onClick={() => navigate('/auth')}>
                Try the Simulator <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="space-y-4">
                {[
                  { icon: <Gauge className="w-6 h-6" />, title: 'Real-Time Projections', desc: 'See how your score changes as you select items to dispute. Instant feedback, no guessing.' },
                  { icon: <BarChart3 className="w-6 h-6" />, title: 'Outcome History', desc: 'Projections improve over time as our AI learns from real dispute outcomes across your portfolio.' },
                  { icon: <Target className="w-6 h-6" />, title: 'Client Presentations', desc: 'Show clients exactly what to expect. Build trust with data-backed projections.' },
                ].map((item, i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="text-primary mt-0.5">{item.icon}</div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-emerald-500">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Predict Before You Dispute</h2>
          <p className="text-primary-foreground/80 mb-8">Make smarter decisions with AI-powered score projections.</p>
          <Button size="lg" className="bg-background text-foreground hover:bg-background/90" onClick={() => navigate('/auth')}>
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ProductScoreSimulator;
