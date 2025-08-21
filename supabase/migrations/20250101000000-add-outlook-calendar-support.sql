-- Add Outlook Calendar support fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN outlook_calendar_connected BOOLEAN DEFAULT false,
ADD COLUMN outlook_refresh_token TEXT,
ADD COLUMN calendar_provider TEXT DEFAULT 'google' CHECK (calendar_provider IN ('google', 'outlook', 'both'));

-- Update existing profiles to have 'google' as default calendar provider
UPDATE public.profiles 
SET calendar_provider = 'google' 
WHERE google_calendar_connected = true;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_calendar_provider ON public.profiles(calendar_provider);
CREATE INDEX IF NOT EXISTS idx_profiles_outlook_connected ON public.profiles(outlook_calendar_connected);
