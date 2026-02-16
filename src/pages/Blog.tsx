import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, User, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { useState } from 'react';

const blogPosts = [
  {
    slug: 'understanding-your-credit-report',
    title: 'Understanding Your Credit Report: A Complete Guide',
    excerpt: 'Learn how to read your credit report, identify errors, and understand what each section means for your financial health.',
    category: 'Education',
    readTime: '8 min read',
    date: 'Feb 10, 2026',
    author: 'Sebastian Sevillano',
  },
  {
    slug: 'ai-transforming-credit-repair-2026',
    title: 'How AI is Transforming Credit Repair in 2026',
    excerpt: 'Discover how artificial intelligence is making credit repair faster, more accurate, and more accessible than ever before.',
    category: 'AI & Technology',
    readTime: '6 min read',
    date: 'Feb 5, 2026',
    author: 'Credit AI Team',
  },
  {
    slug: 'common-credit-report-errors',
    title: '5 Common Credit Report Errors and How to Dispute Them',
    excerpt: 'From incorrect balances to fraudulent accounts, here are the most common errors and step-by-step instructions to dispute them.',
    category: 'Disputes',
    readTime: '10 min read',
    date: 'Jan 28, 2026',
    author: 'Sebastian Sevillano',
  },
  {
    slug: 'fcra-rights-every-consumer-should-know',
    title: 'FCRA Rights Every Consumer Should Know',
    excerpt: 'The Fair Credit Reporting Act gives you powerful rights. Learn what they are and how to exercise them effectively.',
    category: 'Compliance',
    readTime: '7 min read',
    date: 'Jan 20, 2026',
    author: 'Credit AI Team',
  },
  {
    slug: 'building-credit-repair-business-2026',
    title: 'Building a Successful Credit Repair Business in 2026',
    excerpt: 'Tips and strategies for starting or scaling your credit repair business using modern tools and AI automation.',
    category: 'Business',
    readTime: '12 min read',
    date: 'Jan 15, 2026',
    author: 'Sebastian Sevillano',
  },
  {
    slug: 'impact-of-late-payments',
    title: 'The Impact of Late Payments on Your Credit Score',
    excerpt: 'How late payments affect your score, how long they stay on your report, and strategies to recover faster.',
    category: 'Education',
    readTime: '5 min read',
    date: 'Jan 8, 2026',
    author: 'Credit AI Team',
  },
];

const categories = ['All', 'Education', 'AI & Technology', 'Disputes', 'Compliance', 'Business'];

const Blog = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-10 w-auto cursor-pointer" onClick={() => navigate('/')} />
          <Button variant="ghost" onClick={() => navigate('/')}>← Back to Home</Button>
        </div>
      </nav>

      <section className="pt-32 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-3xl">
          <ScrollReveal>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Blog</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Credit Repair Insights</h1>
            <p className="text-lg text-muted-foreground mb-8">Expert tips, industry news, and guides to help you master credit repair.</p>
          </ScrollReveal>

          {/* Search & Filter */}
          <ScrollReveal delay={0.05}>
            <div className="flex flex-col sm:flex-row items-center gap-4 max-w-xl mx-auto mb-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
              <Button variant="ghost" className="mt-4" onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}>Clear filters</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, i) => (
                <ScrollReveal key={post.slug} delay={i * 0.05}>
                  <Card
                    className="h-full border-border hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
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
                        <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read more <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-400/10 border border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-2">Stay Updated</h3>
              <p className="text-muted-foreground mb-6">Get the latest credit repair insights delivered to your inbox.</p>
              <Button size="lg" onClick={() => navigate('/auth')}>
                Join Credit AI
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Blog;
