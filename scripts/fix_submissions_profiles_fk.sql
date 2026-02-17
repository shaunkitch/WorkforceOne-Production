-- Add explicit FK to profiles for easy joining
-- This assumes profiles.id is the user_id (same as auth.users.id)
ALTER TABLE submissions
ADD CONSTRAINT fk_submissions_profiles
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE SET NULL;
