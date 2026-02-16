import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
        <div className="container mx-auto max-w-3xl prose prose-slate dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: February 16, 2026</p>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using Credit AI's platform, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
          <h2>2. Description of Service</h2>
          <p>Credit AI provides an AI-powered credit repair platform that helps businesses analyze credit reports, generate dispute letters, track outcomes, and manage client relationships.</p>
          <h2>3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information during registration.</p>
          <h2>4. Acceptable Use</h2>
          <p>You agree not to use the platform for any unlawful purpose, to submit fraudulent disputes, or to misrepresent information to credit bureaus.</p>
          <h2>5. Subscription & Billing</h2>
          <p>Paid plans are billed monthly or annually. Refunds are handled on a case-by-case basis. We reserve the right to change pricing with 30 days' notice.</p>
          <h2>6. Intellectual Property</h2>
          <p>All content, features, and functionality of the Credit AI platform are owned by Credit AI and protected by intellectual property laws.</p>
          <h2>7. Limitation of Liability</h2>
          <p>Credit AI is not a law firm and does not provide legal advice. We are not responsible for the outcomes of disputes submitted through our platform.</p>
          <h2>8. Termination</h2>
          <p>We may suspend or terminate your account if you violate these terms. You may cancel your account at any time.</p>
          <h2>9. Contact</h2>
          <p>For questions about these terms, contact us at legal@creditai.com.</p>
        </div>
      </article>
    </div>
  );
};

export default TermsOfService;
