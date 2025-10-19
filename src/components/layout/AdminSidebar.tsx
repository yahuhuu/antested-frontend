// Path: src/components/layout/AdminSidebar.tsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  FolderIcon,
  UserIcon,
  SparklesIcon,
  CodeIcon,
  TrashIcon,
  SettingsIcon,
} from '../ui/Icons';

const AdminSidebar: React.FC = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-in-out rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
      isActive ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300' : ''
    }`;

  const menuItems = [
    { to: '/admin/projects', label: 'Projects', icon: <FolderIcon className="h-5 w-5 mr-3" /> },
    { to: '/admin/users', label: 'Users & Roles', icon: <UserIcon className="h-5 w-5 mr-3" /> },
    { to: '/admin/customizations', label: 'Customizations', icon: <SparklesIcon className="h-5 w-5 mr-3" /> },
    { to: '/admin/integration', label: 'Integration', icon: <CodeIcon className="h-5 w-5 mr-3" /> },
    { to: '/admin/data', label: 'Data Management', icon: <TrashIcon className="h-5 w-5 mr-3" /> },
    { to: '/admin/site', label: 'Site Settings', icon: <SettingsIcon className="h-5 w-5 mr-3" /> },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 flex flex-col z-10">
      <div className="p-4 border-b dark:border-gray-700">
        <Link to="/projects" className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {menuItems.map(item => (
          <NavLink key={item.to} to={item.to} className={navLinkClasses}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;