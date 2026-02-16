import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const blogPosts = [
  {
    title: 'Understanding Your Credit Report: A Complete Guide',
    excerpt: 'Learn how to read your credit report, identify errors, and understand what each section means for your financial health.',
    category: 'Education',
    readTime: '8 min read',
    date: 'Feb 10, 2026',
    author: 'Sebastian Sevillano',
  },
  {
    title: 'How AI is Transforming Credit Repair in 2026',
    excerpt: 'Discover how artificial intelligence is making credit repair faster, more accurate, and more accessible than ever before.',
    category: 'AI & Technology',
    readTime: '6 min read',
    date: 'Feb 5, 2026',
    author: 'Credit AI Team',
  },
  {
    title: '5 Common Credit Report Errors and How to Dispute Them',
    excerpt: 'From incorrect balances to fraudulent accounts, here are the most common errors and step-by-step instructions to dispute them.',
    category: 'Disputes',
    readTime: '10 min read',
    date: 'Jan 28, 2026',
    author: 'Sebastian Sevillano',
  },
  {
    title: 'FCRA Rights Every Consumer Should Know',
    excerpt: 'The Fair Credit Reporting Act gives you powerful rights. Learn what they are and how to exercise them effectively.',
    category: 'Compliance',
    readTime: '7 min read',
    date: 'Jan 20, 2026',
    author: 'Credit AI Team',
  },
  {
    title: 'Building a Successful Credit Repair Business in 2026',
    excerpt: 'Tips and strategies for starting or scaling your credit repair business using modern tools and AI automation.',
    category: 'Business',
    readTime: '12 min read',
    date: 'Jan 15, 2026',
    author: 'Sebastian Sevillano',
  },
  {
    title: 'The Impact of Late Payments on Your Credit Score',
    excerpt: 'How late payments affect your score, how long they stay on your report, and strategies to recover faster.',
    category: 'Education',
    readTime: '5 min read',
    date: 'Jan 8, 2026',
    author: 'Credit AI Team',
  },
];

const Blog = () => {
  const navigate = useNavigate();

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
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Blog</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Credit Repair Insights</h1>
            <p className="text-lg text-muted-foreground">Expert tips, industry news, and guides to help you master credit repair.</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <Card className="h-full border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />{post.author}
                      </div>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
