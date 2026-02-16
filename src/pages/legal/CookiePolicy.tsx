import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const CookiePolicy = () => {
  const navigate = useNavigate();

  const cookieTypes = [
    { name: 'Essential Cookies', required: true, description: 'Required for the platform to function. These handle authentication, security tokens, and session management. They cannot be disabled.', examples: 'Session ID, CSRF tokens, authentication tokens' },
    { name: 'Analytics Cookies', required: false, description: 'Help us understand how users interact with our platform so we can improve the experience. Data is aggregated and anonymized.', examples: 'Page views, feature usage, session duration' },
    { name: 'Preference Cookies', required: false, description: 'Remember your settings such as language, theme (light/dark mode), and display preferences across sessions.', examples: 'Theme selection, sidebar state, notification preferences' },
    { name: 'Performance Cookies', required: false, description: 'Monitor platform performance, identify bottlenecks, and help us optimize load times and responsiveness.', examples: 'Page load times, error rates, API response metrics' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-10 w-auto cursor-pointer" onClick={() => navigate('/')} />
          <Button variant="ghost" onClick={() => navigate('/')}>← Back to Home</Button>
        </div>
      </nav>

      <article className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10"><Cookie className="w-6 h-6 text-primary" /></div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Cookie Policy</h1>
                <p className="text-sm text-muted-foreground">Last updated: February 16, 2026</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              This policy explains how Credit AI uses cookies and similar technologies to recognize you when you visit our platform. It explains what these technologies are, why we use them, and your rights to control their use.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h2 className="text-xl font-bold text-foreground mb-4">What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">Cookies are small data files placed on your device when you visit a website. They are widely used to make websites work efficiently and to provide reporting information. Cookies set by the website owner are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies."</p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2 className="text-xl font-bold text-foreground mb-6">Types of Cookies We Use</h2>
            <div className="space-y-4 mb-10">
              {cookieTypes.map((cookie, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{cookie.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cookie.required ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                        {cookie.required ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{cookie.description}</p>
                    <p className="text-xs text-muted-foreground"><strong className="text-foreground">Examples:</strong> {cookie.examples}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <h2 className="text-xl font-bold text-foreground mb-3">Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You can control and manage cookies through your browser settings. Most browsers allow you to refuse or accept cookies, delete existing cookies, and set preferences for certain websites.</p>
            <p className="text-muted-foreground leading-relaxed mb-3">Please note that disabling essential cookies may affect platform functionality, including login and security features.</p>
            <p className="text-muted-foreground leading-relaxed mb-8">For more information about cookies and how to manage them, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">allaboutcookies.org</a>.</p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <h2 className="text-xl font-bold text-foreground mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">For questions about our cookie practices, contact us at privacy@creditai.com.</p>
          </ScrollReveal>
        </div>
      </article>
    </div>
  );
};

export default CookiePolicy;
