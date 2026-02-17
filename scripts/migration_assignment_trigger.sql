-- Trigger to automatically complete assignments when a submission is received

CREATE OR REPLACE FUNCTION public.link_submission_to_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  matching_assignment_id uuid;
BEGIN
  -- 1. Try to find a PENDING assignment for this user and form
  SELECT id INTO matching_assignment_id
  FROM public.form_assignments
  WHERE form_id = new.form_id
    AND user_id = auth.uid()
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  -- 2. If found, update the submission with the assignment_id
  --    AND update the assignment status to 'completed'
  IF matching_assignment_id IS NOT NULL THEN
    NEW.assignment_id := matching_assignment_id;

    UPDATE public.form_assignments
    SET status = 'completed'
    WHERE id = matching_assignment_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS link_submission_on_insert ON public.submissions;
CREATE TRIGGER link_submission_on_insert
  BEFORE INSERT ON public.submissions
  FOR EACH ROW
  EXECUTE PROCEDURE public.link_submission_to_assignment();
