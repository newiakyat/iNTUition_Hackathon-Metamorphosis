-- Create project_announcements table
CREATE TABLE IF NOT EXISTS project_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE project_announcements ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to insert announcements
CREATE POLICY "Allow admins to insert announcements" ON project_announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Only users with admin role can insert announcements
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.com'
    )
  );

-- Policy to allow anyone to view announcements
CREATE POLICY "Allow anyone to view announcements" ON project_announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS project_announcements_project_id_idx ON project_announcements (project_id);
CREATE INDEX IF NOT EXISTS project_announcements_created_at_idx ON project_announcements (created_at);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_project_announcements_updated_at
BEFORE UPDATE ON project_announcements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 