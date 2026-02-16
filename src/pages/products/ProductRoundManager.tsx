import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, ArrowRight, CheckCircle2, Users, Calendar, RefreshCw, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const ProductRoundManager = () => {
  const navigate = useNavigate();

  const features = [
    'Organize disputes into structured, trackable rounds',
    'AI recommends optimal items per round for maximum impact',
    'Track round progress across all three bureaus simultaneously',
    'Automatic follow-up scheduling when response deadlines approach',
    'Response tracking and outcome logging per item',
    'Multi-client round management dashboard for agency owners',
  ];

  const roundFlow = [
    { step: 'Round 1', title: 'Initial Disputes', description: 'Send first-round dispute letters to all three bureaus for priority items.', icon: <ClipboardList className="w-5 h-5" /> },
    { step: 'Round 2', title: 'Follow Up', description: 'Escalate unresolved items with stronger legal language and additional evidence.', icon: <RefreshCw className="w-5 h-5" /> },
    { step: 'Round 3', title: 'Targeted Escalation', description: 'Address remaining items with specialized letters tailored to bureau-specific patterns.', icon: <Layers className="w-5 h-5" /> },
    { step: 'Ongoing', title: 'Continuous Monitoring', description: 'Track new items and score changes, launching additional rounds as needed.', icon: <Calendar className="w-5 h-5" /> },
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
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Round Manager</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Manage multi-round dispute campaigns with AI-powered recommendations. Keep every client's progress organized, on track, and optimized for results.</p>
            </div>
          </ScrollReveal>

          {/* Round Flow */}
          <ScrollReveal delay={0.05}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              {roundFlow.map((round, i) => (
                <Card key={i} className="border-border hover:border-primary/20 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{round.icon}</div>
                      <Badge variant="secondary" className="text-xs">{round.step}</Badge>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{round.title}</h3>
                    <p className="text-xs text-muted-foreground">{round.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-6">
                <Layers className="w-10 h-10 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Structured Dispute Campaigns</h2>
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
                Start Managing Rounds <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Multi-Client Overview</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Client A', round: 'Round 2', items: 8, status: 'In Progress' },
                      { name: 'Client B', round: 'Round 1', items: 12, status: 'Pending' },
                      { name: 'Client C', round: 'Round 3', items: 3, status: 'Responded' },
                    ].map((client, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.round} · {client.items} items</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">{client.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-emerald-500">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Organize Your Dispute Campaigns</h2>
          <p className="text-primary-foreground/80 mb-8">AI-powered round management for professional credit repair.</p>
          <Button size="lg" className="bg-background text-foreground hover:bg-background/90" onClick={() => navigate('/auth')}>
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ProductRoundManager;
