import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const ProductScoreSimulator = () => {
  const navigate = useNavigate();
  const features = [
    'Predict score changes before sending disputes',
    'Model different dispute scenarios side by side',
    'Bureau-specific score impact projections',
    'Understand which items have the highest score impact',
    'Timeline estimates for score improvement',
    'Data-driven strategy recommendations',
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
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Predict the impact of disputes before you send them. Our AI simulates score changes so you can prioritize the highest-impact items.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
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
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default ProductScoreSimulator;
