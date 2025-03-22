-- Create project_feedback table
CREATE TABLE IF NOT EXISTS project_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  department TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE project_feedback ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert feedback
CREATE POLICY "Allow users to insert feedback" ON project_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy to allow only admins to view all feedback
CREATE POLICY "Allow admins to view all feedback" ON project_feedback
  FOR SELECT
  TO authenticated
  USING (
    -- Users with admin role can view all feedback
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.com'
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS project_feedback_project_id_idx ON project_feedback (project_id);
CREATE INDEX IF NOT EXISTS project_feedback_user_email_idx ON project_feedback (user_email);
CREATE INDEX IF NOT EXISTS project_feedback_created_at_idx ON project_feedback (created_at);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_project_feedback_updated_at
BEFORE UPDATE ON project_feedback
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 