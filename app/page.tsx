"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Search, TrendingUp, TrendingDown, Plus, ChevronRight, ChevronDown, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { projects, kpis, addProject } from "./data/mockData";
import AddProjectModal from "@/app/components/AddProjectModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";
import { Sidebar } from '@/components/sidebar';
import { ProjectCard } from '@/components/ProjectCard';
import { useAuth } from "@/lib/AuthContext";
import { Department } from "@/lib/AuthContext";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projectList, setProjectList] = useState(projects);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  
  // Add logging for debugging
  useEffect(() => {
    console.log("Dashboard auth state:", { user, isAdmin, isLoading });
  }, [user, isAdmin, isLoading]);

  // Filter projects based on access permissions and search query
  const getAccessibleProjects = () => {
    return projectList.filter(project => {
      // Check if user has access to this project
      const hasAccess = isAdmin || 
        !project.allowedDepartments || 
        project.allowedDepartments.length === 0 ||
        (user?.department && project.allowedDepartments.includes(user.department));
      
      // Only include projects the user has access to
      return hasAccess;
    });
  };

  const filteredProjects = getAccessibleProjects().filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProject = (newProject: any) => {
    const updatedProjects = addProject(newProject);
    setProjectList(updatedProjects);
  };

  const toggleExpandProject = (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Project Dashboard</h1>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="w-[250px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => setIsAddModalOpen(true)}>
                New Project
              </Button>
              <UserProfile />
            </div>
          </div>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Active Projects</h2>
              {isAdmin && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Admin view - showing all projects</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No projects found matching your search criteria.
                </div>
              )}
            </div>
          </section>

          {isAddModalOpen && (
            <AddProjectModal
              open={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onAddProject={handleAddProject}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}