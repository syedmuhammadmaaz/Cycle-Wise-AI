import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCalendarSync } from '@/hooks/useCalendarSync'
import { Calendar, Check, RefreshCw, Unplug, Mail } from 'lucide-react'

interface CalendarConnectionProps {
  googleConnected: boolean
  outlookConnected: boolean
  onConnectionChange?: () => void
}

export const CalendarConnection = ({ googleConnected, outlookConnected, onConnectionChange }: CalendarConnectionProps) => {
  const { 
    connectGoogleCalendar, 
    connectOutlookCalendar,
    syncCalendar, 
    disconnectGoogleCalendar, 
    disconnectOutlookCalendar, 
    isConnectingGoogle,
    isConnectingOutlook,
    isSyncing 
  } = useCalendarSync()

  const handleGoogleConnect = async () => {
    await connectGoogleCalendar()
    onConnectionChange?.()
  }

  const handleOutlookConnect = async () => {
    await connectOutlookCalendar()
    onConnectionChange?.()
  }

  const handleSync = async () => {
    console.log('Syncing calendar...')
    await syncCalendar()
    onConnectionChange?.()
  }

  const handleGoogleDisconnect = async () => {
    await disconnectGoogleCalendar()
    onConnectionChange?.()
  }

  const handleOutlookDisconnect = async () => {
    await disconnectOutlookCalendar()
    onConnectionChange?.()
  }

  // If both calendars are connected
  if (googleConnected && outlookConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calendar Connections</CardTitle>
          <CardDescription>
            Both Google and Outlook calendars are connected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Google Calendar</span>
                <Badge variant="secondary" className="gap-1">
                  <Check className="h-3 w-3" />
                  Connected
                </Badge>
              </div>
              <Button 
                onClick={handleGoogleDisconnect} 
                variant="outline" 
                size="sm"
              >
                Disconnect
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Outlook Calendar</span>
                <Badge variant="secondary" className="gap-1">
                  <Check className="h-3 w-3" />
                  Connected
                </Badge>
              </div>
              <Button 
                onClick={handleOutlookDisconnect} 
                variant="outline" 
                size="sm"
              >
                Disconnect
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleSync} 
            disabled={isSyncing} 
            className="w-full"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing All Calendars...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync All Calendars
              </>
            )}
          </Button>
          
          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1">
              <li>• We look for events with keywords like "period", "cycle", "menstruation"</li>
              <li>• Found events are automatically added to your cycle tracking</li>
              <li>• Both calendars sync daily to keep data up-to-date</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If only Google Calendar is connected
  if (googleConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Google Calendar</CardTitle>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              Connected
            </Badge>
          </div>
          <CardDescription>
            Automatically sync your cycle events from Google Calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleSync} 
            disabled={isSyncing} 
            className="w-full"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleGoogleDisconnect} 
            variant="outline" 
            className="w-full"
          >
            <Unplug className="h-4 w-4 mr-2" />
            Disconnect
          </Button>

          <div className="border-t pt-3">
            <Button 
              onClick={handleOutlookConnect} 
              variant="outline" 
              className="w-full"
              disabled={isConnectingOutlook}
            >
              {isConnectingOutlook ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  Also Connect Outlook
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-3 p-3 bg-muted/50 rounded-md">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1">
              <li>• We look for events with keywords like "period", "cycle", "menstruation"</li>
              <li>• Found events are automatically added to your cycle tracking</li>
              <li>• Your calendar syncs daily to keep data up-to-date</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If only Outlook Calendar is connected
  if (outlookConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Outlook Calendar</CardTitle>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              Connected
            </Badge>
          </div>
          <CardDescription>
            Automatically sync your cycle events from Outlook Calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleSync} 
            disabled={isSyncing} 
            className="w-full"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleOutlookDisconnect} 
            variant="outline" 
            className="w-full"
          >
            <Unplug className="h-4 w-4 mr-2" />
            Disconnect
          </Button>

          <div className="border-t pt-3">
            <Button 
              onClick={handleGoogleConnect} 
              variant="outline" 
              className="w-full"
              disabled={isConnectingGoogle}
            >
              {isConnectingGoogle ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Also Connect Google
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-3 p-3 bg-muted/50 rounded-md">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1">
              <li>• We look for events with keywords like "period", "cycle", "menstruation"</li>
              <li>• Found events are automatically added to your cycle tracking</li>
              <li>• Your calendar syncs daily to keep data up-to-date</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Connect Calendar</CardTitle>
        <CardDescription>
          Choose your preferred calendar service to automatically import cycle events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-medium">Benefits of connecting:</p>
          <ul className="space-y-1 ml-4">
            <li>• Automatic cycle tracking from existing calendar events</li>
            <li>• Sync events containing keywords like "period" or "cycle"</li>
            <li>• Daily background sync to keep data current</li>
            <li>• No manual data entry required</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={handleGoogleConnect} 
            disabled={isConnectingGoogle} 
            className="w-full"
          >
            {isConnectingGoogle ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Connect Google Calendar
              </>
            )}
          </Button>

          <Button 
            onClick={handleOutlookConnect} 
            disabled={isConnectingOutlook} 
            variant="outline"
            className="w-full"
          >
            {isConnectingOutlook ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2 text-blue-600" />
                Connect Outlook Calendar
              </>
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
          <p className="font-medium mb-1">Privacy & Security:</p>
          <p>We only request read-only access to your calendar. Your personal events remain private and we only sync cycle-related entries.</p>
        </div>
      </CardContent>
    </Card>
  )
}