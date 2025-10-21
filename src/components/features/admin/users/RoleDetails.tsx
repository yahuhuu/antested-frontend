// Path: src/components/features/admin/users/RoleDetails.tsx
import React, { useState, useEffect } from 'react';
import { Role, PermissionGroup, getPermissions } from '../../../../services/roleService';
import { User, getUsers } from '../../../../services/userService';
import { EditIcon, TrashIcon } from '../../../ui/Icons';

interface RoleDetailsProps {
    role: Role;
    onEdit: () => void;
    onDelete: () => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 text-sm text-gray-900 dark:text-gray-200">{children}</div>
    </div>
);

const RoleDetails: React.FC<RoleDetailsProps> = ({ role, onEdit, onDelete }) => {
    const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
    const [usersWithRole, setUsersWithRole] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [permissions, allUsers] = await Promise.all([
                    getPermissions(),
                    getUsers()
                ]);
                
                setPermissionGroups(permissions);

                const filteredUsers = allUsers.filter(user => user.role === role.name);
                setUsersWithRole(filteredUsers);

            } catch (error) {
                console.error("Failed to fetch details data for role", error);
            } finally {
                setLoading(false);
            }
        };

        if (role) {
            fetchData();
        }
    }, [role]);

    const rolePermissions = new Set(role.permissions);

    return (
        <div className="space-y-6 pb-6">
             <div className="pb-4 border-b dark:border-gray-600">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{role.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Role Details</p>
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
                <p className="whitespace-pre-wrap">{role.description || 'No description provided.'}</p>
            </DetailSection>

            <DetailSection title="Users with this Role">
                {loading ? (
                    <p>Loading users...</p>
                ) : usersWithRole.length > 0 ? (
                    <ul className="space-y-2">
                        {usersWithRole.map(user => (
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
                    <p>No users are currently assigned this role.</p>
                )}
            </DetailSection>

            <DetailSection title="Permissions">
                {loading ? (
                    <p>Loading permissions...</p>
                ) : (
                    <div className="space-y-4">
                        {permissionGroups.map(group => (
                            <div key={group.id}>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{group.name}</h4>
                                <ul className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {group.permissions.map(perm => {
                                        const hasPermission = rolePermissions.has(perm.id);
                                        return (
                                            <li key={perm.id} className="flex items-center gap-2">
                                                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${hasPermission ? 'bg-green-500' : 'bg-red-500'}`}>
                                                    {hasPermission ? (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    )}
                                                </span>
                                                <span className={hasPermission ? '' : 'text-gray-500 line-through'}>{perm.label}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </DetailSection>
        </div>
    );
};

export default RoleDetails;