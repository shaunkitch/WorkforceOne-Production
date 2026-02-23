-- Add team_id to tasks for group assignment
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL;
