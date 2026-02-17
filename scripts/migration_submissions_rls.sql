-- Allow users to view their own submissions
DROP POLICY IF EXISTS "Users can view own submissions" ON submissions;
CREATE POLICY "Users can view own submissions" ON submissions FOR SELECT
  USING (user_id = auth.uid());
