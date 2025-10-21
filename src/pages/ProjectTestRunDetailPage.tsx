// Path: src/pages/ProjectTestRunDetailPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTestRunById, TestRun, StatusCounts } from '../services/testRunService';
import { getTestCasesByIds, getSelectableTestCases, TestCase, Priority, Status, TestCaseHistoryEntry } from '../services/testCaseService';
import { User, getUsers } from '../services/userService';

import OverallProgress from '../components/features/test-runs/details/OverallProgress';
import StatusPieChart from '../components/features/test-runs/details/StatusPieChart';
import { CheckSuccessIcon, ChevronDownIcon, BugIcon, SearchIcon, FolderIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon } from '../components/ui/Icons';
import { Checkbox } from '../components/ui/Checkbox';
import { TestCaseDirectory, DirectoryNode } from '../components/features/test-cases/TestCaseDirectory';
import { Pagination } from '../components/ui/Pagination';
import DetailsDrawer from '../components/ui/DetailsDrawer';
import TestCaseDetails from '../components/features/test-cases/TestCaseDetails';
import CompleteRunConfirmationModal from '../components/features/test-runs/details/CompleteRunConfirmationModal';
import DeleteFromRunConfirmationModal from '../components/features/test-runs/details/DeleteFromRunConfirmationModal';


type RunCaseStatus = 'Untested' | 'Passed' | 'Failed' | 'Blocked' | 'Skipped' | 'Automation Passed' | 'Automation Failed' | 'Automation Error';

type RunTestCase = TestCase & {
    runStatus: RunCaseStatus;
    history: TestCaseHistoryEntry[];
};

const statusOptions: RunCaseStatus[] = ['Untested', 'Passed', 'Failed', 'Blocked', 'Skipped', 'Automation Passed', 'Automation Failed', 'Automation Error'];

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


// --- Badge Components (copied for styling consistency) ---
const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
    const colors = {
        Critical: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400',
        High: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
        Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
        Low: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
    };
    return <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[priority]}`}>{priority}</span>;
};

const RunStatusBadge: React.FC<{ status: RunCaseStatus }> = ({ status }) => {
    const colors: Record<RunCaseStatus, string> = {
        Passed: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
        Failed: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
        Blocked: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
        Skipped: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
        Untested: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
        'Automation Passed': 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
        'Automation Failed': 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
        'Automation Error': 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400',
    };
    return <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>{status}</span>;
};

// --- Table Component ---
const TestRunExecutionTable: React.FC<{
    cases: RunTestCase[],
    selectedCaseIds: Set<string>,
    onSelectCase: (caseId: string, checked: boolean) => void,
    onSelectAll: (checked: boolean) => void,
    onViewDetails: (testCase: RunTestCase) => void;
}> = ({ cases, selectedCaseIds, onSelectCase, onSelectAll, onViewDetails }) => {
    
    const areAllVisibleSelected = cases.length > 0 && cases.every(tc => selectedCaseIds.has(tc.id));
    
    return (
        <table className="min-w-full">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                <tr>
                    <th className="px-4 py-4 w-12"><Checkbox id="cb-all-run-cases" checked={areAllVisibleSelected} onChange={e => onSelectAll(e.target.checked)} /></th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Case ID</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignee</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {cases.map((testCase) => (
                    <tr key={testCase.id} onClick={() => onViewDetails(testCase)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <Checkbox id={`cb-run-${testCase.id}`} checked={selectedCaseIds.has(testCase.id)} onChange={e => onSelectCase(testCase.id, e.target.checked)} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{testCase.caseId}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 truncate" style={{ maxWidth: '200px' }} title={testCase.name}>{testCase.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge priority={testCase.priority} /></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <RunStatusBadge status={testCase.runStatus} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{testCase.assignee}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};


const initialUserDirectories: DirectoryNode[] = [
    { id: 'authentication', label: 'Authentication', icon: <FolderIcon />, children: [ { id: 'authentication/login', label: 'Login', icon: <FolderIcon /> }, { id: 'authentication/register', label: 'Register', icon: <FolderIcon /> }, { id: 'authentication/forgot-password', label: 'Forgot Password', icon: <FolderIcon /> }, ] }, { id: 'dashboard', label: 'Dashboard', icon: <FolderIcon /> }
];

const ProjectTestRunDetailPage: React.FC = () => {
    const { projectId, runId } = useParams<{ projectId: string; runId: string }>();
    const [run, setRun] = useState<TestRun | null>(null);
    const [runTestCases, setRunTestCases] = useState<RunTestCase[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set());
    const [detailsTestCase, setDetailsTestCase] = useState<RunTestCase | null>(null);
    const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
    const [isDeleteFromRunModalOpen, setIsDeleteFromRunModalOpen] = useState(false);
    
    // State for filtering and pagination
    const [activeDirectory, setActiveDirectory] = useState('All');
    const [filters, setFilters] = useState({ search: '', status: 'All', priority: 'All', assignee: 'All' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [userDirectories, setUserDirectories] = useState<DirectoryNode[]>(initialUserDirectories);
    const [specialDirectoryCounts, setSpecialDirectoryCounts] = useState({ all: 0, drafts: 0, trash: 0 });

    const fetchData = useCallback(async () => {
        if (!projectId || !runId) return;
        setLoading(true);
        setError('');
        try {
            const [runData, userData] = await Promise.all([ getTestRunById(runId), getUsers() ]);
            if (!runData) throw new Error("Test Run not found.");
            
            setRun(runData);
            setUsers(userData);

            const initialAssigneeName = runData.assigneeId ? userData.find(u => u.id === runData.assigneeId)?.name : undefined;
            
            let casesData: TestCase[];
            if (runData.includeAll) {
                casesData = await getSelectableTestCases(projectId);
            } else {
                casesData = await getTestCasesByIds(runData.testCaseIds);
            }
            
            const distributeStatuses = (cases: TestCase[], counts: StatusCounts, defaultAssignee?: string): RunTestCase[] => {
                const casesWithDefaults: RunTestCase[] = cases.map(tc => ({
                    ...tc,
                    assignee: defaultAssignee || tc.assignee,
                    runStatus: 'Untested',
                    history: []
                }));

                const shuffledIndices = shuffleArray(Array.from(Array(casesWithDefaults.length).keys()));
                let masterIndex = 0;
                
                const statusMap: { [key in keyof StatusCounts]: RunCaseStatus | null } = {
                    passed: 'Passed', failed: 'Failed', blocked: 'Blocked', skipped: 'Skipped', 
                    automationPassed: 'Automation Passed', automationFailed: 'Automation Failed', automationError: 'Automation Error',
                    untested: null, // We don't need to explicitly set untested
                };

                for (const key of Object.keys(statusMap) as Array<keyof StatusCounts>) {
                    const statusToApply = statusMap[key];
                    if (!statusToApply) continue;

                    const count = counts[key];
                    for (let i = 0; i < count; i++) {
                        if (masterIndex < shuffledIndices.length) {
                            const caseIndexToUpdate = shuffledIndices[masterIndex];
                            casesWithDefaults[caseIndexToUpdate].runStatus = statusToApply;
                            masterIndex++;
                        }
                    }
                }
                casesWithDefaults.sort((a, b) => a.caseId.localeCompare(b.caseId));
                return casesWithDefaults;
            };
            
            const finalCases = distributeStatuses(casesData, runData.statusCounts, initialAssigneeName);
            setRunTestCases(finalCases);

        } catch (err) {
            console.error(err);
            setError("Failed to load test run details.");
        } finally {
            setLoading(false);
        }
    }, [projectId, runId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (runTestCases.length === 0) return;

        const calculateDirectoryCounts = () => {
             const allCount = runTestCases.length;
             setSpecialDirectoryCounts({ all: allCount, drafts: 0, trash: 0 });

             const updateCounts = (nodes: DirectoryNode[]): DirectoryNode[] => {
                return nodes.map(node => {
                    const count = runTestCases.filter(tc => tc.directory.startsWith(node.id)).length;
                    const updatedNode: DirectoryNode = { ...node, count };
                    if (node.children) {
                        updatedNode.children = updateCounts(node.children);
                    }
                    return updatedNode;
                });
            };
            setUserDirectories(updateCounts(initialUserDirectories));
        };
        calculateDirectoryCounts();
    }, [runTestCases]);

     useEffect(() => {
        setCurrentPage(1);
        setSelectedCaseIds(new Set());
    }, [filters, rowsPerPage, activeDirectory]);

    const currentStatusCounts = useMemo<StatusCounts>(() => {
        const counts: StatusCounts = {
            passed: 0, failed: 0, blocked: 0, skipped: 0, untested: 0,
            automationPassed: 0,
            automationFailed: 0,
            automationError: 0,
        };
    
        runTestCases.forEach(tc => {
            switch (tc.runStatus) {
                case 'Passed': counts.passed++; break;
                case 'Failed': counts.failed++; break;
                case 'Blocked': counts.blocked++; break;
                case 'Skipped': counts.skipped++; break;
                case 'Untested': counts.untested++; break;
                case 'Automation Passed': counts.automationPassed++; break;
                case 'Automation Failed': counts.automationFailed++; break;
                case 'Automation Error': counts.automationError++; break;
            }
        });
    
        return counts;
    }, [runTestCases]);
    
    const uniqueAssignees = useMemo(() => {
        const assignees = new Set(runTestCases.map(tc => tc.assignee).filter(Boolean));
        return Array.from(assignees);
    }, [runTestCases]);

    const displayRunData = useMemo<TestRun | null>(() => {
        if (!run) return null;
        return { ...run, statusCounts: currentStatusCounts };
    }, [run, currentStatusCounts]);


    const filteredCases = useMemo(() => {
        return runTestCases.filter(tc => {
            const dirFilter = activeDirectory === 'All' ? true : tc.directory.startsWith(activeDirectory);
            const searchLower = filters.search.toLowerCase();
            const searchFilter = tc.name.toLowerCase().includes(searchLower) || tc.caseId.toLowerCase().includes(searchLower);
            const statusFilter = filters.status === 'All' ? true : tc.runStatus === filters.status;
            const priorityFilter = filters.priority === 'All' ? true : tc.priority === filters.priority;
            const assigneeFilter = filters.assignee === 'All' ? true : tc.assignee === filters.assignee;

            return dirFilter && searchFilter && statusFilter && priorityFilter && assigneeFilter;
        });
    }, [runTestCases, activeDirectory, filters]);

    const totalCases = filteredCases.length;
    const totalPages = Math.ceil(totalCases / rowsPerPage);
    const paginatedCases = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredCases.slice(start, start + rowsPerPage);
    }, [filteredCases, currentPage, rowsPerPage]);
    
    const handleSelectCase = (caseId: string, checked: boolean) => {
        setSelectedCaseIds(prev => { const newSet = new Set(prev); if (checked) newSet.add(caseId); else newSet.delete(caseId); return newSet; });
    };
    
    const handleSelectAllPaginated = (checked: boolean) => {
        setSelectedCaseIds(prev => {
            const newSet = new Set(prev);
            paginatedCases.forEach(tc => {
                if(checked) newSet.add(tc.id);
                else newSet.delete(tc.id);
            });
            return newSet;
        });
    };
    
    const handleBulkAssigneeChange = (newAssigneeName: string) => {
        if (newAssigneeName && selectedCaseIds.size > 0) {
            setRunTestCases(prevCases =>
                prevCases.map(c => {
                    if (selectedCaseIds.has(c.id)) {
                        return { ...c, assignee: newAssigneeName };
                    }
                    return c;
                })
            );
        }
    };

    const handleBulkStatusChange = (newStatus: RunCaseStatus) => {
        if (newStatus && selectedCaseIds.size > 0) {
            setRunTestCases(prevCases =>
                prevCases.map(c => {
                    if (selectedCaseIds.has(c.id)) {
                        const newHistoryEntry: TestCaseHistoryEntry = {
                            id: `hist-${Date.now()}-${c.id}`,
                            status: newStatus,
                            comment: '', // No comment for bulk updates
                            createdBy: 'Admin User', // Mocked current user
                            createdAt: new Date().toLocaleString(),
                            attachments: [],
                        };
                        return {
                            ...c,
                            runStatus: newStatus,
                            history: [newHistoryEntry, ...(c.history || [])],
                        };
                    }
                    return c;
                })
            );
        }
    };
    
    const handleViewDetails = (testCase: RunTestCase) => {
        setDetailsTestCase(testCase);
    };
    
    const handleAssigneeChange = (testCaseId: string, newAssigneeName: string) => {
        const updateTestCaseState = (tc: RunTestCase) => {
            if (tc.id === testCaseId) {
                return { ...tc, assignee: newAssigneeName };
            }
            return tc;
        };
        setRunTestCases(prevCases => prevCases.map(updateTestCaseState));
        setDetailsTestCase(prev => (prev && prev.id === testCaseId ? updateTestCaseState(prev) : prev));
    };

    const handleAddResult = (testCaseId: string, updates: { status: string; comment: string; assignedToId: string; attachments: File[] }) => {
        const updateTestCaseState = (tc: RunTestCase) => {
             if (tc.id === testCaseId) {
                const newHistoryEntry: TestCaseHistoryEntry = {
                    id: `hist-${Date.now()}`,
                    status: updates.status,
                    comment: updates.comment,
                    assignedToId: updates.assignedToId,
                    attachments: updates.attachments,
                    createdBy: 'Admin User', // Mocked current user
                    createdAt: new Date().toLocaleString(),
                };
                return {
                    ...tc,
                    runStatus: updates.status as RunCaseStatus,
                    history: [newHistoryEntry, ...tc.history],
                };
            }
            return tc;
        };
        
        setRunTestCases(prevCases => prevCases.map(updateTestCaseState));
        setDetailsTestCase(prev => prev ? updateTestCaseState(prev) : null);
    };

    const handleAddResultAndNext = (testCaseId: string, updates: { status: string; comment: string; assignedToId: string; attachments: File[] }) => {
        handleAddResult(testCaseId, updates);

        const currentIndex = paginatedCases.findIndex(c => c.id === testCaseId);
        if (currentIndex !== -1 && currentIndex < paginatedCases.length - 1) {
            setDetailsTestCase(paginatedCases[currentIndex + 1]);
        } else {
            setDetailsTestCase(null);
        }
    };
    
    const currentIndex = useMemo(() => {
        if (!detailsTestCase) return -1;
        return paginatedCases.findIndex(c => c.id === detailsTestCase.id);
    }, [detailsTestCase, paginatedCases]);

    const handleNext = () => {
        if (currentIndex !== -1 && currentIndex < paginatedCases.length - 1) {
            setDetailsTestCase(paginatedCases[currentIndex + 1]);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setDetailsTestCase(paginatedCases[currentIndex - 1]);
        }
    };

    const handleConfirmCompleteRun = useCallback(() => {
        if (run) {
            setRun(prevRun => {
                if (!prevRun) return null;
                return { ...prevRun, status: 'Completed' };
            });
        }
        setIsCompleteConfirmOpen(false);
    }, [run]);

    const handleCompleteRun = useCallback(() => {
        if (!run) return;
    
        const passedTotal = currentStatusCounts.passed + currentStatusCounts.automationPassed;
        const failedTotal = currentStatusCounts.failed + currentStatusCounts.automationFailed + currentStatusCounts.automationError;
    
        const isComplete = currentStatusCounts.untested === 0;
        const hasIssues = failedTotal > 0 || currentStatusCounts.blocked > 0;
    
        if (isComplete && !hasIssues) {
            // If 100% done and no issues, complete directly
            handleConfirmCompleteRun();
        } else {
            // Otherwise, show confirmation
            setIsCompleteConfirmOpen(true);
        }
    }, [run, currentStatusCounts, handleConfirmCompleteRun]);
    
    const handleConfirmDeleteFromRun = () => {
        setRunTestCases(prevCases =>
            prevCases.filter(c => !selectedCaseIds.has(c.id))
        );
        setSelectedCaseIds(new Set());
        setIsDeleteFromRunModalOpen(false);
    };

    if (loading) return <p className="text-center p-8">Loading test run...</p>;
    if (error) return <p className="text-center p-8 text-red-500">{error}</p>;
    if (!run) return <p className="text-center p-8">Test Run not found.</p>;
    
    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <Link to={`/projects/${projectId}/runs`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">&larr; Back to Test Runs</Link>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{run.name}</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{run.description}</p>
                    </div>
                     {run.status !== 'Completed' && (
                        <button 
                            onClick={handleCompleteRun}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors whitespace-nowrap"
                        >
                            <CheckSuccessIcon className="w-5 h-5" />
                            Complete Test Run
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1"><OverallProgress run={displayRunData} assigneeNames={uniqueAssignees} /></div>
                    <div className="lg:col-span-2"><StatusPieChart counts={displayRunData?.statusCounts || null} /></div>
                </div>

                <div className="flex h-full gap-4">
                    <TestCaseDirectory 
                        activeDirectory={activeDirectory}
                        onSelect={setActiveDirectory}
                        userDirectories={userDirectories}
                        specialDirectoryCounts={specialDirectoryCounts}
                        showSystemFolders={false}
                    />

                    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md min-w-0">
                        <div className="p-4 border-b dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4">Test Cases</h2>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative w-full sm:w-auto flex-grow">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text" placeholder="Search cases..."
                                        className="w-full pl-10 pr-4 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={filters.search} onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                                    />
                                </div>
                                <div className="relative w-full sm:w-auto">
                                    <select className="w-full appearance-none pl-4 pr-10 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
                                        <option value="All">Status: All</option>
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="relative w-full sm:w-auto">
                                    <select className="w-full appearance-none pl-4 pr-10 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={filters.priority} onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}>
                                        <option value="All">Priority: All</option>
                                        <option value="Critical">Critical</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="relative w-full sm:w-auto">
                                    <select className="w-full appearance-none pl-4 pr-10 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={filters.assignee} onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}>
                                        <option value="All">Assignee: All</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.name}>{user.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                                 {selectedCaseIds.size > 0 && (
                                    <>
                                        <div className="relative w-full sm:w-auto">
                                            <select 
                                                onChange={(e) => { handleBulkStatusChange(e.target.value as RunCaseStatus); (e.target as HTMLSelectElement).value = ""; }}
                                                className="w-full appearance-none pl-4 pr-10 py-1.5 bg-blue-600 text-white font-semibold border border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Set Status ({selectedCaseIds.size})</option>
                                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
                                        </div>
                                        <div className="relative w-full sm:w-auto">
                                            <select
                                                onChange={(e) => { handleBulkAssigneeChange(e.target.value); (e.target as HTMLSelectElement).value = ""; }}
                                                className="w-full appearance-none pl-4 pr-10 py-1.5 bg-blue-600 text-white font-semibold border border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Set Assignee ({selectedCaseIds.size})</option>
                                                {users.map(user => <option key={user.id} value={user.name}>{user.name}</option>)}
                                            </select>
                                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
                                        </div>
                                        <button
                                            onClick={() => setIsDeleteFromRunModalOpen(true)}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                            Remove from Test Run
                                        </button>
                                    </>
                                 )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <TestRunExecutionTable 
                                cases={paginatedCases} 
                                selectedCaseIds={selectedCaseIds}
                                onSelectCase={handleSelectCase}
                                onSelectAll={handleSelectAllPaginated}
                                onViewDetails={handleViewDetails}
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
            </div>
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
                            disabled={currentIndex === -1 || currentIndex >= paginatedCases.length - 1}
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
                        showResultSection={true}
                        resultStatusOptions={statusOptions}
                        onAddResult={handleAddResult}
                        onAddResultAndNext={handleAddResultAndNext}
                        users={users}
                        onAssigneeChange={handleAssigneeChange}
                        isAssigneeEditable={true}
                    />
                }
            </DetailsDrawer>
            <CompleteRunConfirmationModal
                isOpen={isCompleteConfirmOpen}
                onClose={() => setIsCompleteConfirmOpen(false)}
                onConfirm={handleConfirmCompleteRun}
                statusCounts={currentStatusCounts}
                totalTestCases={run.totalTestCases}
            />
            <DeleteFromRunConfirmationModal
                isOpen={isDeleteFromRunModalOpen}
                onClose={() => setIsDeleteFromRunModalOpen(false)}
                onConfirm={handleConfirmDeleteFromRun}
                itemCount={selectedCaseIds.size}
            />
        </>
    );
};

export default ProjectTestRunDetailPage;