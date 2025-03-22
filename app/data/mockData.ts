import { Department } from '@/lib/AuthContext';

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