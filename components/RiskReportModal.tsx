'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, ExternalLink, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { projects } from '@/app/data/mockData';
import { validateSupabaseConnection } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { debugSupabaseAuth } from '../lib/supabase-debug';
import { getAuthenticatedClient } from '../lib/auth-bridge';

interface RiskReportModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function RiskReportModal({ projectId, isOpen, onClose }: RiskReportModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [riskReport, setRiskReport] = useState<null | {
    score: number;
    report: string;
    mitigationMeasures: string[];
    savedToDatabase?: boolean;
  }>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  
  // Redirect non-admin users if they somehow access this component
  useEffect(() => {
    if (isOpen && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access risk reports.",
        variant: "destructive",
      });
      onClose();
    }
  }, [isOpen, isAdmin, onClose, toast]);
  
  // If user is not an admin, don't render the component
  if (!isAdmin) return null;
  
  // API URL for the chatbot
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  useEffect(() => {
    console.log('RiskReportModal: Modal is', isOpen ? 'open' : 'closed', 'for project', projectId);
    
    // Reset state when modal opens
    if (isOpen) {
      setRiskReport(null);
      setGenerationProgress(0);
      setIsGenerating(false);
      
      // Check connection when modal opens
      const checkConnection = async () => {
        try {
          // Check Supabase connection
          const supabaseResult = await validateSupabaseConnection();
          
          // Check API server connection
          const apiResponse = await fetch(`${API_URL}/api/status`, { 
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000) 
          });
          
          setConnectionStatus(
            supabaseResult.connected && apiResponse.ok
              ? `Connected to services` 
              : `Connection issue: ${!supabaseResult.connected ? 'Supabase' : 'API Server'}`
          );
          
          console.log('RiskReportModal: Connection status:', { 
            supabase: supabaseResult, 
            api: apiResponse.ok 
          });
        } catch (error) {
          console.error('RiskReportModal: Connection check error:', error);
          setConnectionStatus(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      
      checkConnection();
    }
  }, [isOpen, projectId, API_URL]);

  const getProjectData = () => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    return project;
  };

  const generateRiskReport = async () => {
    console.log('RiskReportModal: Generating risk report for project', projectId);
    
    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      // Get project data
      const project = getProjectData();
      setGenerationProgress(30);
      
      // Prepare the prompt for the risk assessment
      const prompt = `Generate a comprehensive risk assessment report for the following project:
      
Project Name: ${project.title}
Description: ${project.description}
Status: ${project.status}
Progress: ${project.progress}%
Priority: ${project.priority}
Owner: ${project.owner}
Timeline: ${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}
Budget: $${project.budget.toLocaleString()}
Budget Spent: $${project.spent.toLocaleString()}
Stakeholders: ${project.stakeholders.join(', ')}

Based on this information, please provide:
1. A structured risk assessment report identifying potential risks in the following categories:
   - Schedule risks
   - Budget risks
   - Resource risks
   - Technical risks
   - Stakeholder risks
   - Operational risks

2. For each identified risk:
   - Assign a probability (Low/Medium/High)
   - Assess impact severity (Low/Medium/High)
   - Calculate a risk priority score

3. Recommend specific mitigation measures for each high and medium priority risk

4. Provide an overall project risk score out of 100, where 0 is no risk and 100 is extremely high risk

Format the report in a clear, structured manner with headings and bullet points.`;

      setGenerationProgress(50);
      
      // Make API call to the chatbot
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          assistantType: 'changeManagement',
          stream: false
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      setGenerationProgress(80);
      
      const data = await response.json();
      console.log('RiskReportModal: Received response:', data);
      
      // Extract risk score from the response
      // This regex looks for a number followed by "/100" or "out of 100"
      const scoreRegex = /(\d+)(?:\s*\/\s*100|(?:\s+out\s+of\s+|\s+of\s+)\s*100)/i;
      const scoreMatch = data.response.match(scoreRegex);
      const riskScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 75; // Default to 75 if no score found
      
      // Extract mitigation measures (improved approach)
      // Look for a section with "mitigation" or "recommendations" in the heading
      const mitigationRegex = /(?:^|\n)#+\s*(?:.*?mitigation|.*?recommendations|.*?measures).*?(?=\n#+|$)/i;
      const mitigationSection = (data.response.match(mitigationRegex) || [''])[0];
      
      // If a section was found, extract bullet points, otherwise fallback to simpler approach
      let mitigationMeasures: string[] = [];
      if (mitigationSection && mitigationSection.length > 30) {
        // Extract bullet points with markdown formatting preserved
        mitigationMeasures = mitigationSection
          .split(/\n\s*[-*•]\s+/)
          .slice(1) // Skip the heading
          .filter((line: string) => line.trim().length > 15)
          .map((line: string) => {
            // Ensure the line looks like a proper markdown bullet point
            const trimmed = line.trim();
            // If it doesn't already start with a bullet, add one
            return trimmed.startsWith('-') || trimmed.startsWith('*') ? trimmed : `- ${trimmed}`;
          })
          .slice(0, 5); // Take up to 5 measures
      } else {
        // Fallback to the previous approach
        const fallbackSection = data.response.split(/mitigation|recommendations/i)[1] || '';
        mitigationMeasures = fallbackSection
          .split(/\n\s*[-*•]\s+/)
          .filter((line: string) => line.trim().length > 20)
          .map((line: string) => {
            // Ensure the line looks like a proper markdown bullet point
            const trimmed = line.trim();
            return trimmed.startsWith('-') || trimmed.startsWith('*') ? trimmed : `- ${trimmed}`;
          })
          .slice(0, 5); // Take up to 5 measures
      }
      
      setRiskReport({
        score: riskScore,
        report: data.response,
        mitigationMeasures: mitigationMeasures
      });
      
      toast({
        title: 'Success',
        description: 'Risk report generated successfully',
      });
      
    } catch (error) {
      console.error('RiskReportModal: Error generating risk report:', error);
      toast({
        title: 'Error',
        description: `Failed to generate risk report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  // Function to get color based on risk score
  const getRiskScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-amber-600';
    return 'text-red-600';
  };

  // Function to download the risk report as a markdown file
  const downloadReport = () => {
    if (!riskReport) return;
    
    const project = getProjectData();
    
    // Create formatted content with project info and risk score
    const content = `# Risk Assessment Report: ${project.title}

## Project Information
- **Project Name:** ${project.title}
- **Status:** ${project.status} (${project.progress}% Complete)
- **Risk Score:** ${riskReport.score}/100
- **Priority:** ${project.priority}
- **Owner:** ${project.owner}
- **Timeline:** ${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}
- **Budget:** $${project.budget.toLocaleString()}
- **Budget Spent:** $${project.spent.toLocaleString()}
- **Stakeholders:** ${project.stakeholders.join(', ')}

## Report Generated on ${new Date().toLocaleString()}

${riskReport.report}
`;
    
    // Create a Blob with the content
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `risk-report-${project.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Success',
      description: 'Risk report downloaded successfully',
    });
  };

  // Function to save the risk report to the database
  const saveReportToDatabase = async () => {
    if (!riskReport || riskReport.savedToDatabase) return;
     
    setIsSaving(true);
    
    try {
      // Get the authenticated Supabase client
      const authClient = getAuthenticatedClient();
      
      // Debug auth status before saving
      await debugSupabaseAuth();
      
      const project = getProjectData();
      
      // Prepare the report data
      const reportData = {
        project_id: projectId,
        risk_score: riskReport.score,
        full_report: riskReport.report,
        mitigation_measures: riskReport.mitigationMeasures,
        created_by: user?.email || 'anonymous',
        created_at: new Date().toISOString()
      };
      
      console.log('Saving report data:', reportData);
      
      // Save using the authenticated client
      const { data, error } = await authClient
        .from('project_risk_reports')
        .insert(reportData)
        .select()
        .single();
      
      if (error) {
        console.error('Error saving risk report to database:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      // Update the local state to reflect that the report was saved
      if (riskReport) {
        setRiskReport({
          ...riskReport,
          savedToDatabase: true
        });
      }
      
      toast({
        title: 'Success',
        description: 'Risk report saved to database successfully',
      });
      
      console.log('Risk report saved to database:', data);
      
    } catch (error) {
      console.error('Failed to save risk report:', error);
      toast({
        title: 'Error',
        description: `Failed to save risk report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Risk Assessment</DialogTitle>
          <DialogDescription>
            Generate a comprehensive risk assessment report for this project.
          </DialogDescription>
        </DialogHeader>
        
        {!riskReport ? (
          // Generation screen
          <div className="space-y-6 py-4">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Risk Assessment Tool</h3>
              <p className="text-muted-foreground mb-4">
                Generate a comprehensive risk report based on project data. The report will identify potential risks, 
                recommend mitigation measures, and provide an overall risk score.
              </p>
              
              {connectionStatus && (
                <div className={`text-sm mb-4 ${connectionStatus.includes('error') ? 'text-red-500' : 'text-green-600'}`}>
                  {connectionStatus}
                </div>
              )}
              
              {isGenerating && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating report...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              )}
            </div>
          </div>
        ) : (
          // Report display screen
          <div className="space-y-6 py-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-semibold text-lg">Risk Score</h3>
              <div className={`text-3xl font-bold ${getRiskScoreColor(riskReport.score)}`}>
                {riskReport.score}/100
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Key Mitigation Measures:</h3>
              <ul className="space-y-3">
                {riskReport.mitigationMeasures.map((measure, index) => (
                  <li key={index} className="pl-2 border-l-2 border-green-500">
                    <div className="flex-1 pl-2">
                      <MarkdownRenderer content={measure} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Full Report:</h3>
              <div className="border rounded p-4 bg-slate-50 overflow-y-auto max-h-[400px]">
                <div className="mb-2">
                  <MarkdownRenderer content={riskReport.report} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {!riskReport ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={generateRiskReport} 
                disabled={isGenerating}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isGenerating ? 'Generating...' : 'Generate Risk Report'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="outline"
                onClick={downloadReport}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button
                variant="outline"
                onClick={saveReportToDatabase}
                disabled={isSaving || riskReport.savedToDatabase}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : riskReport.savedToDatabase ? 'Saved' : 'Save to Database'}
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => setRiskReport(null)}
              >
                Generate New Report
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 