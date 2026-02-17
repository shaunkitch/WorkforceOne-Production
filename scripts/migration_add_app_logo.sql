-- Add the missing column for App Logo
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS app_logo_url text;

-- Reload Supabase Schema Cache
NOTIFY pgrst, 'reload';
