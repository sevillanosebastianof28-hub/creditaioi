import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Brain, Shield, Zap, Target, ArrowRight, ArrowLeft, 
  CheckCircle2, Users, TrendingUp, Lock, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlowingCard } from '@/components/landing/GlowingCard';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/landing/ScrollReveal';
import { GlowText } from '@/components/landing/TextReveal';
import { MagneticButton } from '@/components/landing/MagneticButton';
import { AnimatedCounter } from '@/components/landing/AnimatedCounter';

const WhyUs = () => {
  const navigate = useNavigate();

  const advantages = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "10x Faster Processing",
      description: "What takes hours manually, our AI does in seconds. Process more clients with less effort and scale your business without adding overhead.",
      stat: "10x",
      statLabel: "Speed increase"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Precision Targeting",
      description: "AI identifies the highest-impact items first, maximizing score improvement per dispute round. No wasted effort on low-probability disputes.",
      stat: "94%",
      statLabel: "Deletion rate"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Built-In Compliance",
      description: "FCRA-compliant templates and automatic guardrails prevent illegal or risky disputes. Stay protected while delivering results.",
      stat: "100%",
      statLabel: "Compliant"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Self-Improving AI",
      description: "Our AI learns from every dispute outcome, continuously improving accuracy and success rates. The more you use it, the smarter it gets.",
      stat: "∞",
      statLabel: "Learning"
    }
  ];

  const comparisons = [
    { feature: "Credit Report Parsing", us: "Seconds (AI)", others: "30-60 min (manual)" },
    { feature: "Dispute Letter Generation", us: "One-click, auto-generated", others: "Manual templates" },
    { feature: "Success Prediction", us: "AI-powered probability scores", others: "Guesswork" },
    { feature: "Compliance Checking", us: "Automatic FCRA guardrails", others: "Manual review" },
    { feature: "Bureau Response Tracking", us: "Real-time automated", others: "Spreadsheets" },
    { feature: "Strategy Optimization", us: "AI learns & adapts", others: "Static playbooks" },
  ];

  const stats = [
    { value: 94, suffix: "%", label: "Deletion Rate" },
    { value: 45, suffix: "+", label: "Avg Points Gained" },
    { value: 10, suffix: "x", label: "Faster Processing" },
    { value: 24, suffix: "/7", label: "AI Availability" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-10 w-auto" />
            </button>
            <MagneticButton
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">The AI Advantage</Badge>
          </motion.div>
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            Why Credit AI is <GlowText>Different</GlowText>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            We built this from the ground up with AI at the core—not bolted on as an afterthought. Here's why credit repair professionals choose us.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.1}>
            {stats.map((stat, i) => (
              <StaggerItem key={i}>
                <GlowingCard className="p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm font-medium text-foreground">{stat.label}</div>
                </GlowingCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Four Pillars of <GlowText>Excellence</GlowText>
            </h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {advantages.map((adv, i) => (
              <StaggerItem key={i}>
                <GlowingCard className="group h-full" glowColor="rgba(16, 185, 129, 0.25)">
                  <motion.div whileHover={{ y: -8 }}>
                    <CardContent className="p-8 text-center relative overflow-hidden">
                      <motion.div 
                        className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className="text-sm font-bold text-primary">{adv.stat}</span>
                      </motion.div>
                      <motion.div 
                        className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 mb-6"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <motion.div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative text-primary group-hover:text-white transition-colors duration-300">
                          {adv.icon}
                        </div>
                      </motion.div>
                      <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{adv.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{adv.description}</p>
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{adv.statLabel}</span>
                      </div>
                    </CardContent>
                  </motion.div>
                </GlowingCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Credit AI vs. <GlowText>Traditional Tools</GlowText>
            </h2>
            <p className="text-muted-foreground">See how AI transforms every step of the credit repair process.</p>
          </ScrollReveal>
          <ScrollReveal>
            <GlowingCard>
              <CardContent className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-sm font-semibold text-foreground">Feature</th>
                        <th className="text-left p-4 text-sm font-semibold text-primary">
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Credit AI
                          </span>
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Others</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisons.map((row, i) => (
                        <motion.tr 
                          key={i} 
                          className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <td className="p-4 text-sm font-medium text-foreground">{row.feature}</td>
                          <td className="p-4 text-sm text-primary flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            {row.us}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{row.others}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </GlowingCard>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-2xl">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6">
              Experience the Difference
            </h2>
            <p className="text-muted-foreground mb-8">
              Start your free trial today and see why credit repair professionals are switching to AI-powered solutions.
            </p>
            <MagneticButton
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg shadow-xl shadow-primary/25 rounded-xl font-medium flex items-center gap-2 mx-auto"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default WhyUs;
