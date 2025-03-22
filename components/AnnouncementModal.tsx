'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addProjectAnnouncement } from '@/app/data/mockData';
import { useAuth } from '@/lib/AuthContext';
import { validateSupabaseConnection } from '@/lib/supabase';

interface AnnouncementModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function AnnouncementModal({ projectId, isOpen, onClose }: AnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth(); // Get current user information

  useEffect(() => {
    console.log('AnnouncementModal: Modal is', isOpen ? 'open' : 'closed', 'for project', projectId);
    
    // Reset form when modal opens
    if (isOpen) {
      setTitle('');
      setContent('');
      
      // Check Supabase connection when modal opens
      const checkConnection = async () => {
        const result = await validateSupabaseConnection();
        setConnectionStatus(
          result.connected 
            ? `Connected to Supabase` 
            : `Connection error: ${result.error}`
        );
        console.log('AnnouncementModal: Supabase connection status:', result);
      };
      
      checkConnection();
    }
  }, [isOpen, projectId]);

  const handleSubmit = async () => {
    console.log('AnnouncementModal: Submitting announcement', { title, content, projectId });
    
    if (!title.trim() || !content.trim()) {
      console.log('AnnouncementModal: Validation failed - empty fields');
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (!projectId || isNaN(projectId)) {
      console.error('AnnouncementModal: Invalid project ID:', projectId);
      toast({
        title: 'Error',
        description: 'Invalid project ID',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate Supabase connection before submitting
      const connectionResult = await validateSupabaseConnection();
      console.log('AnnouncementModal: Connection check before submission:', connectionResult);
      
      if (!connectionResult.connected) {
        console.warn('AnnouncementModal: Supabase connection issue, will fallback to local storage');
      }
      
      // Get user information for created_by field
      const createdBy = user?.email || 'Admin';
      
      const announcement = await addProjectAnnouncement({
        project_id: projectId,
        title,
        content,
        created_by: createdBy,
        created_at: new Date().toISOString(),
      });
      
      if (!announcement) {
        throw new Error('Failed to create announcement');
      }
      
      console.log('AnnouncementModal: Successfully created announcement', announcement);

      toast({
        title: 'Success',
        description: 'Announcement has been posted',
      });

      // Reset form and close modal
      setTitle('');
      setContent('');
      onClose();
    } catch (error) {
      console.error('AnnouncementModal: Error creating announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to create announcement',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Project Announcement</DialogTitle>
          <DialogDescription>
            Create an announcement that will be visible to all users who can view this project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              className="col-span-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Content
            </Label>
            <Textarea
              id="content"
              className="col-span-3"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Announcement content"
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? 'Posting...' : 'Post Announcement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 