// Path: src/components/features/test-cases/TestCaseTable.tsx
import React from 'react';
import { TestCase, Priority, Status } from '../../../services/testCaseService';
import { EllipsisIcon } from '../../ui/Icons';
import { Checkbox } from '../../ui/Checkbox';

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
    const colors = {
        High: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
        Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
        Low: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
    };
    return <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[priority]}`}>{priority}</span>;
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
    const colors = {
        Active: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
        Draft: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300',
        Obsolete: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>{status}</span>;
};


interface TestCaseTableProps {
    testCases: TestCase[];
    loading: boolean;
    error: string;
}

export const TestCaseTable: React.FC<TestCaseTableProps> = ({ testCases, loading, error }) => {
    const tableHeaders = ["Case ID", "Name", "Priority", "Status", "Assignee", "Last Updated", "Actions"];

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

        return testCases.map((tc, index) => (
            <tr key={tc.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3"><Checkbox id={`cb-${index}`} /></td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{tc.caseId}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100">{tc.name}</td>
                <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge priority={tc.priority} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={tc.status} /></td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{tc.assignee}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{tc.lastUpdated}</td>
                <td className="px-4 py-3 text-center">
                    <button className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                        <EllipsisIcon />
                    </button>
                </td>
            </tr>
        ));
    };

    return (
        <table className="min-w-full">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                <tr>
                    <th className="px-4 py-2 w-12"><Checkbox id="cb-all" /></th>
                    {tableHeaders.map(header => (
                        <th key={header} scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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