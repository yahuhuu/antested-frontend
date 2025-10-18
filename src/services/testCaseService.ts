// Path: services/testCaseService.ts
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'Draft' | 'In Review' | 'Approved' | 'Need Update' | 'Archived';

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
}

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

// Larger, more realistic mock data
let mockTestCases: TestCase[] = [
    { id: 'tc-22C99939', caseId: 'TC-22C99939', name: 'Verify successful login with valid credentials', priority: 'Critical', status: 'Approved', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001', directory: 'authentication' },
    { id: 'tc-3936E24A', caseId: 'TC-3936E24A', name: 'Verify login failure with empty password field', priority: 'High', status: 'Approved', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001', directory: 'authentication' },
    { id: 'tc-39404DC2', caseId: 'TC-39404DC2', name: 'Verify login failure with invalid username', priority: 'High', status: 'In Review', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001', directory: 'authentication' },
    { id: 'tc-4768259F', caseId: 'TC-4768259F', name: 'Verify login failure with a disabled/inactive account', priority: 'Medium', status: 'Draft', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001', directory: 'authentication' },
    { id: 'tc-4D4AD433', caseId: 'TC-4D4AD433', name: 'Verify account lockout mechanism after multiple failures', priority: 'Critical', status: 'Approved', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001', directory: 'authentication/security' },
    { id: 'tc-5553F5D6', caseId: 'TC-5553F5D6', name: 'Login with Invalid Password', priority: 'High', status: 'Approved', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001', directory: 'authentication' },
    { id: 'tc-arch-001', caseId: 'TC-ARCH-001', name: 'Legacy login verification (deprecated)', priority: 'Low', status: 'Archived', assignee: 'Admin User', lastUpdated: '01/05/2024', projectId: 'proj-001', directory: 'legacy' },
    
    ...Array.from({ length: 25 }, (_, i) => {
        const statuses: Status[] = ['Draft', 'In Review', 'Approved', 'Need Update'];
        const priorities: Priority[] = ['High', 'Medium', 'Low', 'Critical'];
        return {
            id: `tc-auth-00${i + 1}`,
            caseId: `TC-AUTH-00${i + 1}`,
            name: `User Authentication Test Case #${i + 1}`,
            priority: priorities[i % 4],
            status: statuses[i % 4],
            assignee: 'Admin User',
            lastUpdated: `10/${10 + (i % 15)}/2025`,
            projectId: 'proj-001',
            directory: i % 5 === 0 ? 'authentication/sso' : 'authentication',
        };
    }),
    ...Array.from({ length: 15 }, (_, i) => ({
        id: `tc-mbank-00${i + 1}`,
        caseId: `TC-MBANK-00${i + 1}`,
        name: `Mobile Banking Feature Test #${i + 1}`,
        priority: (['High', 'Medium', 'Low'] as Priority[])[i % 3],
        status: (['Draft', 'Approved', 'Archived'] as Status[])[i % 3],
        assignee: 'Admin User',
        lastUpdated: `10/${10 + (i % 15)}/2025`,
        projectId: 'proj-002',
        directory: 'transfers',
    }))
];

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