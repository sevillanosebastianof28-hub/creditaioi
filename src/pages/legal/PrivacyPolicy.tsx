import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: February 16, 2026</p>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly, such as your name, email address, and credit report data when you use our services. We also collect usage data including IP addresses, browser type, and interaction patterns.</p>
          <h2>2. How We Use Your Information</h2>
          <p>Your information is used to provide and improve our AI-powered credit repair services, generate dispute letters, analyze credit reports, and communicate important service updates.</p>
          <h2>3. Data Security</h2>
          <p>We implement industry-standard security measures including encryption at rest and in transit, access controls, and regular security audits to protect your sensitive financial data.</p>
          <h2>4. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with credit bureaus as part of the dispute process and with service providers who assist in operating our platform.</p>
          <h2>5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time.</p>
          <h2>6. Cookies</h2>
          <p>We use cookies and similar technologies to enhance your experience. See our Cookie Policy for more details.</p>
          <h2>7. Contact Us</h2>
          <p>For privacy-related inquiries, contact us at privacy@creditai.com.</p>
        </div>
      </article>
    </div>
  );
};

export default PrivacyPolicy;
