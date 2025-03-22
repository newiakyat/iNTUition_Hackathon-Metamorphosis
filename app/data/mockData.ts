import { Department } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

export let projects = [
  {
    id: 1,
    title: "Cloud Migration Project",
    description: "Migrate all on-premise infrastructure to AWS cloud platform",
    status: "In Progress",
    priority: "High",
    owner: "John Doe",
    startDate: "2024-03-01",
    endDate: "2024-06-30",
    progress: 65,
    risk: "Medium",
    budget: 175000,
    spent: 112000,
    stakeholders: ["IT Department", "Finance", "Operations"],
    allowedDepartments: ["IT", "ENGINEERING"] as Department[],
    kpis: [
      {
        title: "Data Migration Completion",
        value: 75,
        trend: "up",
        color: "bg-blue-500",
      },
      {
        title: "System Downtime",
        value: 12,
        trend: "down",
        color: "bg-green-500",
      },
      {
        title: "Cost Efficiency",
        value: 85,
        trend: "up",
        color: "bg-purple-500",
      }
    ],
    phases: [
      {
        id: 101,
        title: "Planning and Assessment",
        description: "Analyze current infrastructure and plan migration strategy",
        status: "Completed",
        progress: 100,
        startDate: "2024-03-01",
        endDate: "2024-03-30",
      },
      {
        id: 102,
        title: "Data Migration",
        description: "Transfer existing data to cloud storage solutions",
        status: "In Progress",
        progress: 75,
        startDate: "2024-04-01",
        endDate: "2024-05-15",
      },
      {
        id: 103,
        title: "Application Migration",
        description: "Transfer applications and services to cloud infrastructure",
        status: "In Progress",
        progress: 45,
        startDate: "2024-04-15",
        endDate: "2024-06-15",
      },
      {
        id: 104,
        title: "Testing and Optimization",
        description: "Ensure all systems are functioning and optimize performance",
        status: "Not Started",
        progress: 0,
        startDate: "2024-06-01",
        endDate: "2024-06-30",
      }
    ]
  },
  {
    id: 2,
    title: "ERP System Implementation",
    description: "Deploy enterprise resource planning system across the organization",
    status: "Planning",
    priority: "Critical",
    owner: "Jane Smith",
    startDate: "2024-04-15",
    endDate: "2024-12-31",
    progress: 25,
    risk: "High",
    budget: 350000,
    spent: 87500,
    stakeholders: ["HR", "Finance", "Supply Chain", "Executive Team"],
    allowedDepartments: ["HR", "SUPPLY"] as Department[],
    kpis: [
      {
        title: "Requirement Completion",
        value: 92,
        trend: "up",
        color: "bg-green-500",
      },
      {
        title: "Stakeholder Approval",
        value: 78,
        trend: "up",
        color: "bg-blue-500",
      },
      {
        title: "Vendor Evaluation",
        value: 65,
        trend: "up",
        color: "bg-yellow-500",
      }
    ],
    phases: [
      {
        id: 201,
        title: "Requirements Gathering",
        description: "Collect business requirements from all departments",
        status: "Completed",
        progress: 100,
        startDate: "2024-04-15",
        endDate: "2024-05-30",
      },
      {
        id: 202,
        title: "Vendor Selection",
        description: "Evaluate and select ERP vendor",
        status: "In Progress",
        progress: 80,
        startDate: "2024-05-15",
        endDate: "2024-06-30",
      },
      {
        id: 203,
        title: "Implementation",
        description: "Deploy and configure ERP system",
        status: "Not Started",
        progress: 0,
        startDate: "2024-07-01",
        endDate: "2024-11-30",
      },
      {
        id: 204,
        title: "Training and Rollout",
        description: "Train employees and roll out to all departments",
        status: "Not Started",
        progress: 0,
        startDate: "2024-11-01",
        endDate: "2024-12-31",
      }
    ]
  },
  {
    id: 3,
    title: "Digital Marketing Transformation",
    description: "Implement new digital marketing strategies and tools",
    status: "In Progress",
    priority: "Medium",
    owner: "Alex Johnson",
    startDate: "2024-02-15",
    endDate: "2024-09-30",
    progress: 50,
    risk: "Low",
    budget: 125000,
    spent: 62500,
    stakeholders: ["Marketing", "Sales", "IT"],
    allowedDepartments: ["MARKETING", "SALES"] as Department[],
    kpis: [
      {
        title: "Campaign Engagement",
        value: 87,
        trend: "up",
        color: "bg-green-500",
      },
      {
        title: "Tool Adoption",
        value: 58,
        trend: "up",
        color: "bg-blue-500",
      },
      {
        title: "ROI",
        value: 32,
        trend: "down",
        color: "bg-red-500",
      }
    ],
    phases: [
      {
        id: 301,
        title: "Strategy Development",
        description: "Define digital marketing strategy and goals",
        status: "Completed",
        progress: 100,
        startDate: "2024-02-15",
        endDate: "2024-03-15",
      },
      {
        id: 302,
        title: "Tool Selection",
        description: "Evaluate and select marketing automation tools",
        status: "Completed",
        progress: 100,
        startDate: "2024-03-16",
        endDate: "2024-04-30",
      },
      {
        id: 303,
        title: "Implementation",
        description: "Configure and implement selected tools",
        status: "In Progress",
        progress: 60,
        startDate: "2024-05-01",
        endDate: "2024-07-31",
      },
      {
        id: 304,
        title: "Campaign Development",
        description: "Develop and launch digital campaigns",
        status: "Not Started",
        progress: 0,
        startDate: "2024-08-01",
        endDate: "2024-09-30",
      }
    ]
  },
  {
    id: 4,
    title: "R&D Project: Next-Gen Product Line",
    description: "Research and develop the next generation of products",
    status: "In Progress",
    priority: "High",
    owner: "David Chen",
    startDate: "2024-01-15",
    endDate: "2024-10-31",
    progress: 35,
    risk: "Medium",
    budget: 450000,
    spent: 158000,
    stakeholders: ["R&D", "Engineering", "Manufacturing"],
    allowedDepartments: ["RD", "ENGINEERING", "MANUFACTURING"] as Department[],
    kpis: [
      {
        title: "Research Milestones",
        value: 45,
        trend: "up",
        color: "bg-blue-500",
      },
      {
        title: "Prototype Success Rate",
        value: 68,
        trend: "up",
        color: "bg-green-500",
      }
    ],
    phases: [
      {
        id: 401,
        title: "Research",
        description: "Conduct market research and technical feasibility studies",
        status: "Completed",
        progress: 100,
        startDate: "2024-01-15",
        endDate: "2024-03-31",
      },
      {
        id: 402,
        title: "Concept Development",
        description: "Create initial product concepts and specifications",
        status: "In Progress",
        progress: 70,
        startDate: "2024-04-01",
        endDate: "2024-06-30",
      },
      {
        id: 403,
        title: "Prototyping",
        description: "Build and test functional prototypes",
        status: "Not Started",
        progress: 0,
        startDate: "2024-07-01",
        endDate: "2024-09-30",
      }
    ]
  }
];

export const kpis = [
  {
    title: "Change Implementation",
    value: 78,
    trend: "up",
    color: "bg-green-500",
  },
  {
    title: "Stakeholder Engagement",
    value: 92,
    trend: "up",
    color: "bg-blue-500",
  },
  {
    title: "Risk Assessment",
    value: 45,
    trend: "down",
    color: "bg-red-500",
  },
  {
    title: "Budget Utilization",
    value: 82,
    trend: "up",
    color: "bg-purple-500",
  },
];

export const addProject = (project: any) => {
  const newProject = {
    ...project,
    id: projects.length + 1,
    allowedDepartments: project.allowedDepartments || []
  };
  
  projects = [...projects, newProject];
  
  return projects;
};

// Project announcements data
// This is now kept for backward compatibility and initial data loading
let projectAnnouncements: any[] = [
  {
    id: '1',
    project_id: 1,
    title: 'Cloud Migration Kickoff',
    content: 'We are officially starting the cloud migration project next week. All stakeholders please prepare for the kickoff meeting.',
    created_by: 'Admin',
    created_at: '2024-05-10T10:00:00Z',
  },
  {
    id: '2',
    project_id: 2,
    title: 'ERP Implementation Update',
    content: 'The vendor selection phase is almost complete. We will be announcing the chosen vendor next month.',
    created_by: 'Admin',
    created_at: '2024-05-12T14:30:00Z',
  }
];

// Function to get announcements for a specific project
export const getProjectAnnouncements = async (projectId: number) => {
  console.log('mockData: getProjectAnnouncements called for project', projectId);
  
  try {
    // Log Supabase URL and key availability (without exposing actual values)
    console.log('Supabase URL available:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Anon Key available:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    console.log('Attempting to fetch announcements from Supabase...');
    // Get announcements from Supabase
    const { data, error } = await supabase
      .from('project_announcements')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching announcements from Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Fallback to mock data if Supabase fails
      console.log('Falling back to mock data');
      const filteredAnnouncements = projectAnnouncements.filter(announcement => 
        announcement.project_id === projectId
      );
      console.log('Returning filtered mock announcements:', filteredAnnouncements);
      return filteredAnnouncements;
    }
    
    console.log('Supabase returned announcements:', data);
    
    // Check if we have data in Supabase but also have mock data for the same project
    // Combine them to ensure no announcements are lost during migration
    if (data && data.length > 0) {
      return data;
    } else {
      // If no data in Supabase, check if we have mock data for this project
      const filteredMockAnnouncements = projectAnnouncements.filter(announcement => 
        announcement.project_id === projectId
      );
      
      if (filteredMockAnnouncements.length > 0) {
        console.log('No data in Supabase, returning mock announcements:', filteredMockAnnouncements);
        return filteredMockAnnouncements;
      }
      
      return [];
    }
  } catch (error) {
    console.error('Exception when fetching announcements:', error);
    // Fallback to mock data
    const filteredAnnouncements = projectAnnouncements.filter(announcement => 
      announcement.project_id === projectId
    );
    console.log('Error occurred, returning filtered mock announcements:', filteredAnnouncements);
    return filteredAnnouncements;
  }
};

// Function to add a new announcement
export const addProjectAnnouncement = async (announcement: any) => {
  console.log('mockData: addProjectAnnouncement called with', announcement);
  
  try {
    // Log Supabase URL and key availability (without exposing actual values)
    console.log('Supabase URL available:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Anon Key available:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Add announcement to Supabase
    console.log('Attempting to insert announcement into Supabase...');
    const { data, error } = await supabase
      .from('project_announcements')
      .insert({
        project_id: announcement.project_id,
        title: announcement.title,
        content: announcement.content,
        created_by: announcement.created_by,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding announcement to Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Add to local mock data as fallback
      console.log('Falling back to mock data');
      const newAnnouncement = {
        id: Date.now().toString(),
        ...announcement
      };
      projectAnnouncements = [newAnnouncement, ...projectAnnouncements];
      return newAnnouncement;
    }
    
    console.log('Announcement successfully added to Supabase:', data);
    
    // Also add to local mock data for immediate availability
    projectAnnouncements = [data, ...projectAnnouncements];
    return data;
  } catch (error) {
    console.error('Exception when adding announcement:', error);
    
    // Fallback to mock data
    const newAnnouncement = {
      id: Date.now().toString(),
      ...announcement
    };
    projectAnnouncements = [newAnnouncement, ...projectAnnouncements];
    return newAnnouncement;
  }
}; 