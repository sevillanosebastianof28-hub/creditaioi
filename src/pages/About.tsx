import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Linkedin, Twitter, Target, Heart, Users, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const About = () => {
  const navigate = useNavigate();

  const teamMembers = [
    { name: 'Sebastian Sevillano', role: 'Founder & CEO', bio: 'Visionary entrepreneur with deep expertise in fintech and credit repair. Sebastian founded Credit AI to democratize access to fair credit through cutting-edge artificial intelligence.', initials: 'SS' },
    { name: 'Coming Soon', role: 'CTO', bio: 'We are growing our leadership team. Interested in joining? Check out our Careers page.', initials: '?' },
    { name: 'Coming Soon', role: 'Head of AI', bio: 'We are actively hiring world-class AI talent to push the boundaries of credit repair technology.', initials: '?' },
    { name: 'Coming Soon', role: 'Head of Compliance', bio: 'Our compliance team ensures every feature meets the highest standards of FCRA and FDCPA regulation.', initials: '?' },
  ];

  const values = [
    { icon: <Target className="w-6 h-6" />, title: 'Mission-Driven', description: 'Every decision we make is guided by our mission to make fair credit accessible to everyone.' },
    { icon: <Heart className="w-6 h-6" />, title: 'Client-First', description: 'We build for credit repair businesses and their clients, ensuring real results that change lives.' },
    { icon: <Lightbulb className="w-6 h-6" />, title: 'Innovation', description: 'We leverage the latest in AI and machine learning to stay years ahead of the industry.' },
    { icon: <Users className="w-6 h-6" />, title: 'Transparency', description: 'We believe in honest, compliant practices that build trust with every interaction.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-10 w-auto cursor-pointer" onClick={() => navigate('/')} />
          <Button variant="ghost" onClick={() => navigate('/')}>← Back to Home</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-3xl">
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              About <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Credit AI</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Founded by Sebastian Sevillano, Credit AI is on a mission to revolutionize the credit repair industry through artificial intelligence, making fair credit accessible to everyone.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <Card className="overflow-hidden border-primary/20">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12 flex flex-col justify-center items-center text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-4xl font-bold text-primary-foreground mb-4">SS</div>
                    <h3 className="text-2xl font-bold text-foreground">Sebastian Sevillano</h3>
                    <p className="text-primary font-medium">Founder & CEO</p>
                    <div className="flex gap-3 mt-4">
                      <a href="#" className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-4 h-4" /></a>
                      <a href="#" className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Linkedin className="w-4 h-4" /></a>
                    </div>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-foreground mb-4">The Vision Behind Credit AI</h2>
                    <p className="text-muted-foreground mb-4">
                      Sebastian Sevillano founded Credit AI with a bold vision: to bring the power of artificial intelligence to the credit repair industry. After witnessing firsthand how manual, time-consuming, and error-prone the traditional credit repair process was, he set out to build something better.
                    </p>
                    <p className="text-muted-foreground">
                      Today, Credit AI is the first fully AI-driven credit repair operating system, helping businesses process disputes 10x faster with 94% deletion rates. What started as a simple idea has grown into a platform that's transforming how credit repair professionals work.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">Our Values</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">The principles that guide everything we build.</p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
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

      {/* Team */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">Our Team</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">Meet the people building the future of credit repair.</p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <Card className="text-center border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg font-bold text-primary mx-auto mb-4">{member.initials}</div>
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-xs text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-emerald-500">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Join the Revolution</h2>
          <p className="text-primary-foreground/80 mb-8">Ready to see what AI can do for your credit repair business?</p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90" onClick={() => navigate('/auth')}>
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;
