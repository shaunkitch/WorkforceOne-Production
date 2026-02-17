-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policy (old name)
DROP POLICY IF EXISTS "Users can view own submissions" ON submissions;
-- Drop possibly existing new policy (new name)
DROP POLICY IF EXISTS "Users can view relevant submissions" ON submissions;

-- Create comprehensive SELECT policy
CREATE POLICY "Users can view relevant submissions" ON submissions FOR SELECT
  USING (
    -- User can see their own submissions
    user_id = auth.uid() 
    OR
    -- Org Admins/Owners/Editors can see all submissions for forms in their org
    EXISTS (
        SELECT 1 FROM forms f
        WHERE f.id = submissions.form_id
        AND get_org_role_for_user(f.organization_id) IN ('owner', 'admin', 'editor')
    )
  );

-- Allow Insert (authenticated users) - maintain existing or ensure it exists
DROP POLICY IF EXISTS "Authenticated users can insert submissions" ON submissions;
CREATE POLICY "Authenticated users can insert submissions" ON submissions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
