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
            { id: 'p-proj-create', label: 'Create' },
            { id: 'p-proj-view', label: 'View' },
            { id: 'p-proj-edit', label: 'Edit' },
            { id: 'p-proj-delete', label: 'Delete' },
        ]
    },
    {
        id: 'pg-plans',
        name: 'Test Plans',
        permissions: [
            { id: 'p-plan-create', label: 'Create' },
            { id: 'p-plan-view', label: 'View' },
            { id: 'p-plan-edit', label: 'Edit' },
            { id: 'p-plan-delete', label: 'Delete' },
        ]
    },
    {
        id: 'pg-cases',
        name: 'Test Cases',
        permissions: [
            { id: 'p-case-create', label: 'Create' },
            { id: 'p-case-view', label: 'View' },
            { id: 'p-case-edit', label: 'Edit' },
            { id: 'p-case-delete', label: 'Delete' },
        ]
    },
    {
        id: 'pg-runs',
        name: 'Test Runs',
        permissions: [
            { id: 'p-run-create', label: 'Create' },
            { id: 'p-run-view', label: 'View' },
            { id: 'p-run-edit', label: 'Edit' },
            { id: 'p-run-delete', label: 'Delete' },
        ]
    },
    {
        id: 'pg-milestones',
        name: 'Milestone',
        permissions: [
            { id: 'p-milestone-create', label: 'Create' },
            { id: 'p-milestone-view', label: 'View' },
            { id: 'p-milestone-edit', label: 'Edit' },
            { id: 'p-milestone-delete', label: 'Delete' },
        ]
    },
    {
        id: 'pg-bugs',
        name: 'Bug',
        permissions: [
            { id: 'p-bug-create', label: 'Create' },
            { id: 'p-bug-view', label: 'View' },
            { id: 'p-bug-edit', label: 'Edit' },
            { id: 'p-bug-delete', label: 'Delete' },
        ]
    },
    {
        id: 'pg-admin',
        name: 'Admin',
        permissions: [
            { id: 'p-admin-manage-projects', label: 'Manage Projects' },
            { id: 'p-admin-manage-users', label: 'Manage Users & Roles' },
            { id: 'p-admin-manage-customizations', label: 'Manage Customizations' },
            { id: 'p-admin-manage-integrations', label: 'Manage Integrations' },
            { id: 'p-admin-manage-data', label: 'Manage Data Management' },
            { id: 'p-admin-manage-site', label: 'Manage Site Settings' },
        ]
    }
];

let mockRoles: Role[] = [
    { 
        id: 'role-1', 
        name: 'Lead', 
        description: 'Full access to projects and can manage test suites.', 
        permissions: [
            'p-proj-create', 'p-proj-view', 'p-proj-edit', 'p-proj-delete',
            'p-plan-create', 'p-plan-view', 'p-plan-edit', 'p-plan-delete',
            'p-case-create', 'p-case-view', 'p-case-edit', 'p-case-delete',
            'p-run-create', 'p-run-view', 'p-run-edit', 'p-run-delete',
            'p-milestone-create', 'p-milestone-view', 'p-milestone-edit', 'p-milestone-delete',
            'p-bug-create', 'p-bug-view', 'p-bug-edit', 'p-bug-delete',
        ], 
        users: 1 
    },
    { 
        id: 'role-2', 
        name: 'Tester', 
        description: 'Can execute test runs and add results.', 
        permissions: [
            'p-proj-view',
            'p-plan-create', 'p-plan-view', 'p-plan-edit',
            'p-case-view', 'p-case-edit', 'p-case-create',
            'p-run-view', 'p-run-edit',
            'p-milestone-view',
            'p-bug-create', 'p-bug-view', 'p-bug-edit',
        ], 
        users: 2 
    },
    { 
        id: 'role-3', 
        name: 'Developer', 
        description: 'Can view projects and test cases.', 
        permissions: [
            'p-proj-view',
            'p-plan-view',
            'p-case-view',
            'p-run-view',
            'p-milestone-view',
            'p-bug-view',
        ], 
        users: 1 
    },
    { 
        id: 'role-4', 
        name: 'Guest', 
        description: 'Read-only access to projects.', 
        permissions: ['p-proj-view', 'p-plan-view'], 
        users: 0 
    },
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

export const deleteRole = (roleId: string): Promise<void> => {
    const initialLength = mockRoles.length;
    mockRoles = mockRoles.filter(r => r.id !== roleId);
    if (mockRoles.length < initialLength) {
        return simulateDelay(undefined);
    }
    return Promise.reject(new Error('Role not found'));
};

export const deleteRoles = (roleIds: string[]): Promise<void> => {
    mockRoles = mockRoles.filter(r => !roleIds.includes(r.id));
    return simulateDelay(undefined);
};
