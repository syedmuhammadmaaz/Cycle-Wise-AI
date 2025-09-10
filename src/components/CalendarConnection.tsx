import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCalendarSync } from '../hooks/useCalendarSync';
import { Calendar, Check, RefreshCw, Unplug, Mail, Apple, Link } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CalendarConnectionProps {
  googleConnected: boolean;
  outlookConnected: boolean;
  appleConnected: boolean;
  onConnectionChange?: () => void;
}

export const CalendarConnection = ({ googleConnected, outlookConnected, appleConnected, onConnectionChange }: CalendarConnectionProps) => {
  const { user } = useAuth();
  const [showAppleModal, setShowAppleModal] = useState(false);
  const [iCloudEmail, setICloudEmail] = useState('');
  const [appSpecificPassword, setAppSpecificPassword] = useState('');
  const [isAppleConnecting, setIsAppleConnecting] = useState(false);
  const {
    connectGoogleCalendar,
    connectOutlookCalendar,
    syncCalendar,
    syncAppleCalendar,
    disconnectGoogleCalendar,
    disconnectOutlookCalendar,
    disconnectAppleCalendar,
    isConnectingGoogle,
    isConnectingOutlook,
    isSyncingApple, // Using the new, dedicated state
    isSyncingGoogleOutlook // Using the new, dedicated state
  } = useCalendarSync();

  const handleGoogleConnect = async () => {
    await connectGoogleCalendar();
    onConnectionChange?.();
  };

  const handleOutlookConnect = async () => {
    await connectOutlookCalendar();
    onConnectionChange?.();
  };
  
  const handleGoogleOutlookSync = async () => {
    console.log('Syncing Google/Outlook calendars...');
    if (googleConnected && outlookConnected) {
      await syncCalendar('all');
    } else if (googleConnected) {
      await syncCalendar('google');
    } else if (outlookConnected) {
      await syncCalendar('outlook');
    }
    onConnectionChange?.();
  };

  const handleAppleSync = async () => {
    console.log('Syncing Apple calendar...');
    await syncAppleCalendar();
    onConnectionChange?.(); // Trigger dashboard refresh
  };

  const handleGoogleDisconnect = async () => {
    await disconnectGoogleCalendar();
    onConnectionChange?.();
  };

  const handleOutlookDisconnect = async () => {
    await disconnectOutlookCalendar();
    onConnectionChange?.();
  };

  const handleAppleDisconnect = async () => {
    await disconnectAppleCalendar();
    onConnectionChange?.();
  };

  const handleAppleConnect = async () => {
    if (!user || !iCloudEmail || !appSpecificPassword) {
      toast({
        title: "Error",
        description: "Please enter your iCloud email and app-specific password.",
        variant: "destructive"
      });
      return;
    }

    if (!iCloudEmail.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter your full iCloud email address (e.g., user@icloud.com)",
        variant: "destructive"
      });
      return;
    }

    setIsAppleConnecting(true);
    try {
      const caldavUrl = `https://caldav.icloud.com/principals/${encodeURIComponent(iCloudEmail)}/`;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          apple_caldav_connected: true,
          apple_caldav_username: iCloudEmail,
          apple_caldav_password: appSpecificPassword,
          apple_caldav_url: caldavUrl
        })
        .eq('user_id', user.id);

        await syncAppleCalendar();
      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }
      
      toast({
        title: "Connection Successful",
        description: "Your Apple Calendar credentials have been saved. Your events have been synced ",
      });

      onConnectionChange?.();
      setShowAppleModal(false);
      setICloudEmail('');
      setAppSpecificPassword('');
      
    } catch (error: any) {
      console.error('Apple connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsAppleConnecting(false);
    }
  };

  const connectedCount = [googleConnected, outlookConnected, appleConnected].filter(Boolean).length;
  const googleOutlookConnected = googleConnected || outlookConnected;
  const showMasterSync = googleConnected && outlookConnected;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calendar Connections</CardTitle>
          <CardDescription>
            {connectedCount === 0 
              ? "Connect your calendars to automatically sync cycle events"
              : `${connectedCount} calendar${connectedCount > 1 ? 's' : ''} connected`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Calendar Section */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">Google Calendar</span>
              {googleConnected ? (
                <Badge variant="secondary" className="gap-1">
                  <Check className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline">Not Connected</Badge>
              )}
            </div>
            {googleConnected ? (
              <Button onClick={handleGoogleDisconnect} variant="outline" size="sm">
                Disconnect
              </Button>
            ) : (
              <Button 
                onClick={handleGoogleConnect} 
                disabled={isConnectingGoogle}
                size="sm"
              >
                {isConnectingGoogle ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            )}
          </div>

          {/* Outlook Calendar Section */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Outlook Calendar</span>
              {outlookConnected ? (
                <Badge variant="secondary" className="gap-1">
                  <Check className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline">Not Connected</Badge>
              )}
            </div>
            {outlookConnected ? (
              <Button onClick={handleOutlookDisconnect} variant="outline" size="sm">
                Disconnect
              </Button>
            ) : (
              <Button 
                onClick={handleOutlookConnect} 
                disabled={isConnectingOutlook}
                size="sm"
              >
                {isConnectingOutlook ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            )}
          </div>

          {/* Apple Calendar Section - kept separate as requested */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
    <Apple className="h-4 w-4 text-gray-800" />
    <span className="font-medium">Apple Calendar</span>
    {!isSyncingApple && (
        appleConnected ? (
            <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" />
                Connected 
            </Badge>
        ) : (
            <Badge variant="outline">Not Connected</Badge>
        )
    )}
</div>
            {appleConnected ? (
              <div className="flex gap-2">
                <Button onClick={handleAppleSync} variant="outline" size="sm" disabled={isSyncingApple}>
                  {isSyncingApple ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Sync'
                  )}
                </Button>
                <Button onClick={handleAppleDisconnect} variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setShowAppleModal(true)}
                size="sm"
              >
                Connect
              </Button>
            )}
          </div>

          {/* Master Sync button for Google & Outlook */}
          {showMasterSync && (
            <Button
              onClick={handleGoogleOutlookSync}
              disabled={isSyncingGoogleOutlook}
              className="w-full"
            >
              {isSyncingGoogleOutlook ? (
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
          )}
          {/* Individual sync buttons for Google/Outlook when only one is connected */}
          {!showMasterSync && googleOutlookConnected && (
            <Button
              onClick={handleGoogleOutlookSync}
              disabled={isSyncingGoogleOutlook}
              className="w-full"
            >
              {isSyncingGoogleOutlook ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Calendar
                </>
              )}
            </Button>
          )}


          {/* Information Section */}
          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1">
              <li>• We look for events with keywords like "period", "cycle", "menstruation"</li>
              <li>• Found events are automatically added to your cycle tracking</li>
              <li>• Connected calendars sync daily to keep data up-to-date</li>
              {connectedCount === 0 && <li>• No manual data entry required once connected</li>}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Apple Calendar Connection Modal */}
      <Dialog open={showAppleModal} onOpenChange={setShowAppleModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Apple className="h-6 w-6" />
              Connect Apple Calendar
            </DialogTitle>
            <DialogDescription>
              Securely connect your calendar with an app-specific password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Important:</strong> You must use an App-Specific Password for security. You can create one from your{' '}
              <a 
                href="https://appleid.apple.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline"
              >
                Apple ID account page
              </a>.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="iCloudEmail">iCloud Email</Label>
              <Input
                id="iCloudEmail"
                type="email"
                value={iCloudEmail}
                onChange={(e) => setICloudEmail(e.target.value)}
                placeholder="john.doe@icloud.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appSpecificPassword">App-Specific Password</Label>
              <Input
                id="appSpecificPassword"
                type="password"
                value={appSpecificPassword}
                onChange={(e) => setAppSpecificPassword(e.target.value)}
                placeholder="xxxx-xxxx-xxxx-xxxx"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAppleModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAppleConnect} 
                disabled={isAppleConnecting || !iCloudEmail || !appSpecificPassword}
                className="flex-1"
              >
                {isAppleConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};