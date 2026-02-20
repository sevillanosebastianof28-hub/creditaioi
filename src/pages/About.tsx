import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Target, Heart, Users, Lightbulb, Shield, Brain, Zap, TrendingUp, CheckCircle2, Rocket, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const About = () => {
  const navigate = useNavigate();

  const values = [
    { icon: <Target className="w-6 h-6" />, title: 'Mission-Driven', description: 'Every decision we make is guided by our mission to make fair credit accessible to everyone.' },
    { icon: <Heart className="w-6 h-6" />, title: 'Client-First', description: 'We build for credit repair businesses and their clients, ensuring real results that change lives.' },
    { icon: <Lightbulb className="w-6 h-6" />, title: 'Innovation', description: 'We leverage the latest in AI and machine learning to stay years ahead of the industry.' },
    { icon: <Users className="w-6 h-6" />, title: 'Transparency', description: 'We believe in honest, compliant practices that build trust with every interaction.' },
    { icon: <Shield className="w-6 h-6" />, title: 'Compliance', description: 'FCRA and FDCPA compliance is baked into every feature we build — not an afterthought.' },
    { icon: <Brain className="w-6 h-6" />, title: 'Intelligence', description: 'Our AI learns from every dispute outcome, continuously improving accuracy and success rates.' },
  ];

  const milestones = [
    { year: '2024', title: 'Founded', description: 'Sebastian Sevillano launches Credit AI with a vision to transform credit repair through artificial intelligence.' },
    { year: '2024', title: 'Platform Launch', description: 'First version of the AI-powered credit repair operating system goes live, featuring automated dispute letter generation.' },
    { year: '2025', title: 'AI Engine v2', description: 'Major upgrade to the AI engine with multi-model architecture, achieving 94% dispute deletion rates.' },
    { year: '2025', title: 'White-Label Launch', description: 'Agencies can now fully brand the platform as their own, serving their clients under their identity.' },
  ];

  const stats = [
    { value: '94%', label: 'Deletion Rate', icon: <TrendingUp className="w-5 h-5" /> },
    { value: '10x', label: 'Faster Processing', icon: <Zap className="w-5 h-5" /> },
    { value: '50K+', label: 'Disputes Processed', icon: <BarChart3 className="w-5 h-5" /> },
    { value: '500+', label: 'Agencies Served', icon: <Rocket className="w-5 h-5" /> },
  ];

  const capabilities = [
    'AI-powered credit report analysis in seconds',
    'Automated dispute letter generation with legal compliance',
    'Multi-bureau dispute tracking and management',
    'Real-time score simulation and forecasting',
    'Round-based dispute workflow automation',
    'White-label platform for agency branding',
    'Client portal with self-service tools',
    'Bureau response analysis and next-step recommendations',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-10 w-auto cursor-pointer" onClick={() => navigate('/')} />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/blog')}>Blog</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/careers')}>Careers</Button>
            <Button variant="ghost" onClick={() => navigate('/')}>← Back to Home</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-3xl">
          <ScrollReveal>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Our Story</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              About <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Credit AI</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Founded by Sebastian Sevillano, Credit AI is on a mission to revolutionize the credit repair industry through artificial intelligence — making fair credit accessible to everyone.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <Card className="text-center border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">{stat.icon}</div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <Card className="overflow-hidden border-primary/20">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12 flex flex-col justify-center items-center text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-4xl font-bold text-primary-foreground mb-4">SS</div>
                    <h3 className="text-2xl font-bold text-foreground">Sebastian Sevillano</h3>
                    <p className="text-primary font-medium mb-2">Founder & CEO</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Visionary entrepreneur with deep expertise in fintech, AI, and credit repair operations.
                    </p>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <Badge className="bg-primary/10 text-primary border-primary/20 w-fit mb-4">The Vision</Badge>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Why Credit AI Exists</h2>
                    <p className="text-muted-foreground mb-4">
                      Sebastian Sevillano founded Credit AI after witnessing firsthand how manual, time-consuming, and error-prone the traditional credit repair process was. Agencies were drowning in paperwork, compliance was a guessing game, and clients were left in the dark about their progress.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      He envisioned a platform where artificial intelligence handles the heavy lifting — analyzing credit reports in seconds, generating legally-compliant dispute letters automatically, and predicting outcomes before disputes are even sent.
                    </p>
                    <p className="text-muted-foreground">
                      Today, Credit AI is the first fully AI-driven credit repair operating system, helping agencies process disputes 10x faster with a 94% deletion rate. What started as a bold idea has grown into a platform transforming how the entire industry works.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">Our Journey</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">From a bold idea to the industry's most advanced AI credit repair platform.</p>
          </ScrollReveal>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />
            <div className="space-y-8">
              {milestones.map((milestone, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className={`flex items-start gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} hidden md:block`}>
                      {i % 2 === 0 && (
                        <Card className="border-border hover:border-primary/20 transition-colors inline-block">
                          <CardContent className="p-5">
                            <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">{milestone.year}</Badge>
                            <h3 className="font-semibold text-foreground text-lg">{milestone.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    <div className="relative z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <div className="w-3 h-3 rounded-full bg-primary-foreground" />
                    </div>
                    <div className={`flex-1 ${i % 2 !== 0 ? 'md:text-left' : 'md:text-left'}`}>
                      {/* Mobile: always show. Desktop: show on alternating sides */}
                      <Card className={`border-border hover:border-primary/20 transition-colors ${i % 2 === 0 ? 'md:hidden' : ''}`}>
                        <CardContent className="p-5">
                          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">{milestone.year}</Badge>
                          <h3 className="font-semibold text-foreground text-lg">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        </CardContent>
                      </Card>
                      {i % 2 !== 0 && (
                        <Card className="border-border hover:border-primary/20 transition-colors hidden md:block">
                          <CardContent className="p-5">
                            <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">{milestone.year}</Badge>
                            <h3 className="font-semibold text-foreground text-lg">{milestone.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">Our Values</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">The principles that guide everything we build.</p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <Card className="h-full text-center border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">{v.icon}</div>
                    <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do / Capabilities */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Platform</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Credit AI Does</h2>
              <p className="text-muted-foreground mb-6">
                Credit AI is a complete operating system for credit repair agencies. We combine artificial intelligence with industry expertise to automate, optimize, and scale every aspect of the credit repair workflow.
              </p>
              <p className="text-muted-foreground">
                From the moment a client uploads their credit report to the final dispute resolution, our AI handles the analysis, letter generation, compliance checks, and outcome tracking — all while learning and improving from every result.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="grid grid-cols-1 gap-3">
                {capabilities.map((cap, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">{cap}</span>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-emerald-500">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Join the Revolution</h2>
          <p className="text-primary-foreground/80 mb-8">Ready to see what AI can do for your credit repair business?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" onClick={() => navigate('/auth')}>
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-primary-foreground hover:bg-white/10" onClick={() => navigate('/careers')}>
              We're Hiring <Rocket className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
