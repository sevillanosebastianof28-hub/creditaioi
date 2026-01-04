import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, 
  Brain, 
  Shield, 
  Zap, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Clock,
  Target,
  BarChart3,
  Bot,
  Lock,
  Rocket,
  Play,
  ChevronRight,
  Layers,
  Globe,
  MousePointerClick,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Hero3D } from '@/components/landing/Hero3D';
import { ParticleField } from '@/components/landing/ParticleField';
import { FloatingElements } from '@/components/landing/FloatingElements';
import { AnimatedCounter } from '@/components/landing/AnimatedCounter';
import { GlowingCard } from '@/components/landing/GlowingCard';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/landing/ScrollReveal';
import { TextReveal, GlowText } from '@/components/landing/TextReveal';
import { MagneticButton } from '@/components/landing/MagneticButton';

const Landing = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Credit Analysis",
      description: "Instantly parse and analyze credit reports from any source. Our AI identifies errors, duplicates, and opportunities humans miss.",
      color: "from-violet-500 to-purple-600"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "One-Click Disputes",
      description: "Generate bureau-specific dispute letters in seconds. FCRA-compliant templates for every situation.",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Score Prediction",
      description: "Know your expected outcomes before sending disputes. AI predicts deletion probability and score impact.",
      color: "from-emerald-500 to-green-600"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Compliance Engine",
      description: "Built-in FCRA compliance guardrails. Automatic blocking of illegal disputes and fraudulent claims.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Real-Time Tracking",
      description: "Monitor every dispute, response, and score change across all three bureaus in real-time.",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Smart Prioritization",
      description: "AI identifies high-impact items first. Focus on deletions that maximize score improvement.",
      color: "from-indigo-500 to-blue-600"
    }
  ];

  const stats = [
    { value: 94, suffix: "%", label: "Deletion Rate", sublabel: "In beta testing" },
    { value: 45, suffix: "+", label: "Avg Points", sublabel: "Score improvement" },
    { value: 10, suffix: "x", label: "Faster", sublabel: "Than manual processing" },
    { value: 24, suffix: "/7", label: "Support", sublabel: "Always here to help" }
  ];

  const advantages = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "10x Faster Processing",
      description: "What takes hours manually, our AI does in seconds. Process more clients with less effort.",
      stat: "10x",
      statLabel: "Speed increase"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Precision Targeting",
      description: "AI identifies the highest-impact items first, maximizing score improvement per dispute round.",
      stat: "94%",
      statLabel: "Deletion rate"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Built-In Compliance",
      description: "FCRA-compliant templates and automatic guardrails prevent illegal or risky disputes.",
      stat: "100%",
      statLabel: "Compliant"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Learns & Improves",
      description: "Our AI learns from every dispute, continuously improving accuracy and success rates.",
      stat: "∞",
      statLabel: "Learning"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$149",
      period: "/month",
      description: "Perfect for solo practitioners",
      features: [
        "Up to 25 active clients",
        "AI credit report analysis",
        "Automated dispute generation",
        "Client portal access",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$349",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Up to 100 active clients",
        "Everything in Starter",
        "VA staff accounts",
        "SmartCredit integration",
        "Priority support",
        "Custom branding"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$799",
      period: "/month",
      description: "For multi-location businesses",
      features: [
        "Unlimited clients",
        "Everything in Professional",
        "Multi-location support",
        "API access",
        "Dedicated success manager",
        "Custom integrations"
      ],
      popular: false
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Import Reports",
      description: "Connect SmartCredit, IdentityIQ, or upload PDFs. AI parses everything in seconds.",
      icon: <Layers className="w-5 h-5" />
    },
    {
      step: "02", 
      title: "AI Analysis",
      description: "Our AI identifies errors, calculates deletion probability, and creates optimal strategy.",
      icon: <Brain className="w-5 h-5" />
    },
    {
      step: "03",
      title: "Generate & Send",
      description: "One-click dispute generation for all bureaus. Track responses in real-time.",
      icon: <Rocket className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          backgroundColor: scrollY > 50 ? 'hsl(var(--background) / 0.8)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid hsl(var(--border) / 0.5)' : 'none'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            <motion.div 
              className="flex items-center flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <img 
                src="/images/credit-ai-logo.png" 
                alt="Credit AI Platform" 
                className="h-14 sm:h-16 md:h-20 w-auto object-contain" 
              />
            </motion.div>
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {['Features', 'How It Works', 'Pricing', 'Why Us'].map((item, i) => (
                <motion.a 
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`} 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </motion.a>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button variant="ghost" onClick={() => navigate('/auth')} className="text-muted-foreground hover:text-foreground hidden sm:inline-flex">
                  Sign In
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <MagneticButton
                  onClick={() => navigate('/auth')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all text-sm sm:text-base px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen flex items-center">
        {/* 3D Background */}
        <Hero3D />
        
        {/* Particle Field */}
        <ParticleField />
        
        {/* Floating Elements */}
        <FloatingElements />
        
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
              top: '5%',
              right: '10%',
            }}
          />
          <motion.div 
            className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.15, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: 'radial-gradient(circle, hsl(160 84% 50% / 0.25) 0%, transparent 70%)',
              bottom: '10%',
              left: '5%',
            }}
          />
        </div>
        
        {/* Grid pattern with gradient mask */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <motion.div 
          className="container mx-auto relative z-10"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          <div className="text-center max-w-4xl mx-auto">
            {/* Animated Badge */}
            <TextReveal delay={0}>
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 cursor-default"
                whileHover={{ scale: 1.05, borderColor: 'hsl(var(--primary) / 0.5)' }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium text-primary">First AI-Driven Credit Repair Platform</span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
              </motion.div>
            </TextReveal>
            
            <TextReveal delay={0.15}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-[1.1] tracking-tight">
                The Future of{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent bg-[size:200%] animate-[gradient_3s_ease_infinite]">
                    Credit Repair
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <motion.path 
                      d="M2 10C50 4 100 4 150 6C200 8 250 4 298 10" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.4 }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </svg>
                </span>
                <br className="hidden sm:block" />
                <span className="sm:ml-0">is Here</span>
              </h1>
            </TextReveal>
            
            <TextReveal delay={0.3}>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
                Revolutionary AI technology that analyzes credit reports, generates dispute letters, 
                and predicts outcomes—all in seconds. Transform your business into a credit repair powerhouse.
              </p>
            </TextReveal>
            
            {/* CTA Buttons */}
            <TextReveal delay={0.45}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <MagneticButton
                  onClick={() => navigate('/auth')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all group relative overflow-hidden rounded-xl font-medium flex items-center"
                >
                  <span className="relative z-10 flex items-center">
                    Start Free Trial
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity bg-[size:200%]"
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </MagneticButton>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-6 text-lg border-border hover:bg-secondary/50 group transition-all rounded-xl"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Play className="w-5 h-5 mr-2" />
                    </motion.span>
                    Watch Demo
                  </Button>
                </motion.div>
              </div>
            </TextReveal>

            {/* Stats */}
            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto" staggerDelay={0.1}>
              {stats.map((stat, index) => (
                <StaggerItem key={index}>
                  <GlowingCard className="p-4 sm:p-6 group">
                    <motion.div 
                      className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </motion.div>
                    <div className="text-xs sm:text-sm font-medium text-foreground">{stat.label}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.sublabel}</div>
                  </GlowingCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <MousePointerClick className="w-5 h-5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
        </motion.div>
      </section>

      {/* Trusted By Banner */}
      <section className="py-6 sm:py-8 border-y border-border/50 bg-secondary/20 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-16 text-muted-foreground">
            {[
              { icon: <Bot className="w-5 h-5" />, text: "AI Credit Analysis" },
              { icon: <FileText className="w-5 h-5" />, text: "Auto Letter Generation" },
              { icon: <BarChart3 className="w-5 h-5" />, text: "Score Prediction" },
              { icon: <Lock className="w-5 h-5" />, text: "FCRA Compliant" },
              { icon: <Globe className="w-5 h-5" />, text: "All 3 Bureaus" },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="flex items-center gap-2 opacity-60 hover:opacity-100 hover:text-primary transition-all cursor-default"
                whileHover={{ scale: 1.1, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 0.6, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {item.icon}
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="container mx-auto">
          <ScrollReveal className="text-center mb-10 sm:mb-16">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">Features</Badge>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              AI-Powered <GlowText>Everything</GlowText>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              From credit report analysis to dispute generation, our AI handles the heavy lifting 
              so you can focus on growing your business.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" staggerDelay={0.1}>
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <GlowingCard 
                  className="group h-full"
                  glowColor={`rgba(16, 185, 129, 0.2)`}
                >
                  <CardContent className="p-8 relative">
                    <motion.div 
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-6 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    
                    <motion.div 
                      className="mt-4 flex items-center gap-1 text-primary"
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Learn more</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </CardContent>
                </GlowingCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30 relative overflow-hidden">
        {/* Background decoration */}
        <motion.div 
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="container mx-auto relative">
          <ScrollReveal className="text-center mb-10 sm:mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">How It Works</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Simple. Powerful. <GlowText>Automated.</GlowText>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Get started in minutes and let AI do the heavy lifting.
            </p>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-8 relative">
              {/* Animated connection line */}
              <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-1 overflow-hidden rounded-full bg-border">
                <motion.div 
                  className="h-full w-1/3 bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                  animate={{ x: ['0%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              
              {workflowSteps.map((item, index) => (
                <ScrollReveal key={index} delay={index * 0.15}>
                  <motion.div 
                    className="relative text-center group"
                    whileHover={{ y: -5 }}
                  >
                    {/* Step circle */}
                    <motion.div 
                      className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-card border-2 border-primary/20 shadow-xl mb-4 sm:mb-6 relative group-hover:border-primary/50 group-hover:shadow-primary/20 transition-all"
                      whileHover={{ scale: 1.05, rotate: 2 }}
                    >
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">{item.step}</span>
                      <motion.div 
                        className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                      >
                        {item.icon}
                      </motion.div>
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2 md:px-0">{item.description}</p>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl top-1/4 -left-48"
            animate={{ 
              x: [0, 50, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl bottom-1/4 -right-40"
            animate={{ 
              x: [0, -50, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          />
        </div>
        
        <div className="container mx-auto relative">
          <ScrollReveal className="text-center mb-10 sm:mb-16">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">The AI Advantage</Badge>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Why Credit AI is <GlowText>Different</GlowText>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              We built this from the ground up with AI at the core—not bolted on as an afterthought.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto" staggerDelay={0.1}>
            {advantages.map((advantage, index) => (
              <StaggerItem key={index}>
                <GlowingCard 
                  className="group transition-all duration-500"
                  glowColor="rgba(16, 185, 129, 0.25)"
                >
                  <motion.div whileHover={{ y: -8 }}>
                    <CardContent className="p-6 sm:p-8 text-center relative overflow-hidden">
                      {/* Floating stat badge */}
                      <motion.div 
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 sm:px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className="text-xs sm:text-sm font-bold text-primary">{advantage.stat}</span>
                      </motion.div>
                      
                      {/* Icon with animated background */}
                      <motion.div 
                        className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 mb-4 sm:mb-6"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <motion.div 
                          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                        />
                        <div className="relative text-primary group-hover:text-white transition-colors duration-300">
                          {advantage.icon}
                        </div>
                      </motion.div>
                      
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors">{advantage.title}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{advantage.description}</p>
                      
                      {/* Bottom stat label */}
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
                        <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{advantage.statLabel}</span>
                      </div>
                    </CardContent>
                  </motion.div>
                </GlowingCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Additional CTA */}
          <ScrollReveal className="text-center mt-10 sm:mt-16">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-secondary/50 border border-border hover:border-primary/30 transition-all group cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </motion.div>
              <span className="text-sm sm:text-base text-foreground font-medium">Experience the future of credit repair</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              </motion.div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30 relative overflow-hidden">
        <motion.div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="container mx-auto relative">
          <ScrollReveal className="text-center mb-10 sm:mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">Pricing</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Plans for <GlowText>Every Business</GlowText>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Start with a 14-day free trial. No credit card required.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto items-start" staggerDelay={0.15}>
            {pricingPlans.map((plan, index) => (
              <StaggerItem key={index}>
                <GlowingCard 
                  className={`relative transition-all duration-300 ${
                    plan.popular 
                      ? 'md:scale-105 z-10 border-primary' 
                      : ''
                  }`}
                  glowColor={plan.popular ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.15)'}
                >
                  <motion.div whileHover={{ y: plan.popular ? 0 : -8 }}>
                    {plan.popular && (
                      <motion.div 
                        className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge className="bg-primary text-primary-foreground px-3 sm:px-4 py-1 shadow-lg text-xs sm:text-sm flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Most Popular
                        </Badge>
                      </motion.div>
                    )}
                    <CardContent className="p-5 sm:p-6 md:p-8">
                      <div className="text-center mb-6 sm:mb-8">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                        <div className="flex items-baseline justify-center gap-1 mb-2">
                          <span className="text-3xl sm:text-4xl font-bold text-muted-foreground tracking-widest">****</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                      
                      <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                        {plan.features.map((feature, i) => (
                          <motion.li 
                            key={i} 
                            className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-foreground group/item"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <motion.div whileHover={{ scale: 1.2 }}>
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                      
                      <MagneticButton
                        onClick={() => navigate('/auth')}
                        className={`w-full py-4 sm:py-5 rounded-xl font-medium flex items-center justify-center gap-2 ${
                          plan.popular 
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25' 
                            : 'bg-secondary hover:bg-secondary/80 text-foreground'
                        }`}
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </MagneticButton>
                    </CardContent>
                  </motion.div>
                </GlowingCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
          
          {/* Launch Date */}
          <ScrollReveal className="text-center mt-8 sm:mt-12">
            <motion.p 
              className="text-base sm:text-lg text-muted-foreground"
              whileHover={{ scale: 1.02 }}
            >
              Launched: <span className="text-primary font-semibold">12/28/25</span>
            </motion.p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-primary" />
        
        {/* Animated mesh gradient */}
        <motion.div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:4rem_4rem]" />
        
        {/* Floating shapes */}
        <motion.div 
          className="hidden sm:block absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-xl"
          animate={{ rotate: [0, 360], y: [0, 20, 0] }}
          transition={{ rotate: { duration: 20, repeat: Infinity }, y: { duration: 5, repeat: Infinity } }}
        />
        <motion.div 
          className="hidden sm:block absolute bottom-10 right-10 w-32 h-32 border border-white/10 rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="container mx-auto text-center relative">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 px-2">
              Ready to Transform Your Business?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
              Be among the first to experience the future of credit repair. Start your free trial today and see the AI difference.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <MagneticButton
                onClick={() => navigate('/auth')}
                className="bg-white text-primary hover:bg-white/90 px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg shadow-xl font-medium rounded-xl flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Start Free Trial
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.span>
              </MagneticButton>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white/50 bg-white/10 text-white hover:bg-white/20 hover:border-white/70 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto backdrop-blur-sm"
                >
                  Schedule Demo
                </Button>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="col-span-2">
              <motion.div 
                className="flex items-center gap-2 mb-4"
                whileHover={{ scale: 1.02 }}
              >
                <img src="/images/credit-ai-logo.png" alt="Credit AI Platform" className="h-8 sm:h-10 w-auto" />
              </motion.div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-xs">
                The first AI-driven credit repair operating system. Transform your business with intelligent automation.
              </p>
              <div className="flex gap-3 sm:gap-4">
                {[
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>,
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                ].map((icon, i) => (
                  <motion.a 
                    key={i}
                    href="#" 
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {icon}
                  </motion.a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'FCRA Compliance'] }
            ].map((section, i) => (
              <div key={i}>
                <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">{section.title}</h4>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                  {section.links.map((link, j) => (
                    <motion.li key={j} whileHover={{ x: 3 }}>
                      <a href="#" className="hover:text-primary transition-colors">{link}</a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <motion.div 
            className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              © 2025 Credit AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
