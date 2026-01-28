import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { useBrand } from '@/contexts/BrandContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Building2, 
  UserCog, 
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const roleOptions: { value: AppRole; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: 'client',
    label: 'Client',
    description: 'Individual consumer looking to repair credit',
    icon: User,
  },
  {
    value: 'agency_owner',
    label: 'Business Owner',
    description: 'Credit repair business owner with full platform access',
    icon: Building2,
  },
  {
    value: 'va_staff',
    label: 'VA / Staff',
    description: 'Business employee with limited operations access',
    icon: UserCog,
  },
];

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { brand } = useBrand();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully.',
      });
      navigate('/');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setForgotEmailSent(true);
      toast({
        title: 'Email sent!',
        description: 'Check your inbox for the password reset link.',
      });
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setIsLoading(true);
    
    const { error } = await signUp(
      email, 
      password, 
      selectedRole, 
      firstName, 
      lastName,
      selectedRole === 'agency_owner' ? agencyName : undefined
    );
    
    if (error) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account created!',
        description: `Welcome to ${brand.company_name}. Your account has been set up.`,
      });
      navigate('/');
    }
    setIsLoading(false);
  };

  const proceedToDetails = () => {
    if (selectedRole) {
      setStep('details');
    }
  };

  // Dynamic styles based on brand settings
  const backgroundStyle = brand.login_background_url
    ? { backgroundImage: `url(${brand.login_background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center p-4 relative overflow-hidden"
      style={backgroundStyle}
    >
      {/* Background decorations */}
      {!brand.login_background_url && (
        <>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </>
      )}
      
      {/* Overlay for custom background */}
      {brand.login_background_url && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}
      
      <div className="w-full max-w-lg relative z-10">
        {/* Back to home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Logo */}
        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          {brand.logo_url ? (
            <img src={brand.logo_url} alt={brand.company_name} className="h-14 w-auto" />
          ) : (
            <img src="/images/credit-ai-logo.png" alt="Credit AI Platform" className="h-14 w-auto" />
          )}
          {brand.login_tagline && (
            <p className="text-muted-foreground text-center text-sm max-w-sm">
              {brand.login_tagline}
            </p>
          )}
        </div>

        <Card className="border-border bg-card/80 backdrop-blur-xl shadow-xl">
          <Tabs defaultValue="signin" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2 bg-secondary">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => setStep('role')}
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* Sign In */}
              <TabsContent value="signin" className="mt-0">
                {showForgotPassword ? (
                  forgotEmailSent ? (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Mail className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          We sent a password reset link to <strong>{forgotEmail}</strong>
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => { setShowForgotPassword(false); setForgotEmailSent(false); }}
                        className="w-full"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Sign In
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(false)}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        Back to sign in
                      </button>
                      <div>
                        <CardTitle className="text-xl text-foreground">Forgot Password?</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Enter your email and we'll send you a reset link
                        </CardDescription>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email" className="text-foreground">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="you@example.com"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="pl-10 bg-background border-border"
                            required
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  )
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-background border-border"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password" className="text-foreground">Password</Label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-background border-border"
                          required
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
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}
              </TabsContent>

              {/* Sign Up */}
              <TabsContent value="signup" className="mt-0">
                {step === 'role' ? (
                  <div className="space-y-4">
                    <div>
                      <CardTitle className="text-xl text-foreground">Choose Your Role</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Select how you'll be using {brand.company_name}
                      </CardDescription>
                    </div>
                    <div className="space-y-3">
                      {roleOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedRole === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setSelectedRole(option.value)}
                            className={cn(
                              'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
                              'hover:border-primary/50 hover:bg-secondary/50',
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border bg-background'
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                                isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                              )}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-foreground">{option.label}</p>
                                  {isSelected && (
                                    <Check className="w-5 h-5 text-primary" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <Button 
                      onClick={proceedToDetails}
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={!selectedRole}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setStep('role')}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Back to role selection
                    </button>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-background border-border"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-background border-border"
                          required
                        />
                      </div>
                    </div>

                    {selectedRole === 'agency_owner' && (
                      <div className="space-y-2">
                        <Label htmlFor="agencyName" className="text-foreground">Business Name</Label>
                        <Input
                          id="agencyName"
                          placeholder="Your Credit Repair Business"
                          value={agencyName}
                          onChange={(e) => setAgencyName(e.target.value)}
                          className="bg-background border-border"
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-background border-border"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
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
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-muted-foreground text-sm mt-6">
          By signing up, you agree to our{' '}
          <a 
            href={brand.terms_url || '#'} 
            className="text-primary hover:underline"
            target={brand.terms_url ? '_blank' : undefined}
            rel={brand.terms_url ? 'noopener noreferrer' : undefined}
          >
            Terms of Service
          </a>
          {' '}and{' '}
          <a 
            href={brand.privacy_url || '#'} 
            className="text-primary hover:underline"
            target={brand.privacy_url ? '_blank' : undefined}
            rel={brand.privacy_url ? 'noopener noreferrer' : undefined}
          >
            Privacy Policy
          </a>
        </p>

        {/* Powered by badge - can be hidden */}
        {!brand.hide_powered_by && (
          <p className="text-center text-muted-foreground/50 text-xs mt-4">
            Powered by Credit AI Platform
          </p>
        )}
      </div>
    </div>
  );
}
