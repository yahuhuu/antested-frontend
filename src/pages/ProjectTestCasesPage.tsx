// Path: src/pages/ProjectTestCasesPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getTestCases, TestCase, deleteTestCases } from '../services/testCaseService';
import { TestCaseDirectory, DirectoryNode } from '../components/features/test-cases/TestCaseDirectory';
import { TestCaseTable } from '../components/features/test-cases/TestCaseTable';
import { Pagination } from '../components/features/test-cases/Pagination';
import DeleteTestCaseModal from '../components/features/test-cases/DeleteTestCaseModal';
import AddDirectoryModal from '../components/features/test-cases/AddDirectoryModal';
import { SearchIcon, SparklesIcon, PlusIcon, ChevronDownIcon, TrashIcon as DeleteIcon, FolderIcon } from '../components/ui/Icons';


// --- Recursive Utility to Add Node ---
const addNodeToTree = (nodes: DirectoryNode[], parentId: string, newNode: DirectoryNode): DirectoryNode[] => {
    return nodes.map(node => {
        if (node.id === parentId) {
            return { ...node, children: [...(node.children || []), newNode] };
        }
        if (node.children) {
            return { ...node, children: addNodeToTree(node.children, parentId, newNode) };
        }
        return node;
    });
};

const initialUserDirectories: DirectoryNode[] = [
    {
        id: 'authentication', label: 'Authentication', icon: <FolderIcon />, count: 7,
        children: [
            { id: 'authentication/security', label: 'Security', icon: <FolderIcon />, count: 1 },
            { id: 'authentication/sso', label: 'SSO', icon: <FolderIcon />, count: 5 },
        ]
    },
    { id: 'legacy', label: 'Legacy', icon: <FolderIcon />, count: 1 }
];


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

    const [activeDirectory, setActiveDirectory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());

    // State for directories
    const [userDirectories, setUserDirectories] = useState<DirectoryNode[]>(initialUserDirectories);
    const [isAddDirectoryModalOpen, setIsAddDirectoryModalOpen] = useState(false);
    const [addDirectoryParentId, setAddDirectoryParentId] = useState<string | null>(null);

    // State for delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [casesToDelete, setCasesToDelete] = useState<Set<string>>(new Set());

    const fetchTestCases = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            setError('');
            
            const effectiveFilters = { ...filters };
            let directoryFilter = activeDirectory;

            // Handle special directory filters
            if (activeDirectory === 'Drafts') {
                effectiveFilters.status = 'Draft';
                directoryFilter = 'All'; 
            } else if (activeDirectory === 'Trash') {
                effectiveFilters.status = 'Archived';
                directoryFilter = 'All';
            }

            const { testCases: data, totalCount } = await getTestCases({
                projectId,
                filters: effectiveFilters,
                directory: directoryFilter,
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
    }, [projectId, filters, currentPage, rowsPerPage, activeDirectory]);

    useEffect(() => {
        fetchTestCases();
    }, [fetchTestCases]);
    
    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
        setSelectedCases(new Set()); // Clear selection on data change
    }, [filters, rowsPerPage, activeDirectory]);

    const handleSelectItem = (id: string, checked: boolean) => {
        setSelectedCases(prev => {
            const newSet = new Set(prev);
            if (checked) newSet.add(id);
            else newSet.delete(id);
            return newSet;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedCases(checked ? new Set(testCases.map(tc => tc.id)) : new Set());
    };

    // --- Delete Logic ---
    const handleDeleteRequest = (ids: string[]) => {
        if (ids.length === 0) return;
        setCasesToDelete(new Set(ids));
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteTestCases(Array.from(casesToDelete));
            // Refresh data
            await fetchTestCases();
            setSelectedCases(new Set());
        } catch (err) {
            console.error("Failed to delete test cases:", err);
            setError("An error occurred while moving cases to trash.");
        } finally {
            setIsDeleteModalOpen(false);
            setCasesToDelete(new Set());
        }
    };

     // --- Directory Logic ---
     const handleAddDirectoryClick = (parentId: string | null) => {
        setAddDirectoryParentId(parentId);
        setIsAddDirectoryModalOpen(true);
    };

    const handleSaveDirectory = (name: string) => {
        const newId = name.toLowerCase().replace(/\s+/g, '-');
        const newNode: DirectoryNode = {
            id: addDirectoryParentId ? `${addDirectoryParentId}/${newId}` : newId,
            label: name,
            icon: <FolderIcon />,
            count: 0,
            children: []
        };

        if (addDirectoryParentId) {
            setUserDirectories(prev => addNodeToTree(prev, addDirectoryParentId, newNode));
        } else {
            setUserDirectories(prev => [...prev, newNode]);
        }
    };


    const totalPages = useMemo(() => Math.ceil(totalCases / rowsPerPage), [totalCases, rowsPerPage]);
    const areAllVisibleSelected = selectedCases.size > 0 && testCases.length > 0 && testCases.every(tc => selectedCases.has(tc.id));

    return (
        <>
            <div className="flex h-full gap-6">
                {/* Directory Sidebar */}
                <TestCaseDirectory 
                    activeDirectory={activeDirectory} 
                    onSelect={setActiveDirectory} 
                    userDirectories={userDirectories}
                    onAddDirectory={handleAddDirectoryClick}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Test Cases</h1>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
                                    <SparklesIcon /> AI Generate
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                                    <PlusIcon /> Create Test Case
                                </button>
                            </div>
                        </div>
                        {/* Filters Toolbar */}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <div className="relative w-full sm:w-auto flex-grow">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text" placeholder="Search cases..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.search} onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                                />
                            </div>
                            <div className="relative w-full sm:w-auto">
                                <select className="w-full appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
                                    <option value="All">Status: All</option>
                                    <option value="Draft">Draft</option>
                                    <option value="In Review">In Review</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Need Update">Need Update</option>
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative w-full sm:w-auto">
                                <select className="w-full appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={filters.priority} onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}>
                                    <option value="All">Priority: All</option>
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative w-full sm:w-auto">
                                <select className="w-full appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={filters.assignee} onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}>
                                    <option value="All">Assignee: All</option>
                                    <option value="Admin User">Admin User</option>
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                            {selectedCases.size > 0 && (
                                <button onClick={() => handleDeleteRequest(Array.from(selectedCases))} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                                    <DeleteIcon /> Delete ({selectedCases.size})
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                    <TestCaseTable 
                            testCases={testCases} 
                            loading={loading} 
                            error={error}
                            selectedCases={selectedCases}
                            onSelectItem={handleSelectItem}
                            onSelectAll={handleSelectAll}
                            areAllVisibleSelected={areAllVisibleSelected}
                            onDelete={(id) => handleDeleteRequest([id])}
                        />
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
            <DeleteTestCaseModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemCount={casesToDelete.size}
            />
            <AddDirectoryModal
                isOpen={isAddDirectoryModalOpen}
                onClose={() => setIsAddDirectoryModalOpen(false)}
                onSave={handleSaveDirectory}
                parentId={addDirectoryParentId}
            />
        </>
    );
};

export default ProjectTestCasesPage;