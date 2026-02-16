import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Information We Collect',
      content: [
        'We collect information you provide directly, such as your name, email address, and credit report data when you use our services. We also collect usage data including IP addresses, browser type, and interaction patterns.',
        'Information collected includes: account registration details, credit report uploads, dispute correspondence, payment information (processed by secure third-party providers), and communications with our support team.',
      ],
    },
    {
      title: '2. How We Use Your Information',
      content: [
        'Your information is used to provide and improve our AI-powered credit repair services, generate dispute letters, analyze credit reports, and communicate important service updates.',
        'We may also use aggregated, anonymized data to improve our AI models and provide industry insights. Your individual data is never shared with third parties for marketing purposes.',
      ],
    },
    {
      title: '3. Data Security',
      content: [
        'We implement industry-standard security measures including AES-256 encryption at rest and TLS 1.3 encryption in transit, role-based access controls, and regular third-party security audits.',
        'All credit report data is stored in SOC 2 Type II compliant infrastructure. Access to sensitive data is limited to authorized personnel on a need-to-know basis.',
      ],
    },
    {
      title: '4. Data Sharing & Third Parties',
      content: [
        'We do not sell your personal information. We may share data with credit bureaus (Experian, Equifax, TransUnion) as part of the dispute process and with service providers who assist in operating our platform.',
        'Third-party service providers are contractually required to maintain the same level of data protection and may only use your data to provide services on our behalf.',
      ],
    },
    {
      title: '5. Your Rights',
      content: [
        'You have the right to: access and download your personal data, correct inaccurate information, request deletion of your account and data, opt out of marketing communications, and receive notification of data breaches.',
        'California residents have additional rights under the CCPA, including the right to know what data is collected and the right to opt out of the sale of personal information.',
      ],
    },
    {
      title: '6. Data Retention',
      content: [
        'We retain your personal data for as long as your account is active or as needed to provide services. Dispute records are retained for 7 years to comply with regulatory requirements.',
        'You may request deletion of your account at any time. Upon deletion, personal data is purged within 30 days, except where retention is required by law.',
      ],
    },
    {
      title: '7. Cookies & Tracking',
      content: [
        'We use cookies and similar technologies to enhance your experience. See our Cookie Policy for detailed information about the types of cookies we use and how to manage them.',
      ],
    },
    {
      title: '8. Children\'s Privacy',
      content: [
        'Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If we become aware of such collection, we will promptly delete the data.',
      ],
    },
    {
      title: '9. Changes to This Policy',
      content: [
        'We may update this Privacy Policy from time to time. We will notify you of material changes via email or in-app notification at least 30 days before the changes take effect.',
      ],
    },
    {
      title: '10. Contact Us',
      content: [
        'For privacy-related inquiries, contact our Data Protection Officer at privacy@creditai.com or write to us at: Credit AI, Privacy Team, United States.',
      ],
    },
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
              <div className="p-2.5 rounded-xl bg-primary/10"><Shield className="w-6 h-6 text-primary" /></div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground">Last updated: February 16, 2026</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              At Credit AI, your privacy is paramount. This policy explains how we collect, use, protect, and share your personal information when you use our platform. We are committed to transparency and to giving you control over your data.
            </p>
          </ScrollReveal>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <ScrollReveal key={i} delay={i * 0.03}>
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

export default PrivacyPolicy;
