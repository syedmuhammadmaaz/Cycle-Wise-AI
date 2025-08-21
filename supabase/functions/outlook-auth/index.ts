import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const clientId = Deno.env.get('MICROSOFT_CLIENT_ID') ?? '';
    const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET') ?? '';
    const tenant = Deno.env.get('MICROSOFT_TENANT') ?? 'common';

    // Basic validation to avoid launching OAuth with misconfigured credentials
    if (!clientId || clientId.includes('~')) {
      return new Response(JSON.stringify({
        error: 'Misconfigured Microsoft OAuth client_id. Ensure MICROSOFT_CLIENT_ID is set to the Azure Application (client) ID GUID, not the client secret.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!clientSecret) {
      return new Response(JSON.stringify({
        error: 'Missing MICROSOFT_CLIENT_SECRET. Set a valid client secret in your Edge Functions environment.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Construct the OAuth authorization URL
    const scopes = ['Calendars.Read', 'offline_access'];
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/outlook-callback`,
      scope: scopes.join(' '),
      response_type: 'code',
      response_mode: 'query',
      state: user.id,
      prompt: 'consent'
    });

    const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;

    return new Response(JSON.stringify({ authUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});