'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone } from 'lucide-react';
import { getProjectAnnouncements } from '@/app/data/mockData';
import { validateSupabaseConnection } from '@/lib/supabase';

interface Announcement {
  id: string | number;
  project_id: number;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at?: string; // Optional field to match Supabase schema
}

interface ProjectAnnouncementsProps {
  projectId: number;
}

export default function ProjectAnnouncements({ projectId }: ProjectAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  useEffect(() => {
    console.log('ProjectAnnouncements: Fetching announcements for project', projectId);
    
    const checkConnection = async () => {
      const result = await validateSupabaseConnection();
      setConnectionStatus(
        result.connected 
          ? `Connected to Supabase` 
          : `Connection error: ${result.error}`
      );
      console.log('Supabase connection status:', result);
    };
    
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await checkConnection();
        const data = await getProjectAnnouncements(projectId);
        console.log('ProjectAnnouncements: Fetched announcements:', data);
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('ProjectAnnouncements: Error fetching announcements:', error);
        setError('Failed to load announcements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchAnnouncements();
    } else {
      console.error('ProjectAnnouncements: Invalid project ID', projectId);
      setError('Invalid project ID');
      setLoading(false);
    }
  }, [projectId]);

  console.log('ProjectAnnouncements: Current state -', { 
    loading, 
    announcementsCount: announcements.length,
    connectionStatus
  });

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Megaphone className="h-5 w-5 mr-2 text-purple-500" />
            Project Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading announcements...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-purple-200">
      <CardHeader className="pb-3 bg-purple-50">
        <CardTitle className="text-lg flex items-center">
          <Megaphone className="h-5 w-5 mr-2 text-purple-500" />
          Project Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-base">{announcement.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {new Date(announcement.created_at).toLocaleDateString('en-GB')}
                  </Badge>
                </div>
                <p className="text-sm whitespace-pre-line">{announcement.content}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Posted by {announcement.created_by}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No announcements yet. Check back later for updates.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 