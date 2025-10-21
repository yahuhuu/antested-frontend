// Path: src/components/features/admin/users/GroupDetails.tsx
import React, { useState, useEffect } from 'react';
import { Group, User, getUsers } from '../../../../services/userService';
import { Project, getProjects } from '../../../../services/projectService';
import { EditIcon, TrashIcon } from '../../../ui/Icons';

interface GroupDetailsProps {
    group: Group;
    onEdit: () => void;
    onDelete: () => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 text-sm text-gray-900 dark:text-gray-200">{children}</div>
    </div>
);

const GroupDetails: React.FC<GroupDetailsProps> = ({ group, onEdit, onDelete }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState({ users: true, projects: true });

    useEffect(() => {
        const fetchData = async () => {
            setLoading({ users: true, projects: true });
            try {
                const [allUsers, allProjects] = await Promise.all([getUsers(), getProjects()]);

                const groupUsers = allUsers.filter(user => group.users.includes(user.id));
                setUsers(groupUsers);

                const groupProjects = allProjects.filter(project =>
                    project.groups.some(g => g.id === group.id)
                );
                setProjects(groupProjects);

            } catch (error) {
                console.error("Failed to fetch group details data", error);
            } finally {
                setLoading({ users: false, projects: false });
            }
        };
        fetchData();
    }, [group]);

    return (
        <div className="space-y-6 pb-6">
            <div className="pb-4 border-b dark:border-gray-600">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Group Details</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={onEdit} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <EditIcon className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={onDelete} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900 transition-colors">
                            <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>
            </div>

            <DetailSection title="Description">
                <p className="whitespace-pre-wrap">{group.description || 'No description provided.'}</p>
            </DetailSection>

            <DetailSection title="Projects">
                {loading.projects ? (
                    <p>Loading projects...</p>
                ) : projects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {projects.map(project => (
                            <span key={project.id} className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full dark:bg-purple-900 dark:text-purple-300">
                                {project.name}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p>This group is not assigned to any projects.</p>
                )}
            </DetailSection>

            <DetailSection title="Members">
                {loading.users ? (
                    <p>Loading members...</p>
                ) : users.length > 0 ? (
                    <ul className="space-y-2">
                        {users.map(user => (
                            <li key={user.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                <div>
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No users are members of this group.</p>
                )}
            </DetailSection>
        </div>
    );
};

export default GroupDetails;
