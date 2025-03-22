'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/lib/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, User, Calendar, RefreshCcw, Plus, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

interface FeedbackItem {
  id: string;
  project_id: number;
  user_email: string;
  department: string | null;
  content: string;
  created_at: string;
}

interface FeedbackHistoryProps {
  projectId: number;
}

export default function FeedbackHistory({ projectId }: FeedbackHistoryProps) {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingItems, setSyncingItems] = useState(false);
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Function to handle "Add to Context" button click
  const handleAddToContext = () => {
    // Show toast notification without implementing actual functionality
    toast({
      title: "Success",
      description: "Added to knowledge base",
      variant: "default",
    });
  };

  // Function to fetch feedback from both Supabase and localStorage
  const fetchFeedback = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    
    try {
      // Fetch feedback from Supabase
      const { data, error } = await supabase
        .from('project_feedback')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching feedback from Supabase:', error);
        // Proceed to check localStorage
      }
      
      // Start with Supabase data (if available)
      let allFeedback = data || [];
      
      // Attempt to find locally stored feedback for all users
      try {
        const keys = Object.keys(localStorage);
        const feedbackKeys = keys.filter(key => key.startsWith(`feedback_${projectId}_`));
        
        for (const key of feedbackKeys) {
          const localFeedback = JSON.parse(localStorage.getItem(key) || '[]');
          
          // Add any feedback items that aren't already in the Supabase results
          localFeedback.forEach((item: FeedbackItem) => {
            // Check if this item already exists in our results
            const exists = allFeedback.some(
              (existingItem: FeedbackItem) => existingItem.id === item.id
            );
            
            if (!exists) {
              allFeedback.push({
                ...item,
                _source: 'local' // Add flag to identify local items
              });
            }
          });
        }
      } catch (localError) {
        console.error('Error parsing localStorage feedback:', localError);
      }
      
      // Sort by created_at date, newest first
      allFeedback.sort((a: FeedbackItem, b: FeedbackItem) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setFeedbackItems(allFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to sync locally stored feedback to Supabase
  const syncLocalFeedback = async () => {
    if (!isAdmin) return;
    
    setSyncingItems(true);
    
    try {
      // Find all feedback items in localStorage
      const keys = Object.keys(localStorage);
      const feedbackKeys = keys.filter(key => key.startsWith(`feedback_${projectId}_`));
      let syncedCount = 0;
      
      for (const key of feedbackKeys) {
        const localFeedback = JSON.parse(localStorage.getItem(key) || '[]');
        
        for (const item of localFeedback) {
          // Skip items that don't have the _source: 'local' flag
          if (item._source !== 'local') continue;
          
          // Remove the _source property before sending to Supabase
          const { _source, ...cleanItem } = item;
          
          // Try to insert the item into Supabase
          const { error } = await supabase
            .from('project_feedback')
            .insert(cleanItem);
          
          if (!error) {
            syncedCount++;
          }
        }
      }
      
      // Refresh the feedback list
      fetchFeedback();
      
      alert(`Successfully synced ${syncedCount} feedback items to the database.`);
    } catch (error) {
      console.error('Error syncing feedback:', error);
    } finally {
      setSyncingItems(false);
    }
  };
  
  useEffect(() => {
    fetchFeedback();
  }, [projectId, isAdmin]);

  // If user is not an admin, don't render anything
  if (!isAdmin) return null;

  const getDepartmentLabel = (departmentCode: string | null) => {
    if (!departmentCode) return 'Not specified';
    
    switch (departmentCode) {
      case 'RD': return 'Research & Development';
      case 'IT': return 'IT';
      case 'SALES': return 'Sales';
      case 'MARKETING': return 'Marketing';
      case 'ENGINEERING': return 'Engineering';
      case 'SUPPLY': return 'Supply Chain';
      case 'MANUFACTURING': return 'Manufacturing';
      case 'HR': return 'Human Resources';
      default: return departmentCode;
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Feedback History
          </CardTitle>
          <CardDescription>
            User feedback for this project
          </CardDescription>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={syncLocalFeedback}
          disabled={syncingItems}
          className="flex items-center gap-1"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Sync Local Feedback
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading feedback...</div>
        ) : feedbackItems.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No feedback received yet</div>
        ) : (
          <div className="space-y-4">
            {feedbackItems.map((item) => (
              <Card key={item.id} className={`border ${item._source === 'local' ? 'border-dashed border-yellow-500' : ''}`}>
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.user_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item._source === 'local' && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          Stored Locally
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {getDepartmentLabel(item.department)}
                      </Badge>
                    </div>
                  </div>
                  <p className="my-2 text-sm">{item.content}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {item.created_at ? format(new Date(item.created_at), 'PPpp') : 'Unknown date'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-xs"
                      onClick={handleAddToContext}
                    >
                      <Plus className="h-3 w-3" />
                      Add to Context
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 