import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Heart, 
  Calendar as CalendarIcon, 
  MessageCircle, 
  Settings, 
  Crown,
  Plus
} from 'lucide-react';
import CycleForm from '@/components/CycleForm';
import AIChat from '@/components/AIChat';
import { CalendarConnection } from '@/components/CalendarConnection';

interface Profile {
  id: string;
  full_name: string;
  subscription_status: string;
  google_calendar_connected: boolean;
}

interface Cycle {
  id: string;
  start_date: string;
  end_date?: string;
  cycle_length?: number;
  period_length?: number;
  symptoms?: string[];
  notes?: string;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchCycles();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchCycles = async () => {
    try {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setCycles(data || []);
    } catch (error) {
      console.error('Error fetching cycles:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const latestCycle = cycles[0];
  const nextPeriodDate = latestCycle?.start_date 
    ? new Date(new Date(latestCycle.start_date).getTime() + (latestCycle.cycle_length || 28) * 24 * 60 * 60 * 1000)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Bloom</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {profile?.subscription_status === 'premium' && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3" />
                Premium
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              Hi, {profile?.full_name || 'there'}!
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Current Cycle</CardTitle>
                </CardHeader>
                <CardContent>
                  {latestCycle ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary">
                        Day {Math.ceil((new Date().getTime() - new Date(latestCycle.start_date).getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Started {new Date(latestCycle.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No cycle data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Next Period</CardTitle>
                </CardHeader>
                <CardContent>
                  {nextPeriodDate ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary">
                        {Math.ceil((nextPeriodDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expected {nextPeriodDate.toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Track cycles to see predictions
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Cycles */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Cycles</CardTitle>
                    <CardDescription>Your cycle history</CardDescription>
                  </div>
                  <Button onClick={() => setShowCycleForm(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Cycle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {cycles.length > 0 ? (
                  <div className="space-y-3">
                    {cycles.slice(0, 5).map((cycle) => (
                      <div key={cycle.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">
                            {new Date(cycle.start_date).toLocaleDateString()}
                            {cycle.end_date && ` - ${new Date(cycle.end_date).toLocaleDateString()}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {cycle.cycle_length && `${cycle.cycle_length} day cycle`}
                            {cycle.period_length && ` • ${cycle.period_length} day period`}
                          </div>
                        </div>
                        {cycle.symptoms && cycle.symptoms.length > 0 && (
                          <div className="flex gap-1">
                            {cycle.symptoms.slice(0, 2).map((symptom, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                            {cycle.symptoms.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{cycle.symptoms.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No cycles tracked yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start tracking your menstrual cycles to get personalized insights
                    </p>
                    <Button onClick={() => setShowCycleForm(true)}>
                      Track Your First Cycle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-0"
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowAIChat(true)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with AI Health Guide
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                
                {profile?.subscription_status === 'free' && (
                  <Button className="w-full justify-start">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Calendar Connection */}
            <CalendarConnection 
              isConnected={profile?.google_calendar_connected || false}
              onConnectionChange={fetchProfile}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCycleForm && (
        <CycleForm 
          onClose={() => setShowCycleForm(false)}
          onCycleAdded={() => {
            fetchCycles();
            setShowCycleForm(false);
            toast({
              title: "Cycle added successfully",
              description: "Your cycle has been tracked."
            });
          }}
        />
      )}

      {showAIChat && (
        <AIChat onClose={() => setShowAIChat(false)} />
      )}
    </div>
  );
};

export default Dashboard;