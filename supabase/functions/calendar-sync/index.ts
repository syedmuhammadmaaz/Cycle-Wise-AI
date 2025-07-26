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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let user_id: string

    if (req.method === 'POST') {
      // Called from OAuth callback or manual trigger
      const body = await req.json()
      user_id = body.user_id
    } else {
      // Called as a cron job - sync all connected users
      console.log('Running scheduled calendar sync for all users')
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, google_refresh_token')
        .eq('google_calendar_connected', true)
        .not('google_refresh_token', 'is', null)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return new Response(JSON.stringify({ error: 'Failed to fetch profiles' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const results = []
      for (const profile of profiles || []) {
        try {
          const result = await syncUserCalendar(supabase, profile.user_id, profile.google_refresh_token)
          results.push({ user_id: profile.user_id, success: true, result })
        } catch (error) {
          console.error(`Sync failed for user ${profile.user_id}:`, error)
          results.push({ user_id: profile.user_id, success: false, error: error.message })
        }
      }

      return new Response(JSON.stringify({ 
        message: 'Scheduled sync completed',
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Single user sync
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_refresh_token')
      .eq('user_id', user_id)
      .eq('google_calendar_connected', true)
      .single()

    if (profileError || !profile?.google_refresh_token) {
      console.error('User not found or not connected:', profileError)
      return new Response(JSON.stringify({ error: 'User not connected to Google Calendar' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const result = await syncUserCalendar(supabase, user_id, profile.google_refresh_token)

    return new Response(JSON.stringify({
      message: 'Calendar sync completed successfully',
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Calendar sync error:', error)
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
  // Refresh the access token
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
    throw new Error('Failed to refresh access token')
  }

  const tokens: GoogleTokenResponse = await tokenResponse.json()
  
  // Get calendar events from the last 6 months to 6 months in the future
  const timeMin = new Date()
  timeMin.setMonth(timeMin.getMonth() - 6)
  const timeMax = new Date()
  timeMax.setMonth(timeMax.getMonth() + 6)

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
    throw new Error('Failed to fetch calendar events')
  }

  const calendarData = await calendarResponse.json()
  const events: GoogleCalendarEvent[] = calendarData.items || []

  // Filter events that might be cycle-related
  const cycleKeywords = [
    'period', 'menstruation', 'cycle', 'flow', 'pms', 'menstrual',
    'ovulation', 'fertile', 'luteal', 'follicular', 'spotting',
    'cramps', 'bloating', 'mood swing'
  ]

  const cycleEvents = events.filter(event => {
    if (!event.summary) return false
    
    const summary = event.summary.toLowerCase()
    return cycleKeywords.some(keyword => summary.includes(keyword))
  })

  console.log(`Found ${cycleEvents.length} potential cycle events for user ${user_id}`)

  let syncedCount = 0
  let existingCount = 0

  for (const event of cycleEvents) {
    try {
      // Extract start date
      let startDate: string
      if (event.start.date) {
        startDate = event.start.date
      } else if (event.start.dateTime) {
        startDate = new Date(event.start.dateTime).toISOString().split('T')[0]
      } else {
        continue // Skip events without valid dates
      }

      // Check if we already have this cycle date
      const { data: existingCycle } = await supabase
        .from('cycles')
        .select('id')
        .eq('user_id', user_id)
        .eq('start_date', startDate)
        .maybeSingle()

      if (existingCycle) {
        existingCount++
        continue
      }

      // Determine if this is a period start (contains specific keywords)
      const isPeriodStart = ['period', 'menstruation', 'flow'].some(keyword => 
        event.summary.toLowerCase().includes(keyword)
      )

      if (isPeriodStart) {
        // Extract potential cycle/period length from description or summary
        let cycle_length: number | null = null
        let period_length: number | null = null
        
        const text = `${event.summary} ${event.description || ''}`.toLowerCase()
        const cycleMatch = text.match(/(\d+)\s*day\s*cycle/)
        const periodMatch = text.match(/(\d+)\s*day\s*(period|flow)/)
        
        if (cycleMatch) cycle_length = parseInt(cycleMatch[1])
        if (periodMatch) period_length = parseInt(periodMatch[1])

        // Extract symptoms from the event
        const symptoms: string[] = []
        const symptomKeywords = [
          'cramps', 'bloating', 'headache', 'mood swing', 'fatigue',
          'nausea', 'tender breast', 'acne', 'backache', 'irritability'
        ]
        
        symptomKeywords.forEach(symptom => {
          if (text.includes(symptom)) {
            symptoms.push(symptom)
          }
        })

        // Insert new cycle
        const { error: insertError } = await supabase
          .from('cycles')
          .insert({
            user_id: user_id,
            start_date: startDate,
            cycle_length: cycle_length,
            period_length: period_length,
            symptoms: symptoms.length > 0 ? symptoms : null,
            notes: `Imported from Google Calendar: ${event.summary}`,
          })

        if (insertError) {
          console.error('Error inserting cycle:', insertError)
        } else {
          syncedCount++
          console.log(`Synced cycle for ${startDate}`)
        }
      }
    } catch (error) {
      console.error('Error processing event:', event.id, error)
    }
  }

  return {
    totalEvents: events.length,
    cycleEvents: cycleEvents.length,
    syncedCount,
    existingCount,
  }
}