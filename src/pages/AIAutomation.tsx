import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Users,
  Building2,
  UserCog,
  Zap,
  Shield,
  TrendingUp,
  FileCheck,
  MessageSquareText,
  Workflow,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Lock,
  GraduationCap,
  Layers,
  Sparkles,
  ArrowRight,
  Bot,
  RefreshCcw,
  LineChart,
  FileWarning,
  Gauge,
  Network,
} from "lucide-react";

const AIAutomation = () => {
  const [activeTab, setActiveTab] = useState("client");

  const clientFeatures = [
    {
      icon: Brain,
      title: "Automated Credit Understanding",
      description: "AI-generated explanations for credit report changes, active disputes, and bureau responses in plain language.",
      badge: "Auto-Generated",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Workflow,
      title: "AI-Driven Journey Orchestration",
      description: "Automatically moves clients through Intake → Analysis → Dispute → Response → Optimization phases.",
      badge: "Self-Driving",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: AlertTriangle,
      title: "Predictive Progress Alerts",
      description: "AI detects stagnation and triggers proactive updates like 'No bureau response yet' automatically.",
      badge: "Proactive",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: FileCheck,
      title: "Smart Document Automation",
      description: "AI validates uploads, flags inconsistencies, and requests only what's needed, when needed.",
      badge: "Zero Friction",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: MessageSquareText,
      title: "AI-Assisted Messaging",
      description: "Context-aware AI drafts responses to common questions, linked to dispute rounds.",
      badge: "24/7 Support",
      color: "from-indigo-500 to-violet-500",
    },
  ];

  const businessFeatures = [
    {
      icon: Gauge,
      title: "Autonomous Operations Engine",
      description: "AI monitors pipeline health, response timelines, and staff capacity. Auto-reallocates tasks at bottlenecks.",
      badge: "Self-Healing",
      color: "from-rose-500 to-red-500",
    },
    {
      icon: Target,
      title: "AI Strategy Optimization",
      description: "Learns from dispute outcomes and dynamically adjusts sequencing. Recommends best strategies by bureau.",
      badge: "Always Learning",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Shield,
      title: "Automated Compliance Enforcement",
      description: "AI blocks non-compliant actions, flags risky patterns, and generates audit-ready logs automatically.",
      badge: "Protected",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: Building2,
      title: "White-Label Automation Controls",
      description: "AI adapts workflows per partner rules. Automates branding, onboarding, and enforces SLAs.",
      badge: "Scalable",
      color: "from-purple-500 to-fuchsia-500",
    },
    {
      icon: LineChart,
      title: "Predictive Revenue Intelligence",
      description: "AI forecasts client lifetime value, revenue at risk, and staffing needs based on growth.",
      badge: "Data-Driven",
      color: "from-amber-500 to-yellow-500",
    },
  ];

  const staffFeatures = [
    {
      icon: Layers,
      title: "AI-Generated Work Queues",
      description: "Tasks ranked by impact, urgency, and bureau deadlines. Dynamically reprioritizes as conditions change.",
      badge: "Smart Priority",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Bot,
      title: "Guided Execution Mode",
      description: "AI explains why a task exists, what outcome it targets, and what rules must be followed.",
      badge: "Zero Errors",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: CheckCircle2,
      title: "Automated Quality Assurance",
      description: "AI reviews work before submission, flags errors, and auto-approves low-risk actions.",
      badge: "QA Built-In",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: GraduationCap,
      title: "Adaptive Training Automation",
      description: "AI identifies skill gaps and assigns micro-training automatically. Improves output over time.",
      badge: "Self-Improving",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Lock,
      title: "Secure Automation Boundaries",
      description: "AI enforces role limits and prevents unauthorized access or actions. Maintains system integrity.",
      badge: "Secure",
      color: "from-red-500 to-rose-500",
    },
  ];

  const crossPortalFeatures = [
    {
      icon: Network,
      title: "Central AI Brain",
      description: "Unified learning across clients, staff actions, and bureau responses. Improves accuracy continuously.",
    },
    {
      icon: Target,
      title: "Outcome-Oriented Automation",
      description: "Every action evaluated based on expected impact, risk, and time efficiency.",
    },
    {
      icon: RefreshCcw,
      title: "Self-Optimizing System",
      description: "Learns from results, reduces manual intervention over time, builds long-term defensibility.",
    },
  ];

  const FeatureCard = ({ feature, index }: { feature: typeof clientFeatures[0]; index: number }) => (
    <Card 
      className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
            <feature.icon className="h-6 w-6 text-white" />
          </div>
          <Badge variant="secondary" className="text-xs font-medium">
            {feature.badge}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {feature.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/credit-ai-logo.png" alt="Credit AI Platform" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/landing">
              <Button variant="ghost" size="sm">Back to Home</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20 text-sm">
              <Sparkles className="h-4 w-4 mr-2 inline" />
              AI Automation Layer
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                AI That Runs the System
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Not Just Assists It
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Credit AI actively operates across all portals—eliminating manual decisions, 
              reducing latency, enforcing compliance, and enabling scale without proportional staffing.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-12">
              {[
                { value: "90%", label: "Less Manual Work" },
                { value: "24/7", label: "Autonomous Ops" },
                { value: "10x", label: "Faster Processing" },
                { value: "100%", label: "Compliance" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portal Tabs Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="grid grid-cols-3 w-full max-w-2xl h-auto p-2 bg-muted/50 backdrop-blur-sm">
                <TabsTrigger 
                  value="client" 
                  className="flex items-center gap-2 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
                >
                  <Users className="h-5 w-5" />
                  <span className="hidden sm:inline">Client Portal</span>
                  <span className="sm:hidden">Client</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="business" 
                  className="flex items-center gap-2 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  <Building2 className="h-5 w-5" />
                  <span className="hidden sm:inline">Business Portal</span>
                  <span className="sm:hidden">Business</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="staff" 
                  className="flex items-center gap-2 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
                >
                  <UserCog className="h-5 w-5" />
                  <span className="hidden sm:inline">VA / Staff Portal</span>
                  <span className="sm:hidden">Staff</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="client" className="mt-0">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    Client Portal AI
                  </span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Automate understanding, expectations, and engagement—without requiring staff involvement.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientFeatures.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} index={index} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="business" className="mt-0">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Business Portal AI
                  </span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Allow agencies and partners to manage outcomes, not operations.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessFeatures.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} index={index} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="staff" className="mt-0">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                    VA / Staff Portal AI
                  </span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Turn staff into high-output executors guided by AI precision.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffFeatures.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} index={index} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Cross-Portal Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border-primary/20">
              Market Differentiator
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Cross-Portal AI Intelligence
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A unified AI brain that learns from every interaction across all portals, 
              continuously improving accuracy and efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {crossPortalFeatures.map((feature, index) => (
              <div 
                key={index}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card className="relative h-full border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 mb-6">
                      <feature.icon className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Outcome */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <Brain className="h-16 w-16 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Strategic Outcome
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  By embedding AI automation into every portal and decision layer, Credit AI becomes:
                </p>
                <div className="grid sm:grid-cols-3 gap-6 mb-10">
                  {[
                    { icon: Zap, label: "A self-operating credit platform" },
                    { icon: Building2, label: "A scalable white-label product" },
                    { icon: Shield, label: "A defensible AI-driven system" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-background/50 backdrop-blur-sm">
                      <item.icon className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium text-center">{item.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xl font-semibold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  The most autonomous and value-dense credit repair platform in the market.
                </p>
                <Link to="/auth" className="inline-block mt-8">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 shadow-xl gap-2">
                    Experience the Future <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2024 Credit AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AIAutomation;
