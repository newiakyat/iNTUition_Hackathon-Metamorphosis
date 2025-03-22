'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/lib/AuthContext';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { MessageSquare, Send, Check } from 'lucide-react';
import { projects } from "@/app/data/mockData";

interface FeedbackFormProps {
  projectId: number;
  onFeedbackSubmitted?: () => void;
}

interface FeedbackItem {
  id: string;
  project_id: number;
  user_email: string;
  department: string | null;
  content: string;
  created_at: string;
}

export default function FeedbackForm({ projectId, onFeedbackSubmitted }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userFeedback, setUserFeedback] = useState<FeedbackItem[]>([]);
  const { user } = useAuth();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch the user's previous feedback for this project
  useEffect(() => {
    if (!user?.email) return;
    
    const fetchUserFeedback = async () => {
      try {
        // Try to get feedback from Supabase first
        const { data, error } = await supabase
          .from('project_feedback')
          .select('*')
          .eq('project_id', projectId)
          .eq('user_email', user.email)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.warn('Unable to fetch feedback from Supabase:', error);
          // Fallback to local storage as a backup
          const storedFeedback = localStorage.getItem(`feedback_${projectId}_${user.email}`);
          if (storedFeedback) {
            setUserFeedback(JSON.parse(storedFeedback));
          }
          return;
        }
        
        if (data && data.length > 0) {
          setUserFeedback(data);
          // Also update local storage for offline access
          localStorage.setItem(`feedback_${projectId}_${user.email}`, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error fetching user feedback:', error);
      }
    };
    
    fetchUserFeedback();
  }, [projectId, user?.email, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim() || !user?.email) return;
    
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Prepare feedback data
      const newFeedback = {
        id: crypto.randomUUID(),
        project_id: projectId,
        user_email: user.email,
        content: feedback.trim(),
        department: user.department || null,
        created_at: new Date().toISOString()
      };
      
      // Try to insert feedback into Supabase database
      const { error } = await supabase
        .from('project_feedback')
        .insert(newFeedback);
      
      if (error) {
        console.warn('Error submitting feedback to Supabase:', error);
        
        // Fallback: Store feedback in localStorage for later sync
        const storedFeedback = localStorage.getItem(`feedback_${projectId}_${user.email}`);
        const feedbackItems = storedFeedback ? JSON.parse(storedFeedback) : [];
        feedbackItems.unshift(newFeedback);
        localStorage.setItem(`feedback_${projectId}_${user.email}`, JSON.stringify(feedbackItems));
        
        // Update UI even if Supabase fails (offline support)
        setUserFeedback([newFeedback, ...userFeedback]);
        setSuccessMessage('Feedback saved locally. It will be synced when connection is restored.');
      } else {
        // Success - update local state and storage
        setUserFeedback([newFeedback, ...userFeedback]);
        localStorage.setItem(
          `feedback_${projectId}_${user.email}`, 
          JSON.stringify([newFeedback, ...userFeedback])
        );
        
        setSuccessMessage('Feedback submitted successfully!');
      }
      
      // Clear the form
      setFeedback('');
      
      // Call the callback if provided
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrorMessage('An unexpected error occurred. Your feedback has been saved locally.');
      
      // Attempt local storage as fallback
      try {
        const newFeedback = {
          id: crypto.randomUUID(),
          project_id: projectId,
          user_email: user.email,
          content: feedback.trim(),
          department: user.department || null,
          created_at: new Date().toISOString()
        };
        
        // Store in local state and localStorage
        setUserFeedback([newFeedback, ...userFeedback]);
        localStorage.setItem(
          `feedback_${projectId}_${user.email}`, 
          JSON.stringify([newFeedback, ...userFeedback])
        );
      } catch (localStorageError) {
        console.error('Local storage fallback failed:', localStorageError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Project Feedback
        </CardTitle>
        <CardDescription>
          Share your thoughts and suggestions about this project
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="Enter your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px]"
            required
          />
          
          {errorMessage && (
            <div className="mt-2 text-sm text-red-500">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="mt-2 text-sm text-green-500 flex items-center gap-1">
              <Check className="h-4 w-4" />
              {successMessage}
            </div>
          )}
          
          {userFeedback.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-sm mb-3">Your Previous Feedback</h3>
              <div className="space-y-3">
                {userFeedback.map((item) => (
                  <div key={item.id} className="p-3 bg-muted/50 rounded-md border">
                    <p className="text-sm">{item.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted on {formatDate(item.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || !feedback.trim()}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Submit Feedback
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 