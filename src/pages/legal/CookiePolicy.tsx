import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CookiePolicy = () => {
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
          <h1>Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: February 16, 2026</p>
          <h2>1. What Are Cookies</h2>
          <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience.</p>
          <h2>2. How We Use Cookies</h2>
          <p>We use essential cookies for authentication and security, analytics cookies to understand usage patterns, and preference cookies to remember your settings.</p>
          <h2>3. Types of Cookies</h2>
          <ul>
            <li><strong>Essential:</strong> Required for the platform to function (authentication, security).</li>
            <li><strong>Analytics:</strong> Help us understand how users interact with our platform.</li>
            <li><strong>Preferences:</strong> Remember your settings and preferences.</li>
          </ul>
          <h2>4. Managing Cookies</h2>
          <p>You can control cookies through your browser settings. Note that disabling essential cookies may affect platform functionality.</p>
          <h2>5. Contact</h2>
          <p>For questions about our cookie practices, contact privacy@creditai.com.</p>
        </div>
      </article>
    </div>
  );
};

export default CookiePolicy;
