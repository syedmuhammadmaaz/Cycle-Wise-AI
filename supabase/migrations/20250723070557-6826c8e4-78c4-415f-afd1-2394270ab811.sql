-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to sync calendar data daily at 6 AM UTC
SELECT cron.schedule(
  'daily-calendar-sync',
  '0 6 * * *', -- Daily at 6 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://uiuecyakzpooeerejaye.supabase.co/functions/v1/calendar-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpdWVjeWFrenBvb2VlcmVqYXllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTk1OTMxNywiZXhwIjoyMDY3NTM1MzE3fQ.nDq_KOJ3T_VCPVd7tC0B9KKCXYQMFJbk_5oJR4XMN5s"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);