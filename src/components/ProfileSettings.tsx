import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Crown, Shield, Calendar, X } from 'lucide-react';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  subscription_status: string;
  google_calendar_connected: boolean;
}
const PRICE_IDS = {
premium: 'price_1234567890ABCDEF',
pro: 'price_ABCDEF1234567890', 
basic: 'price_0987654321FEDCBA', 
};

const SUPABASE_CHECKOUT_URL = 'https://[your-project-ref].supabase.co/functions/v1/create-checkout-session';

const ProfileSettings = ({ isOpen, onClose }: ProfileSettingsProps) => {
  const { user, updatePassword } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
    }
  }, [isOpen, user]);

  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile",
        description: "Failed to load your profile information.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUpgradeClick = async (tier) => {
    setIsUpgrading(true);
    const userId = user?.id;

    if (!userId || !PRICE_IDS[tier]) {
      console.error('User ID or price ID is missing.');
      setIsUpgrading(false);
      return;
    }

    try {
      const response = await fetch(SUPABASE_CHECKOUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token || ''}`,
        },
        body: JSON.stringify({
          priceId: PRICE_IDS[tier],
          userId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create Stripe Checkout session:', data.error);
        toast({
          title: "Error starting subscription",
          description: "Failed to create the Stripe checkout session.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('An error occurred during upgrade:', error);
      toast({
        title: "An unexpected error occurred",
        description: "Please check your network and try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, full_name: fullName } : null);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const { error } = await updatePassword(newPassword);

    if (error) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully."
      });
      (e.target as HTMLFormElement).reset();
    }

    setIsLoading(false);
  };
  
  const getButtonText = () => {
    if (isUpgrading) return "Redirecting...";
    if (profile?.subscription_status === 'premium') return "Current Plan";
    return profile?.subscription_status ? "Change Plan" : "Subscribe Now";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass border-primary/20">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <User className="h-8 w-8 text-primary" />
                <div className="absolute inset-0 h-8 w-8 rounded-full animate-pulse-glow"></div>
              </div>
              <div>
                <DialogTitle className="text-2xl gradient-primary bg-clip-text text-transparent">
                  Profile & Settings
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  Manage your account settings and preferences
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {isLoadingProfile ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass mb-6">
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-black data-[state=active]:to-gray-800 data-[state=active]:text-white"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-black data-[state=active]:to-gray-800 data-[state=active]:text-white"
              >
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="subscription"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-black data-[state=active]:to-gray-800 data-[state=active]:text-white"
              >
                Subscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your basic profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        defaultValue={profile?.full_name || ''}
                        placeholder="Enter your full name"
                        className="glass border-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email || user?.email || ''}
                        disabled
                        className="glass border-primary/20 bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed from this interface
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="gradient-primary text-primary-foreground shadow-glow hover-lift"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        minLength={6}
                        required
                        className="glass border-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        minLength={6}
                        required
                        className="glass border-primary/20 focus:border-primary"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="gradient-primary text-primary-foreground shadow-glow hover-lift"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    Subscription Status
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div>
                      <h3 className="font-medium">Current Plan</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {profile?.subscription_status || 'Free'} Plan
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="gradient-primary text-primary-foreground"
                        onClick={() => setIsPricingModalOpen(true)}
                        disabled={isUpgrading}
                      >
                        {getButtonText()}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Google Calendar
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.google_calendar_connected ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {profile?.google_calendar_connected ? (
                        <span className="text-emerald-500">✓ Active</span>
                      ) : (
                        <span className="text-muted-foreground">Disconnected</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
      
      {/* New Pricing Modal */}
      <Dialog open={isPricingModalOpen} onOpenChange={setIsPricingModalOpen}>
        <DialogContent className="max-w-3xl glass border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
            <DialogDescription>
              Select the perfect plan for your needs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-3">
             {/* Basic Tier Card */}
             <Card className={`glass-card p-4 transition-all duration-300 ${profile?.subscription_status === 'basic' ? 'border-2 border-primary shadow-glow' : ''}`}>
                <CardHeader className="text-center pb-2">
                  <h4 className="font-bold text-lg">Basic</h4>
                  <p className="text-xl font-semibold mt-1">$0<span className="text-sm text-muted-foreground">/month</span></p>
                  <CardDescription className="text-sm">Perfect for getting started.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="text-left text-sm space-y-2 mb-4">
                    <li>• Manual cycle tracking</li>
                    <li>• Basic period predictions</li>
                    <li>• Limited AI Chatbot access</li>
                  </ul>
                  <Button 
                    size="sm" 
                    disabled={isUpgrading || profile?.subscription_status === 'basic'}
                    className="w-full gradient-basic"
                  >
                    {profile?.subscription_status === 'basic' ? "Current Plan" : "Get Basic"}
                  </Button>
                </CardContent>
              </Card>

             {/* Pro Tier Card */}
             <Card className={`glass-card p-4 transition-all duration-300 ${profile?.subscription_status === 'pro' ? 'border-2 border-primary shadow-glow' : ''}`}>
                <CardHeader className="text-center pb-2">
                  <h4 className="font-bold text-lg">Pro</h4>
                  <p className="text-xl font-semibold mt-1">$15<span className="text-sm text-muted-foreground">/month</span></p>
                  <CardDescription className="text-sm">Advanced features for power users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="text-left text-sm space-y-2 mb-4">
                    <li>• Unlimited cycle tracking</li>
                    <li>• Advanced period predictions</li>
                    <li>• AI Chatbot with history</li>
                  </ul>
                  <Button 
                    size="sm" 
                    onClick={() => handleUpgradeClick('pro')}
                    disabled={isUpgrading || profile?.subscription_status === 'pro'}
                    className="w-full gradient-pro"
                  >
                    {profile?.subscription_status === 'pro' ? "Current Plan" : isUpgrading ? "Redirecting..." : "Upgrade to Pro"}
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Tier Card */}
              <Card className={`glass-card p-4 transition-all duration-300 ${profile?.subscription_status === 'premium' ? 'border-2 border-primary shadow-glow' : ''}`}>
                <CardHeader className="text-center pb-2">
                  <h4 className="font-bold text-lg">Premium</h4>
                  <p className="text-xl font-semibold mt-1">$25<span className="text-sm text-muted-foreground">/month</span></p>
                  <CardDescription className="text-sm">Everything in Pro, plus exclusive benefits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="text-left text-sm space-y-2 mb-4">
                    <li>• All Pro features</li>
                    <li>• Outlook and Google Calendar sync</li>
                    <li>• Priority customer support</li>
                  </ul>
                  <Button 
                    size="sm" 
                    onClick={() => handleUpgradeClick('premium')}
                    disabled={isUpgrading || profile?.subscription_status === 'premium'}
                    className="w-full gradient-premium"
                  >
                    {profile?.subscription_status === 'premium' ? "Current Plan" : isUpgrading ? "Redirecting..." : "Upgrade to Premium"}
                  </Button>
                </CardContent>
              </Card>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default ProfileSettings;
