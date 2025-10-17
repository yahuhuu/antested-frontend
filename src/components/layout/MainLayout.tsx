// Path: components/layout/MainLayout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useMatch } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import ProjectSidebar from './ProjectSidebar';
import { SunIcon, MoonIcon, BellIcon, UserIcon } from '../ui/Icons';

const MainLayout: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const isProjectPage = useMatch('/projects/:projectId/*');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex-shrink-0 flex justify-between items-center z-20">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Test Case Manager</h1>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={theme === 'dark'}
                        aria-label="Toggle theme"
                    >
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-flex h-5 w-5 items-center justify-center transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                                theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        >
                            {theme === 'dark' ? (
                                <MoonIcon className="h-3 w-3 text-gray-400" />
                            ) : (
                                <SunIcon className="h-3 w-3 text-yellow-500" />
                            )}
                        </span>
                    </button>

                    <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 relative transition-colors">
                        <BellIcon className="w-5 h-5" />
                        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                    </button>

                    <div className="relative" ref={profileRef}>
                        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-3 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium text-gray-800 dark:text-white">Admin</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Profile</div>
                            </div>
                            <div className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300">
                               <UserIcon className="w-6 h-6" />
                            </div>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border dark:border-gray-700 animate-fade-in-down">
                                <Link to="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    My Setting
                                </Link>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    Logout
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                {isProjectPage && <ProjectSidebar />}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;