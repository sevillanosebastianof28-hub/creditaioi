import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MapPin, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { useState } from 'react';
import { toast } from 'sonner';

const Contact = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    { icon: <Mail className="w-5 h-5" />, label: 'Email', value: 'support@creditai.com', sub: 'We respond within 24 hours' },
    { icon: <MapPin className="w-5 h-5" />, label: 'Location', value: 'United States', sub: 'Serving clients nationwide' },
    { icon: <Clock className="w-5 h-5" />, label: 'Hours', value: 'Mon - Fri, 9am - 6pm EST', sub: 'Weekend support via email' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Live Chat', value: 'Available in-app', sub: 'For registered users' },
  ];

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
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Contact</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-4">
              {contactInfo.map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <Card className="border-border hover:border-primary/20 transition-colors">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">{item.icon}</div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="font-semibold text-foreground text-sm">{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <ScrollReveal delay={0.1}>
                <Card className="border-border">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-bold text-foreground mb-6">Send a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Your name" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                          <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="you@example.com" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
                        <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="How can we help?" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                        <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Tell us more..." />
                      </div>
                      <Button type="submit" size="lg" className="w-full">Send Message <ArrowRight className="ml-2 w-4 h-4" /></Button>
                    </form>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
