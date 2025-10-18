// Path: src/components/features/test-cases/TestCaseDirectory.tsx
import React, { useState } from 'react';
import { PlusIcon, FolderIcon, DraftIcon, TrashIcon, ChevronRightIcon, FolderPlusIcon } from '../../ui/Icons';

// --- Types ---
export interface DirectoryNode {
    id: string;
    label: string;
    count?: number;
    icon: React.ReactNode;
    children?: DirectoryNode[];
}

interface DirectoryProps {
    activeDirectory: string;
    onSelect: (id: string) => void;
    userDirectories: DirectoryNode[];
    onAddDirectory: (parentId: string | null) => void;
}

// --- Recursive Component to Render Directory ---
const DirectoryNodeItem: React.FC<{ 
    node: DirectoryNode; 
    depth?: number;
    onAddDirectory: (parentId: string) => void;
    activeDirectory: string;
    onSelect: (id: string) => void;
}> = ({ node, activeDirectory, onSelect, onAddDirectory, depth = 0 }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    const isActive = activeDirectory === node.id;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasChildren) setIsOpen(!isOpen);
    };
    
    return (
        <div>
            <div 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`group flex items-center justify-between pl-${depth * 2} pr-2 text-sm rounded-md transition-colors ${
                    isActive 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-500' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                     <div className="flex-shrink-0 w-5 h-8 flex items-center justify-center">
                        {hasChildren && (
                             <button onClick={handleToggle} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                                <ChevronRightIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                             </button>
                        )}
                    </div>
                    <div 
                        onClick={() => onSelect(node.id)}
                        className="flex items-center gap-3 h-8 flex-1 min-w-0 cursor-pointer"
                    >
                        <div className="flex-shrink-0">{node.icon}</div>
                        <span className="font-medium truncate" title={node.label}>{node.label}</span>
                    </div>
                </div>
                <div className="flex items-center flex-shrink-0 pl-1">
                    {node.count !== undefined && (
                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md mr-2 ${
                            isActive ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-600'
                        }`}>{node.count}</span>
                    )}
                    {isHovered && node.id !== 'All' && node.id !== 'Drafts' && node.id !== 'Trash' && (
                         <button onClick={(e) => { e.stopPropagation(); onAddDirectory(node.id); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FolderPlusIcon className="w-4 h-4" />
                         </button>
                    )}
                </div>
            </div>
            {hasChildren && isOpen && (
                <div className="mt-1 flex flex-col gap-1">
                    {node.children?.map(child => (
                        <DirectoryNodeItem key={child.id} node={child} activeDirectory={activeDirectory} onSelect={onSelect} onAddDirectory={onAddDirectory} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const TestCaseDirectory: React.FC<DirectoryProps> = ({ activeDirectory, onSelect, userDirectories, onAddDirectory }) => {

    const defaultDirectories: DirectoryNode[] = [
      { id: 'All', label: 'All Test Cases', count: 35, icon: <FolderIcon /> },
      { id: 'Drafts', label: 'Drafts', count: 29, icon: <DraftIcon /> },
      { id: 'Trash', label: 'Trash', count: 3, icon: <TrashIcon /> },
    ];

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Directory</h2>
                <button onClick={() => onAddDirectory(null)} className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                    <PlusIcon />
                </button>
            </div>
            <nav className="flex flex-col gap-1 flex-grow overflow-y-auto min-h-0 pr-2 -mr-2">
                {defaultDirectories.map(node => (
                    <DirectoryNodeItem key={node.id} node={node} activeDirectory={activeDirectory} onSelect={onSelect} onAddDirectory={() => {}} />
                ))}
                
                <hr className="my-3 border-gray-200 dark:border-gray-700" />
                
                {userDirectories.map(node => (
                    <DirectoryNodeItem key={node.id} node={node} activeDirectory={activeDirectory} onSelect={onSelect} onAddDirectory={onAddDirectory} />
                ))}
            </nav>
        </aside>
    );
};