// Path: components/layout/MainLayout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme'; // Impor hook useTheme dari path yang benar

// --- Icon Components ---
const SunIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);

const MoonIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
);


const BellIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);

const UserIcon = () => (
    <svg className="w-8 h-8 rounded-full" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
);


const MainLayout: React.FC = () => {
    const { theme, toggleTheme } = useTheme(); // Gunakan useTheme hook dengan object destructuring
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Efek untuk menutup dropdown saat mengklik di luar
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
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex-shrink-0 flex justify-between items-center z-10">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Test Case Manager</h1>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Theme Toggle Switch */}
                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex items-center h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={theme === 'dark'}
                        aria-label="Toggle theme"
                    >
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-flex h-6 w-6 items-center justify-center transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                                theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        >
                            {theme === 'dark' ? (
                                <MoonIcon className="h-4 w-4 text-gray-400" />
                            ) : (
                                <SunIcon className="h-4 w-4 text-yellow-500" />
                            )}
                        </span>
                    </button>

                    <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 relative transition-colors">
                        <BellIcon />
                        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                    </button>
                    
                    <button className="hidden sm:block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors">
                        Admin
                    </button>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>

                    <div className="relative" ref={profileRef}>
                        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <span className="hidden md:inline text-gray-700 dark:text-gray-200 font-medium">Profile</span>
                            <div className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300">
                               <UserIcon />
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
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;