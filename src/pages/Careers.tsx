import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Careers = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-10 w-auto cursor-pointer" onClick={() => navigate('/')} />
          <Button variant="ghost" onClick={() => navigate('/')}>← Back to Home</Button>
        </div>
      </nav>
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Careers</h1>
          <p className="text-lg text-muted-foreground mb-8">This page is coming soon. Stay tuned!</p>
          <Card className="border-dashed border-2 border-primary/20">
            <CardContent className="p-12">
              <p className="text-muted-foreground">We're building an incredible team. Check back soon for open positions.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Careers;
