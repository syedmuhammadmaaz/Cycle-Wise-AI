import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useCalendarSync = () => {
  const { user } = useAuth();
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isConnectingOutlook, setIsConnectingOutlook] = useState(false);
  const [isSyncingGoogleOutlook, setIsSyncingGoogleOutlook] = useState(false);
  const [isSyncingApple, setIsSyncingApple] = useState(false);
  const { toast } = useToast();

  const connectGoogleCalendar = async () => {
    try {
      setIsConnectingGoogle(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/calendar-auth`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate calendar connection');
      }

      const { authUrl } = await response.json();
      const popup = window.open(
        authUrl,
        'google-calendar-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnectingGoogle(false);
          
          toast({
            title: "Google Calendar Connected!",
            description: "Your Google Calendar has been connected successfully.",
          });
          
          window.location.reload();
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(checkClosed);
        if (!popup.closed) {
          popup.close();
          setIsConnectingGoogle(false);
        }
      }, 300000);

    } catch (error) {
      console.error('Google Calendar connection error:', error);
      setIsConnectingGoogle(false);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Google Calendar",
        variant: "destructive",
      });
    }
  };

  const connectOutlookCalendar = async () => {
    try {
      setIsConnectingOutlook(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/outlook-auth`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let message = 'Failed to initiate calendar connection';
        try {
          const errorData = await response.json();
          if (errorData?.error) message = errorData.error;
        } catch (e) {
          // ignore JSON parsing error
        }
        throw new Error(message);
      }

      const { authUrl } = await response.json();
      const popup = window.open(
        authUrl,
        'outlook-calendar-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnectingOutlook(false);
          
          toast({
            title: "Outlook Calendar Connected!",
            description: "Your Outlook Calendar has been connected successfully.",
          });
          
          window.location.reload();
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(checkClosed);
        if (!popup.closed) {
          popup.close();
          setIsConnectingOutlook(false);
        }
      }, 300000);

    } catch (error) {
      console.error('Outlook Calendar connection error:', error);
      setIsConnectingOutlook(false);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Outlook Calendar",
        variant: "destructive",
      });
    }
  };

  const syncCalendar = async (provider = 'all') => {
    try {
      setIsSyncingGoogleOutlook(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('google_calendar_connected, outlook_calendar_connected')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      let totalSynced = 0;
      let totalExisting = 0;
      const results = [];

      const syncProvider = async (syncProviderName) => {
        const response = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/calendar-sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: session.user.id,
            provider: syncProviderName,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const parsedResult = json?.result ?? json;
          const providerDisplayName = syncProviderName === 'google' ? 'Google' : 'Outlook';
          results.push({ provider: providerDisplayName, ...parsedResult });
          totalSynced += parsedResult.syncedCount || 0;
          totalExisting += parsedResult.existingCount || 0;
        } else {
          console.error(`${syncProviderName} sync failed`, await response.text());
        }
      };

      if ((provider === 'all' || provider === 'google') && profile.google_calendar_connected) {
        await syncProvider('google');
      }

      if ((provider === 'all' || provider === 'outlook') && profile.outlook_calendar_connected) {
        await syncProvider('outlook');
      }

      if (totalSynced > 0) {
        toast({
          title: "Calendar Synced",
          description: `Successfully synced ${totalSynced} new event(s).`,
        });
      } else if (totalExisting > 0) {
        toast({
          title: "No New Events",
          description: `${totalExisting} event(s) were already in your calendar.`,
        });
      } else {
        toast({
          title: "No Events",
          description: "No events available to sync.",
        });
      }

      return { results, totalSynced, totalExisting };

    } catch (error) {
      console.error('Calendar sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync calendar",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSyncingGoogleOutlook(false);
    }
  };

  const syncAppleCalendar = async () => {
    try {
      setIsSyncingApple(true);
      if (!user) {
        throw new Error('User not authenticated.');
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User session not found.');
      }

      const response = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync Apple Calendar.');
      }

      const syncResult = await response.json();
      const { syncedCount, existingCount } = syncResult.result;

      if (syncedCount > 0) {
        toast({
          title: "Apple Calendar Synced",
          description: `Successfully synced ${syncedCount} new event(s).`,
        });
      } else if (existingCount > 0) {
        toast({
          title: "No New Events",
          description: `${existingCount} event(s) were already in your calendar.`,
        });
      } else {
        toast({
          title: "No Events Found",
          description: "No cycle events found in your Apple Calendar.",
        });
      }

      return syncResult;
    } catch (error) {
      console.error('Apple Calendar sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync Apple Calendar",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSyncingApple(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('outlook_calendar_connected, apple_caldav_connected')
        .eq('user_id', user.id)
        .single();

      const updatePayload = {
        google_refresh_token: null,
        google_calendar_connected: false,
        updated_at: new Date().toISOString(),
        ...((profile?.outlook_calendar_connected || profile?.apple_caldav_connected) ? {} : { calendar_provider: null })
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Google Calendar Disconnected",
        description: "Your Google Calendar has been disconnected.",
      });

    } catch (error) {
      console.error('Disconnect Google error:', error);
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect Google Calendar",
        variant: "destructive",
      });
    }
  };

  const disconnectOutlookCalendar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('google_calendar_connected, apple_caldav_connected')
        .eq('user_id', user.id)
        .single();
      
      const updatePayload = {
        outlook_refresh_token: null,
        outlook_calendar_connected: false,
        updated_at: new Date().toISOString(),
        ...((profile?.google_calendar_connected || profile?.apple_caldav_connected) ? {} : { calendar_provider: null })
      };

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Outlook Calendar Disconnected",
        description: "Your Outlook Calendar has been disconnected.",
      });

    } catch (error) {
      console.error('Disconnect Outlook error:', error);
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect Outlook Calendar",
        variant: "destructive",
      });
    }
  };

  const disconnectAppleCalendar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('google_calendar_connected, outlook_calendar_connected')
        .eq('user_id', user.id)
        .single();
        
      const updatePayload = {
        apple_caldav_connected: false,
        apple_caldav_url: null,
        updated_at: new Date().toISOString(),
        ...((profile?.google_calendar_connected || profile?.outlook_calendar_connected) ? {} : { calendar_provider: null })
      };

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Apple Calendar Disconnected",
        description: "Your Apple Calendar has been disconnected.",
      });

    } catch (error) {
      console.error('Disconnect Apple error:', error);
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect Apple Calendar",
        variant: "destructive",
      });
    }
  };

  return {
    connectGoogleCalendar,
    connectOutlookCalendar,
    syncCalendar,
    syncAppleCalendar,
    disconnectGoogleCalendar,
    disconnectOutlookCalendar,
    disconnectAppleCalendar,
    isConnectingGoogle,
    isConnectingOutlook,
    isSyncingApple,
    isSyncingGoogleOutlook
  };
};