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
import { cloneUniformsGroups } from 'three/src/renderers/shaders/UniformsUtils.js';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  subscription_status: string;
  google_calendar_connected: boolean;
}

const ProfileSettings = ({ isOpen, onClose , onProfileUpdated}: ProfileSettingsProps) => {
  const { user, updatePassword } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

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

      // Update local state immediately for a snappier UI
      setProfile(prev => prev ? { ...prev, full_name: fullName } : null);

      // Call the callback function to notify the parent component
      if (onProfileUpdated) {
        onProfileUpdated();
      }
      
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
    const currentPassword = formData.get('currentPassword') as string;
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
console.log(profile ,user , "here ar ethe thing ")
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
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
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
                        defaultValue={profile?.full_name ||user?.identities[0].identity_data?.full_name ||''}
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
                      {profile?.subscription_status === 'premium' ? (
                        <Crown className="h-5 w-5 text-primary" />
                      ) : (
                        <Button size="sm" className="gradient-primary text-primary-foreground">
                          Upgrade to Premium
                        </Button>
                      )}
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
    </Dialog>
  );
};

export default ProfileSettings;