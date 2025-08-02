import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCalendarSync } from '@/hooks/useCalendarSync'
import { Calendar, Check, RefreshCw, Unplug } from 'lucide-react'

interface CalendarConnectionProps {
  isConnected: boolean
  onConnectionChange?: () => void
}

export const CalendarConnection = ({ isConnected, onConnectionChange }: CalendarConnectionProps) => {
  const { connectGoogleCalendar, syncCalendar, disconnectCalendar, isConnecting, isSyncing } = useCalendarSync()

  const handleConnect = async () => {
    await connectGoogleCalendar()
    onConnectionChange?.()
  }

  const handleSync = async () => {
    console.log('Syncing calendar...')
    console.log(await syncCalendar())
    await syncCalendar()
    onConnectionChange?.()
  }

  const handleDisconnect = async () => {
    await disconnectCalendar()
    onConnectionChange?.()
  }

  if (isConnected) {
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
            onClick={handleDisconnect} 
            variant="outline" 
            className="w-full"
          >
            <Unplug className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
          
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
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Connect Google Calendar</CardTitle>
        </div>
        <CardDescription>
          Automatically import your cycle events from Google Calendar
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
        
        <Button 
          onClick={handleConnect} 
          disabled={isConnecting} 
          className="w-full"
        >
          {isConnecting ? (
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
        
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
          <p className="font-medium mb-1">Privacy & Security:</p>
          <p>We only request read-only access to your calendar. Your personal events remain private and we only sync cycle-related entries.</p>
        </div>
      </CardContent>
    </Card>
  )
}