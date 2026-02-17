-- RLS Policies for Form Assignments
ALTER TABLE form_assignments ENABLE ROW LEVEL SECURITY;

-- 1. SELECT: Users can see their own assignments. Admins/Owners/Editors can see all.
DROP POLICY IF EXISTS "Users view own assignments" ON form_assignments;
CREATE POLICY "Users view own assignments" ON form_assignments FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM forms f
      WHERE f.id = form_assignments.form_id
      AND get_org_role_for_user(f.organization_id) IN ('owner', 'admin', 'editor')
    )
  );

-- 2. INSERT: Admins/Owners/Editors can assign.
DROP POLICY IF EXISTS "Admins assign forms" ON form_assignments;
CREATE POLICY "Admins assign forms" ON form_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms f
      WHERE f.id = form_assignments.form_id
      AND get_org_role_for_user(f.organization_id) IN ('owner', 'admin', 'editor')
    )
  );

-- 3. UPDATE: Users can update status of their OWN assignments (e.g. to completed).
--    Admins can also update.
DROP POLICY IF EXISTS "Users update own assignments" ON form_assignments;
CREATE POLICY "Users update own assignments" ON form_assignments FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM forms f
      WHERE f.id = form_assignments.form_id
      AND get_org_role_for_user(f.organization_id) IN ('owner', 'admin', 'editor')
    )
  );

-- 4. DELETE: Admins/Owners can remove assignments.
DROP POLICY IF EXISTS "Admins remove assignments" ON form_assignments;
CREATE POLICY "Admins remove assignments" ON form_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM forms f
      WHERE f.id = form_assignments.form_id
      AND get_org_role_for_user(f.organization_id) IN ('owner', 'admin')
    )
  );
