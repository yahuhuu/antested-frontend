// Path: src/components/features/test-runs/TestCaseSelectionModal.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSelectableTestCases, TestCase } from '../../../services/testCaseService';
import { TestCaseDirectory, DirectoryNode } from '../test-cases/TestCaseDirectory';
import { TestCaseTable } from '../test-cases/TestCaseTable';
import { Pagination } from '../../ui/Pagination';
import { FolderIcon, DraftIcon, TrashIcon } from '../../ui/Icons';

interface TestCaseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
  projectId: string;
  initialSelectedIds: string[];
}

// Re-create the initial directory structure here to avoid dependency loops if moved to a shared file
const initialUserDirectories: DirectoryNode[] = [
    { id: 'authentication', label: 'Authentication', icon: <FolderIcon />, children: [ { id: 'authentication/login', label: 'Login', icon: <FolderIcon /> }, { id: 'authentication/register', label: 'Register', icon: <FolderIcon /> }, { id: 'authentication/forgot-password', label: 'Forgot Password', icon: <FolderIcon /> }, ] }, { id: 'dashboard', label: 'Dashboard', icon: <FolderIcon /> }
];

const TestCaseSelectionModal: React.FC<TestCaseSelectionModalProps> = ({ isOpen, onClose, onConfirm, projectId, initialSelectedIds }) => {
    const [allTestCases, setAllTestCases] = useState<TestCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
    const [activeDirectory, setActiveDirectory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [userDirectories, setUserDirectories] = useState<DirectoryNode[]>(initialUserDirectories);
    const [specialDirectoryCounts, setSpecialDirectoryCounts] = useState({ all: 0, drafts: 0, trash: 0 });


    const fetchData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await getSelectableTestCases(projectId);
            setAllTestCases(data);
        } catch (err) {
            console.error("Failed to load selectable test cases", err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, fetchData]);

    useEffect(() => {
        const calculateCounts = () => {
             const allCount = allTestCases.length;
             setSpecialDirectoryCounts({ all: allCount, drafts: 0, trash: 0 }); // Drafts/Trash not relevant here

             const updateCounts = (nodes: DirectoryNode[]): DirectoryNode[] => {
                return nodes.map(node => {
                    const count = allTestCases.filter(tc => tc.directory.startsWith(node.id)).length;
                    const updatedNode: DirectoryNode = { ...node, count };
                    if (node.children) {
                        updatedNode.children = updateCounts(node.children);
                    }
                    return updatedNode;
                });
            };
            setUserDirectories(updateCounts(initialUserDirectories));
        };
        if (allTestCases.length > 0) {
            calculateCounts();
        }
    }, [allTestCases]);

    const filteredTestCases = useMemo(() => {
        if (activeDirectory === 'All') return allTestCases;
        return allTestCases.filter(tc => tc.directory.startsWith(activeDirectory));
    }, [allTestCases, activeDirectory]);

    const totalCases = filteredTestCases.length;
    const totalPages = Math.ceil(totalCases / rowsPerPage);

    const paginatedTestCases = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredTestCases.slice(start, start + rowsPerPage);
    }, [filteredTestCases, currentPage, rowsPerPage]);

    const handleConfirm = () => {
        onConfirm(Array.from(selectedIds));
    };
    
    const handleSelectItem = (id: string, checked: boolean) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (checked) newSet.add(id);
            else newSet.delete(id);
            return newSet;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (checked) {
                paginatedTestCases.forEach(tc => newSet.add(tc.id));
            } else {
                paginatedTestCases.forEach(tc => newSet.delete(tc.id));
            }
            return newSet;
        });
    };

    const handleDirectorySelect = (directoryId: string, isSelected: boolean) => {
        const idsToChange = (directoryId === 'All'
            ? allTestCases 
            : allTestCases.filter(tc => tc.directory.startsWith(directoryId))
        ).map(tc => tc.id);

        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                idsToChange.forEach(id => newSet.add(id));
            } else {
                idsToChange.forEach(id => newSet.delete(id));
            }
            return newSet;
        });
    };


    const areAllVisibleSelected = paginatedTestCases.length > 0 && paginatedTestCases.every(tc => selectedIds.has(tc.id));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl m-4 flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">Select Test Cases</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Select test cases to include in the run. Test cases with a 'Draft' status are not shown.</p>
                </div>
                
                <div className="flex-grow p-5 flex gap-4 overflow-hidden">
                    <div className="w-1/4 flex-shrink-0">
                        <TestCaseDirectory
                            activeDirectory={activeDirectory}
                            onSelect={setActiveDirectory}
                            userDirectories={userDirectories}
                            specialDirectoryCounts={specialDirectoryCounts}
                            selectionMode={true}
                            allTestCases={allTestCases}
                            selectedTestCaseIds={selectedIds}
                            onDirectorySelect={handleDirectorySelect}
                        />
                    </div>
                    <div className="w-3/4 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                        <div className="flex-1 overflow-auto">
                            <TestCaseTable 
                                testCases={paginatedTestCases}
                                loading={loading}
                                error={""}
                                selectedCases={selectedIds}
                                onSelectItem={handleSelectItem}
                                onSelectAll={handleSelectAll}
                                areAllVisibleSelected={areAllVisibleSelected}
                                onDelete={() => {}} // Not applicable here
                                onEdit={() => {}}   // Not applicable here
                                onViewDetails={() => {}} // Not applicable here
                                onDuplicate={() => {}} // Not applicable here
                                showActions={false}
                                showAssignee={false}
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

                <div className="p-5 flex justify-between items-center border-t dark:border-gray-700 flex-shrink-0">
                    <div className="text-sm font-semibold">{selectedIds.size} test cases selected</div>
                    <div className="flex space-x-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg">Cancel</button>
                        <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestCaseSelectionModal;
