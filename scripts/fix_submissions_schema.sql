-- 1. Ensure submissions table has user_id and assignment_id
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS assignment_id uuid REFERENCES form_assignments(id) ON DELETE SET NULL;

-- 2. Drop existing policies on submissions to start fresh
DROP POLICY IF EXISTS "Public can insert submissions" ON submissions;
DROP POLICY IF EXISTS "Members can view submissions of their organization's forms" ON submissions;

-- 3. Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 4. INSERT: Allow anyone to insert (public forms) OR authenticated users (app forms)
CREATE POLICY "Anyone can insert submissions" ON submissions FOR INSERT
WITH CHECK (true);

-- 5. SELECT: 
--    a) Users can see their OWN submissions
--    b) Org Members (Admins/Editors) can see submissions for their org's forms
CREATE POLICY "Users can view own submissions" ON submissions FOR SELECT
USING (
  user_id = auth.uid()
);

CREATE POLICY "Org members can view form submissions" ON submissions FOR SELECT
USING (
  EXISTS (
      SELECT 1 FROM forms f
      WHERE f.id = submissions.form_id
      AND get_org_role_for_user(f.organization_id) IN ('owner', 'admin', 'editor', 'viewer')
  )
);
