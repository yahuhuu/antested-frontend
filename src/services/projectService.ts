// Path: src/services/projectService.ts
import { User, Group, mockUsers, mockGroups } from './userService';

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  enableApprovals: boolean;
  users: User[];
  groups: Group[];
  memberCount: number;
  defaultTestCaseTemplateId?: string;
}

export type NewProject = Omit<Project, 'id' | 'memberCount'>;

// --- Find specific users and groups for easier assignment ---
const adminUser = mockUsers.find(u => u.id === 'user-1')!;
const alice = mockUsers.find(u => u.id === 'user-2')!;

const devGroup = mockGroups.find(g => g.id === 'group-1')!;
const qaGroup = mockGroups.find(g => g.id === 'group-2')!;
const pmGroup = mockGroups.find(g => g.id === 'group-3')!;

// FIX: Export 'mockProjects' to make it accessible to other modules.
export let mockProjects: Project[] = [
  {
    id: 'proj-nobi',
    name: 'Nobi Dana Kripto',
    key: 'NOBI',
    description: 'Platform for crypto investment and savings.',
    enableApprovals: true,
    users: [],
    groups: [devGroup, pmGroup],
    memberCount: 2, // user-1, user-3
    defaultTestCaseTemplateId: 'tmpl-multi',
  },
  {
    id: 'proj-akulaku',
    name: 'Akulaku Finance',
    key: 'AKULAKU',
    description: 'Financial services and buy-now-pay-later platform.',
    enableApprovals: false,
    users: [],
    groups: [qaGroup],
    memberCount: 2, // user-2, user-4
    defaultTestCaseTemplateId: 'tmpl-bdd',
  },
  {
    id: 'proj-traveloka',
    name: 'Travel (Traveloka)',
    key: 'TRAVEL',
    description: 'All-in-one travel booking platform for flights, hotels, and activities.',
    enableApprovals: true,
    users: [adminUser, alice],
    groups: [],
    memberCount: 2, // user-1, user-2
    defaultTestCaseTemplateId: 'tmpl-single',
  },
  {
      id: 'proj-tokopedia',
      name: 'Travel & Entertainment (Tokopedia)',
      key: 'TOKPED',
      description: 'Travel and entertainment booking services integrated within the Tokopedia ecosystem.',
      enableApprovals: false,
      users: [],
      groups: [devGroup, qaGroup, pmGroup],
      memberCount: 4, // All users
      defaultTestCaseTemplateId: 'tmpl-exploratory',
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

export const deleteProjects = (ids: string[]): Promise<void> => {
    mockProjects = mockProjects.filter(p => !ids.includes(p.id));
    return simulateDelay(undefined);
};