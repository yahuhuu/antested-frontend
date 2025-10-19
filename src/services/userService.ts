// Path: src/services/userService.ts
export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}
  
export interface Group {
    id: string;
    name: string;
}

const mockUsers: User[] = [
    { id: 'user-1', name: 'Admin User', email: 'admin@example.com', avatarUrl: `https://i.pravatar.cc/40?u=user-1` },
    { id: 'user-2', name: 'Alice Johnson', email: 'alice.j@example.com', avatarUrl: `https://i.pravatar.cc/40?u=user-2` },
    { id: 'user-3', name: 'Bob Williams', email: 'bob.w@example.com', avatarUrl: `https://i.pravatar.cc/40?u=user-3` },
    { id: 'user-4', name: 'Charlie Brown', email: 'charlie.b@example.com', avatarUrl: `https://i.pravatar.cc/40?u=user-4` },
];

const mockGroups: Group[] = [
    { id: 'group-1', name: 'Developers' },
    { id: 'group-2', name: 'QA Team' },
    { id: 'group-3', name: 'Project Managers' },
];

const simulateDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 300));
};
  
export const getUsers = (): Promise<User[]> => {
    return simulateDelay([...mockUsers]);
};

export const getGroups = (): Promise<Group[]> => {
    return simulateDelay([...mockGroups]);
};