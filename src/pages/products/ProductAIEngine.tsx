import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Target, BarChart3, ArrowRight, CheckCircle2, Shield, Cpu, LineChart, FileSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const ProductAIEngine = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <FileSearch className="w-5 h-5" />, text: 'Instant credit report parsing from any source — PDF, image, or text' },
    { icon: <Cpu className="w-5 h-5" />, text: 'AI-powered error, duplicate, and mixed-file detection' },
    { icon: <Target className="w-5 h-5" />, text: 'Deletion probability scoring for every disputable item' },
    { icon: <LineChart className="w-5 h-5" />, text: 'Bureau-specific strategy recommendations based on outcome data' },
    { icon: <Shield className="w-5 h-5" />, text: 'FCRA & FDCPA compliance guardrails built into every analysis' },
    { icon: <Brain className="w-5 h-5" />, text: 'Continuous learning from dispute outcomes for improving accuracy' },
  ];

  const howItWorks = [
    { step: '01', title: 'Upload Report', description: 'Upload a credit report in any format. Our OCR engine handles PDFs, images, and raw text.' },
    { step: '02', title: 'AI Analysis', description: 'Our AI parses every line, identifying errors, duplicates, and disputable items in under 10 seconds.' },
    { step: '03', title: 'Strategy Output', description: 'Receive a prioritized list of items with deletion probability scores and recommended dispute strategies.' },
    { step: '04', title: 'Generate Letters', description: 'One-click generation of bureau-specific, legally compliant dispute letters for each item.' },
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
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">The brain behind Credit AI. Analyze credit reports in seconds, catch errors humans miss, and build optimal dispute strategies — all powered by advanced AI.</p>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal delay={0.05}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
              {[
                { icon: <Brain className="w-7 h-7" />, label: 'AI Models', value: '4+' },
                { icon: <Zap className="w-7 h-7" />, label: 'Analysis Speed', value: '<10s' },
                { icon: <Target className="w-7 h-7" />, label: 'Accuracy', value: '94%' },
                { icon: <BarChart3 className="w-7 h-7" />, label: 'Items Analyzed', value: '100K+' },
              ].map((s, i) => (
                <Card key={i} className="text-center border-border hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="text-primary mb-2 flex justify-center">{s.icon}</div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollReveal>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-12 items-start mb-20">
            <ScrollReveal>
              <h2 className="text-2xl font-bold text-foreground mb-6">Intelligent Analysis at Scale</h2>
              <div className="space-y-4">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="text-primary mt-0.5">{f.icon}</div>
                    <span className="text-muted-foreground">{f.text}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" className="mt-8" onClick={() => navigate('/auth')}>
                Try It Free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </ScrollReveal>

            {/* How it works */}
            <ScrollReveal delay={0.1}>
              <h2 className="text-2xl font-bold text-foreground mb-6">How It Works</h2>
              <div className="space-y-6">
                {howItWorks.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{step.step}</div>
                    <div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-emerald-500">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to Analyze Smarter?</h2>
          <p className="text-primary-foreground/80 mb-8">Join thousands of professionals using AI-powered credit analysis.</p>
          <Button size="lg" className="bg-background text-foreground hover:bg-background/90" onClick={() => navigate('/auth')}>
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ProductAIEngine;
