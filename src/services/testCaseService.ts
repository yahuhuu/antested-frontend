// Path: src/services/testCaseService.ts
import { mockProjects } from './projectService';
// FIX: Correctly import 'mockTemplates' and 'mockTestStepTemplates' after exporting them from the source module.
import { mockTemplates, mockTestStepTemplates } from './customizationService';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'Draft' | 'In Review' | 'Approved' | 'Need Update' | 'Archived' | 'Ready';

export interface TestCaseHistoryEntry {
  id: string;
  status: string; // Changed from Status for flexibility (e.g., run status vs approval status)
  comment: string;
  assignedToId?: string;
  createdBy: string;
  createdAt: string;
  attachments: File[];
}

export interface TestCase {
  id: string;
  caseId: string;
  name: string;
  priority: Priority;
  status: Status;
  assignee: string;
  lastUpdated: string; // "MM/DD/YYYY"
  projectId: string;
  directory: string;
  templateId: string;
  testStepTemplateId: string;
  steps: any; // Data for dynamic steps based on testStepTemplateId
  customFields: {
    [key: string]: any;
  };
  history?: TestCaseHistoryEntry[];
}

export type NewTestCase = Omit<TestCase, 'id' | 'caseId' | 'lastUpdated' | 'history'>;

interface GetTestCasesParams {
  projectId: string;
  filters: {
    search: string;
    status: string;
    priority: string;
    assignee: string;
  };
  directory: string;
  page: number;
  rowsPerPage: number;
}

// --- Data Generation Helpers ---
const priorities: Priority[] = ['Critical', 'High', 'Medium', 'Low'];
// FIX: Export 'mockTestCases' to make it accessible to other modules that depend on it for data generation and type inference.
export let mockTestCases: TestCase[] = [];
const projectCaseCounters: { [projectId: string]: number } = {};

const generateId = () => `tc-${Math.random().toString(36).substring(2, 10)}`;

const generateCaseId = (projectId: string): string => {
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) {
        // Fallback for safety, though it shouldn't happen with mock data
        return `ERR-${Date.now()}`;
    }

    if (!projectCaseCounters[projectId]) {
        projectCaseCounters[projectId] = 0;
    }

    projectCaseCounters[projectId]++;
    return `${project.key}-${projectCaseCounters[projectId]}`;
};


const generateStepsData = (testStepTemplateId: string, testCaseName: string): any => {
    switch (testStepTemplateId) {
        case 'tst-single':
            return {
                'field-steps': `1. Go to page for "${testCaseName}".\n2. Perform action X.\n3. Verify Y happens.`,
                'field-expected': 'The expected outcome is Z.'
            };
        case 'tst-multi':
            return {
                'repeater-steps': [
                    { id: '1', 'sub-step-desc': 'Navigate to the relevant page.', 'sub-step-expected': 'The page loads correctly.' },
                    { id: '2', 'sub-step-desc': `Interact with the main feature related to "${testCaseName}".`, 'sub-step-expected': 'The feature responds as expected.' },
                ]
            };
        case 'tst-bdd':
            return {
                'field-bdd-scenario': `Given a user is on the page\nWhen they perform an action related to "${testCaseName}"\nThen they should see the correct result.`
            };
        case 'tst-exploratory':
             return {
                'field-mission': `Explore the functionality related to "${testCaseName}".`,
                'field-goals': `- Verify core functionality works.\n- Check for edge cases.\n- Assess usability.`
            };
        default:
            return {};
    }
};


// --- Test Case Generation ---

// Helper to create and push a test case, ensuring a unique and correct caseId
const createAndPushCase = (data: Omit<TestCase, 'id' | 'caseId'>) => {
    const newCase: TestCase = {
        ...data,
        id: generateId(),
        caseId: generateCaseId(data.projectId),
        history: data.history || [],
    };
    mockTestCases.push(newCase);
};


// --- Specific Hand-Crafted Cases ---

// Authentication Cases (Nobi Project - uses multi-step template)
const nobiAuthTemplateId = 'tmpl-multi';
const nobiAuthTestStepTemplateId = 'tst-multi';
createAndPushCase({ name: 'Redirect to Login Page when not authenticated', priority: 'Critical', status: 'Approved', assignee: 'Admin User', lastUpdated: '10/20/2025', projectId: 'proj-nobi', directory: 'authentication', templateId: nobiAuthTemplateId, testStepTemplateId: nobiAuthTestStepTemplateId, steps: generateStepsData(nobiAuthTestStepTemplateId, 'Unauthenticated Redirect'), customFields: {}, history: [] });
createAndPushCase({ name: 'Redirect to Register Page from Login', priority: 'High', status: 'Approved', assignee: 'Admin User', lastUpdated: '10/20/2025', projectId: 'proj-nobi', directory: 'authentication', templateId: nobiAuthTemplateId, testStepTemplateId: nobiAuthTestStepTemplateId, steps: generateStepsData(nobiAuthTestStepTemplateId, 'Login to Register Redirect'), customFields: {}, history: [] });
createAndPushCase({ name: 'Redirect to Forgot Password Page from Login', priority: 'High', status: 'Approved', assignee: 'Admin User', lastUpdated: '10/20/2025', projectId: 'proj-nobi', directory: 'authentication', templateId: nobiAuthTemplateId, testStepTemplateId: nobiAuthTestStepTemplateId, steps: generateStepsData(nobiAuthTestStepTemplateId, 'Forgot Password Redirect'), customFields: {}, history: [] });


// Dashboard Cases (One for each project with correct templates)
createAndPushCase({ 
    name: 'Verify Dashboard Nobi widgets', 
    priority: 'Critical', 
    status: 'Approved', 
    assignee: 'Admin User', 
    lastUpdated: '10/25/2025', 
    projectId: 'proj-nobi', 
    directory: 'dashboard', 
    templateId: 'tmpl-multi', 
    testStepTemplateId: 'tst-multi', 
    steps: {
        'repeater-steps': [
            { id: '1', 'sub-step-desc': '1. Navigate to the dashboard.', 'sub-step-expected': 'The dashboard page loads successfully.' },
            { id: '2', 'sub-step-desc': '2. Check for the "Portfolio Value" widget.', 'sub-step-expected': 'The widget is present and displays a value.' },
            { id: '3', 'sub-step-desc': '3. Verify the "Recent Transactions" widget shows recent activity.', 'sub-step-expected': 'At least one recent transaction is listed.' },
        ]
    }, 
    customFields: { 'cf-is-automated': true, 'cf-preconditions': 'User must be logged in.' },
    history: []
});
createAndPushCase({ name: 'Verify Dashboard Akulaku Finance data accuracy', priority: 'Critical', status: 'Ready', assignee: 'Admin User', lastUpdated: '10/25/2025', projectId: 'proj-akulaku', directory: 'dashboard', templateId: 'tmpl-bdd', testStepTemplateId: 'tst-bdd', steps: {'field-bdd-scenario': 'Given the user is on the dashboard\nWhen the user views the "Account Balance" widget\nThen the balance should match the user\'s actual account balance from the backend.'}, customFields: {}, history: [] });
createAndPushCase({ 
    name: 'Verify Dashboard Traveloka booking summary', 
    priority: 'Critical', 
    status: 'Approved', 
    assignee: 'Admin User', 
    lastUpdated: '10/25/2025', 
    projectId: 'proj-traveloka', 
    directory: 'dashboard', 
    templateId: 'tmpl-single', 
    testStepTemplateId: 'tst-single',
    steps: {
        'field-steps': '1. Log in to the Traveloka account.\n2. Make a flight booking.\n3. Navigate to the main dashboard.',
        'field-expected': 'The dashboard displays a summary card for the recent flight booking.'
    },
    customFields: { 'cf-browser': 'Chrome', 'cf-preconditions': 'User has a valid account with a payment method.' },
    history: []
});
createAndPushCase({ 
    name: 'Verify Dashboard Tokopedia promotional banners', 
    priority: 'High', 
    status: 'Ready', 
    assignee: 'Admin User', 
    lastUpdated: '10/25/2025', 
    projectId: 'proj-tokopedia', 
    directory: 'dashboard', 
    templateId: 'tmpl-exploratory', 
    testStepTemplateId: 'tst-exploratory', 
    steps: {
        'field-mission': 'Explore all promotional banners on the dashboard for visual and functional correctness.',
        'field-goals': '- Ensure all banners are clickable.\n- Verify redirection to the correct promotional page.\n- Check for any visual glitches or overlapping text.'
    }, 
    customFields: {},
    history: []
});


// --- Bulk Generation Loop ---
const directories = [
    { path: 'authentication/login', count: 15 },
    { path: 'authentication/register', count: 10 },
    { path: 'authentication/forgot-password', count: 8 },
    { path: 'dashboard', count: 20 },
];

mockProjects.forEach(project => {
    // Find the default Test Case Template for the project
    const projectCaseTemplate = mockTemplates.find(t => t.id === project.defaultTestCaseTemplateId);
    // Find the default Test Step Template from that Test Case Template
    const testStepTemplateId = projectCaseTemplate?.defaultTestStepTemplateId || 'tst-single'; // Fallback

    directories.forEach(dir => {
        for (let i = 0; i < dir.count; i++) {
             const status = project.enableApprovals
                ? ['Draft', 'In Review', 'Approved', 'Need Update'][i % 4] as Status
                : ['Draft', 'Ready'][i % 2] as Status;
            const priority = priorities[i % priorities.length];
            const name = `${dir.path.split('/').pop()} Test #${i + 1}`;

            createAndPushCase({
                name: name,
                priority: priority,
                status: status,
                assignee: 'Admin User',
                lastUpdated: `11/${1 + (i % 28)}/2025`,
                projectId: project.id,
                directory: dir.path,
                templateId: project.defaultTestCaseTemplateId || 'tmpl-single', // Use project's default
                testStepTemplateId: testStepTemplateId,
                steps: generateStepsData(testStepTemplateId, name), // Generate correct steps data
                customFields: {},
                history: []
            });
        }
    });
});


/**
 * Simulates fetching test cases from an API with filtering and pagination.
 */
export const getTestCases = (
  { projectId, filters, directory, page, rowsPerPage }: GetTestCasesParams
): Promise<{ testCases: TestCase[], totalCount: number }> => {
  console.log(`Fetching test cases for project ${projectId}`, { filters, directory, page, rowsPerPage });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1. Filter by Project ID and exclude already archived items unless Trash is selected
      let results = mockTestCases.filter(tc => 
        tc.projectId === projectId && (filters.status === 'Archived' ? true : tc.status !== 'Archived')
      );
      
      if (filters.status === 'Archived') {
          results = mockTestCases.filter(tc => tc.projectId === projectId && tc.status === 'Archived');
      }


      // 2. Filter by Directory
      if (directory && directory !== 'All') {
        results = results.filter(tc => tc.directory.startsWith(directory));
      }

      // 3. Apply other filters
      results = results.filter(tc => {
        const searchLower = filters.search.toLowerCase();
        const statusFilter = filters.status === 'All' || filters.status === 'Archived' ? true : tc.status === filters.status;
        const priorityFilter = filters.priority === 'All' ? true : tc.priority === filters.priority;
        const assigneeFilter = filters.assignee === 'All' ? true : tc.assignee === filters.assignee;
        const searchFilter = tc.name.toLowerCase().includes(searchLower) || tc.caseId.toLowerCase().includes(searchLower);

        return searchFilter && statusFilter && priorityFilter && assigneeFilter;
      });

      const totalCount = results.length;

      // 4. Apply pagination
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      const paginatedTestCases = results.slice(start, end);

      console.log(`Found ${totalCount} cases, returning page ${page}`);
      resolve({ testCases: paginatedTestCases, totalCount });
    }, 1000); // Simulate network latency
  });
};

/**
 * Retrieves all test cases for a specific project without pagination or filtering.
 * Essential for calculating total counts across all directories.
 */
export const getAllTestCasesForProject = (projectId: string): Promise<TestCase[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = mockTestCases.filter(tc => tc.projectId === projectId);
      resolve(results);
    }, 100); // Shorter delay for a simple filter
  });
};

/**
 * Retrieves all test cases for a specific project excluding drafts, for use in test run selection.
 */
export const getSelectableTestCases = (projectId: string): Promise<TestCase[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = mockTestCases.filter(tc => tc.projectId === projectId && (tc.status === 'Approved' || tc.status === 'Ready'));
      resolve(results);
    }, 100);
  });
};


export const getTestCasesByIds = (ids: string[]): Promise<TestCase[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const idSet = new Set(ids);
            const results = mockTestCases.filter(tc => idSet.has(tc.id));
            resolve(results);
        }, 100);
    });
};


export const getTestCaseById = (id: string): Promise<TestCase | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const testCase = mockTestCases.find(tc => tc.id === id);
            resolve(testCase ? { ...testCase } : undefined);
        }, 300);
    });
};

export const createTestCase = (testCaseData: NewTestCase): Promise<TestCase> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newTestCase: TestCase = {
                ...testCaseData,
                id: generateId(),
                caseId: generateCaseId(testCaseData.projectId),
                lastUpdated: new Date().toLocaleDateString('en-US'),
                history: [],
            };
            mockTestCases.unshift(newTestCase);
            resolve(newTestCase);
        }, 500);
    });
};

export const updateTestCase = (id: string, updates: Partial<NewTestCase>): Promise<TestCase | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let updatedTestCase: TestCase | undefined;
            mockTestCases = mockTestCases.map(tc => {
                if (tc.id === id) {
                    updatedTestCase = { ...tc, ...updates, lastUpdated: new Date().toLocaleDateString('en-US') };
                    return updatedTestCase;
                }
                return tc;
            });
            resolve(updatedTestCase);
        }, 500);
    });
};

/**
 * Simulates moving test cases to trash by changing their status to 'Archived'.
 * @param testCaseIds - An array of test case IDs to "delete".
 * @returns A promise that resolves when the operation is complete.
 */
export const deleteTestCases = (testCaseIds: string[]): Promise<void> => {
    console.log(`Moving test cases to trash:`, testCaseIds);
    return new Promise((resolve) => {
        setTimeout(() => {
            mockTestCases = mockTestCases.map(tc => {
                if (testCaseIds.includes(tc.id)) {
                    return { ...tc, status: 'Archived' };
                }
                return tc;
            });
            console.log('Test cases moved to trash successfully.');
            resolve();
        }, 500);
    });
};

/**
 * Simulates restoring test cases from trash by changing their status to 'Draft'.
 * @param testCaseIds - An array of test case IDs to restore.
 * @returns A promise that resolves when the operation is complete.
 */
export const restoreTestCases = (testCaseIds: string[]): Promise<void> => {
    console.log(`Restoring test cases:`, testCaseIds);
    return new Promise((resolve) => {
        setTimeout(() => {
            mockTestCases = mockTestCases.map(tc => {
                if (testCaseIds.includes(tc.id)) {
                    // Restore to 'Draft' status, a sensible default.
                    return { ...tc, status: 'Draft' };
                }
                return tc;
            });
            console.log('Test cases restored successfully.');
            resolve();
        }, 500);
    });
};


/**
 * Permanently deletes test cases from the mock data store.
 * @param testCaseIds - An array of test case IDs to permanently delete.
 * @returns A promise that resolves when the operation is complete.
 */
export const permanentlyDeleteTestCases = (testCaseIds: string[]): Promise<void> => {
    console.log(`Permanently deleting test cases:`, testCaseIds);
    return new Promise((resolve) => {
        setTimeout(() => {
            const idSet = new Set(testCaseIds);
            mockTestCases = mockTestCases.filter(tc => !idSet.has(tc.id));
            console.log('Test cases permanently deleted.');
            resolve();
        }, 500);
    });
};


/**
 * Duplicates a test case.
 * @param testCaseId The ID of the test case to duplicate.
 * @returns A promise that resolves with the new duplicated test case.
 */
export const duplicateTestCase = (testCaseId: string): Promise<TestCase> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const originalCase = mockTestCases.find(tc => tc.id === testCaseId);
            if (!originalCase) {
                return reject(new Error('Test case not found.'));
            }
            
            // Create a deep copy to avoid reference issues
            const duplicatedCaseData = JSON.parse(JSON.stringify(originalCase));

            const newTestCase: TestCase = {
                ...duplicatedCaseData,
                id: generateId(),
                caseId: generateCaseId(originalCase.projectId),
                name: `${originalCase.name} (Copy)`,
                status: 'Draft',
                lastUpdated: new Date().toLocaleDateString('en-US'),
                history: [],
            };
            
            // Add the new test case to the beginning of the array
            mockTestCases.unshift(newTestCase);
            
            resolve(newTestCase);
        }, 500);
    });
};