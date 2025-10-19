// Path: src/services/roleService.ts
export interface Permission {
    id: string;
    label: string;
}

export interface PermissionGroup {
    id: string;
    name: string;
    permissions: Permission[];
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[]; // Array of permission IDs
    users: number; // Count of users with this role
}

const mockPermissions: PermissionGroup[] = [
    {
        id: 'pg-projects',
        name: 'Projects',
        permissions: [
            { id: 'p-proj-view', label: 'View Projects' },
            { id: 'p-proj-add', label: 'Add/Edit Projects' },
            { id: 'p-proj-delete', label: 'Delete Projects' },
        ]
    },
    {
        id: 'pg-cases',
        name: 'Test Cases',
        permissions: [
            { id: 'p-case-view', label: 'View Test Cases' },
            { id: 'p-case-add', label: 'Add/Edit Test Cases' },
            { id: 'p-case-delete', label: 'Delete Test Cases' },
        ]
    },
    {
        id: 'pg-runs',
        name: 'Test Runs',
        permissions: [
            { id: 'p-run-view', label: 'View Test Runs' },
            { id: 'p-run-start', label: 'Start/Stop Test Runs' },
            { id: 'p-run-add-result', label: 'Add Test Results' },
        ]
    },
    {
        id: 'pg-admin',
        name: 'Administration',
        permissions: [
            { id: 'p-admin-users', label: 'Manage Users & Roles' },
            { id: 'p-admin-settings', label: 'Access Site Settings' },
        ]
    }
];

const mockRoles: Role[] = [
    { id: 'role-1', name: 'Lead', description: 'Full access to projects and can manage test suites.', permissions: ['p-proj-view', 'p-proj-add', 'p-case-view', 'p-case-add', 'p-case-delete', 'p-run-view', 'p-run-start', 'p-run-add-result'], users: 1 },
    { id: 'role-2', name: 'Tester', description: 'Can execute test runs and add results.', permissions: ['p-proj-view', 'p-case-view', 'p-run-view', 'p-run-add-result'], users: 2 },
    { id: 'role-3', name: 'Developer', description: 'Can view projects and test cases.', permissions: ['p-proj-view', 'p-case-view'], users: 1 },
    { id: 'role-4', name: 'Guest', description: 'Read-only access to projects.', permissions: ['p-proj-view'], users: 0 },
];

const simulateDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 200));
};

export const getRoles = (): Promise<Role[]> => {
    return simulateDelay([...mockRoles]);
};

export const getPermissions = (): Promise<PermissionGroup[]> => {
    return simulateDelay([...mockPermissions]);
};
