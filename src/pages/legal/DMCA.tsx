import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const DMCA = () => {
  const navigate = useNavigate();

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
              <div className="p-2.5 rounded-xl bg-primary/10"><Scale className="w-6 h-6 text-primary" /></div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">DMCA Policy</h1>
                <p className="text-sm text-muted-foreground">Last updated: February 16, 2026</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Credit AI respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (DMCA), we will respond expeditiously to claims of copyright infringement.
            </p>
          </ScrollReveal>

          <div className="space-y-8">
            <ScrollReveal delay={0.05}>
              <h2 className="text-xl font-bold text-foreground mb-3">1. Filing a DMCA Notice</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">If you believe that content on our platform infringes your copyright, please provide a written notice (a "DMCA Takedown Notice") containing all of the following:</p>
              <Card className="border-border">
                <CardContent className="p-5">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">1.</span> A physical or electronic signature of the copyright owner (or authorized agent).</li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">2.</span> Identification of the copyrighted work claimed to have been infringed.</li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">3.</span> Identification of the material that is claimed to be infringing, with enough detail to locate it on our platform.</li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">4.</span> Your contact information: name, address, telephone number, and email address.</li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">5.</span> A statement that you have a good-faith belief that the use is not authorized by the copyright owner.</li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">6.</span> A statement, under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on their behalf.</li>
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h2 className="text-xl font-bold text-foreground mb-3">2. Counter-Notice</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">If you believe your content was wrongly removed due to a DMCA notice, you may submit a counter-notice containing:</p>
              <ul className="space-y-2 text-muted-foreground text-sm ml-4">
                <li>• Your physical or electronic signature</li>
                <li>• Identification of the material that was removed and its prior location</li>
                <li>• A statement under penalty of perjury that you believe the material was removed by mistake</li>
                <li>• Your name, address, and telephone number</li>
                <li>• Consent to jurisdiction of your local federal court</li>
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <h2 className="text-xl font-bold text-foreground mb-3">3. Repeat Infringers</h2>
              <p className="text-muted-foreground leading-relaxed">In accordance with the DMCA, Credit AI will terminate the accounts of users who are repeat infringers of copyright.</p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <h2 className="text-xl font-bold text-foreground mb-3">4. Contact Our Designated Agent</h2>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-5">
                  <p className="text-sm text-foreground font-medium mb-1">DMCA Designated Agent</p>
                  <p className="text-sm text-muted-foreground">Credit AI, Legal Department</p>
                  <p className="text-sm text-muted-foreground">Email: dmca@creditai.com</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </article>
    </div>
  );
};

export default DMCA;
