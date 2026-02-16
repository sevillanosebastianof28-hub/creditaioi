import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
        <div className="container mx-auto max-w-3xl prose prose-slate dark:prose-invert">
          <h1>DMCA Policy</h1>
          <p className="text-muted-foreground">Last updated: February 16, 2026</p>
          <h2>1. Copyright Infringement Notice</h2>
          <p>Credit AI respects the intellectual property rights of others. If you believe that content on our platform infringes your copyright, please provide a written notice containing the following:</p>
          <ul>
            <li>A description of the copyrighted work claimed to be infringed.</li>
            <li>A description of the material claimed to be infringing and its location on the platform.</li>
            <li>Your contact information (name, address, phone, email).</li>
            <li>A statement of good faith belief that the use is not authorized.</li>
            <li>A statement under penalty of perjury that the information is accurate.</li>
            <li>Your physical or electronic signature.</li>
          </ul>
          <h2>2. Counter-Notice</h2>
          <p>If you believe your content was wrongly removed, you may submit a counter-notice with the required information under the DMCA.</p>
          <h2>3. Contact</h2>
          <p>Send DMCA notices to: dmca@creditai.com</p>
        </div>
      </article>
    </div>
  );
};

export default DMCA;
