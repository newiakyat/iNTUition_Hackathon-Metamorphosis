'use client';

import { useState, useEffect } from 'react';
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
  const [canAccess, setCanAccess] = useState(false);
  
  // Update access whenever user's department or admin status changes
  useEffect(() => {
    setCanAccess(checkAccess());
  }, [user, isAdmin, user?.department, project.allowedDepartments]);

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

  // Function to get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Check if user has access to this project
  const checkAccess = () => {
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
    if (canAccess) {
      router.push(`/project/${project.id}`);
    }
  };
  
  // Create human-readable department names for display
  const getDepartmentNames = (departments: Department[]) => {
    if (!departments || departments.length === 0) return "All departments";
    
    const departmentMap: Record<Department, string> = {
      'engineering': 'Engineering',
      'marketing': 'Marketing',
      'finance': 'Finance',
      'hr': 'HR',
      'sales': 'Sales',
      'operations': 'Operations'
    };
    
    const names = departments.map(dept => departmentMap[dept] || dept);
    return names.length > 3 
      ? `${names.slice(0, 2).join(', ')}...` 
      : names.join(', ');
  };

  return (
    <Card 
      className={`overflow-hidden transition-shadow cursor-pointer ${
        canAccess ? 'hover:shadow-md' : 'opacity-75 hover:cursor-not-allowed'
      }`} 
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
              {!canAccess && <Lock className="h-4 w-4 text-muted-foreground" />}
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
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-1.5 ${getPriorityColor(project.priority)}`}></div>
                  <span>{project.priority}</span>
                </div>
              </div>
            )}
            
            {project.allowedDepartments && project.allowedDepartments.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Access:</span>
                <span className="text-xs">
                  {getDepartmentNames(project.allowedDepartments)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress:</span>
              <span>{project.progress}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white rounded-full h-2 mt-4 overflow-hidden border border-black">
            <div 
              className="h-full bg-purple-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
        
        <div className="px-6 py-3 bg-muted/30 border-t flex justify-end">
          <Button 
            variant={canAccess ? "outline" : "ghost"} 
            size="sm"
            disabled={!canAccess}
          >
            {canAccess ? "View Details" : "No Access"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 