import { create } from 'zustand'

interface CalendarEvent {
  id: string;
  summary: string;
  start_date: string;
}

interface CalendarStore {
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
}))
