import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export const useCalendarSync = () => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  const connectGoogleCalendar = async () => {
    try {
      setIsConnecting(true)
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Call our calendar-auth edge function to get the OAuth URL
      // const response = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/calendar-auth`, {
      const response = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/calendar-sync`, {
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
          setIsConnecting(false)
          
          // Refresh the page or update state to reflect the connection
          toast({
            title: "Calendar Connected!",
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
          setIsConnecting(false)
        }
      }, 300000)

    } catch (error) {
      console.error('Calendar connection error:', error)
      setIsConnecting(false)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect calendar",
        variant: "destructive",
      })
    }
  }

  const syncCalendar = async () => {
    try {
      setIsSyncing(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // const response = await fetch(`https://uiuecyakzpooeerejaye.supabase.co/functions/v1/calendar-sync`, {
      const response = await fetch(`https://xmbqbdyodnxjqxqgeaor.supabase.co/functions/v1/calendar-sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: session.user.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync calendar')
      }

      const result = await response.json()
      
      toast({
        title: "Calendar Synced",
        description: `Found ${result.result.syncedCount} new cycle events`,
      })

      return result
    } catch (error) {
      console.error('Calendar sync error:', error)
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync calendar",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsSyncing(false)
    }
  }

  const disconnectCalendar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          google_refresh_token: null,
          google_calendar_connected: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "Calendar Disconnected",
        description: "Your Google Calendar has been disconnected.",
      })

    } catch (error) {
      console.error('Disconnect error:', error)
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect calendar",
        variant: "destructive",
      })
    }
  }

  return {
    connectGoogleCalendar,
    syncCalendar,
    disconnectCalendar,
    isConnecting,
    isSyncing,
  }
}