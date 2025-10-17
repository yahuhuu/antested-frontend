// Path: components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  // Placeholder icon
  const ProjectIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0 flex flex-col">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 tracking-wider">NAVIGASI</h2>
      </div>
      <nav className="flex-grow pt-4">
        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150 ease-in-out text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100 ${
              isActive ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 border-r-4 border-blue-500' : ''
            }`
          }
        >
          <ProjectIcon />
          <span>Proyek</span>
        </NavLink>
        {/* Tautan navigasi lainnya dapat ditambahkan di sini */}
      </nav>
    </aside>
  );
};

export default Sidebar;
