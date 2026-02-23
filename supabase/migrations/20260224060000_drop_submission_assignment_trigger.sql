-- Drop the heavy and somewhat unpredictable database trigger for linking submissions
-- We will handle this explicitly in the frontend / API layer to improve UX and reduce DB overhead.

DROP TRIGGER IF EXISTS link_submission_on_insert ON public.submissions;
DROP FUNCTION IF EXISTS public.link_submission_to_assignment();
