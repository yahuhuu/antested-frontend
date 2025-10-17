// Path: src/services/dashboardService.ts

// --- Interface Definitions ---
export interface ProjectStats {
  milestones: number;
  testPlans: number;
  testRuns: number;
  testCases: number;
  openBugs: number;
}

export interface TestCaseStatus {
  status: 'Passed' | 'Blocked' | 'Skipped' | 'Failed';
  count: number;
  percentage: number;
  color: string;
}

export interface Milestone {
    id: string;
    name: string;
    dueDate: string;
    progress: number;
}

export interface TestRun {
    id:string;
    name: string;
    status: 'In Progress' | 'Completed';
    passed: number;
    total: number;
}

export interface Activity {
    id: string;
    user: string;
    action: string;
    timestamp: string;
    type: 'history' | 'test_change';
}

export interface TestCaseTrendPoint {
    date: string; // "10/12"
    statuses: {
        passed: number;
        blocked: number;
        skipped: number;
        failed: number;
        automationPassed: number;
        automationFailed: number;
        automationError: number;
    }
}


// --- Mock Data ---

const mockStats: { [projectId: string]: ProjectStats } = {
    'proj-001': { milestones: 5, testPlans: 12, testRuns: 45, testCases: 350, openBugs: 14 },
    'proj-002': { milestones: 3, testPlans: 8, testRuns: 22, testCases: 180, openBugs: 7 },
    'proj-003': { milestones: 8, testPlans: 20, testRuns: 102, testCases: 800, openBugs: 45 },
    'proj-004': { milestones: 2, testPlans: 5, testRuns: 15, testCases: 95, openBugs: 3 },
};

const mockTrendData: TestCaseTrendPoint[] = [
    { date: '10/12', statuses: { passed: 0, blocked: 0, skipped: 0, failed: 0, automationPassed: 0, automationFailed: 0, automationError: 0 }},
    { date: '10/13', statuses: { passed: 0, blocked: 0, skipped: 0, failed: 0, automationPassed: 0, automationFailed: 0, automationError: 0 }},
    { date: '10/14', statuses: { passed: 0, blocked: 0, skipped: 0, failed: 0, automationPassed: 0, automationFailed: 0, automationError: 0 }},
    { date: '10/15', statuses: { passed: 5, blocked: 1, skipped: 1, failed: 2, automationPassed: 0, automationFailed: 0, automationError: 0 }},
    { date: '10/16', statuses: { passed: 21, blocked: 2, skipped: 4, failed: 8, automationPassed: 0, automationFailed: 0, automationError: 0 }},
    { date: '10/17', statuses: { passed: 15, blocked: 1, skipped: 2, failed: 4, automationPassed: 0, automationFailed: 0, automationError: 0 }},
];

const mockMilestones: Milestone[] = [
    { id: 'm-01', name: 'Phase 1: UI/UX Freeze', dueDate: '2024-08-15', progress: 90 },
    { id: 'm-02', name: 'Phase 2: Backend API Completion', dueDate: '2024-09-01', progress: 75 },
    { id: 'm-03', name: 'UAT Deployment', dueDate: '2024-09-20', progress: 30 },
];

const mockTestRuns: TestRun[] = [
    { id: 'tr-01', name: 'Regression Cycle - v1.2.3', status: 'Completed', passed: 18, total: 20 },
    { id: 'tr-02', name: 'Smoke Test - New Auth Feature', status: 'In Progress', passed: 5, total: 8 },
    { id: 'tr-03', name: 'Full Regression - Pre-Release', status: 'Completed', passed: 145, total: 150 },
];

const mockActivities: Activity[] = [
    { id: 'act-1', user: 'Alice Johnson', action: "created a new test plan 'User Authentication'", timestamp: '2 hours ago', type: 'history' },
    { id: 'act-2', user: 'Bob Williams', action: "updated test case 'TC-003: Login with valid credentials'", timestamp: '5 hours ago', type: 'test_change' },
    { id: 'act-3', user: 'Charlie Brown', action: "started test run 'Smoke Test - Build #582'", timestamp: '1 day ago', type: 'history' },
    { id: 'act-4', user: 'Alice Johnson', action: "marked milestone 'UI/UX Freeze' as 90% complete", timestamp: '2 days ago', type: 'history' },
    { id: 'act-5', user: 'David Miller', action: "added a new bug report 'Login button unresponsive on Firefox'", timestamp: '3 days ago', type: 'history' },
    { id: 'act-6', user: 'Bob Williams', action: "obsoleted test case 'TC-013: Login with Google (SSO)'", timestamp: '4 days ago', type: 'test_change' },
];

// --- Service Functions ---

const simulateDelay = <T,>(data: T, delay = 1200): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(data), delay));

export const getProjectStats = (projectId: string): Promise<ProjectStats> => {
    const data = mockStats[projectId] || { milestones: 0, testPlans: 0, testRuns: 0, testCases: 0, openBugs: 0 };
    return simulateDelay(data, 800);
};

export const getTestCaseTrend = (projectId: string): Promise<TestCaseTrendPoint[]> => {
    // In a real app, you would filter by projectId
    return simulateDelay(mockTrendData, 1500);
};

export const getRecentMilestones = (projectId: string): Promise<Milestone[]> => {
    // In a real app, you would filter by projectId
    return simulateDelay(mockMilestones, 1100);
};

export const getRecentTestRuns = (projectId: string): Promise<TestRun[]> => {
    // In a real app, you would filter by projectId
    return simulateDelay(mockTestRuns, 1300);
};

export const getProjectActivity = (projectId: string): Promise<Activity[]> => {
    // In a real app, you would filter by projectId
    return simulateDelay(mockActivities, 1600);
};