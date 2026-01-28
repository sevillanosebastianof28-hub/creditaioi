import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useBrand } from '@/contexts/BrandContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { brand } = useBrand();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have an access token in the URL (recovery flow)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (type !== 'recovery' || !accessToken) {
      setError('Invalid or expired password reset link. Please request a new one.');
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: 'Reset failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setIsSuccess(true);
      toast({
        title: 'Password updated!',
        description: 'Your password has been successfully reset.',
      });
      // Redirect after a short delay
      setTimeout(() => navigate('/auth'), 2000);
    }
    
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur-xl shadow-xl">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl mb-2">Password Reset Successful!</CardTitle>
            <CardDescription className="mb-6">
              Your password has been updated. Redirecting to sign in...
            </CardDescription>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90">
                Go to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur-xl shadow-xl">
          <CardContent className="py-12 text-center">
            <CardTitle className="text-2xl mb-2 text-destructive">Invalid Link</CardTitle>
            <CardDescription className="mb-6">{error}</CardDescription>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md relative z-10">
        <Link 
          to="/auth" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>

        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          {brand.logo_url ? (
            <img src={brand.logo_url} alt={brand.company_name} className="h-14 w-auto" />
          ) : (
            <img src="/images/credit-ai-logo.png" alt="Credit AI Platform" className="h-14 w-auto" />
          )}
        </div>

        <Card className="border-border bg-card/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background border-border"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background border-border"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
