import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Target, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const ProductAIEngine = () => {
  const navigate = useNavigate();
  const features = [
    'Instant credit report parsing from any source',
    'AI-powered error and duplicate detection',
    'Deletion probability scoring for every item',
    'Bureau-specific strategy recommendations',
    'Compliance guardrails built into every analysis',
    'Continuous learning from dispute outcomes',
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
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">AI Credit Analysis Engine</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">The brain behind Credit AI. Our AI Engine analyzes credit reports in seconds, identifying errors humans miss and building optimal dispute strategies.</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <ScrollReveal>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Intelligent Analysis at Scale</h2>
                <ul className="space-y-4">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="mt-8" onClick={() => navigate('/auth')}>
                  Try It Free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Brain className="w-8 h-8" />, label: 'AI Models', value: '4+' },
                  { icon: <Zap className="w-8 h-8" />, label: 'Analysis Speed', value: '<10s' },
                  { icon: <Target className="w-8 h-8" />, label: 'Accuracy', value: '94%' },
                  { icon: <BarChart3 className="w-8 h-8" />, label: 'Items Analyzed', value: '100K+' },
                ].map((s, i) => (
                  <Card key={i} className="text-center border-border">
                    <CardContent className="p-6">
                      <div className="text-primary mb-2 flex justify-center">{s.icon}</div>
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductAIEngine;
