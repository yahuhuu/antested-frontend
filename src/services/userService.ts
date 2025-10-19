// Path: src/services/userService.ts
export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
    status: 'Active' | 'Inactive';
    lastActive: string;
    groups: string[]; // Group IDs
}
  
export interface Group {
    id: string;
    name: string;
    description: string;
    users: string[]; // User IDs
}

let mockUsers: User[] = [
    { id: 'user-1', name: 'Admin User', email: 'admin@example.com', avatarUrl: `https://i.pravatar.cc/40?u=user-1`, role: 'Lead', status: 'Active', lastActive: '2 hours ago', groups: ['group-1', 'group-3'] },
    { id: 'user-2', name: 'Alice Johnson', email: 'alice.j@example.com', avatarUrl: `https://i.pravatar.cc/40?u=user-2`, role: 'Tester', status: 'Active', lastActive: '5 hours ago', groups: ['group-2'] },
    { id: 'user-3', name: 'Bob Williams', email: 'bob.w@example.com', avatarUrl: `https://i.pravatar.cc/40?u=user-3`, role: 'Developer', status: 'Active', lastActive: '1 day ago', groups: ['group-1'] },
    { id: 'user-4', name: 'Charlie Brown', email: 'charlie.b@example.com', avatarUrl: `https://i.pravatar.cc/40?u=user-4`, role: 'Tester', status: 'Inactive', lastActive: '2 weeks ago', groups: ['group-2'] },
];

const mockGroups: Group[] = [
    { id: 'group-1', name: 'Developers', description: 'Responsible for application development.', users: ['user-1', 'user-3'] },
    { id: 'group-2', name: 'QA Team', description: 'Responsible for quality assurance and testing.', users: ['user-2', 'user-4'] },
    { id: 'group-3', name: 'Project Managers', description: 'Oversee project planning and execution.', users: ['user-1'] },
];

const simulateDelay = <T,>(data: T, delay: number = 300): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
};
  
export const getUsers = (): Promise<User[]> => {
    return simulateDelay([...mockUsers]);
};

export const getGroups = (): Promise<Group[]> => {
    return simulateDelay([...mockGroups]);
};

export const activateUser = (userId: string): Promise<void> => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
        user.status = 'Active';
        return simulateDelay(undefined);
    }
    return Promise.reject(new Error('User not found'));
};

export const deactivateUser = (userId: string): Promise<void> => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
        user.status = 'Inactive';
        return simulateDelay(undefined);
    }
    return Promise.reject(new Error('User not found'));
};

export const deleteUser = (userId: string): Promise<void> => {
    const initialLength = mockUsers.length;
    mockUsers = mockUsers.filter(u => u.id !== userId);
    if (mockUsers.length < initialLength) {
        return simulateDelay(undefined);
    }
    return Promise.reject(new Error('User not found'));
};
