import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Heart, Sparkles, Shield, Zap } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp, forgotPassword, updatePassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    // Check if this is a password reset flow
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      setIsPasswordReset(true);
    }
  }, [searchParams]);

  if (user && !isPasswordReset) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account."
      });
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    const { error } = await forgotPassword(email);

    if (error) {
      toast({
        title: "Error sending reset email",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password."
      });
      setShowForgotPassword(false);
    }

    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const { error } = await updatePassword(password);

    if (error) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Password updated successfully",
        description: "Your password has been updated. You are now logged in."
      });
      setIsPasswordReset(false);
      // User will be redirected to dashboard by the navigation logic
    }

    setIsLoading(false);
  };

  // If this is a password reset flow, show the reset form
  if (isPasswordReset && user) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 animate-float blur-3xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-accent/15 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full bg-primary/5 animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/2 right-10 w-20 h-20 rounded-full bg-primary/8 animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="glass-card shadow-strong animate-scale-in border-primary/20">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Heart className="h-12 w-12 text-primary animate-glow" />
                  <div className="absolute inset-0 h-12 w-12 rounded-full animate-pulse-glow"></div>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-3">
                Reset Your Password
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Please enter your new password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter new password"
                    minLength={6}
                    required
                    className="glass border-primary/20 focus:border-primary transition-all duration-300 h-12"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                    className="glass border-primary/20 focus:border-primary transition-all duration-300 h-12"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full gradient-primary text-primary-foreground shadow-glow hover-lift h-12 text-base font-medium" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Updating password...
                    </div>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 animate-float blur-3xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-accent/15 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full bg-primary/5 animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 rounded-full bg-primary/8 animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="glass-card shadow-strong animate-scale-in border-primary/20">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Heart className="h-12 w-12 text-primary animate-glow" />
                <div className="absolute inset-0 h-12 w-12 rounded-full animate-pulse-glow"></div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-3">
              Welcome to Women CycleWise
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Your personal cycle companion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass mb-8">
               <TabsTrigger
  value="signin"
  className="data-[state=active]:gradient-primary data-[state=active]:text-black transition-all duration-300"
>
  Sign In
</TabsTrigger>
<TabsTrigger
  value="signup"
  className="data-[state=active]:gradient-primary data-[state=active]:text-black transition-all duration-300"
>
  Sign Up
</TabsTrigger>

              </TabsList>
              
              <TabsContent value="signin" className="space-y-0">
                <form onSubmit={showForgotPassword ? handleForgotPassword : handleSignIn} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="glass border-primary/20 focus:border-primary transition-all duration-300 h-12"
                    />
                  </div>
                  {!showForgotPassword && (
                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="glass border-primary/20 focus:border-primary transition-all duration-300 h-12"
                      />
                    </div>
                  )}
                  
                  {showForgotPassword ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          Enter your email to reset your password
                        </p>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full gradient-primary text-primary-foreground shadow-glow hover-lift h-12 text-base font-medium" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                            Sending reset email...
                          </div>
                        ) : (
                          "Send Reset Email"
                        )}
                      </Button>
                      <Button 
                        type="button"
                        variant="ghost" 
                        className="w-full" 
                        onClick={() => setShowForgotPassword(false)}
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Button 
                        type="submit" 
                        className="w-full gradient-primary text-primary-foreground shadow-glow hover-lift h-12 text-base font-medium" 
                        disabled={isLoading}
                      >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Signing in...
                      </div>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                      <div className="text-center">
                        <button 
                          type="button"
                          className="text-sm text-primary hover:underline transition-colors"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot your password?
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-0">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Your name"
                      required
                      className="glass border-primary/20 focus:border-primary transition-all duration-300 h-12"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="glass border-primary/20 focus:border-primary transition-all duration-300 h-12"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      minLength={6}
                      required
                      className="glass border-primary/20 focus:border-primary transition-all duration-300 h-12"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary text-primary-foreground shadow-glow hover-lift h-12 text-base font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Trust indicators */}
            <div className="flex justify-center items-center mt-8 space-x-6 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="flex items-center text-xs text-muted-foreground">
                <Shield className="h-3 w-3 mr-1 text-primary" />
                HIPAA Secure
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 mr-1 text-primary" />
                AI-Powered
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Zap className="h-3 w-3 mr-1 text-primary" />
                Fast Setup
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;