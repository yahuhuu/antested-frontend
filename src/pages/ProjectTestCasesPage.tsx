// Path: src/pages/ProjectTestCasesPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getTestCases, TestCase, deleteTestCases, createTestCase, updateTestCase, NewTestCase, getTestCaseById, getAllTestCasesForProject, permanentlyDeleteTestCases, restoreTestCases, Status, TestCaseHistoryEntry } from '../services/testCaseService';
import { getProjectById, Project } from '../services/projectService';
import { User, getUsers } from '../services/userService';
import { TestCaseDirectory, DirectoryNode } from '../components/features/test-cases/TestCaseDirectory';
import { TestCaseTable } from '../components/features/test-cases/TestCaseTable';
import { Pagination } from '../components/ui/Pagination';
import DeleteTestCaseModal from '../components/features/test-cases/DeleteTestCaseModal';
import AddDirectoryModal from '../components/features/test-cases/AddDirectoryModal';
import EditDirectoryModal from '../components/features/test-cases/EditDirectoryModal';
import DeleteDirectoryModal from '../components/features/test-cases/DeleteDirectoryModal';
import AIGenerateModal from '../components/features/test-cases/AIGenerateModal';
import TestCaseFormModal from '../components/features/test-cases/TestCaseFormModal';
import { SearchIcon, SparklesIcon, PlusIcon, ChevronDownIcon, TrashIcon as DeleteIcon, FolderIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/ui/Icons';
import DetailsDrawer from '../components/ui/DetailsDrawer';
import TestCaseDetails from '../components/features/test-cases/TestCaseDetails';


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
        id: 'authentication', label: 'Authentication', icon: <FolderIcon />, count: 0,
        children: [
            { id: 'authentication/login', label: 'Login', icon: <FolderIcon />, count: 0 },
            { id: 'authentication/register', label: 'Register', icon: <FolderIcon />, count: 0 },
            { id: 'authentication/forgot-password', label: 'Forgot Password', icon: <FolderIcon />, count: 0 },
        ]
    },
    { id: 'dashboard', label: 'Dashboard', icon: <FolderIcon />, count: 0 }
];


const ProjectTestCasesPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [users, setUsers] = useState<User[]>([]);
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
    const [specialDirectoryCounts, setSpecialDirectoryCounts] = useState({ all: 0, drafts: 0, trash: 0 });
    const [isEditDirModalOpen, setIsEditDirModalOpen] = useState(false);
    const [isDeleteDirModalOpen, setIsDeleteDirModalOpen] = useState(false);
    const [dirToModify, setDirToModify] = useState<DirectoryNode | null>(null);

    // State for delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [casesToDelete, setCasesToDelete] = useState<Set<string>>(new Set());

    // State for AI Generate Modal
    const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);
    
    // State for Test Case Create/Edit Modal
    const [isTestCaseModalOpen, setIsTestCaseModalOpen] = useState(false);
    const [editingTestCaseId, setEditingTestCaseId] = useState<string | null>(null);
    const [detailsTestCase, setDetailsTestCase] = useState<TestCase | null>(null);


    const fetchAllData = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            setError('');
            
            // Fetch project details first to determine approval workflow
            const [projectData, userData] = await Promise.all([
                getProjectById(projectId),
                getUsers()
            ]);
            setProject(projectData || null);
            setUsers(userData);
            if (!projectData) {
                throw new Error("Project not found");
            }

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
        fetchAllData();
    }, [fetchAllData]);

     // Effect to calculate directory counts. Runs on project change or after data refresh.
     useEffect(() => {
        if (!projectId) return;

        const calculateDirectoryCounts = async () => {
            try {
                const allCasesForProject = await getAllTestCasesForProject(projectId);

                // Calculate counts for special directories
                const allCount = allCasesForProject.filter(tc => tc.status !== 'Archived').length;
                const draftCount = allCasesForProject.filter(tc => tc.status === 'Draft').length;
                const trashCount = allCasesForProject.filter(tc => tc.status === 'Archived').length;
                setSpecialDirectoryCounts({ all: allCount, drafts: draftCount, trash: trashCount });

                // Recursive function to update counts for user-defined directories
                const updateCounts = (nodes: DirectoryNode[]): DirectoryNode[] => {
                    return nodes.map(node => {
                        const count = allCasesForProject.filter(
                            tc => tc.directory.startsWith(node.id) && tc.status !== 'Archived'
                        ).length;

                        const updatedNode: DirectoryNode = { ...node, count };
                        if (node.children) {
                            updatedNode.children = updateCounts(node.children);
                        }
                        return updatedNode;
                    });
                };
                
                setUserDirectories(() => updateCounts(initialUserDirectories));

            } catch (err) {
                console.error("Failed to calculate directory counts:", err);
            }
        };

        calculateDirectoryCounts();
    }, [projectId, testCases]); // Re-calculate when project changes or main test case list is refreshed
    
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
        setDetailsTestCase(null); // Close details drawer if open
    };

    const handleConfirmMoveToTrash = async () => {
        try {
            await deleteTestCases(Array.from(casesToDelete)); // This service function moves to trash
            await fetchAllData();
            setSelectedCases(new Set());
        } catch (err) {
            console.error("Failed to move test cases to trash:", err);
            setError("An error occurred while moving cases to trash.");
        } finally {
            setIsDeleteModalOpen(false);
            setCasesToDelete(new Set());
        }
    };
    
    const handleConfirmPermanentDelete = async () => {
        try {
            await permanentlyDeleteTestCases(Array.from(casesToDelete));
            await fetchAllData();
            setSelectedCases(new Set());
        } catch (err) {
            console.error("Failed to permanently delete test cases:", err);
            setError("An error occurred while permanently deleting cases.");
        } finally {
            setIsDeleteModalOpen(false);
            setCasesToDelete(new Set());
        }
    };

    const handleConfirmRestore = async () => {
        try {
            await restoreTestCases(Array.from(casesToDelete));
            await fetchAllData();
            setSelectedCases(new Set());
        } catch (err) {
            console.error("Failed to restore test cases:", err);
            setError("An error occurred while restoring cases.");
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

    const handleEditDirectory = (node: DirectoryNode) => {
        setDirToModify(node);
        setIsEditDirModalOpen(true);
    };
    
    const handleDeleteDirectory = (node: DirectoryNode) => {
        setDirToModify(node);
        setIsDeleteDirModalOpen(true);
    };

    const handleSaveDirectoryEdit = (newName: string) => {
        if (!dirToModify) return;

        // Note: For simplicity, this only updates the label. A real implementation
        // would need to recursively update child paths if the ID changes.
        const updateLabel = (nodes: DirectoryNode[]): DirectoryNode[] => {
            return nodes.map(node => {
                if (node.id === dirToModify.id) {
                    return { ...node, label: newName };
                }
                if (node.children) {
                    return { ...node, children: updateLabel(node.children) };
                }
                return node;
            });
        };

        setUserDirectories(prev => updateLabel(prev));
        setIsEditDirModalOpen(false);
        setDirToModify(null);
    };

    const handleConfirmDirectoryDelete = () => {
        if (!dirToModify) return;

        const removeNode = (nodes: DirectoryNode[]): DirectoryNode[] => {
            return nodes.filter(node => node.id !== dirToModify.id).map(node => {
                if (node.children) {
                    return { ...node, children: removeNode(node.children) };
                }
                return node;
            });
        };

        setUserDirectories(prev => removeNode(prev));
        setIsDeleteDirModalOpen(false);
        setDirToModify(null);
    };

    const handleAIGenerateClose = (didGenerate: boolean) => {
        setIsAIGenerateModalOpen(false);
        if (didGenerate) {
            // Refresh test cases if AI generated new ones
            fetchAllData();
        }
    };
    
    // --- Create/Edit/View/Duplicate Test Case Logic ---
    const handleOpenCreateModal = () => {
        setEditingTestCaseId(null);
        setIsTestCaseModalOpen(true);
    };

    const handleEditTestCase = (id: string) => {
        setDetailsTestCase(null); // Close drawer if open
        setEditingTestCaseId(id);
        setIsTestCaseModalOpen(true);
    };

    const handleViewDetails = (id: string) => {
        const testCase = testCases.find(tc => tc.id === id);
        if (testCase) {
            setDetailsTestCase(testCase);
        }
    };

    const handleAddResult = (testCaseId: string, updates: { status: string; comment: string; assignedToId: string; attachments: File[] }) => {
        const newHistoryEntry: TestCaseHistoryEntry = {
            id: `hist-${Date.now()}`,
            status: updates.status,
            comment: updates.comment,
            assignedToId: updates.assignedToId,
            attachments: updates.attachments,
            createdBy: 'Admin User', // Mocked current user
            createdAt: new Date().toLocaleString(),
        };
    
        const updateTestCaseState = (tc: TestCase): TestCase => {
            if (tc.id === testCaseId) {
                return {
                    ...tc,
                    status: updates.status as Status, // Update main status
                    history: [newHistoryEntry, ...(tc.history || [])],
                };
            }
            return tc;
        };
        
        setTestCases(prev => prev.map(updateTestCaseState));
        setDetailsTestCase(prev => prev ? updateTestCaseState(prev) : null);
    };

    
    const handleSaveTestCase = async (data: Omit<NewTestCase, 'projectId'>) => {
        try {
            if (editingTestCaseId) {
                await updateTestCase(editingTestCaseId, data);
            } else {
                await createTestCase({ ...data, projectId: projectId! });
            }
            await fetchAllData();
        } catch (err) {
            console.error("Failed to save test case:", err);
            setError("An error occurred while saving the test case.");
        } finally {
            setIsTestCaseModalOpen(false);
        }
    };


    const totalPages = useMemo(() => Math.ceil(totalCases / rowsPerPage), [totalCases, rowsPerPage]);
    const areAllVisibleSelected = selectedCases.size > 0 && testCases.length > 0 && testCases.every(tc => selectedCases.has(tc.id));
    
    const statusOptions = project?.enableApprovals
        ? ['Draft', 'In Review', 'Approved', 'Need Update']
        : ['Draft', 'Ready'];

    const currentIndex = useMemo(() => {
        if (!detailsTestCase) return -1;
        return testCases.findIndex(c => c.id === detailsTestCase.id);
    }, [detailsTestCase, testCases]);

    const handleNext = () => {
        if (currentIndex !== -1 && currentIndex < testCases.length - 1) {
            setDetailsTestCase(testCases[currentIndex + 1]);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setDetailsTestCase(testCases[currentIndex - 1]);
        }
    };

    return (
        <>
            <div className="flex h-full gap-3">
                {/* Directory Sidebar */}
                <TestCaseDirectory 
                    activeDirectory={activeDirectory} 
                    onSelect={setActiveDirectory} 
                    userDirectories={userDirectories}
                    onAddDirectory={handleAddDirectoryClick}
                    onEditDirectory={handleEditDirectory}
                    onDeleteDirectory={handleDeleteDirectory}
                    specialDirectoryCounts={specialDirectoryCounts}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md min-w-0">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Test Cases</h1>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsAIGenerateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
                                    <SparklesIcon /> AI Generate Test Case
                                </button>
                                <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
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
                                    className="w-full pl-10 pr-4 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.search} onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                                />
                            </div>
                            <div className="relative w-full sm:w-auto">
                                <select className="w-full appearance-none pl-4 pr-10 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
                                    <option value="All">Status: All</option>
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative w-full sm:w-auto">
                                <select className="w-full appearance-none pl-4 pr-10 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={filters.priority} onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}>
                                    <option value="All">Priority: All</option>
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative w-full sm:w-auto">
                                <select className="w-full appearance-none pl-4 pr-10 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={filters.assignee} onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}>
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
                    
                    <div className="flex-1 overflow-auto">
                    <TestCaseTable 
                            testCases={testCases} 
                            loading={loading} 
                            error={error}
                            selectedCases={selectedCases}
                            onSelectItem={handleSelectItem}
                            onSelectAll={handleSelectAll}
                            areAllVisibleSelected={areAllVisibleSelected}
                            onDelete={(id) => handleDeleteRequest([id])}
                            onEdit={handleEditTestCase}
                            onViewDetails={handleViewDetails}
                            onDuplicate={() => {}}
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
                onMoveToTrash={handleConfirmMoveToTrash}
                onPermanentDelete={handleConfirmPermanentDelete}
                onRestore={handleConfirmRestore}
                itemCount={casesToDelete.size}
                isTrashMode={activeDirectory === 'Trash'}
            />
            <AddDirectoryModal
                isOpen={isAddDirectoryModalOpen}
                onClose={() => setIsAddDirectoryModalOpen(false)}
                onSave={handleSaveDirectory}
                parentId={addDirectoryParentId}
            />
            <EditDirectoryModal
                isOpen={isEditDirModalOpen}
                onClose={() => setIsEditDirModalOpen(false)}
                onSave={handleSaveDirectoryEdit}
                initialName={dirToModify?.label || ''}
            />
            <DeleteDirectoryModal
                isOpen={isDeleteDirModalOpen}
                onClose={() => setIsDeleteDirModalOpen(false)}
                onConfirm={handleConfirmDirectoryDelete}
                directoryName={dirToModify?.label || ''}
            />
            <AIGenerateModal
                isOpen={isAIGenerateModalOpen}
                onClose={handleAIGenerateClose}
                directories={userDirectories}
                projectId={projectId!}
            />
             {isTestCaseModalOpen && (
                <TestCaseFormModal
                    isOpen={isTestCaseModalOpen}
                    onClose={() => setIsTestCaseModalOpen(false)}
                    onSave={handleSaveTestCase}
                    projectId={projectId!}
                    testCaseId={editingTestCaseId}
                    directories={userDirectories}
                />
            )}
            <DetailsDrawer
                isOpen={!!detailsTestCase}
                onClose={() => setDetailsTestCase(null)}
                title="Test Case Details"
                headerActions={
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePrevious} 
                            disabled={currentIndex <= 0}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Previous test case"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleNext} 
                            disabled={currentIndex === -1 || currentIndex >= testCases.length - 1}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Next test case"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                }
            >
                {detailsTestCase &&
                    <TestCaseDetails
                        testCase={detailsTestCase}
                        onEdit={() => handleEditTestCase(detailsTestCase.id)}
                        onDelete={() => handleDeleteRequest([detailsTestCase.id])}
                        showResultSection={!!project?.enableApprovals}
                        resultStatusOptions={project?.enableApprovals ? ['Approved', 'Need Update', 'In Review', 'Draft'] : undefined}
                        onAddResult={handleAddResult as any}
                        users={users}
                    />
                }
            </DetailsDrawer>
        </>
    );
};

export default ProjectTestCasesPage;