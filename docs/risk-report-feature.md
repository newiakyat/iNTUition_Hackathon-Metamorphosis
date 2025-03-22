# Project Risk Report Feature

## Features

- **Admin-Only Access**: All risk report features (generation, viewing, and downloading) are restricted to administrators only
- **Risk Report Generation**: Generate comprehensive risk assessment reports for projects
- **Risk Score Calculation**: Each report includes an overall risk score out of 100
- **Mitigation Measures Extraction**: Key measures are extracted and highlighted from the report
- **Markdown Formatting**: Reports are formatted with proper Markdown for readability
- **Report Downloading**: Download reports as Markdown files
- **Database Storage**: Save reports to Supabase for future reference
- **Report History**: View previously saved reports for a project

## Implementation

### Database Structure

The feature uses a Supabase table named `project_risk_reports` with the following fields:

- `id`: UUID (primary key)
- `project_id`: Integer
- `risk_score`: Integer
- `full_report`: Text
- `mitigation_measures`: JSONB array
- `created_by`: Text (user email)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Components

1. **RiskReportModal** (`components/RiskReportModal.tsx`):
   - Handles report generation, formatting, and saving
   - Includes admin-only access restrictions
   - Features buttons for downloading and saving reports

2. **SavedRiskReports** (`components/SavedRiskReports.tsx`):
   - Displays a list of previously saved risk reports for a project
   - Only visible to administrators
   - Allows viewing full report details and downloading past reports

3. **MarkdownRenderer** (`components/MarkdownRenderer.tsx`):
   - Reusable component for rendering Markdown content
   - Used in both the modal and saved reports view

### Integration

These components are integrated into the project detail page (`app/project/[id]/page.tsx`), with appropriate authorization checks to ensure only administrators can access these features.

### Row Level Security (RLS)

The Supabase table has RLS policies in place to:

1. Allow authenticated users to insert risk reports
2. Allow authenticated users to view risk reports

### Setup Instructions

1. Create the database table:
   ```sql
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
   ```

2. Set appropriate environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=your_api_url
   ```

### Technical Details

- **Report Generation**: Reports are generated using the DeepSeek API, with detailed input about the project.
- **Markdown Rendering**: The `react-markdown` library with `remark-gfm` plugin is used for rendering Markdown.
- **Risk Score Extraction**: Regular expressions are used to extract the risk score from the generated report.
- **Mitigation Measures Extraction**: Pattern matching is used to identify and extract key mitigation measures.

## Security Considerations

- All risk report features are protected by admin-only access checks at multiple levels:
  1. UI level: Buttons and components are only visible to admins
  2. Component level: Components verify admin status before rendering
  3. Function level: Critical functions check admin status before execution
  4. Database level: Row-level security ensures data protection

## Future Enhancements

- Risk report comparison between different time periods
- Trend analysis for risk scores over time
- Automated notifications for high-risk projects
- Integration with project planning tools to address identified risks
- PDF export option 