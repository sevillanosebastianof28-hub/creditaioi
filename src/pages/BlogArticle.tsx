import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, User, Calendar, Share2, BookOpen } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const blogArticles: Record<string, {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  content: string[];
}> = {
  'understanding-your-credit-report': {
    title: 'Understanding Your Credit Report: A Complete Guide',
    excerpt: 'Learn how to read your credit report, identify errors, and understand what each section means for your financial health.',
    category: 'Education',
    readTime: '8 min read',
    date: 'Feb 10, 2026',
    author: 'Sebastian Sevillano',
    content: [
      'Your credit report is one of the most important financial documents you\'ll ever encounter. It\'s a detailed record of your credit history, maintained by three major credit bureaus: Experian, Equifax, and TransUnion. Understanding how to read it is the first step toward taking control of your financial future.',
      '## What\'s in a Credit Report?',
      'A credit report typically contains four main sections: **Personal Information**, **Credit Accounts**, **Public Records**, and **Inquiries**. Each section plays a critical role in determining your overall creditworthiness.',
      '### Personal Information',
      'This section includes your name, address, Social Security number, date of birth, and employment information. While this section doesn\'t directly affect your credit score, errors here can indicate identity theft or mixed files — where your information gets confused with someone else\'s.',
      '### Credit Accounts (Trade Lines)',
      'This is the most detailed section. Each account shows the creditor name, account type (revolving, installment, mortgage), date opened, credit limit or loan amount, current balance, payment history, and account status. Late payments, charge-offs, and collections are all recorded here and can significantly impact your score.',
      '### Public Records',
      'Bankruptcies, tax liens, and civil judgments appear in this section. These are the most damaging items on a credit report and can remain for 7-10 years depending on the type.',
      '### Inquiries',
      'There are two types: hard inquiries (when you apply for credit) and soft inquiries (background checks, pre-approvals). Only hard inquiries affect your score, and they typically stay on your report for two years.',
      '## Common Errors to Look For',
      'Studies show that approximately **34% of consumers** have at least one error on their credit reports. Common errors include: incorrect account balances, accounts that don\'t belong to you, duplicate entries, incorrect payment statuses, and outdated information that should have been removed.',
      '## How to Get Your Free Credit Report',
      'Under federal law (FCRA), you\'re entitled to one free credit report from each bureau every 12 months through AnnualCreditReport.com. We recommend staggering your requests — pulling one bureau every four months — so you can monitor your credit year-round.',
      '## Taking Action',
      'Once you\'ve identified errors, the next step is to dispute them. Under the FCRA, credit bureaus have 30 days to investigate and respond to your dispute. If they can\'t verify the information, they must remove it. This is where AI-powered tools like Credit AI can make a massive difference — automating the identification and dispute process to save you hours of manual work.',
    ],
  },
  'ai-transforming-credit-repair-2026': {
    title: 'How AI is Transforming Credit Repair in 2026',
    excerpt: 'Discover how artificial intelligence is making credit repair faster, more accurate, and more accessible than ever before.',
    category: 'AI & Technology',
    readTime: '6 min read',
    date: 'Feb 5, 2026',
    author: 'Credit AI Team',
    content: [
      'The credit repair industry has been ripe for disruption for decades. Manual processes, inconsistent results, and overwhelming paperwork have long plagued both credit repair professionals and their clients. In 2026, artificial intelligence is finally changing the game.',
      '## The Old Way vs. The AI Way',
      'Traditional credit repair involves manually reviewing credit reports line by line, identifying disputable items, crafting individual letters, and tracking responses — all by hand. A single client\'s dispute cycle could take hours of work per round. With AI, that same process takes minutes.',
      '## How AI Analyzes Credit Reports',
      'Modern AI models can parse a credit report in under 10 seconds, identifying not just obvious errors but subtle patterns that human reviewers might miss. This includes detecting duplicate entries across bureaus, identifying accounts that may violate reporting timelines, and scoring each item by its deletion probability based on historical outcome data.',
      '## Intelligent Letter Generation',
      'AI doesn\'t just identify problems — it crafts solutions. By analyzing thousands of successful dispute outcomes, AI can generate bureau-specific dispute letters that use the most effective legal language and dispute reasons for each situation. The result? Higher deletion rates and faster resolutions.',
      '## Predictive Score Modeling',
      'Perhaps the most exciting advancement is AI\'s ability to predict how your credit score will change if specific items are removed. This allows credit repair professionals to prioritize disputes by impact, focusing on the items that will make the biggest difference to their clients\' scores.',
      '## Compliance at Scale',
      'AI ensures every letter, every communication, and every process step complies with FCRA and FDCPA regulations. This is crucial for credit repair businesses that need to scale without risking regulatory violations.',
      '## The Future is Here',
      'At Credit AI, we\'ve built the first fully AI-driven credit repair operating system. Our platform combines intelligent analysis, automated letter generation, predictive scoring, and compliance guardrails into a single, seamless experience. The result: businesses process disputes 10x faster with a 94% deletion rate.',
    ],
  },
  'common-credit-report-errors': {
    title: '5 Common Credit Report Errors and How to Dispute Them',
    excerpt: 'From incorrect balances to fraudulent accounts, here are the most common errors and step-by-step instructions to dispute them.',
    category: 'Disputes',
    readTime: '10 min read',
    date: 'Jan 28, 2026',
    author: 'Sebastian Sevillano',
    content: [
      'Credit report errors are far more common than most people realize. According to the FTC, one in five consumers has an error on at least one of their credit reports. These errors can lower your score by dozens — or even hundreds — of points. Here are the five most common errors and exactly how to dispute them.',
      '## 1. Incorrect Account Balances',
      'This is the most frequent error. A creditor reports a balance that\'s higher than what you actually owe, or fails to update your balance after a payment. This inflates your credit utilization ratio, one of the biggest factors in your score. **How to dispute:** Gather your most recent account statement showing the correct balance. Submit a dispute to each bureau reporting the incorrect balance, including your statement as supporting evidence.',
      '## 2. Accounts That Don\'t Belong to You',
      'Sometimes accounts from people with similar names or Social Security numbers end up on your report. This is called a "mixed file" and can be devastating to your score. **How to dispute:** Submit a dispute clearly stating the account is not yours. Include any documentation that proves your identity and that the account doesn\'t match your records.',
      '## 3. Duplicate Entries',
      'The same debt can appear multiple times — often when it\'s sold to different collection agencies. Under the law, a debt should only appear once on your report. **How to dispute:** Identify each instance of the duplicate entry across your reports. Dispute the duplicates, referencing the original account and pointing out the duplication.',
      '## 4. Incorrect Payment History',
      'A payment marked as "late" when it was actually on time, or a payment marked as "30 days late" when it was only a few days late. Payment history accounts for 35% of your FICO score. **How to dispute:** Gather bank statements or payment confirmations showing the payments were made on time. Submit these with your dispute letter.',
      '## 5. Outdated Negative Information',
      'Most negative items should fall off your report after 7 years (10 years for bankruptcies). If they\'re still there past that date, you have grounds for removal. **How to dispute:** Calculate the date the item should have been removed based on the date of first delinquency. Submit a dispute citing the FCRA\'s reporting time limits.',
      '## Pro Tips for Successful Disputes',
      'Always dispute in writing (not online), send letters via certified mail with return receipt, keep copies of everything, be specific about what\'s wrong and why, cite relevant FCRA sections, and follow up if you don\'t hear back within 30 days. Better yet, use an AI-powered platform like Credit AI that automates this entire process.',
    ],
  },
  'fcra-rights-every-consumer-should-know': {
    title: 'FCRA Rights Every Consumer Should Know',
    excerpt: 'The Fair Credit Reporting Act gives you powerful rights. Learn what they are and how to exercise them effectively.',
    category: 'Compliance',
    readTime: '7 min read',
    date: 'Jan 20, 2026',
    author: 'Credit AI Team',
    content: [
      'The Fair Credit Reporting Act (FCRA) is one of the most powerful consumer protection laws in the United States. Enacted in 1970 and significantly amended since, it governs how your credit information is collected, shared, and used. Understanding your rights under the FCRA is essential for anyone looking to improve their credit.',
      '## Right to Access Your Credit Report',
      'You have the right to request a copy of your credit report from each of the three major bureaus once every 12 months for free. Additional copies can be obtained for a small fee, and you\'re entitled to a free copy whenever you\'re denied credit based on your report.',
      '## Right to Dispute Inaccurate Information',
      'This is perhaps the most important right. Under Section 611, you can dispute any information you believe is inaccurate or incomplete. The bureau must investigate within 30 days and either verify, correct, or delete the information.',
      '## Right to Know Who Accessed Your Report',
      'Your credit report includes a list of everyone who has requested it. You have the right to know who has been looking at your credit information and why.',
      '## Right to Consent for Employment Checks',
      'Employers must get your written permission before pulling your credit report for employment purposes. They must also notify you if they take adverse action based on the report.',
      '## Right to Sue for Violations',
      'If a credit bureau or furnisher violates the FCRA, you have the right to sue for damages. This includes actual damages, statutory damages of $100-$1,000 per violation, and potentially punitive damages.',
      '## Right to Place a Fraud Alert',
      'If you suspect identity theft, you can place a fraud alert on your report that requires creditors to take extra steps to verify your identity before opening new accounts.',
      '## Right to a Credit Freeze',
      'You can freeze your credit report for free, preventing anyone from opening new accounts in your name. This is one of the strongest protections against identity theft.',
      '## How Credit AI Helps You Exercise These Rights',
      'Our platform is built on a deep understanding of the FCRA. Every dispute letter we generate cites relevant FCRA sections. Every process we automate respects the legal frameworks that protect consumers. We make it easy to exercise your rights effectively and efficiently.',
    ],
  },
  'building-credit-repair-business-2026': {
    title: 'Building a Successful Credit Repair Business in 2026',
    excerpt: 'Tips and strategies for starting or scaling your credit repair business using modern tools and AI automation.',
    category: 'Business',
    readTime: '12 min read',
    date: 'Jan 15, 2026',
    author: 'Sebastian Sevillano',
    content: [
      'The credit repair industry is booming. With consumer debt at all-time highs and credit awareness growing, demand for credit repair services has never been stronger. If you\'re thinking about starting or scaling a credit repair business in 2026, here\'s what you need to know.',
      '## The Market Opportunity',
      'Over 100 million Americans have credit scores below 670, and the credit repair services market is projected to reach $6.5 billion by 2027. The opportunity is massive — but so is the competition. To succeed, you need to differentiate yourself with technology, results, and exceptional client experience.',
      '## Getting Started: Legal Requirements',
      'Before you begin, understand the legal landscape. The Credit Repair Organizations Act (CROA) and state-level regulations govern how credit repair businesses operate. Key requirements include: registering your business, obtaining a surety bond (required in many states), providing clients with written contracts, and never charging upfront fees before work is performed.',
      '## Building Your Tech Stack',
      'The days of running a credit repair business with spreadsheets and Word documents are over. Modern credit repair businesses need: a CRM for client management, credit report parsing and analysis tools, dispute letter generation, outcome tracking, and client communication platforms. Platforms like Credit AI combine all of these into a single, AI-powered operating system.',
      '## Scaling with AI Automation',
      'AI is the biggest competitive advantage available to credit repair businesses today. With AI, you can: analyze credit reports in seconds instead of hours, generate legally compliant dispute letters automatically, predict dispute outcomes before sending, track patterns across bureaus, and manage hundreds of clients without proportionally increasing staff.',
      '## Client Acquisition Strategies',
      'The most successful credit repair businesses use a mix of: referral partnerships (with mortgage brokers, real estate agents, car dealers), social media marketing (especially educational content), local SEO and Google Business optimization, and word-of-mouth from satisfied clients.',
      '## Pricing Your Services',
      'Common pricing models include: monthly subscription ($79-$149/month), per-round pricing ($50-$100 per dispute round), and pay-for-deletion (charging based on successful removals). Choose a model that aligns with your target market and the value you deliver.',
      '## Measuring Success',
      'Track these key metrics: client retention rate, average score improvement, deletion rate, time to first result, and revenue per client. Use analytics dashboards to stay on top of your business performance.',
      '## The Credit AI Advantage',
      'At Credit AI, we built our platform specifically for credit repair businesses that want to scale. Our AI processes disputes 10x faster, our deletion rate is 94%, and our clients see an average score improvement of 85+ points. Whether you\'re just starting out or managing thousands of clients, our platform grows with you.',
    ],
  },
  'impact-of-late-payments': {
    title: 'The Impact of Late Payments on Your Credit Score',
    excerpt: 'How late payments affect your score, how long they stay on your report, and strategies to recover faster.',
    category: 'Education',
    readTime: '5 min read',
    date: 'Jan 8, 2026',
    author: 'Credit AI Team',
    content: [
      'Late payments are one of the most damaging items that can appear on your credit report. Payment history accounts for 35% of your FICO score — the single largest factor. Understanding how late payments work, how long they affect your score, and what you can do about them is essential for anyone on a credit improvement journey.',
      '## How Late Payments Are Reported',
      'Creditors typically don\'t report a payment as late until it\'s at least 30 days past due. Late payments are then categorized by severity: 30 days late, 60 days late, 90 days late, 120 days late, and charge-off. Each level is progressively more damaging to your score.',
      '## The Score Impact',
      'A single 30-day late payment can drop your score by 60-110 points, depending on your starting score. The higher your score before the late payment, the bigger the drop. Someone with a 780 score might see a 100+ point drop, while someone with a 620 score might only lose 40-60 points.',
      '## How Long Do Late Payments Stay?',
      'Late payments remain on your credit report for **7 years** from the date of the original delinquency. However, their impact diminishes over time. A late payment from 5 years ago hurts much less than one from last month.',
      '## The Recency Effect',
      'Credit scoring models weight recent activity more heavily than older activity. This means: a recent late payment has a much bigger impact than an older one, consistent on-time payments after a late payment will gradually rebuild your score, and the first 12-24 months after a late payment see the most significant recovery.',
      '## Strategies to Recover',
      '**Goodwill letters:** If you have a strong payment history and the late payment was a one-time event, write a goodwill letter to the creditor asking them to remove it. Some creditors will honor these requests as a courtesy. **Dispute inaccuracies:** If the late payment is reported incorrectly — wrong date, wrong amount, or wrong account — dispute it with the bureaus. **Negotiate for removal:** If you owe a balance, offer to pay it in full in exchange for the creditor removing the late payment notation. Get any agreement in writing before you pay. **Rebuild with positive history:** Open a secured credit card or become an authorized user on someone else\'s account to add positive payment history to your report.',
      '## When to Seek Professional Help',
      'If you have multiple late payments or other negative items, working with a credit repair professional can accelerate your recovery. AI-powered platforms like Credit AI can identify the best strategy for each item and generate optimized dispute letters that maximize your chances of removal.',
    ],
  },
};

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = slug ? blogArticles[slug] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/blog')}>← Back to Blog</Button>
        </div>
      </div>
    );
  }

  const renderContent = (line: string) => {
    if (line.startsWith('### ')) return <h3 className="text-xl font-bold text-foreground mt-8 mb-3">{line.slice(4)}</h3>;
    if (line.startsWith('## ')) return <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">{line.slice(3)}</h2>;
    // Handle bold and inline content
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p className="text-muted-foreground leading-relaxed mb-4">
        {parts.map((part, i) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>
            : <span key={i}>{part}</span>
        )}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-10 w-auto cursor-pointer" onClick={() => navigate('/')} />
          <Button variant="ghost" onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </Button>
        </div>
      </nav>

      <article className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-primary/10 text-primary border-primary/20">{article.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.readTime}</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{article.date}</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">{article.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>
              <div className="flex items-center justify-between border-t border-b border-border py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {article.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{article.author}</p>
                    <p className="text-xs text-muted-foreground">Credit AI</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon"><Share2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon"><BookOpen className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="prose-custom">
              {article.content.map((line, i) => (
                <div key={i}>{renderContent(line)}</div>
              ))}
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={0.2}>
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-400/10 border border-primary/20 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Transform Your Credit Repair Process?</h3>
              <p className="text-muted-foreground mb-6">Join thousands of professionals using AI to deliver better results, faster.</p>
              <Button size="lg" onClick={() => navigate('/auth')}>
                Get Started Free
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </article>
    </div>
  );
};

export default BlogArticle;
