// Path: src/pages/ProjectTestCasesPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getTestCases, TestCase } from '../services/testCaseService';
import { TestCaseDirectory } from '../components/features/test-cases/TestCaseDirectory';
import { TestCaseTable } from '../components/features/test-cases/TestCaseTable';
import { Pagination } from '../components/features/test-cases/Pagination';
import { SearchIcon, SparklesIcon, PlusIcon, ChevronDownIcon } from '../components/ui/Icons';

const ProjectTestCasesPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [totalCases, setTotalCases] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        search: '',
        status: 'All',
        priority: 'All',
        assignee: 'All',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchTestCases = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            setError('');
            const { testCases: data, totalCount } = await getTestCases({
                projectId,
                filters,
                page: currentPage,
                rowsPerPage,
            });
            setTestCases(data);
            setTotalCases(totalCount);
        } catch (err) {
            setError('Failed to load test cases.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [projectId, filters, currentPage, rowsPerPage]);

    useEffect(() => {
        fetchTestCases();
    }, [fetchTestCases]);
    
    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, rowsPerPage]);

    const totalPages = useMemo(() => Math.ceil(totalCases / rowsPerPage), [totalCases, rowsPerPage]);

    return (
        <div className="flex h-full gap-6">
            {/* Directory Sidebar */}
            <TestCaseDirectory />

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md">
                 <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Test Cases</h1>
                         <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
                                <SparklesIcon />
                                AI Generate
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                                <PlusIcon />
                                Create Test Case
                            </button>
                        </div>
                    </div>
                    {/* Filters Toolbar */}
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:w-auto flex-grow">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search cases..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                            />
                        </div>
                        {/* Custom Dropdown Filters */}
                        <div className="relative w-full sm:w-auto">
                            <select className="w-full appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
                                <option value="All">Status: All</option>
                                <option value="Draft">Draft</option>
                                <option value="Active">Active</option>
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                         <div className="relative w-full sm:w-auto">
                            <select className="w-full appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}>
                                <option value="All">Priority: All</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                         <div className="relative w-full sm:w-auto">
                            <select className="w-full appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}>
                                <option value="All">Assignee: All</option>
                                <option value="Admin User">Admin User</option>
                            </select>
                             <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                 </div>
                
                {/* Table and Pagination */}
                <div className="flex-1 overflow-y-auto mt-4">
                   <TestCaseTable testCases={testCases} loading={loading} error={error} />
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    totalItems={totalCases}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            </div>
        </div>
    );
};

export default ProjectTestCasesPage;