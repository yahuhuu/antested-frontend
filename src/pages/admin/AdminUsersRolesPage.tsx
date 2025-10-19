// Path: src/pages/admin/AdminUsersRolesPage.tsx
import React, { useState } from 'react';
import UsersTab from '../../components/features/admin/users/UsersTab';
import GroupsTab from '../../components/features/admin/users/GroupsTab';
import RolesTab from '../../components/features/admin/users/RolesTab';
import { UserIcon, UserGroupIcon, LockClosedIcon } from '../../components/ui/Icons';

type Tab = 'users' | 'groups' | 'roles';

const AdminUsersRolesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  const tabs = [
    { id: 'users', label: 'Users', icon: <UserIcon className="w-5 h-5 mr-2" /> },
    { id: 'groups', label: 'Groups', icon: <UserGroupIcon className="w-5 h-5 mr-2" /> },
    { id: 'roles', label: 'Roles', icon: <LockClosedIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Users & Roles</h1>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center py-3 px-5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-grow mt-6">
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'groups' && <GroupsTab />}
        {activeTab === 'roles' && <RolesTab />}
      </div>
    </div>
  );
};

export default AdminUsersRolesPage;
