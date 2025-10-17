// Path: services/testCaseService.ts
export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Draft' | 'Active' | 'Obsolete';

export interface TestCase {
  id: string;
  caseId: string;
  name: string;
  priority: Priority;
  status: Status;
  assignee: string;
  lastUpdated: string; // "MM/DD/YYYY"
  projectId: string;
}

interface GetTestCasesParams {
  projectId: string;
  filters: {
    search: string;
    status: string;
    priority: string;
    assignee: string;
  };
  page: number;
  rowsPerPage: number;
}

// Larger, more realistic mock data
const mockTestCases: TestCase[] = [
    { id: 'tc-105DA268', caseId: 'TC-105DA268', name: 'Verify password field masking', priority: 'Low', status: 'Draft', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001' },
    { id: 'tc-22C99939', caseId: 'TC-22C99939', name: 'Verify successful login with valid credentials', priority: 'High', status: 'Draft', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001' },
    { id: 'tc-3936E24A', caseId: 'TC-3936E24A', name: 'Verify login failure with empty password field', priority: 'Medium', status: 'Draft', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001' },
    { id: 'tc-39404DC2', caseId: 'TC-39404DC2', name: 'Verify login failure with invalid username', priority: 'High', status: 'Draft', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001' },
    { id: 'tc-3D73D707', caseId: 'TC-3D73D707', name: 'User Login Success', priority: 'High', status: 'Draft', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001' },
    { id: 'tc-47222D78', caseId: 'TC-47222D78', name: 'User Login with Case-Sensitive Username/Email', priority: 'Medium', status: 'Draft', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001' },
    { id: 'tc-4768259F', caseId: 'TC-4768259F', name: 'Verify login failure with a disabled/inactive account', priority: 'High', status: 'Draft', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001' },
    { id: 'tc-4D4AD433', caseId: 'TC-4D4AD433', name: 'Verify account lockout mechanism after multiple fa...', priority: 'High', status: 'Draft', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001' },
    { id: 'tc-5553F5D6', caseId: 'TC-5553F5D6', name: 'Login with Invalid Password', priority: 'High', status: 'Draft', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001' },
    { id: 'tc-568FF937', caseId: 'TC-568FF937', name: 'Login with SQL Injection Attempt in Username', priority: 'High', status: 'Draft', assignee: 'Admin User', lastUpdated: '10/18/2025', projectId: 'proj-001' },
    // Add more data for pagination and filtering
    ...Array.from({ length: 25 }, (_, i) => ({
        id: `tc-auth-00${i + 1}`,
        caseId: `TC-AUTH-00${i + 1}`,
        name: `User Authentication Test Case #${i + 1}`,
        priority: (['High', 'Medium', 'Low'] as Priority[])[i % 3],
        status: (['Draft', 'Active'] as Status[])[i % 2],
        assignee: 'Admin User',
        lastUpdated: `10/${10 + (i % 15)}/2025`,
        projectId: 'proj-001',
    })),
    // Data for another project
    ...Array.from({ length: 15 }, (_, i) => ({
        id: `tc-mbank-00${i + 1}`,
        caseId: `TC-MBANK-00${i + 1}`,
        name: `Mobile Banking Feature Test #${i + 1}`,
        priority: (['High', 'Medium', 'Low'] as Priority[])[i % 3],
        status: (['Draft', 'Active', 'Obsolete'] as Status[])[i % 3],
        assignee: 'Admin User',
        lastUpdated: `10/${10 + (i % 15)}/2025`,
        projectId: 'proj-002',
    }))
];

/**
 * Simulates fetching test cases from an API with filtering and pagination.
 */
export const getTestCases = (
  { projectId, filters, page, rowsPerPage }: GetTestCasesParams
): Promise<{ testCases: TestCase[], totalCount: number }> => {
  console.log(`Fetching test cases for project ${projectId}`, { filters, page, rowsPerPage });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1. Filter by Project ID
      const projectTestCases = mockTestCases.filter(tc => tc.projectId === projectId);

      // 2. Apply filters
      const filtered = projectTestCases.filter(tc => {
        const searchLower = filters.search.toLowerCase();
        return (
          (tc.name.toLowerCase().includes(searchLower) || tc.caseId.toLowerCase().includes(searchLower)) &&
          (filters.status === 'All' || tc.status === filters.status) &&
          (filters.priority === 'All' || tc.priority === filters.priority) &&
          (filters.assignee === 'All' || tc.assignee === filters.assignee)
        );
      });

      const totalCount = filtered.length;

      // 3. Apply pagination
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      const paginatedTestCases = filtered.slice(start, end);

      console.log(`Found ${totalCount} cases, returning page ${page}`);
      resolve({ testCases: paginatedTestCases, totalCount });
    }, 1000); // Simulate network latency
  });
};
