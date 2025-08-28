import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export const useCalendarSync = () => {
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false)
  const [isConnectingOutlook, setIsConnectingOutlook] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  const connectGoogleCalendar = async () => {
    try {
      setIsConnectingGoogle(true)
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Call our calendar-auth edge function to get the OAuth URL
      const response = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/calendar-auth`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to initiate calendar connection')
      }

      const { authUrl } = await response.json()

      // Open the OAuth URL in a popup
      const popup = window.open(
        authUrl,
        'google-calendar-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.')
      }

      // Poll for popup closure (indicating completion)
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setIsConnectingGoogle(false)
          
          toast({
            title: "Google Calendar Connected!",
            description: "Your Google Calendar has been connected successfully.",
          })
          
          // Reload the page to update the profile state
          window.location.reload()
        }
      }, 1000)

      // Cleanup interval after 5 minutes
      setTimeout(() => {
        clearInterval(checkClosed)
        if (!popup.closed) {
          popup.close()
          setIsConnectingGoogle(false)
        }
      }, 300000)

    } catch (error) {
      console.error('Google Calendar connection error:', error)
      setIsConnectingGoogle(false)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Google Calendar",
        variant: "destructive",
      })
    }
  }

  const connectOutlookCalendar = async () => {
    try {
      setIsConnectingOutlook(true)
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Call our outlook-auth edge function to get the OAuth URL
      const response = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/outlook-auth`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        let message = 'Failed to initiate calendar connection'
        try {
          const errorData = await response.json()
          if (errorData?.error) message = errorData.error
        } catch (e) {
          // ignore JSON parsing error
        }
        throw new Error(message)
      }

      const { authUrl } = await response.json()

      // Open the OAuth URL in a popup
      const popup = window.open(
        authUrl,
        'outlook-calendar-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.')
      }

      // Poll for popup closure (indicating completion)
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setIsConnectingOutlook(false)
          
          toast({
            title: "Outlook Calendar Connected!",
            description: "Your Outlook Calendar has been connected successfully.",
          })
          
          // Reload the page to update the profile state
          window.location.reload()
        }
      }, 1000)

      // Cleanup interval after 5 minutes
      setTimeout(() => {
        clearInterval(checkClosed)
        if (!popup.closed) {
          popup.close()
          setIsConnectingOutlook(false)
        }
      }, 300000)

    } catch (error) {
      console.error('Outlook Calendar connection error:', error)
      setIsConnectingOutlook(false)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Outlook Calendar",
        variant: "destructive",
      })
    }
  }

  // const syncCalendar = async () => {
  //   try {
  //     setIsSyncing(true)

  //     console.log('Now Syncing calendar...')
      
  //     const { data: { session } } = await supabase.auth.getSession()
  //     if (!session) {
  //       throw new Error('Not authenticated')
  //     }

  //     // const response = await fetch(`https://uiuecyakzpooeerejaye.supabase.co/functions/v1/calendar-sync`, {
  //     // const response = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/calendar-sync`, {
  //     //   method: 'POST',
  //     //   headers: {
  //     //     'Authorization': `Bearer ${session.access_token}`,
  //     //     'Content-Type': 'application/json',
  //     //   },
  //     //   body: JSON.stringify({ user_id: session.user.id }),
  //     // })
  //     const response = await fetch(`https://automations.aiagents.co.id/webhook/cyclewise/calendar/sync?userId=${session.user.id}`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${session.access_token}`,
  //         'Content-Type': 'application/json',
  //       }
  //     })

      

  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       throw new Error(errorData.error || 'Failed to sync calendar')
  //     }

  //     const result = await response.json()
      
  //     console.log(result)
      
  //     toast({
  //       title: "Calendar Synced",
  //       description: `Calendar synced successfully`,
  //     })

  //     return result
  //   } catch (error) {
  //     console.error('Calendar sync error:', error)
  //     toast({
  //       title: "Sync Failed",
  //       description: error instanceof Error ? error.message : "Failed to sync calendar",
  //       variant: "destructive",
  //     })
  //     throw error
  //   } finally {
  //     setIsSyncing(false)
  //   }
  // }

// const syncCalendar = async () => {
//     try {
//         setIsSyncing(true);
//         const { data: { session } } = await supabase.auth.getSession();
//         if (!session) {
//             throw new Error('Not authenticated');
//         }

//         // Get user profile to determine which calendars to sync
//         const { data: profile } = await supabase
//             .from('profiles')
//             .select('google_calendar_connected, outlook_calendar_connected')
//             .eq('user_id', session.user.id)
//             .single();

//         if (!profile) {
//             throw new Error('User profile not found');
//         }

//         let totalSynced = 0;
//         const results: Array<{ provider: 'Google' | 'Outlook'; syncedCount?: number }> = [];

//         // Sync Google Calendar if connected
//         if (profile.google_calendar_connected) {
//             try {
//                 const googleResponse = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/calendar-sync`, {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${session.access_token}`,
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ 
//                         user_id: session.user.id, 
//                         provider: 'google' 
//                     }),
//                 });

//                 if (googleResponse.ok) {
//                     const googleResult = await googleResponse.json();
//                     results.push({ provider: 'Google', ...googleResult });
//                     totalSynced += googleResult.syncedCount || 0;
//                 }
//             } catch (error) {
//                 console.error('Google Calendar sync error:', error);
//             }
//         }

//         // Sync Outlook Calendar if connected
//         if (profile.outlook_calendar_connected) {
//             try {
//                 const outlookResponse = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/calendar-sync`, {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${session.access_token}`,
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ 
//                         user_id: session.user.id, 
//                         provider: 'outlook' 
//                     }),
//                 });

//                 if (outlookResponse.ok) {
//                     const outlookResult = await outlookResponse.json();
//                     results.push({ provider: 'Outlook', ...outlookResult });
//                     totalSynced += outlookResult.syncedCount || 0;
//                 }
//             } catch (error) {
//                 console.error('Outlook Calendar sync error:', error);
//             }
//         }

//         if (totalSynced > 0) {
//             toast({
//                 title: "Calendar Synced",
//                 description: `Successfully synced ${totalSynced} events from ${results.length} calendar(s).`,
//             });
//         } else {
//             toast({
//                 title: "No New Events",
//                 description: "No new cycle events found to sync.",
//             });
//         }

//         return { results, totalSynced };

//     } catch (error) {
//         console.error('Calendar sync error:', error);
//         toast({
//             title: "Sync Failed",
//             description: error instanceof Error ? error.message : "Failed to sync calendar",
//             variant: "destructive",
//         });
//         throw error;
//     } finally {
//         setIsSyncing(false);
//     }
// };


const syncCalendar = async () => {
  try {
    setIsSyncing(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Get user profile to determine which calendars to sync
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
    let totalDeleted = 0;
    const results: Array<{ provider: 'Google' | 'Outlook'; syncedCount?: number; existingCount?: number; deletedCount?: number }> = [];

    // Helper for syncing a provider
    const syncProvider = async (provider: 'google' | 'outlook') => {
      const response = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/calendar-sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: session.user.id,
          provider,
        }),
      });

      if (response.ok) {
        // The edge function returns { message, result: { syncedCount, existingCount, deletedCount, ... } }
        // Handle both nested and flat results defensively
        const json = await response.json();
        const parsedResult = json?.result ?? json;
        results.push({ provider: provider === 'google' ? 'Google' : 'Outlook', ...parsedResult });
        totalSynced += parsedResult.syncedCount || 0;
        totalExisting += parsedResult.existingCount || 0;
        totalDeleted += parsedResult.deletedCount || 0;
      } else {
        console.error(`${provider} sync failed`, await response.text());
      }
    };

    if (profile.google_calendar_connected) {
      await syncProvider('google');
    }

    if (profile.outlook_calendar_connected) {
      await syncProvider('outlook');
    }

    // Show appropriate toast based on what happened
    if (totalDeleted > 0) {
      toast({
        title: "Calendar Synced",
        description: `Synced successfully. ${totalSynced} new events added, ${totalDeleted} deleted events removed.`,
      });
    } else if (totalSynced > 0) {
      toast({
        title: "Calendar Synced",
        description: `Successfully synced ${totalSynced} new events from your calendar(s).`,
      });
    } else if (totalExisting > 0) {
      toast({
        title: "Calendar Synced",
        description: "Your calendars are up to date. No new events found.",
      });
    } else {
      toast({
        title: "Calendar Synced",
        description: "Your calendars have been synchronized.",
      });
    }

    return { results, totalSynced, totalExisting, totalDeleted };

  } catch (error) {
    console.error('Calendar sync error:', error);
    toast({
      title: "Sync Failed",
      description: error instanceof Error ? error.message : "Failed to sync calendar",
      variant: "destructive",
    });
    throw error;
  } finally {
    setIsSyncing(false);
  }
};





  const disconnectGoogleCalendar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get current profile to determine new calendar provider
      const { data: profile } = await supabase
        .from('profiles')
        .select('outlook_calendar_connected')
        .eq('user_id', user.id)
        .single()

      // Build update object avoiding invalid values for calendar_provider
      const updatePayload: Record<string, string | boolean> = {
        google_refresh_token: null,
        google_calendar_connected: false,
        updated_at: new Date().toISOString(),
      }
      if (profile?.outlook_calendar_connected) {
        updatePayload.calendar_provider = 'outlook'
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "Google Calendar Disconnected",
        description: "Your Google Calendar has been disconnected.",
      })

    } catch (error) {
      console.error('Disconnect Google error:', error)
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect Google Calendar",
        variant: "destructive",
      })
    }
  }

  const disconnectOutlookCalendar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get current profile to determine new calendar provider
      const { data: profile } = await supabase
        .from('profiles')
        .select('google_calendar_connected')
        .eq('user_id', user.id)
        .single()

      // Build update object avoiding invalid values for calendar_provider
      const updatePayload: Record<string, string | boolean> = {
        outlook_refresh_token: null,
        outlook_calendar_connected: false,
        updated_at: new Date().toISOString(),
      }
      if (profile?.google_calendar_connected) {
        updatePayload.calendar_provider = 'google'
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "Outlook Calendar Disconnected",
        description: "Your Outlook Calendar has been disconnected.",
      })

    } catch (error) {
      console.error('Disconnect Outlook error:', error)
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect Outlook Calendar",
        variant: "destructive",
      })
    }
  }

  return {
    connectGoogleCalendar,
    connectOutlookCalendar,
    syncCalendar,
    disconnectGoogleCalendar,
    disconnectOutlookCalendar,
    isConnectingGoogle,
    isConnectingOutlook,
    isSyncing,
  }
}