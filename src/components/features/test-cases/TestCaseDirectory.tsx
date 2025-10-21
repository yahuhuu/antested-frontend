// Path: src/components/features/test-cases/TestCaseDirectory.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { PlusIcon, FolderIcon, DraftIcon, TrashIcon, ChevronRightIcon, FolderPlusIcon, EllipsisIcon, EditIcon } from '../../ui/Icons';
import { Checkbox } from '../../ui/Checkbox';
import { TestCase } from '../../../services/testCaseService';


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
    specialDirectoryCounts: { all: number; drafts: number; trash: number; };
    onAddDirectory?: (parentId: string | null) => void;
    onEditDirectory?: (node: DirectoryNode) => void;
    onDeleteDirectory?: (node: DirectoryNode) => void;
    selectionMode?: boolean;
    showSystemFolders?: boolean;
    allTestCases?: TestCase[];
    selectedTestCaseIds?: Set<string>;
    onDirectorySelect?: (directoryId: string, isSelected: boolean) => void;
}

// --- Recursive Component to Render Directory ---
const DirectoryNodeItem: React.FC<{ 
    node: DirectoryNode; 
    activeDirectory: string;
    onSelect: (id: string) => void;
    onAddDirectory?: (parentId: string) => void;
    onEditDirectory?: (node: DirectoryNode) => void;
    onDeleteDirectory?: (node: DirectoryNode) => void;
    selectionMode?: boolean;
    allTestCases?: TestCase[];
    selectedTestCaseIds?: Set<string>;
    onDirectorySelect?: (directoryId: string, isSelected: boolean) => void;
    depth?: number;
    parentPrefix?: React.ReactNode;
    isLast?: boolean;
}> = (props) => {
    const { 
        node, activeDirectory, onSelect, onAddDirectory, onEditDirectory, onDeleteDirectory, 
        selectionMode = false, allTestCases = [], selectedTestCaseIds = new Set(), onDirectorySelect,
        depth = 0, parentPrefix = null, isLast = false
    } = props;
    const [isOpen, setIsOpen] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const hasChildren = node.children && node.children.length > 0;
    const isActive = activeDirectory === node.id;
    const showManagementActions = onAddDirectory && onEditDirectory && onDeleteDirectory;

    const casesInNode = useMemo(() => {
        if (!selectionMode) return [];
        if (node.id === 'All') return allTestCases;
        return allTestCases.filter(tc => tc.directory.startsWith(node.id));
    }, [node.id, allTestCases, selectionMode]);

    const selectedInNodeCount = useMemo(() => {
        if (!selectionMode) return 0;
        const idsInNode = new Set(casesInNode.map(tc => tc.id));
        return Array.from(selectedTestCaseIds).filter(id => idsInNode.has(id)).length;
    }, [casesInNode, selectedTestCaseIds, selectionMode]);

    const isChecked = selectionMode && casesInNode.length > 0 && selectedInNodeCount === casesInNode.length;
    const isIndeterminate = selectionMode && selectedInNodeCount > 0 && selectedInNodeCount < casesInNode.length;
    const isSpecialNode = ['All', 'Drafts', 'Trash'].includes(node.id);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);
    

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasChildren) setIsOpen(!isOpen);
    };

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isMenuOpen) {
            setIsMenuOpen(false);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPosition({ top: rect.bottom, left: rect.left });
            setIsMenuOpen(true);
        }
    };
    
    return (
        <div>
            <div 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`group flex items-center justify-between pr-2 text-xs rounded-md transition-colors ${
                    isActive && !selectionMode
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-500' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div className="flex h-8 items-center flex-shrink-0">
                        {parentPrefix}
                        {depth > 0 && (
                            <div className="relative w-5 h-full shrink-0">
                                {/* Horizontal part of the connector */}
                                <div className="absolute top-1/2 w-1/2 h-px border-t border-dashed border-gray-300 dark:border-gray-600 right-0"></div>
                                {/* Vertical part of the connector */}
                                {!isLast && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full border-l border-dashed border-gray-300 dark:border-gray-600"></div>}
                                {isLast && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-1/2 border-l border-dashed border-gray-300 dark:border-gray-600"></div>}
                            </div>
                        )}
                    </div>
                     
                    {selectionMode && !isSpecialNode && (
                        <div onClick={e => e.stopPropagation()} className="flex-shrink-0 flex items-center justify-center">
                           <Checkbox
                             id={`dir-cb-${node.id}`}
                             checked={isChecked}
                             indeterminate={isIndeterminate}
                             onChange={(e) => onDirectorySelect?.(node.id, e.target.checked)}
                           />
                        </div>
                    )}

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
                            isActive && !selectionMode ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-600'
                        }`}>{node.count}</span>
                    )}
                    {isHovered && showManagementActions && !isSpecialNode && (
                         <button ref={menuButtonRef} onClick={handleMenuToggle} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <EllipsisIcon className="w-4 h-4" />
                         </button>
                    )}
                </div>
            </div>
            {hasChildren && isOpen && (
                <div className="mt-1 flex flex-col gap-1">
                    {node.children?.map((child, index) => {
                        const newParentPrefix = (
                            <>
                                {parentPrefix}
                                <div className="w-5 h-full shrink-0 relative">
                                    {depth > 0 && !isLast && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full border-l border-dashed border-gray-300 dark:border-gray-600"></div>}
                                </div>
                            </>
                        );
                        return (
                            <DirectoryNodeItem 
                                key={child.id} 
                                node={child} 
                                activeDirectory={activeDirectory} 
                                onSelect={onSelect} 
                                onAddDirectory={onAddDirectory} 
                                onEditDirectory={onEditDirectory}
                                onDeleteDirectory={onDeleteDirectory}
                                depth={depth + 1}
                                selectionMode={selectionMode}
                                allTestCases={allTestCases}
                                selectedTestCaseIds={selectedTestCaseIds}
                                onDirectorySelect={onDirectorySelect}
                                parentPrefix={newParentPrefix}
                                isLast={index === node.children!.length - 1}
                            />
                        );
                    })}
                </div>
            )}
            {isMenuOpen && menuPosition && onAddDirectory && onEditDirectory && onDeleteDirectory && ReactDOM.createPortal(
                 <div
                    ref={menuRef}
                    style={{ position: 'absolute', top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
                    className="z-50 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700"
                >
                    <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                        <li onClick={() => { onAddDirectory(node.id); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><FolderPlusIcon className="w-4 h-4" /> Add Subdirectory</li>
                        <li onClick={() => { onEditDirectory(node); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><EditIcon className="w-4 h-4" /> Edit</li>
                        <li onClick={() => { onDeleteDirectory(node); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 cursor-pointer"><TrashIcon className="w-4 h-4" /> Delete</li>
                    </ul>
                </div>,
                document.body
            )}
        </div>
    );
};

export const TestCaseDirectory: React.FC<DirectoryProps> = (props) => {
    const { 
        activeDirectory, onSelect, userDirectories, onAddDirectory, onEditDirectory, onDeleteDirectory, 
        specialDirectoryCounts, selectionMode = false, allTestCases, selectedTestCaseIds, onDirectorySelect,
        showSystemFolders = true,
    } = props;

    const defaultDirectories: DirectoryNode[] = useMemo(() => {
        const base = [
            { id: 'All', label: 'All Test Cases', count: specialDirectoryCounts.all, icon: <FolderIcon /> }
        ];
        if (showSystemFolders && !selectionMode) {
            base.push(
                { id: 'Drafts', label: 'Drafts', count: specialDirectoryCounts.drafts, icon: <DraftIcon /> },
                { id: 'Trash', label: 'Trash', count: specialDirectoryCounts.trash, icon: <TrashIcon /> }
            );
        }
        return base;
    }, [specialDirectoryCounts, selectionMode, showSystemFolders]);

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Directory</h2>
                {onAddDirectory && (
                    <button onClick={() => onAddDirectory(null)} className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                        <PlusIcon />
                    </button>
                )}
            </div>
            <nav className="flex flex-col gap-1 flex-grow overflow-y-auto min-h-0 pr-2 -mr-2">
                {defaultDirectories.map((node, index) => (
                    <DirectoryNodeItem 
                        key={node.id} 
                        node={node} 
                        activeDirectory={activeDirectory} 
                        onSelect={onSelect}
                        selectionMode={selectionMode}
                        allTestCases={allTestCases}
                        selectedTestCaseIds={selectedTestCaseIds}
                        onDirectorySelect={onDirectorySelect}
                        depth={0}
                        isLast={index === defaultDirectories.length - 1 && userDirectories.length === 0}
                    />
                ))}
                
                {showSystemFolders && !selectionMode && <hr className="my-3 border-gray-200 dark:border-gray-700" />}
                
                {userDirectories.map((node, index) => (
                    <DirectoryNodeItem 
                        key={node.id} 
                        node={node} 
                        activeDirectory={activeDirectory} 
                        onSelect={onSelect} 
                        onAddDirectory={onAddDirectory}
                        onEditDirectory={onEditDirectory}
                        onDeleteDirectory={onDeleteDirectory}
                        selectionMode={selectionMode}
                        allTestCases={allTestCases}
                        selectedTestCaseIds={selectedTestCaseIds}
                        onDirectorySelect={onDirectorySelect}
                        depth={1}
                        isLast={index === userDirectories.length - 1}
                    />
                ))}
            </nav>
        </aside>
    );
};