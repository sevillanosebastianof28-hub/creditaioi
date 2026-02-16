import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const TermsOfService = () => {
  const navigate = useNavigate();

  const sections = [
    { title: '1. Acceptance of Terms', content: ['By accessing or using Credit AI\'s platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services.', 'These terms apply to all users of the platform, including credit repair businesses (agency owners), their staff, and their clients.'] },
    { title: '2. Description of Service', content: ['Credit AI provides an AI-powered credit repair platform that helps businesses analyze credit reports, generate dispute letters, track outcomes, manage client relationships, and automate workflows.', 'Our platform is a tool designed to assist credit repair professionals. Credit AI is not a credit repair organization and does not directly repair credit on behalf of consumers.'] },
    { title: '3. User Accounts', content: ['You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate, current information during registration.', 'You must be at least 18 years old to create an account. You agree to notify us immediately of any unauthorized use of your account.'] },
    { title: '4. Acceptable Use', content: ['You agree not to: use the platform for any unlawful purpose, submit fraudulent disputes or misrepresent information to credit bureaus, attempt to reverse-engineer or exploit the platform, share account credentials, or upload malicious content.', 'Violation of these terms may result in immediate account suspension or termination without refund.'] },
    { title: '5. Subscription & Billing', content: ['Paid plans are billed monthly or annually as selected at checkout. All fees are non-refundable unless otherwise stated. We reserve the right to change pricing with 30 days\' advance notice.', 'If payment fails, we will attempt to notify you before suspending access. You may cancel your subscription at any time; access continues until the end of the current billing period.'] },
    { title: '6. Intellectual Property', content: ['All content, features, AI models, and functionality of the Credit AI platform are owned by Credit AI and protected by intellectual property laws.', 'Dispute letters generated for your use are licensed to you for the purpose of credit repair only. You may not resell, redistribute, or commercially exploit platform-generated content outside its intended use.'] },
    { title: '7. AI-Generated Content', content: ['Our AI generates dispute letters, analyses, and recommendations based on the data provided. While we strive for accuracy, AI-generated content should be reviewed before use.', 'Credit AI does not guarantee specific outcomes from disputes or score improvements. Results vary based on individual circumstances.'] },
    { title: '8. Data Handling', content: ['Your data is handled in accordance with our Privacy Policy. By using the platform, you consent to the collection and processing described therein.', 'You retain ownership of data you upload. We use it solely to provide and improve our services.'] },
    { title: '9. Limitation of Liability', content: ['Credit AI is not a law firm and does not provide legal advice. We are not responsible for the outcomes of disputes submitted through our platform.', 'To the maximum extent permitted by law, Credit AI\'s liability is limited to the amount you\'ve paid for the service in the 12 months preceding the claim.'] },
    { title: '10. Termination', content: ['We may suspend or terminate your account if you violate these terms, with or without notice. You may cancel your account at any time through your account settings.', 'Upon termination, your data will be retained for 30 days for account recovery, then permanently deleted unless retention is required by law.'] },
    { title: '11. Governing Law', content: ['These terms are governed by the laws of the State of Delaware, United States. Any disputes will be resolved through binding arbitration in accordance with AAA rules.'] },
    { title: '12. Contact', content: ['For questions about these terms, contact us at legal@creditai.com.'] },
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
              <div className="p-2.5 rounded-xl bg-primary/10"><FileText className="w-6 h-6 text-primary" /></div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Terms of Service</h1>
                <p className="text-sm text-muted-foreground">Last updated: February 16, 2026</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Please read these Terms of Service carefully before using Credit AI. By accessing our platform, you agree to be bound by these terms and all applicable laws and regulations.
            </p>
          </ScrollReveal>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <ScrollReveal key={i} delay={i * 0.02}>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">{section.title}</h2>
                  {section.content.map((p, j) => (
                    <p key={j} className="text-muted-foreground leading-relaxed mb-3">{p}</p>
                  ))}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default TermsOfService;
