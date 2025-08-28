import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Create Supabase client
const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    let user_id;
    if (req.method === 'POST') {
      const body = await req.json();
      user_id = body.user_id;
      console.log("body");
      console.log(body);
      const { data: profile, error: profileError } = await supabase.from('profiles').select('google_refresh_token, outlook_refresh_token, google_calendar_connected, outlook_calendar_connected').eq('user_id', user_id).single();
      if (profileError || !profile?.google_refresh_token && !profile?.outlook_refresh_token) {
        console.error('User not found or not connected:', profileError);
        return new Response(JSON.stringify({
          error: 'User not connected to any calendar'
        }), {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      if (body.provider) {
        const result = await syncUserCalendar(supabase, user_id, body.provider === 'google' ? profile.google_refresh_token : profile.outlook_refresh_token, body.provider);
        return new Response(JSON.stringify({
          message: 'Calendar sync completed successfully',
          result
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      // Sync logic for a single user
      const result = await syncUserCalendar(supabase, user_id, profile.google_refresh_token || profile.outlook_refresh_token, profile.google_refresh_token ? 'google' : 'outlook');
      return new Response(JSON.stringify({
        message: 'Calendar sync completed successfully',
        result
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } else {
      console.log('Running scheduled calendar sync for all users');
      const { data: profiles, error: profilesError } = await supabase.from('profiles').select('user_id, google_refresh_token, outlook_refresh_token, google_calendar_connected, outlook_calendar_connected').or('google_calendar_connected.eq.true,outlook_calendar_connected.eq.true');
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return new Response(JSON.stringify({
          error: 'Failed to fetch profiles'
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      console.log(`Found ${profiles.length} connected user(s) to sync`);
      const results = [];
      for (const profile of profiles || []){
        try {
          console.log(`Syncing calendar for user: ${profile.user_id}`);
          // Sync Google Calendar
          if (profile.google_refresh_token && profile.google_calendar_connected) {
            const result = await syncUserCalendar(supabase, profile.user_id, profile.google_refresh_token, 'google');
            results.push({
              user_id: profile.user_id,
              provider: 'google',
              success: true,
              result
            });
          }
          // Sync Outlook Calendar
          if (profile.outlook_refresh_token && profile.outlook_calendar_connected) {
            const result = await syncUserCalendar(supabase, profile.user_id, profile.outlook_refresh_token, 'outlook');
            results.push({
              user_id: profile.user_id,
              provider: 'outlook',
              success: true,
              result
            });
          }
        } catch (error) {
          console.error(`Sync failed for user ${profile.user_id}:`, error);
          results.push({
            user_id: profile.user_id,
            success: false,
            error: error.message
          });
        }
      }
      return new Response(JSON.stringify({
        message: 'Scheduled sync completed',
        results
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Calendar sync error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
async function syncUserCalendar(supabase, user_id, refresh_token, provider) {
  console.log(`Start ${provider} calendar sync for user: ${user_id}`);
  let accessToken;
  console.log(`SYNC REQUESTED for ${provider}`);
  if (provider === 'google') {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
        refresh_token: refresh_token,
        grant_type: 'refresh_token'
      })
    });
    if (!tokenResponse.ok) {
      console.error('Failed to refresh Google access token:', await tokenResponse.text());
      throw new Error('Failed to refresh Google access token');
    }
    const tokens = await tokenResponse.json();
    accessToken = tokens.access_token;
    // Fetch Google Calendar events with enhanced logging
    return await fetchGoogleEvents(accessToken, user_id);
  } else {
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('MICROSOFT_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('MICROSOFT_CLIENT_SECRET') ?? '',
        refresh_token: refresh_token,
        grant_type: 'refresh_token'
      })
    });
    if (!tokenResponse.ok) throw new Error('Failed to refresh Microsoft access token');
    const tokens = await tokenResponse.json();
    accessToken = tokens.access_token;
    // Fetch Outlook Calendar events with enhanced logging
    return await fetchOutlookEvents(accessToken, user_id);
  }
}
async function fetchGoogleEvents(accessToken, user_id) {
  const timeMin = new Date();
  timeMin.setMonth(timeMin.getMonth() - 6);
  const timeMax = new Date();
  timeMax.setMonth(timeMax.getMonth() + 6);
  console.log(`Fetching Google events between: ${timeMin.toISOString()} and ${timeMax.toISOString()}`);
  const calendarResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '500'
  })}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  if (!calendarResponse.ok) {
    console.error('Failed to fetch Google events:', await calendarResponse.text());
    throw new Error('Failed to fetch Google events');
  }
  const calendarData = await calendarResponse.json();
  console.log('Fetched Google events:', calendarData.items);
  return processCalendarEvents(calendarData.items, user_id, 'Google');
}
async function fetchOutlookEvents(accessToken, user_id) {
  const timeMin = new Date();
  timeMin.setMonth(timeMin.getMonth() - 6);
  const timeMax = new Date();
  timeMax.setMonth(timeMax.getMonth() + 6);
  console.log(`Fetching Outlook events between: ${timeMin.toISOString()} and ${timeMax.toISOString()}`);
  const calendarResponse = await fetch(`https://graph.microsoft.com/v1.0/me/calendarView?${new URLSearchParams({
    startDateTime: timeMin.toISOString(),
    endDateTime: timeMax.toISOString(),
    $orderby: 'start/dateTime',
    $top: '500'
  })}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Prefer': 'outlook.timezone="UTC"'
    }
  });
  if (!calendarResponse.ok) {
    console.error('Failed to fetch Outlook events:', await calendarResponse.text());
    throw new Error('Failed to fetch Outlook events');
  }
  const calendarData = await calendarResponse.json();
  console.log('Fetched Outlook events:', calendarData.value);
  return processCalendarEvents(calendarData.value, user_id, 'Outlook');
}
async function processCalendarEvents(events, user_id, provider) {
  console.log(`_______________${provider} EVENTS_______________`);
  console.log(`Total events fetched from ${provider}: ${events.length}`);
  console.log(events.reverse());
  
  // Cycle filtering keywords
  const cycleKeywords = [
    'period',
    'menstruation',
    'cycle',
    'flow',
    'pms',
    'menstrual',
    'ovulation',
    'fertile',
    'luteal',
    'follicular',
    'spotting',
    'cramps',
    'bloating',
    'mood swing'
  ];
  let cycleEvents = [];
  let syncedCount = 0;
  let existingCount = 0;
  let deletedCount = 0;
  
  // Fetch existing cycle events to compare
  const { data: existingEvents } = await supabase.from('cycles').select('id, google_event_id, provider').eq('user_id', user_id);
  console.log(`Existing events in database for user ${user_id}: ${existingEvents?.length || 0}`);
  
  const existingIds = existingEvents?.map((event) => event.google_event_id) || [];
  
  // Get all cycle-related event IDs from Google Calendar
  const googleCycleEventIds = [];
  
  // Filter events based on cycle keywords
  for (let thisEvent of events) {
    let thisEventTitle = provider.toLowerCase() === 'google' ? thisEvent.summary : thisEvent.subject;
    if (thisEventTitle) {
      let lowerTitle = thisEventTitle.toLowerCase();
      if (cycleKeywords.some((keyword) => lowerTitle.includes(keyword))) {
        console.log(`Event found: ${thisEventTitle}`);
        googleCycleEventIds.push(thisEvent.id);
        
        if (!existingIds.includes(thisEvent.id)) {
          console.log(`[New Event] ➕ Matched summary: "${thisEventTitle}"`);
          cycleEvents.push(thisEvent);
        } else {
          console.log(`[Existing Event] ➖ Already exists: "${thisEventTitle}"`);
          existingCount++;
        }
      }
    }
  }
  
  console.log(`Cycle-related events found in ${provider}: ${googleCycleEventIds.length}`);
  console.log(`New events to add: ${cycleEvents.length}`);
  
  // Find events that exist in our database but not in Google Calendar (deleted events)
  const eventsToDelete = existingEvents?.filter(event => 
    event.google_event_id && 
    !googleCycleEventIds.includes(event.google_event_id) &&
    event.provider === provider
  ) || [];
  
  console.log(`Events to delete (removed from ${provider}): ${eventsToDelete.length}`);
  
  // Delete events that were removed from Google Calendar
  if (eventsToDelete.length > 0) {
    console.log(`🗑️ Deleting ${eventsToDelete.length} events that were removed from ${provider} Calendar:`);
    for (const eventToDelete of eventsToDelete) {
      console.log(`   - Deleting event ID: ${eventToDelete.id} (Google Event ID: ${eventToDelete.google_event_id})`);
    }
    
    const eventIdsToDelete = eventsToDelete.map(event => event.id);
    const { error: deleteError } = await supabase
      .from('cycles')
      .delete()
      .in('id', eventIdsToDelete);
    
    if (deleteError) {
      console.error('❌ Error deleting removed events:', deleteError);
    } else {
      deletedCount = eventsToDelete.length;
      console.log(`✅ Successfully deleted ${deletedCount} events that were removed from ${provider} Calendar`);
    }
  }
  
  let rows = [];
  // If there are any new cycle events, prepare to insert into Supabase
  if (cycleEvents.length > 0) {
    rows = cycleEvents.map((ev) => ({
      user_id,
      provider,
      start_date: ev.start?.dateTime ? ev.start.dateTime.split('T')[0] : ev.start?.date || null,
      end_date: ev.end?.dateTime ? ev.end.dateTime.split('T')[0] : ev.end?.date || null,
      cycle_length: null,
      period_length: null,
      symptoms: null,
      notes: `Imported from ${provider} Calendar: ${ev.summary}`,
      google_event_id: ev.id || ''
    }));
    const { data, error } = await supabase.from('cycles').insert(rows).select();
    if (error) {
      console.error('❌ Error inserting cycle events:', error);
    } else {
      syncedCount = data.length;
      console.log(`✅ Inserted ${syncedCount} cycle events`);
    }
  } else {
    console.log('No new cycle events to sync.');
  }
  
  console.log(`📊 Sync Summary for ${provider}:`);
  console.log(`   - Total events processed: ${events.length}`);
  console.log(`   - Cycle events found: ${googleCycleEventIds.length}`);
  console.log(`   - New events added: ${syncedCount}`);
  console.log(`   - Existing events: ${existingCount}`);
  console.log(`   - Events deleted: ${deletedCount}`);
  
  // Return the counts for feedback
  return {
    totalEvents: events.length,
    cycleEvents: cycleEvents.length,
    syncedCount,
    existingCount,
    deletedCount,
    rows
  };
}
