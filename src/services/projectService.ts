// Path: src/services/projectService.ts
// FIX: Removed local User and Group interfaces and imported them from userService to ensure type consistency.
import { User, Group } from './userService';

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  enableApprovals: boolean;
  users: User[];
  groups: Group[];
  memberCount: number;
}

export type NewProject = Omit<Project, 'id' | 'memberCount'>;

let mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Client Website Redesign',
    key: 'CWR',
    description: 'A complete overhaul of the main client-facing website, including new branding and a modern tech stack.',
    enableApprovals: true,
    // FIX: The user object was missing properties required by the 'User' interface. It has been updated to include 'role', 'status', 'lastActive', and 'groups'.
    users: [{ id: 'user-1', name: 'Admin User', email: 'admin@example.com', avatarUrl: `https://i.pravatar.cc/40?u=user-1`, role: 'Lead', status: 'Active', lastActive: '2 hours ago', groups: ['group-1', 'group-3'] }],
    // FIX: The group object was missing properties required by the 'Group' interface. It has been updated to include 'description' and 'users'.
    groups: [{ id: 'group-1', name: 'Developers', description: 'Responsible for application development.', users: ['user-1', 'user-3'] }],
    memberCount: 5,
  },
  {
    id: 'proj-002',
    name: 'Mobile Banking App',
    key: 'MBA',
    description: 'Development of a new native mobile application for iOS and Android for personal banking services.',
    enableApprovals: true,
    users: [],
    groups: [],
    memberCount: 12,
  },
  {
    id: 'proj-003',
    name: 'Internal CRM Platform',
    key: 'ICRM',
    description: 'Building a new customer relationship management tool for the internal sales and support teams.',
    enableApprovals: false,
    users: [],
    groups: [],
    memberCount: 8,
  },
  {
      id: 'proj-004',
      name: 'API Gateway Migration',
      key: 'AGM',
      description: 'Migrating the existing API gateway to a new, more scalable cloud-native solution.',
      enableApprovals: true,
      users: [],
      groups: [],
      memberCount: 4,
  }
];

const simulateDelay = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), 500));
};

export const getProjects = (): Promise<Project[]> => {
  return simulateDelay([...mockProjects]);
};

export const getProjectById = (id: string): Promise<Project | undefined> => {
  const project = mockProjects.find(p => p.id === id);
  return simulateDelay(project);
};

export const createProject = (projectData: NewProject): Promise<Project> => {
  const newProject: Project = {
    ...projectData,
    id: `proj-${new Date().getTime()}`,
    memberCount: (projectData.users?.length || 0) + (projectData.groups?.length || 0), // Simplistic member count
  };
  mockProjects.push(newProject);
  return simulateDelay(newProject);
};

export const updateProject = (id: string, updates: Partial<NewProject>): Promise<Project | undefined> => {
  let updatedProject: Project | undefined;
  mockProjects = mockProjects.map(p => {
    if (p.id === id) {
      updatedProject = { ...p, ...updates };
      return updatedProject;
    }
    return p;
  });
  return simulateDelay(updatedProject);
};

export const deleteProject = (id: string): Promise<void> => {
  mockProjects = mockProjects.filter(p => p.id !== id);
  return simulateDelay(undefined);
};