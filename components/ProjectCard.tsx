'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Department } from '@/lib/AuthContext';

type ProjectProps = {
  project: {
    id: number;
    title: string;
    description: string;
    status: string;
    progress: number;
    priority?: string;
    owner?: string;
    startDate?: string;
    endDate?: string;
    kpis?: Array<any>;
    allowedDepartments?: Department[];
  };
};

export function ProjectCard({ project }: ProjectProps) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  // Function to get badge color based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in progress':
        return 'secondary';
      case 'planning':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Check if user has access to this project
  const hasAccess = () => {
    // Admin always has access
    if (isAdmin) return true;
    
    // If no allowed departments specified, assume everyone has access
    if (!project.allowedDepartments || project.allowedDepartments.length === 0) {
      return true;
    }
    
    // Check if user's department is in the allowed departments
    return user?.department && project.allowedDepartments.includes(user.department);
  };

  const handleClick = () => {
    if (hasAccess()) {
      router.push(`/project/${project.id}`);
    } else {
      // Could show a toast or notification here
      console.log('Access denied to project:', project.title);
    }
  };

  return (
    <Card 
      className={`overflow-hidden transition-shadow cursor-pointer ${
        hasAccess() ? 'hover:shadow-md' : 'opacity-75 hover:cursor-not-allowed'
      }`} 
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
              {!hasAccess() && <Lock className="h-4 w-4 text-muted-foreground" />}
              {isAdmin && project.allowedDepartments && project.allowedDepartments.length > 0 && (
                <Shield className="h-4 w-4 text-muted-foreground" title="Restricted access" />
              )}
            </div>
            <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
          
          <div className="space-y-2">
            {project.owner && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Owner:</span>
                <span>{project.owner}</span>
              </div>
            )}
            
            {project.priority && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Priority:</span>
                <span>{project.priority}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress:</span>
              <span>{project.progress}%</span>
            </div>
            
            {project.allowedDepartments && project.allowedDepartments.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Access:</span>
                <span className="text-xs">
                  {project.allowedDepartments.length > 3 
                    ? `${project.allowedDepartments.slice(0, 2).join(', ')}...` 
                    : project.allowedDepartments.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-4 overflow-hidden">
            <div 
              className={`h-full ${
                project.progress > 66 ? 'bg-green-500' : 
                project.progress > 33 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
        
        <div className="px-6 py-3 bg-muted/30 border-t flex justify-end">
          <Button 
            variant={hasAccess() ? "outline" : "ghost"} 
            size="sm"
            disabled={!hasAccess()}
          >
            {hasAccess() ? "View Details" : "No Access"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 