# Project Feedback Feature

This document explains the implementation of the project feedback feature, which allows users to submit feedback on projects and admins to view the feedback history.

## Features

- **User Feedback Submission**: All authenticated users can submit feedback for any project they have access to.
- **Admin Feedback Review**: Only administrators can see all feedback submitted for a project.
- **Department Tracking**: Feedback is associated with the user's department for better organization.
- **Timestamp Records**: Each feedback entry records when it was created.

## Implementation

### Database Structure

The feature uses a Supabase database table called `project_feedback` with the following structure:

- `id`: UUID primary key
- `project_id`: Integer reference to the project
- `user_email`: Email of the user who submitted the feedback
- `department`: Department of the user (optional)
- `content`: The actual feedback text
- `created_at`: Timestamp when the feedback was created
- `updated_at`: Timestamp when the feedback was last updated

### Components

1. **FeedbackForm**: A form component that allows users to submit feedback for a project.
   - Located at: `components/FeedbackForm.tsx`
   - Accessible to all authenticated users

2. **FeedbackHistory**: A component that displays all feedback for a project.
   - Located at: `components/FeedbackHistory.tsx`
   - Only visible to administrators

### Integration

These components are integrated into the project detail page at `app/project/[id]/page.tsx`.

## Row Level Security (RLS)

Supabase Row Level Security is configured with the following policies:

1. **Insert Policy**: Allows any authenticated user to submit feedback
2. **Select Policy**: Allows only administrators to view all feedback (users with email ending in `@admin.com`)

## Setup Instructions

1. **Create the Database Table**:
   
   Execute the SQL migration script located at `supabase/migrations/20240501_create_project_feedback_table.sql` in your Supabase project.

2. **Environment Variables**:

   Ensure your `.env.local` file contains the necessary Supabase configuration:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Test the Feature**:

   - Login as a regular user to submit feedback on projects
   - Login as an admin user (email ending with `@admin.com`) to view all feedback

## Security Considerations

- Only authenticated users can submit feedback
- Only administrators can view all feedback
- Row Level Security (RLS) ensures proper access control at the database level

## Future Enhancements

Potential enhancements for this feature:

- Allow users to edit or delete their own feedback
- Add feedback categorization (positive, negative, suggestion)
- Implement feedback response functionality for admins
- Add notification when new feedback is submitted
- Add analytics on feedback trends over time 