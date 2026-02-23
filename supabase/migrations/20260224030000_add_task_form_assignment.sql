-- Add form_id to tasks to link forms
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS form_id uuid REFERENCES public.forms(id) ON DELETE SET NULL;
