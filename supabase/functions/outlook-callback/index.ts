import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return new Response(`
        <html>
          <head><title>Connection Failed</title></head>
          <body>
            <h1>Connection Failed</h1>
            <p>Error: ${error}</p>
            <p>Please try again.</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    if (!code || !state) {
      return new Response(`
        <html>
          <head><title>Invalid Request</title></head>
          <body>
            <h1>Invalid Request</h1>
            <p>Missing authorization code or state parameter.</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Exchange code for tokens
    const tenant = Deno.env.get('MICROSOFT_TENANT') ?? 'common';
    // const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    const tokenResponse = await fetch(`https://login.microsoftonline.com/common/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get('MICROSOFT_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('MICROSOFT_CLIENT_SECRET') ?? '',
        redirect_uri: `https://${Deno.env.get('SUPABASE_URL').replace('https://', '')}/functions/v1/outlook-callback`,
        // redirect_uri: `https://${Deno.env.get('SUPABASE_URL').replace('https://', '')}/functions/v1/outlook-callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens: MicrosoftTokenResponse = await tokenResponse.json();

    // Update the user profile with refresh token and set calendar provider
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('google_calendar_connected')
      .eq('user_id', state)
      .single();

    let calendarProvider = 'outlook';
    if (currentProfile?.google_calendar_connected) {
      calendarProvider = 'both';
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        outlook_refresh_token: tokens.refresh_token,
        outlook_calendar_connected: true,
        calendar_provider: calendarProvider,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', state);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      throw new Error('Failed to save calendar connection');
    }

    console.log('Successfully connected Outlook Calendar for user:', state);

    // Trigger initial calendar sync
    const syncResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/calendar-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ user_id: state, provider: 'outlook' }),
    });

    if (!syncResponse.ok) {
      console.error('Initial sync failed, but connection was successful');
    }

    return new Response(`
      <html>
        <head>
          <title>Outlook Calendar Connected!</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #fdf2f8 0%, #f9fafb 100%);
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 16px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .success-icon {
              width: 64px;
              height: 64px;
              margin: 0 auto 1rem;
              background: #0078d4;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            h1 {
              color: #1f2937;
              margin-bottom: 0.5rem;
            }
            p {
              color: #6b7280;
              margin-bottom: 1.5rem;
            }
            .countdown {
              color: #0078d4;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">
              <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
            <h1>Outlook Calendar Connected!</h1>
            <p>Your Outlook Calendar has been successfully connected to CycleWise. We're now syncing your cycle events.</p>
            <p class="countdown">This window will close in <span id="countdown">3</span> seconds...</p>
          </div>
          <script>
            let count = 3;
            const countdownEl = document.getElementById('countdown');
            const timer = setInterval(() => {
              count--;
              countdownEl.textContent = count;
              if (count === 0) {
                clearInterval(timer);
                window.close();
              }
            }, 1000);
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    console.error('Outlook callback error:', error);
    return new Response(`
      <html>
        <head><title>Connection Error</title></head>
        <body>
          <h1>Connection Error</h1>
          <p>An error occurred while connecting your Outlook Calendar.</p>
          <p>Error: ${error.message}</p>
          <p>Please try again or contact support.</p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }
});