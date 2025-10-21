// Path: src/services/milestoneService.ts

export interface MilestoneStats {
    open: number;
    overdue: number;
    completed: number;
}

export interface Milestone {
  id: string;
  name: string;
  projectId: string;
  createdBy: string;
  createdAt: string; // DD-MM-YYYY
  dueDateStart: string; // DD-MM-YYYY
  dueDateEnd: string; // DD-MM-YYYY
  status: 'Open' | 'Overdue' | 'Completed';
  progress: number;
  stats: {
    testPlans: MilestoneStats;
    testRuns: MilestoneStats;
  };
}

const mockMilestones: Milestone[] = [
    // === Project: proj-nobi ===
    {
        id: 'milestone-1', name: 'Alpha Release Candidate', projectId: 'proj-nobi',
        createdBy: 'Admin User', createdAt: '01-07-2024',
        dueDateStart: '15-07-2024', dueDateEnd: '30-07-2024', status: 'Open', progress: 45,
        stats: { testPlans: { open: 5, overdue: 1, completed: 2 }, testRuns: { open: 12, overdue: 3, completed: 8 } }
    },
    {
        id: 'milestone-2', name: 'UI/UX Finalization', projectId: 'proj-nobi',
        createdBy: 'Alice Johnson', createdAt: '10-07-2024',
        dueDateStart: '20-07-2024', dueDateEnd: '05-08-2024', status: 'Open', progress: 20,
        stats: { testPlans: { open: 2, overdue: 0, completed: 0 }, testRuns: { open: 5, overdue: 0, completed: 1 } }
    },
    {
        id: 'milestone-3', name: 'Initial API Integration', projectId: 'proj-nobi',
        createdBy: 'Bob Williams', createdAt: '15-06-2024',
        dueDateStart: '20-06-2024', dueDateEnd: '10-07-2024', status: 'Overdue', progress: 85,
        stats: { testPlans: { open: 0, overdue: 1, completed: 4 }, testRuns: { open: 1, overdue: 2, completed: 15 } }
    },
    {
        id: 'milestone-4', name: 'Q2 Feature Freeze', projectId: 'proj-nobi',
        createdBy: 'Admin User', createdAt: '20-05-2024',
        dueDateStart: '25-05-2024', dueDateEnd: '30-06-2024', status: 'Completed', progress: 100,
        stats: { testPlans: { open: 0, overdue: 0, completed: 8 }, testRuns: { open: 0, overdue: 0, completed: 25 } }
    },
    {
        id: 'milestone-6', name: 'Prototype Delivery', projectId: 'proj-nobi',
        createdBy: 'Alice Johnson', createdAt: '01-04-2024',
        dueDateStart: '05-04-2024', dueDateEnd: '20-04-2024', status: 'Completed', progress: 100,
        stats: { testPlans: { open: 0, overdue: 0, completed: 3 }, testRuns: { open: 0, overdue: 0, completed: 10 } }
    },

    // === Project: proj-akulaku ===
    {
        id: 'milestone-aku-1', name: 'Q3 Lending Feature Launch', projectId: 'proj-akulaku',
        createdBy: 'Admin User', createdAt: '01-07-2024',
        dueDateStart: '10-07-2024', dueDateEnd: '30-09-2024', status: 'Open', progress: 15,
        stats: { testPlans: { open: 4, overdue: 0, completed: 1 }, testRuns: { open: 10, overdue: 0, completed: 2 } }
    },
    {
        id: 'milestone-aku-2', name: 'Risk Engine Update', projectId: 'proj-akulaku',
        createdBy: 'Charlie Brown', createdAt: '05-06-2024',
        dueDateStart: '10-06-2024', dueDateEnd: '05-07-2024', status: 'Overdue', progress: 90,
        stats: { testPlans: { open: 0, overdue: 1, completed: 2 }, testRuns: { open: 2, overdue: 3, completed: 20 } }
    },
    {
        id: 'milestone-aku-3', name: 'Mobile App v3.2 Release', projectId: 'proj-akulaku',
        createdBy: 'Alice Johnson', createdAt: '15-04-2024',
        dueDateStart: '20-04-2024', dueDateEnd: '30-05-2024', status: 'Completed', progress: 100,
        stats: { testPlans: { open: 0, overdue: 0, completed: 6 }, testRuns: { open: 0, overdue: 0, completed: 40 } }
    },

    // === Project: proj-traveloka ===
    {
        id: 'milestone-tvl-1', name: 'Holiday Season Promo Readiness', projectId: 'proj-traveloka',
        createdBy: 'Admin User', createdAt: '15-07-2024',
        dueDateStart: '20-07-2024', dueDateEnd: '20-08-2024', status: 'Open', progress: 30,
        stats: { testPlans: { open: 3, overdue: 0, completed: 0 }, testRuns: { open: 8, overdue: 0, completed: 2 } }
    },
    {
        id: 'milestone-tvl-2', name: 'Flight Booking Engine Revamp', projectId: 'proj-traveloka',
        createdBy: 'Bob Williams', createdAt: '01-03-2024',
        dueDateStart: '10-03-2024', dueDateEnd: '30-06-2024', status: 'Completed', progress: 100,
        stats: { testPlans: { open: 0, overdue: 0, completed: 12 }, testRuns: { open: 0, overdue: 0, completed: 50 } }
    },
    
    // === Project: proj-tokopedia ===
    {
        id: 'milestone-tkp-1', name: 'TokoPoints Integration Phase 2', projectId: 'proj-tokopedia',
        createdBy: 'Alice Johnson', createdAt: '10-07-2024',
        dueDateStart: '15-07-2024', dueDateEnd: '15-08-2024', status: 'Open', progress: 25,
        stats: { testPlans: { open: 2, overdue: 0, completed: 1 }, testRuns: { open: 6, overdue: 0, completed: 4 } }
    },
    {
        id: 'milestone-tkp-2', name: 'Seller Dashboard Redesign', projectId: 'proj-tokopedia',
        createdBy: 'Admin User', createdAt: '01-02-2024',
        dueDateStart: '05-02-2024', dueDateEnd: '28-04-2024', status: 'Completed', progress: 100,
        stats: { testPlans: { open: 0, overdue: 0, completed: 15 }, testRuns: { open: 0, overdue: 0, completed: 80 } }
    }
];


const simulateDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 700));
};

export const getMilestones = (projectId: string): Promise<Milestone[]> => {
    // In a real app, you would filter by projectId
    return simulateDelay(mockMilestones.filter(m => m.projectId === projectId));
};