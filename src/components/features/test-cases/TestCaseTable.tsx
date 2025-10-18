// Path: src/components/features/test-cases/TestCaseTable.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TestCase, Priority, Status } from '../../../services/testCaseService';
import { EllipsisIcon, EditIcon, DuplicateIcon, TrashIcon } from '../../ui/Icons';
import { Checkbox } from '../../ui/Checkbox';

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
    const colors = {
        Critical: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400',
        High: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
        Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
        Low: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
    };
    return <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[priority]}`}>{priority}</span>;
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
    const colors: Record<Status, string> = {
        Approved: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
        'In Review': 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-400',
        'Need Update': 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400',
        Draft: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300',
        Archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>{status}</span>;
};


interface TestCaseTableProps {
    testCases: TestCase[];
    loading: boolean;
    error: string;
    selectedCases: Set<string>;
    onSelectItem: (id: string, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    areAllVisibleSelected: boolean;
    onDelete: (id: string) => void;
}

export const TestCaseTable: React.FC<TestCaseTableProps> = ({ 
    testCases, 
    loading, 
    error,
    selectedCases,
    onSelectItem,
    onSelectAll,
    areAllVisibleSelected,
    onDelete
}) => {
    const tableHeaders = ["Case ID", "Name", "Directory", "Priority", "Status", "Assignee", "Actions"];
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Close menu when data changes to prevent orphan menus
    useEffect(() => {
        setOpenMenu(null);
    }, [testCases]);

    const renderContent = () => {
        if (loading) return (
            <tr><td colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400">Loading test cases...</td></tr>
        );
        if (error) return (
            <tr><td colSpan={8} className="text-center py-10 text-red-500">{error}</td></tr>
        );
        if (testCases.length === 0) {
            return <tr><td colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400">No test cases found.</td></tr>;
        }

        return testCases.map((tc) => (
            <tr key={tc.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3"><Checkbox id={`cb-${tc.id}`} checked={selectedCases.has(tc.id)} onChange={e => onSelectItem(tc.id, e.target.checked)} /></td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{tc.caseId}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 truncate" style={{ maxWidth: '200px' }} title={tc.name}>{tc.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{tc.directory}</td>
                <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge priority={tc.priority} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={tc.status} /></td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{tc.assignee}</td>
                <td className="px-4 py-3 text-center relative">
                    <button onClick={() => setOpenMenu(openMenu === tc.id ? null : tc.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <EllipsisIcon />
                    </button>
                    {openMenu === tc.id && (
                         <div ref={menuRef} className="absolute right-8 top-full z-20 mt-2 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700">
                            <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                                <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><EditIcon className="w-4 h-4" /> Edit</li>
                                <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><DuplicateIcon className="w-4 h-4" /> Duplicate</li>
                                <li onClick={() => onDelete(tc.id)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 cursor-pointer"><TrashIcon className="w-4 h-4" /> Delete</li>
                            </ul>
                        </div>
                    )}
                </td>
            </tr>
        ));
    };

    return (
        <table className="min-w-full">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                <tr>
                    <th className="px-4 py-4 w-12"><Checkbox id="cb-all" checked={areAllVisibleSelected} onChange={e => onSelectAll(e.target.checked)} /></th>
                    {tableHeaders.map(header => (
                        <th key={header} scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {renderContent()}
            </tbody>
        </table>
    );
};