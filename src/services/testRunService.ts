// Path: src/services/testRunService.ts
import { mockTestCases, TestCase } from './testCaseService';
import { mockProjects } from './projectService';

export interface StatusCounts {
    passed: number;
    blocked: number;
    untested: number;
    skipped: number;
    failed: number;
    automationPassed: number;
    automationFailed: number;
    automationError: number;
}

interface RunBase {
    id: string;
    name: string;
    projectId: string;
    description: string;
    createdBy: string;
    createdAt: string; // DD-MM-YYYY
    totalTestCases: number;
    dueDateStart: string; // DD-MM-YYYY
    dueDateEnd: string; // DD-MM-YYYY
    status: 'Open' | 'Overdue' | 'Completed';
    statusCounts: StatusCounts;
}

export interface TestPlan extends RunBase {
    milestoneId?: string;
    testRunIds: string[];
}
export interface TestRun extends RunBase {
    milestoneId?: string;
    assigneeId?: string;
    includeAll: boolean;
    testCaseIds: string[];
}

export type NewTestPlan = Omit<TestPlan, 'id' | 'statusCounts' | 'createdBy' | 'createdAt' | 'totalTestCases' | 'status'>;
export type NewTestRun = Omit<TestRun, 'id' | 'statusCounts' | 'createdBy' | 'createdAt' | 'totalTestCases' | 'status'>;


const statusTemplate: StatusCounts = { 
    passed: 0, blocked: 0, untested: 0, skipped: 0, failed: 0, 
    automationPassed: 0, automationFailed: 0, automationError: 0 
};

// --- Helper Functions for Dynamic Mock Data Generation ---

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const generateRealisticStatusCounts = (testCases: TestCase[], status: 'Open' | 'Overdue' | 'Completed'): StatusCounts => {
    const counts: StatusCounts = { ...statusTemplate };
    const total = testCases.length;
    if (total === 0) return counts;

    let totalToDistribute = total;
    let autoCount = 0;
    let manualCount = 0;

    if (status === 'Completed') {
        counts.untested = 0;
        totalToDistribute = total;
        autoCount = Math.floor(totalToDistribute * 0.3); // ~30% automated
        manualCount = totalToDistribute - autoCount;

        // Distribute manual tests for a 'Completed' run (mostly passed)
        counts.passed = Math.floor(manualCount * 0.85);
        counts.failed = Math.floor(manualCount * 0.08);
        counts.skipped = Math.floor(manualCount * 0.04);
        counts.blocked = manualCount - counts.passed - counts.failed - counts.skipped;

        // Distribute automated tests for a 'Completed' run (mostly passed)
        counts.automationPassed = Math.floor(autoCount * 0.9);
        counts.automationFailed = Math.floor(autoCount * 0.07);
        counts.automationError = autoCount - counts.automationPassed - counts.automationFailed;

    } else if (status === 'Overdue') {
        const testedCount = Math.floor(total * (0.4 + Math.random() * 0.4)); // 40-80% tested
        counts.untested = total - testedCount;
        
        autoCount = Math.floor(testedCount * 0.3);
        manualCount = testedCount - autoCount;
        
        // Distribute manual counts
        counts.passed = Math.floor(manualCount * 0.4);
        counts.failed = Math.floor(manualCount * 0.3);
        counts.skipped = Math.floor(manualCount * 0.1);
        counts.blocked = manualCount - counts.passed - counts.failed - counts.skipped;
        
        // Distribute automation counts
        counts.automationPassed = Math.floor(autoCount * 0.5);
        counts.automationFailed = Math.floor(autoCount * 0.3);
        counts.automationError = autoCount - counts.automationPassed - counts.automationFailed;

    } else { // 'Open'
        const testedCount = Math.floor(total * (0.2 + Math.random() * 0.3)); // 20-50% tested
        counts.untested = total - testedCount;
        
        autoCount = Math.floor(testedCount * 0.2);
        manualCount = testedCount - autoCount;
        
        // Distribute manual counts
        counts.passed = Math.floor(manualCount * 0.5);
        counts.failed = Math.floor(manualCount * 0.2);
        counts.skipped = Math.floor(manualCount * 0.15);
        counts.blocked = manualCount - counts.passed - counts.failed - counts.skipped;

        // Distribute automation counts
        counts.automationPassed = Math.floor(autoCount * 0.6);
        counts.automationFailed = Math.floor(autoCount * 0.25);
        counts.automationError = autoCount - counts.automationPassed - counts.automationFailed;
    }

    // Final integrity check to ensure total matches due to Math.floor rounding
    const currentTotal = Object.values(counts).reduce((sum, val) => sum + val, 0);
    const diff = total - currentTotal;
    if (diff !== 0) {
        if (status === 'Completed') {
            counts.passed += diff; // Add remainder to largest group
        } else {
            counts.untested += diff; // Add remainder to untested
        }
    }
    
    return counts;
};


// --- Main Generation Logic ---
const generatedRuns: TestRun[] = [];
const generatedPlans: TestPlan[] = [];

mockProjects.forEach(project => {
    const projectCases = mockTestCases.filter(tc => tc.projectId === project.id && tc.status !== 'Draft' && tc.status !== 'Archived');
    if (projectCases.length === 0) return;

    // Generate Test Runs for this project
    const runStatuses: Array<'Open' | 'Overdue' | 'Completed' | 'Open'> = ['Open', 'Open', 'Overdue', 'Completed'];
    
    for (let i = 0; i < runStatuses.length; i++) {
        const status = runStatuses[i];
        const includeAll = i % 2 === 0;
        const shuffledCases = shuffleArray(projectCases);
        const selectedCases = includeAll ? shuffledCases : shuffledCases.slice(0, Math.max(10, Math.floor(shuffledCases.length * (0.2 + Math.random() * 0.3))));
        
        const totalTestCases = selectedCases.length;
        const statusCounts = generateRealisticStatusCounts(selectedCases, status);

        const newRun: TestRun = {
            id: `run-${project.key.toLowerCase()}-${i + 1}`,
            name: `${project.key} - ${status} Run #${i + 1} (${includeAll ? 'All Cases' : `${selectedCases.length} Cases`})`,
            projectId: project.id,
            description: `This is a generated test run for the ${project.name} project.`,
            assigneeId: `user-${(i % 4) + 1}`,
            createdBy: 'Mock Generator',
            createdAt: `${10 + i}-07-2024`,
            dueDateStart: `${11 + i}-07-2024`,
            dueDateEnd: `${20 + i}-07-2024`,
            status: status,
            includeAll: includeAll,
            testCaseIds: includeAll ? [] : selectedCases.map(tc => tc.id),
            totalTestCases: totalTestCases,
            statusCounts: statusCounts,
        };
        generatedRuns.push(newRun);
    }

    // Generate Test Plans for this project
    const projectRuns = generatedRuns.filter(r => r.projectId === project.id);
    if (projectRuns.length === 0) return;

    const planStatuses: Array<'Open' | 'Overdue' | 'Completed'> = ['Open', 'Overdue', 'Completed'];

    for (let i = 0; i < planStatuses.length; i++) {
        const status = planStatuses[i];
        const runsForPlan = i === 0 ? [projectRuns[0], projectRuns[1]].filter(Boolean) : [projectRuns[i + 1]].filter(Boolean);
        const runIds = runsForPlan.map(r => r.id);

        const aggregatedCounts: StatusCounts = { ...statusTemplate };
        let totalCases = 0;
        runsForPlan.forEach(run => {
            totalCases += run.totalTestCases;
            for(const key in run.statusCounts) {
                aggregatedCounts[key as keyof StatusCounts] += run.statusCounts[key as keyof StatusCounts];
            }
        });

        const newPlan: TestPlan = {
            id: `plan-${project.key.toLowerCase()}-${i + 1}`,
            name: `${project.key} - ${status} Plan #${i + 1}`,
            projectId: project.id,
            description: `This is a generated test plan for the ${project.name} project, linking ${runIds.length} test run(s).`,
            createdBy: 'Mock Generator',
            createdAt: `0${i + 1}-07-2024`,
            dueDateStart: `0${i + 2}-07-2024`,
            dueDateEnd: `1${i + 5}-07-2024`,
            status: status,
            testRunIds: runIds,
            totalTestCases: totalCases,
            statusCounts: aggregatedCounts,
        };
        generatedPlans.push(newPlan);
    }
});


let mockTestPlans: TestPlan[] = generatedPlans;
let mockTestRuns: TestRun[] = generatedRuns;


const simulateDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 500));
};

export const getTestPlans = (projectId: string): Promise<TestPlan[]> => {
    return simulateDelay(mockTestPlans.filter(p => p.projectId === projectId));
};

export const getTestRuns = (projectId: string): Promise<TestRun[]> => {
    return simulateDelay(mockTestRuns.filter(r => r.projectId === projectId));
};

export const getTestRunById = (id: string): Promise<TestRun | undefined> => {
    return simulateDelay(mockTestRuns.find(r => r.id === id));
};

export const createTestPlan = (planData: NewTestPlan): Promise<TestPlan> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newPlan: TestPlan = {
                ...planData,
                id: `plan-${Date.now()}`,
                createdBy: 'Admin User', // Mocked
                createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'), // DD-MM-YYYY
                totalTestCases: 0, // Should be calculated based on runs
                status: 'Open',
                statusCounts: { ...statusTemplate, untested: 0 }
            };
            mockTestPlans.unshift(newPlan);
            resolve(newPlan);
        }, 500);
    });
};

export const updateTestPlan = (id: string, updates: Partial<NewTestPlan>): Promise<TestPlan | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let updatedPlan: TestPlan | undefined;
            mockTestPlans = mockTestPlans.map(p => {
                if (p.id === id) {
                    updatedPlan = { ...p, ...updates };
                    return updatedPlan;
                }
                return p;
            });
            resolve(updatedPlan);
        }, 500);
    });
};

export const createTestRun = (runData: NewTestRun): Promise<TestRun> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newRun: TestRun = {
                ...runData,
                id: `run-${Date.now()}`,
                createdBy: 'Admin User', // Mocked
                createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
                totalTestCases: runData.includeAll ? 999 : runData.testCaseIds.length, // Mock total for 'all'
                status: 'Open',
                statusCounts: { ...statusTemplate, untested: runData.includeAll ? 999 : runData.testCaseIds.length }
            };
            mockTestRuns.unshift(newRun);
            resolve(newRun);
        }, 500);
    });
};

export const updateTestRun = (id: string, updates: Partial<NewTestRun>): Promise<TestRun | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let updatedRun: TestRun | undefined;
            mockTestRuns = mockTestRuns.map(r => {
                if (r.id === id) {
                    const totalTestCases = updates.includeAll ? 999 : (updates.testCaseIds?.length ?? r.testCaseIds.length);
                    updatedRun = { 
                        ...r, 
                        ...updates,
                        totalTestCases, // Recalculate
                    };
                    return updatedRun;
                }
                return r;
            });
            resolve(updatedRun);
        }, 500);
    });
};
