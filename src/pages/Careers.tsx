import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Heart, Zap, Globe, ArrowRight, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const openRoles = [
  { title: 'Senior AI/ML Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time', description: 'Build and improve our AI models for credit report analysis and dispute optimization.' },
  { title: 'Full Stack Developer', dept: 'Engineering', location: 'Remote', type: 'Full-time', description: 'Develop features across our React frontend and serverless backend.' },
  { title: 'Head of Compliance', dept: 'Legal', location: 'Remote', type: 'Full-time', description: 'Ensure all platform features meet FCRA, FDCPA, and state-level regulations.' },
  { title: 'Customer Success Manager', dept: 'Operations', location: 'Remote', type: 'Full-time', description: 'Help credit repair businesses onboard and get maximum value from Credit AI.' },
];

const perks = [
  { icon: <Globe className="w-6 h-6" />, title: 'Remote First', description: 'Work from anywhere in the world. We care about results, not location.' },
  { icon: <Rocket className="w-6 h-6" />, title: 'Equity', description: 'Every team member gets equity. We succeed together.' },
  { icon: <Heart className="w-6 h-6" />, title: 'Health & Wellness', description: 'Comprehensive health insurance and wellness stipend.' },
  { icon: <Zap className="w-6 h-6" />, title: 'Growth Budget', description: '$2,000/year for conferences, courses, and professional development.' },
];

const Careers = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-10 w-auto cursor-pointer" onClick={() => navigate('/')} />
          <Button variant="ghost" onClick={() => navigate('/')}>← Back to Home</Button>
        </div>
      </nav>

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-3xl">
          <ScrollReveal>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Careers</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Join the Team</h1>
            <p className="text-lg text-muted-foreground">Help us build the future of credit repair. We're looking for passionate people who want to make a real impact.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Perks */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <Card className="h-full text-center border-border hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">{perk.icon}</div>
                    <h3 className="font-semibold text-foreground mb-1">{perk.title}</h3>
                    <p className="text-sm text-muted-foreground">{perk.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="container mx-auto max-w-4xl pt-16">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-foreground text-center mb-10">Open Positions</h2>
          </ScrollReveal>
          <div className="space-y-4">
            {openRoles.map((role, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <Card className="border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{role.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <Badge variant="secondary" className="text-xs">{role.dept}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{role.location}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{role.type}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="shrink-0">
                      Apply <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-2xl">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-foreground mb-4">Don't see your role?</h2>
            <p className="text-muted-foreground mb-6">We're always looking for exceptional talent. Send us your resume and tell us how you'd contribute.</p>
            <Button size="lg" onClick={() => navigate('/contact')}>Get in Touch <ArrowRight className="ml-2 w-4 h-4" /></Button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Careers;
