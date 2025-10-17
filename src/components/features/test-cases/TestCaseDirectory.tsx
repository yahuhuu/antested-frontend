// Path: src/components/features/test-cases/TestCaseDirectory.tsx
import React, { useState } from 'react';
import { PlusIcon, FolderIcon, DraftIcon, TrashIcon, ChevronRightIcon } from '../../ui/Icons';

interface DirectoryItemProps {
    icon: React.ReactNode;
    label: string;
    count: number;
    isActive?: boolean;
    isSubItem?: boolean;
}

const DirectoryItem: React.FC<DirectoryItemProps> = ({ icon, label, count, isActive, isSubItem = false }) => (
    <a href="#" className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
        isActive 
            ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        } ${isSubItem ? 'pl-8' : ''}`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-medium">{label}</span>
        </div>
        <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
            isActive ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-600'
        }`}>
            {count}
        </span>
    </a>
);


export const TestCaseDirectory: React.FC = () => {
    const [isAuthOpen, setIsAuthOpen] = useState(true);

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Directory</h2>
                <button className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                    <PlusIcon />
                </button>
            </div>
            <nav className="flex flex-col gap-1">
                <DirectoryItem icon={<FolderIcon />} label="All Test Cases" count={35} isActive />
                <DirectoryItem icon={<DraftIcon />} label="Drafts" count={29} />
                <DirectoryItem icon={<TrashIcon />} label="Trash" count={3} />
                
                {/* Collapsible Folder */}
                <div>
                    <button onClick={() => setIsAuthOpen(!isAuthOpen)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                        <ChevronRightIcon className={`w-4 h-4 transition-transform ${isAuthOpen ? 'rotate-90' : ''}`} />
                        <FolderIcon />
                        <span className="font-medium">authentication</span>
                    </button>
                    {isAuthOpen && (
                        <div className="mt-1 flex flex-col gap-1">
                            {/* Sub-items would go here */}
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    );
};