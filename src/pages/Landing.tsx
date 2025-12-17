import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Brain, 
  Shield, 
  Zap, 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Star,
  Clock,
  Target,
  BarChart3,
  Bot,
  Lock,
  Rocket,
  Play,
  ChevronRight,
  MousePointer,
  Layers,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

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
    { value: "94%", label: "Deletion Rate", sublabel: "Industry-leading success" },
    { value: "45+", label: "Avg Points", sublabel: "Score improvement" },
    { value: "10x", label: "Faster", sublabel: "Than manual processing" },
    { value: "500+", label: "Agencies", sublabel: "Trust our platform" }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Agency Owner",
      company: "CreditPro Solutions",
      content: "Credit AI transformed our agency. We went from 50 clients to 300+ without adding staff. The AI handles everything.",
      avatar: "SM",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Credit Specialist",
      company: "ScoreBoost Inc",
      content: "The dispute letter generation is incredible. What used to take hours now takes minutes. My clients see results faster than ever.",
      avatar: "MJ",
      rating: 5
    },
    {
      name: "Jennifer Lee",
      role: "Agency Director",
      company: "Credit Masters",
      content: "Finally, a platform that understands credit repair. The AI insights have helped us achieve a 94% deletion rate.",
      avatar: "JL",
      rating: 5
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
      description: "For growing agencies",
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
      description: "For multi-location agencies",
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Credit AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/auth')} className="text-muted-foreground">
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="container mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">First AI-Driven Credit Repair Platform</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              The Future of{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-primary via-emerald-light to-primary bg-clip-text text-transparent">
                  Credit Repair
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 100 4 150 6C200 8 250 4 298 10" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" className="opacity-30"/>
                </svg>
              </span>
              {' '}is Here
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Revolutionary AI technology that analyzes credit reports, generates dispute letters, 
              and predicts outcomes—all in seconds. Transform your agency into a credit repair powerhouse.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-6 text-lg border-border hover:bg-secondary/50 group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="relative p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-colors group"
                >
                  <div className="text-4xl font-bold text-primary mb-1 group-hover:scale-105 transition-transform">{stat.value}</div>
                  <div className="text-sm font-medium text-foreground">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Banner */}
      <section className="py-8 border-y border-border/50 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-muted-foreground">
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <Bot className="w-5 h-5" />
              <span className="font-medium">AI Credit Analysis</span>
            </div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Auto Letter Generation</span>
            </div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Score Prediction</span>
            </div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <Lock className="w-5 h-5" />
              <span className="font-medium">FCRA Compliant</span>
            </div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <Globe className="w-5 h-5" />
              <span className="font-medium">All 3 Bureaus</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">Features</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              AI-Powered Everything
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From credit report analysis to dispute generation, our AI handles the heavy lifting 
              so you can focus on growing your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group bg-card border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-8 relative">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  
                  <div className="mt-4 flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Learn more</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">How It Works</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Simple. Powerful. Automated.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and let AI do the heavy lifting.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
              
              {workflowSteps.map((item, index) => (
                <div key={index} className="relative text-center">
                  {/* Step number */}
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-card border-2 border-primary/20 shadow-xl mb-6 relative group hover:border-primary/50 transition-colors">
                    <span className="text-4xl font-bold text-primary">{item.step}</span>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">Testimonials</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Loved by Industry Leaders
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See why credit repair professionals choose Credit AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  
                  <p className="text-foreground mb-6 leading-relaxed text-lg">"{testimonial.content}"</p>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-light text-white flex items-center justify-center font-semibold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <div className="text-xs text-primary">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">Pricing</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Plans for Every Agency
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with a 14-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`bg-card border-border relative transition-all duration-300 ${
                  plan.popular 
                    ? 'border-primary shadow-2xl shadow-primary/10 scale-105 z-10' 
                    : 'hover:border-primary/30 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full py-6 ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25' 
                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                    }`}
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-dark" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="container mx-auto text-center relative">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Agency?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join 500+ agencies already using AI to scale their business and deliver better results for clients.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg shadow-xl group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg"
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
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Credit AI</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-xs">
                The first AI-driven credit repair operating system. Transform your agency with intelligent automation.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FCRA Compliance</a></li>
              </ul>
            </div>
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
