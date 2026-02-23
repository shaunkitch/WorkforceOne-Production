-- Add missing columns to submissions table that the submit_batch RPC expects

ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assignment_id uuid REFERENCES form_assignments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS visit_id uuid REFERENCES visits(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS location jsonb,
ADD COLUMN IF NOT EXISTS signature_url text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'submitted',
ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now();

-- Also ensure RLS policies accommodate these new insert vectors
DROP POLICY IF EXISTS "Public can insert submissions" ON submissions;
CREATE POLICY "Public can insert submissions" ON submissions FOR INSERT
WITH CHECK (true);
