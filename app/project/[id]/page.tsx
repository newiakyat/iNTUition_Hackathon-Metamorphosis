"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Flag, AlertTriangle, DollarSign, Users, TrendingUp, TrendingDown, Megaphone, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { projects } from "@/app/data/mockData";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/AuthContext";
import { Sidebar } from '@/components/sidebar';
import FeedbackForm from '@/components/FeedbackForm';
import FeedbackHistory from '@/components/FeedbackHistory';
import { AnnouncementModal } from '@/components/AnnouncementModal';
import ProjectAnnouncements from '@/components/ProjectAnnouncements';
import { RiskReportModal } from '@/components/RiskReportModal';
import SavedRiskReports from '@/components/SavedRiskReports';

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isRiskReportModalOpen, setIsRiskReportModalOpen] = useState(false);
  const [announcementRefreshKey, setAnnouncementRefreshKey] = useState(0);
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  
  // Parse the project ID once and store it
  const projectId = parseInt(params.id);
  
  useEffect(() => {
    console.log('ProjectDetail: Loading project with ID:', projectId);
    
    const foundProject = projects.find(p => p.id === projectId);
    
    if (foundProject) {
      setProject(foundProject);
    }
    setLoading(false);
  }, [projectId]);

  const getPriorityColor = (priority: string) => {
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

  // Handle closing the announcement modal
  const handleCloseAnnouncementModal = () => {
    setIsAnnouncementModalOpen(false);
    // Trigger a refresh of the announcements
    setAnnouncementRefreshKey(prev => prev + 1);
  };

  // Handle closing the risk report modal
  const handleCloseRiskReportModal = () => {
    setIsRiskReportModalOpen(false);
  };

  // Function to handle opening the risk report modal
  const handleOpenRiskReportModal = () => {
    if (!isAdmin) {
      return; // Early return if not admin
    }
    setIsRiskReportModalOpen(true);
  };

  if (loading) {
    return <div className="p-8 flex justify-center">Loading...</div>;
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-y-auto bg-background p-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold">Project not found</h2>
              <p className="mt-2 text-muted-foreground">The project you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto bg-background p-6">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            
            <div className="flex space-x-2">
              {isAdmin && (
                <>
                  <Button
                    onClick={() => setIsAnnouncementModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Megaphone className="mr-2 h-4 w-4" />
                    Announcement
                  </Button>
                  
                  <Button
                    onClick={handleOpenRiskReportModal}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <FileWarning className="mr-2 h-4 w-4" />
                    Generate Risk Report
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <p className="text-muted-foreground mt-1">{project.description}</p>
              </div>
              <Badge 
                variant={
                  project.status === "Completed" 
                    ? "default" 
                    : project.status === "In Progress" 
                      ? "secondary" 
                      : "destructive"
                }
                className="text-sm px-3 py-1"
              >
                {project.status}
              </Badge>
            </div>
          </div>

          {/* Project Announcements Section */}
          <ProjectAnnouncements 
            projectId={projectId} 
            key={`announcements-${projectId}-${announcementRefreshKey}`} 
          />
          
          {/* Saved Risk Reports Section - Only visible to admins */}
          {isAdmin && <SavedRiskReports projectId={projectId} />}

          {/* Project KPIs - Only visible to admins */}
          {isAdmin && project.kpis && project.kpis.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Project KPIs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {project.kpis.map((kpi: { title: string; trend: string; value: number; color: string }, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-sm text-muted-foreground">
                        {kpi.title}
                      </h3>
                      {kpi.trend === "up" ? (
                        <TrendingUp className="text-green-500 h-4 w-4" />
                      ) : (
                        <TrendingDown className="text-red-500 h-4 w-4" />
                      )}
                    </div>
                    <div className="text-2xl font-bold mb-2">{kpi.value}%</div>
                    <Progress 
                      value={kpi.value} 
                      className="bg-white [&>div]:bg-purple-500 border border-black"
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-4 col-span-2">
              <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Owner</p>
                    <p className="font-medium">{project.owner}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-medium">
                      {new Date(project.startDate).toLocaleDateString('en-GB')} - {new Date(project.endDate).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Flag className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getPriorityColor(project.priority)}`}></div>
                      <p className="font-medium">{project.priority}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">${project.budget.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stakeholders</p>
                    <p className="font-medium">{project.stakeholders.join(", ")}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="font-medium">{project.progress}%</p>
                </div>
                <Progress 
                  value={project.progress} 
                  className="bg-white [&>div]:bg-purple-500 border border-black"
                />
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-muted-foreground">Budget Utilization</p>
                  <p className="font-medium">{Math.round((project.spent / project.budget) * 100)}%</p>
                </div>
                <Progress 
                  value={(project.spent / project.budget) * 100} 
                  className="bg-white [&>div]:bg-purple-500 border border-black"
                />
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Project Stats</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Start Date</h3>
                  <p className="text-2xl font-bold">{new Date(project.startDate).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">End Date</h3>
                  <p className="text-2xl font-bold">{new Date(project.endDate).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Days Remaining</h3>
                  <p className="text-2xl font-bold">
                    {Math.max(0, Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Budget Spent</h3>
                  <p className="text-2xl font-bold">${project.spent.toLocaleString()} <span className="text-sm text-muted-foreground">of ${project.budget.toLocaleString()}</span></p>
                </div>
              </div>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-4">Project Phases</h2>
          <div className="space-y-4">
            {project.phases.map((phase: any) => (
              <Card key={phase.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{phase.title}</h3>
                    <p className="text-sm text-muted-foreground">{phase.description}</p>
                  </div>
                  <Badge 
                    variant={
                      phase.status === "Completed" 
                        ? "default" 
                        : phase.status === "In Progress" 
                          ? "secondary" 
                          : "destructive"
                    }
                  >
                    {phase.status}
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>Progress</span>
                    <span>{phase.progress}%</span>
                  </div>
                  <Progress 
                    value={phase.progress} 
                    className="bg-white [&>div]:bg-purple-500 border border-black"
                  />
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <span>Timeline: {new Date(phase.startDate).toLocaleDateString('en-GB')} - {new Date(phase.endDate).toLocaleDateString('en-GB')}</span>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Feedback section - Only shown to non-admin users */}
          {!isAdmin && (
            <FeedbackForm projectId={projectId} />
          )}
          
          {/* Feedback history - only visible to admins */}
          {isAdmin && <FeedbackHistory projectId={projectId} />}
        </div>
      </div>

      <AnnouncementModal
        projectId={projectId}
        isOpen={isAnnouncementModalOpen}
        onClose={handleCloseAnnouncementModal}
      />

      {isAdmin && (
        <RiskReportModal
          projectId={projectId}
          isOpen={isRiskReportModalOpen}
          onClose={handleCloseRiskReportModal}
        />
      )}
    </ProtectedRoute>
  );
} 