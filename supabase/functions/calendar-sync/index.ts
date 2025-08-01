import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleCalendarEvent {
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
        .select('user_id, google_refresh_token')
        .eq('google_calendar_connected', true)
        .not('google_refresh_token', 'is', null)

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
          const result = await syncUserCalendar(supabase, profile.user_id, profile.google_refresh_token)
          results.push({ user_id: profile.user_id, success: true, result })
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
      .select('google_refresh_token')
      .eq('user_id', user_id)
      .eq('google_calendar_connected', true)
      .single()

    if (profileError || !profile?.google_refresh_token) {
      console.error(' User not found or not connected:', profileError)
      return new Response(JSON.stringify({ error: 'User not connected to Google Calendar' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const result = await syncUserCalendar(supabase, user_id, profile.google_refresh_token)

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

async function syncUserCalendar(supabase: any, user_id: string, refresh_token: string) {
  console.log(` [syncUserCalendar] Start calendar sync for user: ${user_id}`)

  //  Refresh token
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
    console.error(' Failed to refresh access token')
    throw new Error('Failed to refresh access token')
  }

  const tokens: GoogleTokenResponse = await tokenResponse.json()
  console.log(` Access token refreshed for user: ${user_id}`)

  const timeMin = new Date()
  timeMin.setMonth(timeMin.getMonth() - 6)
  const timeMax = new Date()
  timeMax.setMonth(timeMax.getMonth() + 6)

  console.log(` Fetching events between: ${timeMin.toISOString()} and ${timeMax.toISOString()}`)

  const calendarResponse = await fetch(
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
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    }
  )

  if (!calendarResponse.ok) {
    console.error(' Failed to fetch calendar events')
    throw new Error('Failed to fetch calendar events')
  }

  const calendarData = await calendarResponse.json()
  const events: GoogleCalendarEvent[] = calendarData.items || []
  console.log(` Total events fetched from Google Calendar: ${events.length}`)

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

  console.log(` Cycle-related events found: ${cycleEvents.length}`)

  let syncedCount = 0
  let existingCount = 0

  for (const event of cycleEvents) {
    try {
      let startDate: string
      if (event.start.date) {
        startDate = event.start.date
      } else if (event.start.dateTime) {
        startDate = new Date(event.start.dateTime).toISOString().split('T')[0]
      } else {
        console.warn(`[ Skipped] No valid start date for event: ${event.id}`)
        continue
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
            notes: `Imported from Google Calendar: ${event.summary}`,
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

  console.log(` Summary for ${user_id} — Total Events: ${events.length}, Cycle Events: ${cycleEvents.length}, Synced: ${syncedCount}, Existing: ${existingCount}`)

  return {
    totalEvents: events.length,
    cycleEvents: cycleEvents.length,
    syncedCount,
    existingCount,
  }
}
