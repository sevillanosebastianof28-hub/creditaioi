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
 import { motion, AnimatePresence } from 'framer-motion';
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
   ArrowLeft,
   Shield,
   Sparkles,
   Crown,
   Users,
   TrendingUp,
   Star
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
 
 const roleOptions: { 
   value: AppRole; 
   label: string; 
   description: string; 
   icon: React.ElementType;
   gradient: string;
   features: string[];
   badge?: string;
 }[] = [
   {
     value: 'client',
     label: 'Client',
     description: 'Individual consumer looking to repair credit',
     icon: User,
     gradient: 'from-blue-500 to-cyan-500',
     features: ['Personal Dashboard', 'Score Tracking', 'Dispute Progress'],
   },
   {
     value: 'agency_owner',
     label: 'Business Owner',
     description: 'Credit repair business with full platform access',
     icon: Crown,
     gradient: 'from-primary to-emerald-400',
     features: ['Unlimited Clients', 'White-Label Portal', 'Advanced Analytics'],
     badge: 'Most Popular',
   },
   {
     value: 'va_staff',
     label: 'VA / Staff',
     description: 'Business employee with operations access',
     icon: Users,
     gradient: 'from-purple-500 to-pink-500',
     features: ['Client Management', 'Dispute Letters', 'Task Automation'],
   },
 ];
 
 const containerVariants = {
   hidden: { opacity: 0 },
   visible: {
     opacity: 1,
     transition: { staggerChildren: 0.1 }
   }
 };
 
 const itemVariants = {
   hidden: { opacity: 0, y: 20 },
   visible: { opacity: 1, y: 0 }
 };
 
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
   const [hoveredRole, setHoveredRole] = useState<AppRole | null>(null);
   
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
 
   const backgroundStyle = brand.login_background_url
     ? { backgroundImage: `url(${brand.login_background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
     : {};
 
   return (
     <div 
       className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden"
       style={backgroundStyle}
     >
       {/* Animated background elements */}
       {!brand.login_background_url && (
         <>
           <div className="absolute top-0 right-0 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse-slow" />
           <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-primary/3 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
         </>
       )}
       
       {brand.login_background_url && (
         <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
       )}
       
       <motion.div 
         className="w-full max-w-md sm:max-w-lg lg:max-w-xl relative z-10"
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
       >
         {/* Back to home */}
         <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
         >
           <Link 
             to="/" 
             className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 mb-6 group"
           >
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
             <span className="text-sm font-medium">Back to home</span>
           </Link>
         </motion.div>
 
         {/* Logo */}
         <motion.div 
           className="flex flex-col items-center justify-center gap-3 mb-6 sm:mb-8"
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
         >
           {brand.logo_url ? (
             <img src={brand.logo_url} alt={brand.company_name} className="h-12 sm:h-14 w-auto" />
           ) : (
             <img src="/images/credit-ai-logo.png" alt="Credit AI Platform" className="h-12 sm:h-14 w-auto" />
           )}
           {brand.login_tagline && (
             <p className="text-muted-foreground text-center text-sm max-w-sm px-4">
               {brand.login_tagline}
             </p>
           )}
         </motion.div>
 
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
         >
           <Card className="border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden">
             <Tabs defaultValue="signin" className="w-full">
               <CardHeader className="pb-4 px-4 sm:px-6">
                 <TabsList className="grid w-full grid-cols-2 bg-secondary/80 p-1 rounded-xl h-12">
                   <TabsTrigger 
                     value="signin" 
                     className="rounded-lg text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
                   >
                     Sign In
                   </TabsTrigger>
                   <TabsTrigger 
                     value="signup" 
                     className="rounded-lg text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
                     onClick={() => setStep('role')}
                   >
                     Sign Up
                   </TabsTrigger>
                 </TabsList>
               </CardHeader>
 
               <CardContent className="px-4 sm:px-6 pb-6">
                 {/* Sign In */}
                 <TabsContent value="signin" className="mt-0">
                   <AnimatePresence mode="wait">
                     {showForgotPassword ? (
                       forgotEmailSent ? (
                         <motion.div 
                           key="forgot-sent"
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                           className="text-center space-y-4 py-4"
                         >
                           <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto ring-4 ring-primary/10">
                             <Mail className="w-10 h-10 text-primary" />
                           </div>
                           <div>
                             <h3 className="text-xl font-bold text-foreground">Check your email</h3>
                             <p className="text-muted-foreground text-sm mt-2 px-4">
                               We sent a password reset link to <strong className="text-foreground">{forgotEmail}</strong>
                             </p>
                           </div>
                           <Button 
                             variant="outline"
                             onClick={() => { setShowForgotPassword(false); setForgotEmailSent(false); }}
                             className="w-full h-12 rounded-xl border-2 hover:bg-secondary/50"
                           >
                             <ArrowLeft className="w-4 h-4 mr-2" />
                             Back to Sign In
                           </Button>
                         </motion.div>
                       ) : (
                         <motion.form 
                           key="forgot-form"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           onSubmit={handleForgotPassword} 
                           className="space-y-5"
                         >
                           <button
                             type="button"
                             onClick={() => setShowForgotPassword(false)}
                             className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
                           >
                             <ArrowLeft className="w-3 h-3" />
                             Back to sign in
                           </button>
                           <div>
                             <CardTitle className="text-xl sm:text-2xl text-foreground">Forgot Password?</CardTitle>
                             <CardDescription className="text-muted-foreground mt-1">
                               Enter your email and we'll send you a reset link
                             </CardDescription>
                           </div>
                           <div className="space-y-2">
                             <Label htmlFor="forgot-email" className="text-foreground font-medium">Email Address</Label>
                             <div className="relative group">
                               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                               <Input
                                 id="forgot-email"
                                 type="email"
                                 placeholder="you@example.com"
                                 value={forgotEmail}
                                 onChange={(e) => setForgotEmail(e.target.value)}
                                 className="pl-12 h-12 bg-background border-2 border-border/50 rounded-xl focus:border-primary/50 transition-all"
                                 required
                               />
                             </div>
                           </div>
                           <Button 
                             type="submit" 
                             className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity text-base font-semibold shadow-lg shadow-primary/25"
                             disabled={isLoading}
                           >
                             {isLoading ? (
                               <span className="flex items-center gap-2">
                                 <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                 Sending...
                               </span>
                             ) : (
                               <>
                                 Send Reset Link
                                 <ArrowRight className="w-5 h-5 ml-2" />
                               </>
                             )}
                           </Button>
                         </motion.form>
                       )
                     ) : (
                       <motion.form 
                         key="signin-form"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         onSubmit={handleSignIn} 
                         className="space-y-5"
                       >
                         <div className="space-y-2">
                           <Label htmlFor="signin-email" className="text-foreground font-medium">Email Address</Label>
                           <div className="relative group">
                             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                             <Input
                               id="signin-email"
                               type="email"
                               placeholder="you@example.com"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               className="pl-12 h-12 bg-background border-2 border-border/50 rounded-xl focus:border-primary/50 transition-all"
                               required
                             />
                           </div>
                         </div>
                         <div className="space-y-2">
                           <div className="flex items-center justify-between">
                             <Label htmlFor="signin-password" className="text-foreground font-medium">Password</Label>
                             <button
                               type="button"
                               onClick={() => setShowForgotPassword(true)}
                               className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                             >
                               Forgot password?
                             </button>
                           </div>
                           <div className="relative group">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                             <Input
                               id="signin-password"
                               type={showPassword ? 'text' : 'password'}
                               placeholder="••••••••"
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               className="pl-12 pr-12 h-12 bg-background border-2 border-border/50 rounded-xl focus:border-primary/50 transition-all"
                               required
                             />
                             <button
                               type="button"
                               onClick={() => setShowPassword(!showPassword)}
                               className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                             >
                               {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                             </button>
                           </div>
                         </div>
                         <Button 
                           type="submit" 
                           className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity text-base font-semibold shadow-lg shadow-primary/25"
                           disabled={isLoading}
                         >
                           {isLoading ? (
                             <span className="flex items-center gap-2">
                               <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                               Signing in...
                             </span>
                           ) : (
                             <>
                               Sign In
                               <ArrowRight className="w-5 h-5 ml-2" />
                             </>
                           )}
                         </Button>
                         
                         {/* Trust indicators */}
                         <div className="flex items-center justify-center gap-4 pt-2">
                           <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                             <Shield className="w-3.5 h-3.5 text-primary" />
                             <span>Secure Login</span>
                           </div>
                           <div className="w-1 h-1 rounded-full bg-border" />
                           <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                             <Lock className="w-3.5 h-3.5 text-primary" />
                             <span>256-bit SSL</span>
                           </div>
                         </div>
                       </motion.form>
                     )}
                   </AnimatePresence>
                 </TabsContent>
 
                 {/* Sign Up */}
                 <TabsContent value="signup" className="mt-0">
                   <AnimatePresence mode="wait">
                     {step === 'role' ? (
                       <motion.div 
                         key="role-selection"
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: 20 }}
                         className="space-y-5"
                       >
                         <div className="text-center sm:text-left">
                           <CardTitle className="text-xl sm:text-2xl text-foreground flex items-center gap-2 justify-center sm:justify-start">
                             <Sparkles className="w-5 h-5 text-primary" />
                             Choose Your Role
                           </CardTitle>
                           <CardDescription className="text-muted-foreground mt-1">
                             Select how you'll be using {brand.company_name}
                           </CardDescription>
                         </div>
                         
                         <motion.div 
                           className="space-y-3"
                           variants={containerVariants}
                           initial="hidden"
                           animate="visible"
                         >
                           {roleOptions.map((option) => {
                             const Icon = option.icon;
                             const isSelected = selectedRole === option.value;
                             const isHovered = hoveredRole === option.value;
                             
                             return (
                               <motion.button
                                 key={option.value}
                                 type="button"
                                 variants={itemVariants}
                                 onClick={() => setSelectedRole(option.value)}
                                 onMouseEnter={() => setHoveredRole(option.value)}
                                 onMouseLeave={() => setHoveredRole(null)}
                                 className={cn(
                                   'w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden group',
                                   isSelected
                                     ? 'border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg shadow-primary/10'
                                     : 'border-border/50 bg-background/50 hover:border-primary/40 hover:bg-secondary/30'
                                 )}
                               >
                                 {/* Badge */}
                                 {option.badge && (
                                   <div className="absolute -top-0 right-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-lg">
                                     {option.badge}
                                   </div>
                                 )}
                                 
                                 <div className="flex items-start gap-4">
                                   {/* Icon */}
                                   <div className={cn(
                                     'w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 bg-gradient-to-br',
                                     option.gradient,
                                     isSelected || isHovered ? 'shadow-lg scale-105' : 'opacity-80'
                                   )}>
                                     <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                   </div>
                                   
                                   <div className="flex-1 min-w-0">
                                     <div className="flex items-center justify-between mb-1">
                                       <p className="font-bold text-base sm:text-lg text-foreground">{option.label}</p>
                                       {isSelected && (
                                         <motion.div
                                           initial={{ scale: 0 }}
                                           animate={{ scale: 1 }}
                                           className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                                         >
                                           <Check className="w-4 h-4 text-primary-foreground" />
                                         </motion.div>
                                       )}
                                     </div>
                                     <p className="text-sm text-muted-foreground mb-3">
                                       {option.description}
                                     </p>
                                     
                                     {/* Features */}
                                     <div className="flex flex-wrap gap-1.5">
                                       {option.features.map((feature, idx) => (
                                         <span 
                                           key={idx}
                                           className={cn(
                                             'text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium transition-colors',
                                             isSelected 
                                               ? 'bg-primary/15 text-primary' 
                                               : 'bg-secondary text-muted-foreground'
                                           )}
                                         >
                                           {feature}
                                         </span>
                                       ))}
                                     </div>
                                   </div>
                                 </div>
                               </motion.button>
                             );
                           })}
                         </motion.div>
                         
                         <Button 
                           onClick={proceedToDetails}
                           className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity text-base font-semibold shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                           disabled={!selectedRole}
                         >
                           Continue
                           <ArrowRight className="w-5 h-5 ml-2" />
                         </Button>
                       </motion.div>
                     ) : (
                       <motion.form 
                         key="details-form"
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -20 }}
                         onSubmit={handleSignUp} 
                         className="space-y-5"
                       >
                         <button
                           type="button"
                           onClick={() => setStep('role')}
                           className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
                         >
                           <ArrowLeft className="w-3 h-3" />
                           Back to role selection
                         </button>
                         
                         {/* Selected role indicator */}
                         {selectedRole && (
                           <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                             {(() => {
                               const role = roleOptions.find(r => r.value === selectedRole);
                               const Icon = role?.icon || User;
                               return (
                                 <>
                                   <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br', role?.gradient)}>
                                     <Icon className="w-5 h-5 text-white" />
                                   </div>
                                   <div>
                                     <p className="font-semibold text-sm text-foreground">Signing up as {role?.label}</p>
                                     <p className="text-xs text-muted-foreground">{role?.description}</p>
                                   </div>
                                 </>
                               );
                             })()}
                           </div>
                         )}
                         
                         <div className="grid grid-cols-2 gap-3 sm:gap-4">
                           <div className="space-y-2">
                             <Label htmlFor="firstName" className="text-foreground font-medium text-sm">First Name</Label>
                             <Input
                               id="firstName"
                               placeholder="John"
                               value={firstName}
                               onChange={(e) => setFirstName(e.target.value)}
                               className="h-11 bg-background border-2 border-border/50 rounded-xl focus:border-primary/50 transition-all"
                               required
                             />
                           </div>
                           <div className="space-y-2">
                             <Label htmlFor="lastName" className="text-foreground font-medium text-sm">Last Name</Label>
                             <Input
                               id="lastName"
                               placeholder="Doe"
                               value={lastName}
                               onChange={(e) => setLastName(e.target.value)}
                               className="h-11 bg-background border-2 border-border/50 rounded-xl focus:border-primary/50 transition-all"
                               required
                             />
                           </div>
                         </div>
                         
                         {selectedRole === 'agency_owner' && (
                           <motion.div 
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: 'auto' }}
                             className="space-y-2"
                           >
                             <Label htmlFor="agencyName" className="text-foreground font-medium text-sm flex items-center gap-2">
                               <Building2 className="w-4 h-4 text-primary" />
                               Business Name
                             </Label>
                             <Input
                               id="agencyName"
                               placeholder="Your Credit Repair Business"
                               value={agencyName}
                               onChange={(e) => setAgencyName(e.target.value)}
                               className="h-11 bg-background border-2 border-border/50 rounded-xl focus:border-primary/50 transition-all"
                               required
                             />
                           </motion.div>
                         )}
                         
                         <div className="space-y-2">
                           <Label htmlFor="signup-email" className="text-foreground font-medium text-sm">Email Address</Label>
                           <div className="relative group">
                             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                             <Input
                               id="signup-email"
                               type="email"
                               placeholder="you@example.com"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               className="pl-12 h-11 bg-background border-2 border-border/50 rounded-xl focus:border-primary/50 transition-all"
                               required
                             />
                           </div>
                         </div>
                         
                         <div className="space-y-2">
                           <Label htmlFor="signup-password" className="text-foreground font-medium text-sm">Password</Label>
                           <div className="relative group">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                             <Input
                               id="signup-password"
                               type={showPassword ? 'text' : 'password'}
                               placeholder="Create a strong password"
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               className="pl-12 pr-12 h-11 bg-background border-2 border-border/50 rounded-xl focus:border-primary/50 transition-all"
                               required
                             />
                             <button
                               type="button"
                               onClick={() => setShowPassword(!showPassword)}
                               className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                             >
                               {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                             </button>
                           </div>
                           <PasswordStrengthIndicator password={password} />
                         </div>
                         
                         <Button 
                           type="submit" 
                           className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity text-base font-semibold shadow-lg shadow-primary/25"
                           disabled={isLoading}
                         >
                           {isLoading ? (
                             <span className="flex items-center gap-2">
                               <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                               Creating account...
                             </span>
                           ) : (
                             <>
                               Create Account
                               <ArrowRight className="w-5 h-5 ml-2" />
                             </>
                           )}
                         </Button>
                         
                         {/* Trust indicators */}
                         <div className="flex items-center justify-center gap-4 pt-1">
                           <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                             <Shield className="w-3.5 h-3.5 text-primary" />
                             <span>Secure</span>
                           </div>
                           <div className="w-1 h-1 rounded-full bg-border" />
                           <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                             <Star className="w-3.5 h-3.5 text-primary" />
                             <span>Free Trial</span>
                           </div>
                           <div className="w-1 h-1 rounded-full bg-border" />
                           <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                             <TrendingUp className="w-3.5 h-3.5 text-primary" />
                             <span>No CC Required</span>
                           </div>
                         </div>
                       </motion.form>
                     )}
                   </AnimatePresence>
                 </TabsContent>
               </CardContent>
             </Tabs>
           </Card>
         </motion.div>
         
         {/* Footer */}
         <motion.p 
           className="text-center text-xs text-muted-foreground mt-6"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
         >
           By continuing, you agree to our{' '}
           {brand.terms_url ? (
             <a href={brand.terms_url} className="text-primary hover:underline">Terms</a>
           ) : (
             <span className="text-primary">Terms</span>
           )}
           {' '}and{' '}
           {brand.privacy_url ? (
             <a href={brand.privacy_url} className="text-primary hover:underline">Privacy Policy</a>
           ) : (
             <span className="text-primary">Privacy Policy</span>
           )}
         </motion.p>
       </motion.div>
     </div>
   );
 }