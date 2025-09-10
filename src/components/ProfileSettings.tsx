import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User, Crown, Shield, Calendar, RefreshCw } from 'lucide-react';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: any;
  onProfileUpdated?: any;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  subscription_status: string;
  google_calendar_connected: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  updated_at?: string;
}

// ⚠️ IMPORTANT: Replace with your actual Stripe Price IDs from the Stripe Dashboard
const PRICE_IDS = {
  premium: 'price_1S04gjHtLjP6FpI4UvNKxybT', // <-- Replace with your Premium Price ID
  pro: 'price_1S04gaHtLjP6FpI4M4h1FBpT',      // <-- Replace with your Pro Price ID
  basic: 'price_1S01fsHtLjP6FpI4W6DqbluW',      // <-- Replace with your Basic Price ID
};

// ⚠️ IMPORTANT: Replace with the URL of your deployed 'create-checkout-session' Edge Function
const SUPABASE_CHECKOUT_URL = 'https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/create-checkout-session';

const ProfileSettings = ({ isOpen, onClose }: ProfileSettingsProps) => {
  const { user, updatePassword } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
      fetchSession();
      
      // Check for success/cancel parameters
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        toast({
          title: "Payment successful!",
          description: "Your subscription has been activated. It may take a few moments to update.",
        });
        // Remove the success parameter from URL
        window.history.replaceState({}, '', window.location.pathname);
        
        // Wait a bit then refresh profile data
        setTimeout(() => {
          fetchProfile();
        }, 2000);
      } else if (urlParams.get('canceled') === 'true') {
        toast({
          title: "Payment canceled",
          description: "Your subscription was not activated.",
          variant: "destructive"
        });
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [isOpen, user]);

  const fetchSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingProfile(true);
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
      
      console.log('Fetched profile data:', data);
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

  const handleRefreshProfile = async () => {
    await fetchProfile();
    toast({
      title: "Profile refreshed",
      description: "Your profile information has been updated."
    });
  };

  const handleUpgradeClick = async (tier: string) => {
    if (!session?.access_token) {
      toast({
        title: "Authentication required",
        description: "Please log in again to continue.",
        variant: "destructive"
      });
      return;
    }

    setLoadingTier(tier);
    const userId = user?.id;
    const priceId = PRICE_IDS[tier as keyof typeof PRICE_IDS];

    console.log('Upgrading to tier:', tier);
    console.log('Using price ID:', priceId);
    console.log('User ID:', userId);

    if (!userId || !priceId) {
      console.error('User ID or price ID is missing.');
      toast({
        title: "Configuration error",
        description: "Missing required information for upgrade.",
        variant: "destructive"
      });
      setLoadingTier(null);
      return;
    }

    try {
      const requestBody = {
        priceId: priceId,
        userId: userId,
      };

      console.log('Sending request to checkout URL:', SUPABASE_CHECKOUT_URL);
      console.log('Request body:', requestBody);

      const response = await fetch(SUPABASE_CHECKOUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Checkout response status:', response.status);
      const data = await response.json();
      console.log('Checkout response data:', data);

      if (response.ok && data.url) {
        console.log('Redirecting to Stripe Checkout:', data.url);
        // Open Stripe Checkout in the same window
        window.location.href = data.url;
      } else {
        console.error('Failed to create Stripe Checkout session:', data);
        toast({
          title: "Error starting subscription",
          description: data.error || "Failed to create the Stripe checkout session.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('An error occurred during upgrade:', error);
      toast({
        title: "Network error",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleFreePlan = async () => {
    if (!user?.id) return;
    
    setLoadingTier('basic');
    try {
      console.log('Downgrading to basic plan for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'basic',
          stripe_subscription_id: null,
          stripe_customer_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error updating to basic plan:', error);
        throw error;
      }

      console.log('Successfully updated to basic plan:', data);
      await fetchProfile();
      toast({
        title: "Plan updated",
        description: "Your plan has been changed to Basic.",
      });
      setIsPricingModalOpen(false);
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error updating plan",
        description: "Failed to change your plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;

    if (!fullName.trim()) {
      toast({
        title: "Validation error",
        description: "Full name is required.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, full_name: fullName.trim() } : null);
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

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        throw error;
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully."
      });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getButtonText = () => {
    if (profile?.subscription_status === 'premium' || profile?.subscription_status === 'pro') {
      return "Change Plan";
    }
    return "Subscribe Now";
  };

  const getTierButton = (tier: string) => {
    const currentStatus = profile?.subscription_status || 'basic';
    const isCurrentPlan = currentStatus === tier;
    const isUpgradingThisTier = loadingTier === tier;
    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

    if (isCurrentPlan) {
      return (
        <Button size="sm" disabled className="w-full bg-green-600 text-white">
          ✓ Current Plan
        </Button>
      );
    }

    if (isUpgradingThisTier) {
      return (
        <Button size="sm" disabled className="w-full">
          {tier === 'basic' ? 'Updating...' : 'Redirecting to payment...'}
        </Button>
      );
    }
    
    if (tier === 'basic') {
      return (
        <Button
          size="sm"
          onClick={handleFreePlan}
          variant="outline"
          className="w-full border-pink-500 text-pink-600 bg-pink-200"
        >
          Downgrade to Basic
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        onClick={() => handleUpgradeClick(tier)}
        className={`w-full ${tier === 'pro' ? 'bg-pink-200 border-pink-500 hover:bg-pink-300' : 'bg-pink-200 border-pink-500 hover:bg-pink-300'} broder-pink-500 text-pink-600`}
      >
        {`Upgrade to ${tierName}`}
      </Button>
    );
  };

  const getPlanFeatures = (tier: string) => {
    switch (tier) {
      case 'basic':
        return [
          'Manual cycle tracking',
          'Limited cycle tracking',
          'Basic period predictions',
          'Limited AI Chatbot access'
        ];
      case 'pro':
        return [
          'Everything in Basic',
          'Unlimited cycle tracking',
          'Advanced period predictions',
          'AI Chatbot with history'
        ];
      case 'premium':
        return [
          'Everything in Pro',
          'Google Calendar sync',
          'Outlook Calendar sync',
          'Priority customer support'
        ];
      default:
        return [];
    }
  };

  const getPlanPrice = (tier: string) => {
    switch (tier) {
      case 'basic':
        return '$0';
      case 'pro':
        return '$50';
      case 'premium':
        return '$100';
      default:
        return '$0';
    }
  };

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
                <DialogDescription className="text-base text-muted-foreground mb-2 ">
                  Manage your account settings and preferences
                </DialogDescription>
              </div>
            </div>
            {/* <Button
              variant="outline" 
              size="sm"
              onClick={handleRefreshProfile}
              disabled={isLoadingProfile}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingProfile ? 'animate-spin' : ''}`} />
              Refresh
            </Button> */}
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
                        required
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
                        {profile?.subscription_status || 'Basic'} Plan
                      </p>
                      {profile?.stripe_subscription_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {profile.stripe_subscription_id.slice(0, 20)}...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="gradient-primary text-primary-foreground"
                        onClick={() => setIsPricingModalOpen(true)}
                        disabled={!!loadingTier}
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
                  
                  <div className="p-4 bg-gray-100 rounded-lg text-xs">
                    <h4 className="font-medium mb-2">Debug Info (Will remove in production):</h4>
                    <p>User ID: {user?.id}</p>
                    <p>Subscription Status: {profile?.subscription_status || 'Not set'}</p>
                    <p>Stripe Customer ID: {profile?.stripe_customer_id || 'Not set'}</p>
                    <p>Last Updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : 'Not set'}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
      
      {/* Pricing Modal */}
      <Dialog open={isPricingModalOpen} onOpenChange={setIsPricingModalOpen}>
        <DialogContent className="max-w-4xl glass-content border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
            <DialogDescription>
              Select the perfect plan for your needs. Changes take effect immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 md:grid-cols-3">
             {/* Basic Tier Card */}
             <Card className={`glass-card p-6 transition-all duration-300 ${profile?.subscription_status === 'basic' || !profile?.subscription_status ? 'border-2 border-green-500 shadow-glow' : 'border border-gray-200'}`}>
                <CardHeader className="text-center pb-4">
                  <h4 className="font-bold text-xl">Basic</h4>
                  <p className="text-3xl font-bold mt-2">$0<span className="text-sm text-muted-foreground font-normal">/month</span></p>
                  <CardDescription className="text-sm">Perfect for getting started.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-left text-sm space-y-3 mb-6">
                    {getPlanFeatures('basic').map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {getTierButton('basic')}
                </CardContent>
              </Card>

             {/* Pro Tier Card */}
             <Card className={`glass-card p-6 transition-all duration-300 ${profile?.subscription_status === 'pro' ? 'border-2 border-green-500 shadow-glow' : 'border border-pink-400'}`}>
                <CardHeader className="text-center pb-4">
                  <h4 className="font-bold text-xl">Pro</h4>
                  <p className="text-3xl font-bold mt-2">$15<span className="text-sm text-muted-foreground font-normal">/month</span></p>
                  <CardDescription className="text-sm">Advanced features for power users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-left text-sm space-y-3 mb-6">
                    {getPlanFeatures('pro').map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {getTierButton('pro')}
                </CardContent>
              </Card>

              {/* Premium Tier Card */}
              <Card className={`glass-card p-6 transition-all duration-300 ${profile?.subscription_status === 'premium' ? 'border-2 border-purple-500 shadow-glow' : 'border border-gray-200'}`}>
                <CardHeader className="text-center pb-4">
                  <h4 className="font-bold text-xl">Premium</h4>
                  <p className="text-3xl font-bold mt-2">$25<span className="text-sm text-muted-foreground font-normal">/month</span></p>
                  <CardDescription className="text-sm">Everything in Pro, plus exclusive benefits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-left text-sm space-y-3 mb-6">
                    {getPlanFeatures('premium').map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-0.5">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {getTierButton('premium')}
                </CardContent>
              </Card>
          </div>
          
          <div className="mt-6 p-4 bg-pink-50 rounded-lg">
            <h4 className="font-medium text-pink-500 mb-2">Important Notes:</h4>
            <ul className="text-sm text-pink-500 space-y-1">
              <li>• Plan changes take effect immediately after successful payment</li>
              <li>• You'll be redirected to Stripe for secure payment processing</li>
              <li>• If your status doesn't update, use the Refresh button in the top right</li>
              <li>• Contact support if you experience any issues</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
      
    </Dialog>
  );
};

export default ProfileSettings;