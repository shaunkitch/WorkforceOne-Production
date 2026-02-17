-- Add status and submitted_at to submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS status text DEFAULT 'submitted';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now();

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
