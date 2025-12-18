import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  ArrowUpRight,
  Cpu,
  LineChart,
  Users
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Hero3D } from '@/components/landing/Hero3D';
import { AnimatedCounter } from '@/components/landing/AnimatedCounter';
import { GlowingCard } from '@/components/landing/GlowingCard';

const Landing = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

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
      gradient: "from-violet-500 to-purple-600"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "One-Click Disputes",
      description: "Generate bureau-specific dispute letters in seconds. FCRA-compliant templates for every situation.",
      gradient: "from-amber-500 to-orange-600"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Score Prediction",
      description: "Know your expected outcomes before sending disputes. AI predicts deletion probability and score impact.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Compliance Engine",
      description: "Built-in FCRA compliance guardrails. Automatic blocking of illegal disputes and fraudulent claims.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Real-Time Tracking",
      description: "Monitor every dispute, response, and score change across all three bureaus in real-time.",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Smart Prioritization",
      description: "AI identifies high-impact items first. Focus on deletions that maximize score improvement.",
      gradient: "from-indigo-500 to-blue-600"
    }
  ];

  const stats = [
    { value: 94, suffix: "%", label: "Deletion Rate", icon: <Target className="w-5 h-5" /> },
    { value: 45, suffix: "+", label: "Avg Points Gain", icon: <TrendingUp className="w-5 h-5" /> },
    { value: 10, suffix: "x", label: "Faster Processing", icon: <Zap className="w-5 h-5" /> },
    { value: 24, suffix: "/7", label: "AI Support", icon: <Bot className="w-5 h-5" /> }
  ];

  const advantages = [
    {
      icon: <Zap className="w-7 h-7" />,
      title: "10x Faster",
      description: "What takes hours manually, our AI does in seconds.",
      stat: "10x",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: "Precision AI",
      description: "Identifies highest-impact items first for maximum results.",
      stat: "94%",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "100% Compliant",
      description: "FCRA-compliant templates and automatic guardrails.",
      stat: "100%",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: <Brain className="w-7 h-7" />,
      title: "Self-Learning",
      description: "Continuously improves accuracy with every dispute.",
      stat: "∞",
      color: "from-violet-500 to-purple-500"
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
      icon: <Layers className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-500"
    },
    {
      step: "02", 
      title: "AI Analysis",
      description: "Our AI identifies errors, calculates deletion probability, and creates optimal strategy.",
      icon: <Cpu className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-500"
    },
    {
      step: "03",
      title: "Generate & Send",
      description: "One-click dispute generation for all bureaus. Track responses in real-time.",
      icon: <Rocket className="w-6 h-6" />,
      color: "from-violet-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrollY > 50 ? 'hsl(var(--background) / 0.8)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid hsl(var(--border) / 0.5)' : 'none'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-light rounded-xl blur opacity-40 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <span className="text-xl font-display font-bold text-foreground">Credit AI</span>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {['Features', 'How It Works', 'Pricing', 'Why Us'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-all"
                >
                  {item}
                </a>
              ))}
              <Link 
                to="/ai-automation"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-all flex items-center gap-1"
              >
                AI Engine
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/auth')} className="hidden sm:flex text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 lg:pt-36 pb-20 lg:pb-32 px-4 sm:px-6 lg:px-8 relative min-h-[100vh] flex items-center">
        <Hero3D />
        
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
              top: '5%',
              right: '10%',
              transform: `translateY(${scrollY * 0.08}px)`
            }}
          />
          <div 
            className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
            style={{
              background: 'radial-gradient(circle, hsl(217 91% 60%) 0%, transparent 70%)',
              bottom: '10%',
              left: '5%',
              transform: `translateY(${scrollY * -0.05}px)`
            }}
          />
        </div>
        
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium text-primary">First AI-Powered Credit Repair Platform</span>
              </div>
              
              {/* Headline */}
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight animate-slide-up">
                The Future of{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-emerald-light to-primary bg-clip-text text-transparent bg-[size:200%] animate-[gradient_3s_ease_infinite]">
                    Credit Repair
                  </span>
                </span>
                <br className="hidden sm:block" />
                <span className="text-muted-foreground">is Here</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Revolutionary AI that analyzes credit reports, generates dispute letters, 
                and predicts outcomes—all in seconds. Transform your business into a powerhouse.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-base font-semibold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 group"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-14 px-8 text-base font-semibold border-border/50 hover:bg-secondary/50 hover:border-border group"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="group relative p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-primary">{stat.icon}</span>
                        <span className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                          <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                        </span>
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Features Banner */}
      <section className="py-6 border-y border-border/30 bg-secondary/20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              { icon: <Bot className="w-4 h-4" />, text: "AI Credit Analysis" },
              { icon: <FileText className="w-4 h-4" />, text: "Auto Letter Generation" },
              { icon: <LineChart className="w-4 h-4" />, text: "Score Prediction" },
              { icon: <Lock className="w-4 h-4" />, text: "FCRA Compliant" },
              { icon: <Globe className="w-4 h-4" />, text: "All 3 Bureaus" },
            ].map((item, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-default"
              >
                {item.icon}
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium">Features</Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              AI-Powered Everything
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From credit report analysis to dispute generation, our AI handles the heavy lifting 
              so you can focus on growing your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  
                  <div className="mt-5 flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <span className="text-sm font-medium">Learn more</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="container mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium">How It Works</Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Simple. Powerful. Automated.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and let AI do the heavy lifting.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-border via-primary/30 to-border" />
              
              {workflowSteps.map((item, index) => (
                <div key={index} className="relative text-center group">
                  <div className="relative inline-flex flex-col items-center">
                    {/* Step number with gradient background */}
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${item.color} p-[2px] shadow-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <div className="w-full h-full rounded-[14px] bg-card flex items-center justify-center">
                        <span className="text-4xl font-display font-bold text-foreground">{item.step}</span>
                      </div>
                    </div>
                    
                    {/* Icon badge */}
                    <div className={`absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-display font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl top-1/4 -left-48 animate-pulse" />
          <div className="absolute w-80 h-80 bg-blue-500/10 rounded-full blur-3xl bottom-1/4 -right-40 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium">The AI Advantage</Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Why Credit AI is Different
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built from the ground up with AI at the core—not bolted on as an afterthought.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {advantages.map((advantage, index) => (
              <div 
                key={index} 
                className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 text-center overflow-hidden hover:-translate-y-2 transition-all duration-500"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${advantage.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Stat badge */}
                <div className="absolute top-4 right-4">
                  <span className={`text-2xl font-display font-bold bg-gradient-to-r ${advantage.color} bg-clip-text text-transparent`}>
                    {advantage.stat}
                  </span>
                </div>
                
                {/* Icon */}
                <div className={`relative inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br ${advantage.color} text-white items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  {advantage.icon}
                </div>
                
                <h3 className="text-lg font-display font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{advantage.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{advantage.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link 
              to="/ai-automation"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border/50 hover:border-primary/30 hover:bg-secondary/50 transition-all duration-300 group"
            >
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Explore our AI Engine</span>
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-secondary/30 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium">Pricing</Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Plans for Every Business
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with a 14-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-2xl transition-all duration-500 ${
                  plan.popular 
                    ? 'bg-card border-2 border-primary shadow-2xl shadow-primary/10 scale-[1.02] z-10' 
                    : 'bg-card border border-border/50 hover:border-primary/30 hover:-translate-y-1'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1.5 shadow-lg font-medium">Most Popular</Badge>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-display font-semibold text-foreground mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-5xl font-display font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full h-12 font-semibold group ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20' 
                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                    }`}
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-dark to-primary" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-24 h-24 border border-white/10 rounded-2xl rotate-12" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border border-white/10 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border border-white/10 rounded-lg -rotate-12" />
        
        <div className="container mx-auto text-center relative">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Be among the first to experience the future of credit repair. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-base font-semibold shadow-xl group hover:-translate-y-1 transition-all duration-300"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-base font-semibold hover:-translate-y-1 transition-all duration-300"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold text-foreground">Credit AI</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-xs text-sm leading-relaxed">
                The first AI-driven credit repair operating system. Transform your business with intelligent automation.
              </p>
              <div className="flex gap-3">
                {['twitter', 'linkedin'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-all"
                  >
                    {social === 'twitter' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'FCRA Compliance'] }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-display font-semibold text-foreground mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Credit AI. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              The first AI-driven credit repair platform in the industry.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
