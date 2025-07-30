import { supabase } from '@/integrations/supabase/client'
import { CalendarEvent } from '@/store/calendarStore'

export async function fetchUserCycleEvents(userId: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('cycles')
    .select('id, start_date, notes')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching cycle events:', error)
    return []
  }

  return (data || []).map(event => ({
    id: event.id,
    summary: event.notes || 'Cycle Event',
    start_date: event.start_date
  }))
}
