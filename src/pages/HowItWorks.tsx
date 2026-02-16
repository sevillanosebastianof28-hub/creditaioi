import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Layers, Brain, Rocket, ArrowRight, ArrowLeft, CheckCircle2, 
  BarChart3, Shield, Clock, FileText, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlowingCard } from '@/components/landing/GlowingCard';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/landing/ScrollReveal';
import { GlowText } from '@/components/landing/TextReveal';
import { MagneticButton } from '@/components/landing/MagneticButton';

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: "01",
      title: "Import Credit Reports",
      description: "Connect SmartCredit, IdentityIQ, or upload PDFs directly. Our AI parser extracts every data point in seconds—no manual entry needed.",
      icon: <Layers className="w-6 h-6" />,
      details: [
        "Supports all major credit report formats",
        "Automatic OCR for scanned documents",
        "Instant data extraction and normalization",
        "Secure encrypted uploads"
      ]
    },
    {
      step: "02",
      title: "AI Analysis & Strategy",
      description: "Our multi-model AI system analyzes every account, identifies errors, calculates deletion probability, and builds an optimal dispute strategy.",
      icon: <Brain className="w-6 h-6" />,
      details: [
        "Error detection across all 3 bureaus",
        "Success probability scoring per item",
        "Priority ranking for maximum impact",
        "FCRA compliance validation"
      ]
    },
    {
      step: "03",
      title: "Generate & Send Disputes",
      description: "One-click dispute letter generation with bureau-specific templates. Track every letter, response, and outcome in real-time.",
      icon: <Rocket className="w-6 h-6" />,
      details: [
        "Bureau-specific letter templates",
        "Automated tracking & follow-ups",
        "Real-time status updates",
        "Round management system"
      ]
    },
    {
      step: "04",
      title: "Track & Optimize",
      description: "Monitor score changes, analyze bureau responses, and let AI refine your strategy for each subsequent round of disputes.",
      icon: <BarChart3 className="w-6 h-6" />,
      details: [
        "Score tracking across all bureaus",
        "Response analysis & next steps",
        "AI-optimized follow-up rounds",
        "Client progress reporting"
      ]
    }
  ];

  const capabilities = [
    { icon: <FileText className="w-5 h-5" />, title: "Smart Report Parsing", desc: "AI reads and understands credit reports like a seasoned professional" },
    { icon: <Zap className="w-5 h-5" />, title: "Instant Letter Generation", desc: "Dispute letters created in seconds, not hours" },
    { icon: <Shield className="w-5 h-5" />, title: "Compliance Built-In", desc: "Every action checked against FCRA and FDCPA guidelines" },
    { icon: <Clock className="w-5 h-5" />, title: "Automated Follow-ups", desc: "Never miss a deadline with intelligent tracking" },
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
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">How It Works</Badge>
          </motion.div>
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            Credit Repair, <GlowText>Simplified</GlowText>
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            From report import to score improvement—our AI handles the entire credit repair workflow in four simple steps.
          </motion.p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="space-y-12">
            {steps.map((item, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <GlowingCard className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`flex flex-col md:flex-row ${index % 2 === 1 ? 'md:flex-row-reverse' : ''} items-stretch`}>
                      {/* Step Number & Icon */}
                      <div className="md:w-1/3 bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex flex-col items-center justify-center text-center">
                        <motion.div 
                          className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <span className="text-4xl font-bold text-primary">{item.step}</span>
                        </motion.div>
                        <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                          {item.icon}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="md:w-2/3 p-8">
                        <h3 className="text-2xl font-bold text-foreground mb-3">{item.title}</h3>
                        <p className="text-muted-foreground mb-6 leading-relaxed">{item.description}</p>
                        <ul className="space-y-3">
                          {item.details.map((detail, i) => (
                            <motion.li 
                              key={i} 
                              className="flex items-center gap-3 text-sm text-foreground"
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                              {detail}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </GlowingCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for <GlowText>Speed & Accuracy</GlowText>
            </h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6" staggerDelay={0.1}>
            {capabilities.map((cap, i) => (
              <StaggerItem key={i}>
                <GlowingCard className="h-full">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      {cap.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{cap.title}</h3>
                      <p className="text-sm text-muted-foreground">{cap.desc}</p>
                    </div>
                  </CardContent>
                </GlowingCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-2xl">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join the next generation of credit repair professionals using AI to deliver faster, better results.
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

export default HowItWorks;
