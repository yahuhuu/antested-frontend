// Path: src/components/features/admin/users/UserDetails.tsx
import React, { useState, useEffect } from 'react';
import { User, Group, getGroups } from '../../../../services/userService';
import { Project, getProjects } from '../../../../services/projectService';
import { EditIcon, TrashIcon } from '../../../ui/Icons';

interface UserDetailsProps {
    user: User;
    onEdit: () => void;
    onDelete: () => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 text-sm text-gray-900 dark:text-gray-200">{children}</div>
    </div>
);

const UserDetails: React.FC<UserDetailsProps> = ({ user, onEdit, onDelete }) => {
    const [userProjects, setUserProjects] = useState<Project[]>([]);
    const [userGroups, setUserGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState({ projects: true, groups: true });

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading({ projects: true, groups: true });
            try {
                const [allProjects, allGroups] = await Promise.all([
                    getProjects(),
                    getGroups()
                ]);

                // Filter projects for the user
                const projectsForUser = allProjects.filter(project => {
                    const isDirectMember = project.users.some(projectUser => projectUser.id === user.id);
                    const isGroupMember = project.groups.some(projectGroup => user.groups.includes(projectGroup.id));
                    return isDirectMember || isGroupMember;
                });
                setUserProjects(projectsForUser);

                // Filter groups for the user to get full objects
                const groupsForUser = allGroups.filter(group => user.groups.includes(group.id));
                setUserGroups(groupsForUser);

            } catch (error) {
                console.error("Failed to fetch user details data", error);
                setUserProjects([]);
                setUserGroups([]);
            } finally {
                setLoading({ projects: false, groups: false });
            }
        };

        fetchData();
    }, [user]);

    return (
        <div className="space-y-6 pb-6">
            <div className="pb-4 border-b dark:border-gray-600">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                        <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <DetailSection title="Role">
                    <p>{user.role}</p>
                </DetailSection>

                <DetailSection title="Status">
                    <span className={`px-2.5 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        user.status === 'Active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        }`}>
                        {user.status}
                    </span>
                </DetailSection>
            </div>

            <DetailSection title="Last Active">
                <p>{user.lastActive}</p>
            </DetailSection>

            <DetailSection title="Groups">
                {loading.groups ? (
                    <p>Loading groups...</p>
                ) : userGroups.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {userGroups.map(group => (
                            <span key={group.id} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                {group.name}
                            </span>
                        ))}
                    </div>
                ) : <p>This user is not a member of any groups.</p>}
            </DetailSection>

            <DetailSection title="Projects">
                {loading.projects ? (
                    <p>Loading projects...</p>
                ) : userProjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {userProjects.map(project => (
                            <span key={project.id} className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full dark:bg-purple-900 dark:text-purple-300">
                                {project.name}
                            </span>
                        ))}
                    </div>
                ) : <p>This user is not assigned to any projects.</p>}
            </DetailSection>
        </div>
    );
};

export default UserDetails;