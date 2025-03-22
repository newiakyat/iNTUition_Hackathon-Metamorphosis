-- Create project_risk_reports table
CREATE TABLE IF NOT EXISTS project_risk_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id INTEGER NOT NULL,
  risk_score INTEGER NOT NULL,
  full_report TEXT NOT NULL,
  mitigation_measures JSONB,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE project_risk_reports ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to insert risk reports
CREATE POLICY "Allow authenticated users to insert risk reports" ON project_risk_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);  -- Only checks if user is authenticated

-- Policy to allow authenticated users to view risk reports
CREATE POLICY "Allow authenticated users to view risk reports" ON project_risk_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);  -- Only checks if user is authenticated

-- Grant explicit permissions to the authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON project_risk_reports TO authenticated;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS project_risk_reports_project_id_idx ON project_risk_reports (project_id);
CREATE INDEX IF NOT EXISTS project_risk_reports_created_at_idx ON project_risk_reports (created_at);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_project_risk_reports_updated_at
BEFORE UPDATE ON project_risk_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 