import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CalendarEvent {
  id: string
  summary: string
  start: {
    date?: string
    dateTime?: string
  }
  end: {
    date?: string
    dateTime?: string
  }
  description?: string
}

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

interface MicrosoftTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log('[OPTIONS] CORS preflight')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let user_id: string

    if (req.method === 'POST') {
      const body = await req.json()
      user_id = body.user_id
      console.log(`[POST] Sync triggered for user: ${user_id}`)
    } else {
      console.log('[GET] Running scheduled calendar sync for all users')

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, google_refresh_token, outlook_refresh_token, calendar_provider, google_calendar_connected, outlook_calendar_connected')
        .or('google_calendar_connected.eq.true,outlook_calendar_connected.eq.true')

      if (profilesError) {
        console.error(' Error fetching profiles:', profilesError)
        return new Response(JSON.stringify({ error: 'Failed to fetch profiles' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log(` Found ${profiles.length} connected user(s) to sync`)
      const results = []
      for (const profile of profiles || []) {
        try {
          console.log(` Syncing calendar for user: ${profile.user_id}`)
          
          // Sync Google Calendar if connected and has refresh token
          if (profile.google_refresh_token && profile.google_calendar_connected) {
            const googleResult = await syncUserCalendar(supabase, profile.user_id, profile.google_refresh_token, 'google')
            results.push({ user_id: profile.user_id, provider: 'google', success: true, result: googleResult })
          }
          
          // Sync Outlook Calendar if connected and has refresh token
          if (profile.outlook_refresh_token && profile.outlook_calendar_connected) {
            const outlookResult = await syncUserCalendar(supabase, profile.user_id, profile.outlook_refresh_token, 'outlook')
            results.push({ user_id: profile.user_id, provider: 'outlook', success: true, result: outlookResult })
          }
        } catch (error) {
          console.error(` Sync failed for user ${profile.user_id}:`, error)
          results.push({ user_id: profile.user_id, success: false, error: error.message })
        }
      }

      console.log(' Scheduled sync finished for all users')
      return new Response(JSON.stringify({ message: 'Scheduled sync completed', results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_refresh_token, outlook_refresh_token, calendar_provider, google_calendar_connected, outlook_calendar_connected')
      .eq('user_id', user_id)
      .single()

    if (profileError || !profile) {
      console.error(' User not found:', profileError)
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!profile.google_calendar_connected && !profile.outlook_calendar_connected) {
      console.error(' User not connected to any calendar')
      return new Response(JSON.stringify({ error: 'User not connected to any calendar' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Determine which provider to sync based on request or available tokens
    const body = await req.json().catch(() => ({}))
    const requestedProvider = body.provider || 'google'
    
    let result
    if (requestedProvider === 'outlook' && profile.outlook_refresh_token && profile.outlook_calendar_connected) {
      result = await syncUserCalendar(supabase, user_id, profile.outlook_refresh_token, 'outlook')
    } else if (profile.google_refresh_token && profile.google_calendar_connected) {
      result = await syncUserCalendar(supabase, user_id, profile.google_refresh_token, 'google')
    } else {
      return new Response(JSON.stringify({ error: `Requested provider ${requestedProvider} not available or not connected` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(` Calendar sync completed for user ${user_id}`)
    return new Response(JSON.stringify({
      message: 'Calendar sync completed successfully',
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(' Calendar sync error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function syncUserCalendar(supabase: any, user_id: string, refresh_token: string, provider: 'google' | 'outlook') {
  console.log(` [syncUserCalendar] Start ${provider} calendar sync for user: ${user_id}`)

  let accessToken: string
  let calendarResponse: Response

  if (provider === 'google') {
    // Refresh Google access token
    console.log(` Refreshing Google access token for user: ${user_id}`)
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
        refresh_token: refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      console.error(' Failed to refresh Google access token')
      throw new Error('Failed to refresh Google access token')
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json()
    accessToken = tokens.access_token
    console.log(` Google access token refreshed for user: ${user_id}`)

    // Fetch Google Calendar events
    const timeMin = new Date()
    timeMin.setMonth(timeMin.getMonth() - 6)
    const timeMax = new Date()
    timeMax.setMonth(timeMax.getMonth() + 6)

    console.log(` Fetching Google events between: ${timeMin.toISOString()} and ${timeMax.toISOString()}`)

    calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '500',
      }),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
  } else {
    // Refresh Microsoft access token
    console.log(` Refreshing Microsoft access token for user: ${user_id}`)
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('MICROSOFT_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('MICROSOFT_CLIENT_SECRET') ?? '',
        refresh_token: refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      console.error(' Failed to refresh Microsoft access token')
      throw new Error('Failed to refresh Microsoft access token')
    }

    const tokens: MicrosoftTokenResponse = await tokenResponse.json()
    accessToken = tokens.access_token
    console.log(` Microsoft access token refreshed for user: ${user_id}`)

    // Fetch Outlook Calendar events using Microsoft Graph API
    const timeMin = new Date()
    timeMin.setMonth(timeMin.getMonth() - 6)
    const timeMax = new Date()
    timeMax.setMonth(timeMax.getMonth() + 6)

    console.log(` Fetching Outlook events between: ${timeMin.toISOString()} and ${timeMax.toISOString()}`)

    calendarResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?` +
      new URLSearchParams({
        startDateTime: timeMin.toISOString(),
        endDateTime: timeMax.toISOString(),
        $orderby: 'start/dateTime',
        $top: '500',
      }),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'outlook.timezone="UTC"',
        },
      }
    )
  }

  if (!calendarResponse.ok) {
    console.error(` Failed to fetch ${provider} calendar events`)
    throw new Error(`Failed to fetch ${provider} calendar events`)
  }

  const calendarData = await calendarResponse.json()
  let events: CalendarEvent[] = []
  
  if (provider === 'google') {
    events = calendarData.items || []
    console.log(` Total events fetched from Google Calendar: ${events.length}`)
  } else {
    events = calendarData.value || []
    console.log(` Total events fetched from Outlook Calendar: ${events.length}`)
  }

  console.log(`_________________________calendarData (RAW)________________`)
  console.log(events)
  console.log(`___________________________________________________________`)

  //  Cycle filtering
  const cycleKeywords = [
    'period', 'menstruation', 'cycle', 'flow', 'pms', 'menstrual',
    'ovulation', 'fertile', 'luteal', 'follicular', 'spotting',
    'cramps', 'bloating', 'mood swing'
  ]

  const cycleEvents = events.filter(event => {
    if (!event.summary) return false
    const summary = event.summary.toLowerCase()
    const match = cycleKeywords.some(keyword => summary.includes(keyword))
    if (match) console.log(`[Match] ➕ Matched summary: "${summary}"`)
    return match
  })

  console.log(`_________________________calendarData (Filtered)________________`)
  console.log(cycleEvents)
  console.log(`___________________________________________________________`)

  console.log(` Cycle-related events found: ${cycleEvents.length}`)

  let syncedCount = 0
  let existingCount = 0

  for (const event of cycleEvents) {
    try {
      let startDate: string
      if (provider === 'google') {
        if (event.start.date) {
          startDate = event.start.date
        } else if (event.start.dateTime) {
          startDate = new Date(event.start.dateTime).toISOString().split('T')[0]
        } else {
          console.warn(`[ Skipped] No valid start date for Google event: ${event.id}`)
          continue
        }
      } else {
        // Outlook events use different structure
        if (event.start.dateTime) {
          startDate = new Date(event.start.dateTime).toISOString().split('T')[0]
        } else {
          console.warn(`[ Skipped] No valid start date for Outlook event: ${event.id}`)
          continue
        }
      }

      const { data: existingCycle } = await supabase
        .from('cycles')
        .select('id')
        .eq('user_id', user_id)
        .eq('start_date', startDate)
        .maybeSingle()

      if (existingCycle) {
        existingCount++
        console.log(`Existing cycle found on ${startDate} — skipping insert`)
        continue
      }

      const isPeriodStart = ['period', 'menstruation', 'flow'].some(keyword =>
        event.summary.toLowerCase().includes(keyword)
      )

      if (isPeriodStart) {
        const text = `${event.summary} ${event.description || ''}`.toLowerCase()

        let cycle_length: number | null = null
        let period_length: number | null = null

        const cycleMatch = text.match(/(\d+)\s*day\s*cycle/)
        const periodMatch = text.match(/(\d+)\s*day\s*(period|flow)/)

        if (cycleMatch) {
          cycle_length = parseInt(cycleMatch[1])
          console.log(` Parsed cycle length: ${cycle_length}`)
        }
        if (periodMatch) {
          period_length = parseInt(periodMatch[1])
          console.log(` Parsed period length: ${period_length}`)
        }

        const symptomKeywords = [
          'cramps', 'bloating', 'headache', 'mood swing', 'fatigue',
          'nausea', 'tender breast', 'acne', 'backache', 'irritability'
        ]
        const symptoms = symptomKeywords.filter(symptom => text.includes(symptom))
        if (symptoms.length) {
          console.log(` Symptoms detected: ${symptoms.join(', ')}`)
        }

        const { error: insertError } = await supabase
          .from('cycles')
          .insert({
            user_id,
            start_date: startDate,
            cycle_length,
            period_length,
            symptoms: symptoms.length > 0 ? symptoms : null,
            notes: `Imported from ${provider === 'google' ? 'Google' : 'Outlook'} Calendar: ${event.summary}`,
          })

        if (insertError) {
          console.error(` Insert failed on ${startDate}:`, insertError)
        } else {
          syncedCount++
          console.log(` Synced cycle on ${startDate}`)
        }
      } else {
        console.log(` Skipped non-period start: "${event.summary}"`)
      }
    } catch (error) {
      console.error(` Error processing event ${event.id}:`, error)
    }
  }

  console.log(` Summary for ${user_id} — ${provider} Total Events: ${events.length}, Cycle Events: ${cycleEvents.length}, Synced: ${syncedCount}, Existing: ${existingCount}`)

  return {
    provider,
    totalEvents: events.length,
    cycleEvents: cycleEvents.length,
    syncedCount,
    existingCount,
    rawEvents: events,
    filteredEvents: cycleEvents
  }
}
