// Path: src/components/features/test-runs/TestRunFormModal.tsx
import React, { useState, useEffect } from 'react';
import { TestRun, NewTestRun } from '../../../services/testRunService';
import { Milestone, getMilestones } from '../../../services/milestoneService';
import { User, getUsers } from '../../../services/userService';
import { XIcon, ChevronDownIcon } from '../../ui/Icons';
import TestCaseSelectionModal from './TestCaseSelectionModal';

interface TestRunFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (runData: NewTestRun | TestRun) => void;
    run: TestRun | null;
    projectId: string;
}

const TestRunFormModal: React.FC<TestRunFormModalProps> = ({ isOpen, onClose, onSave, run, projectId }) => {
    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [milestoneId, setMilestoneId] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [includeAll, setIncludeAll] = useState(true);
    const [testCaseIds, setTestCaseIds] = useState<string[]>([]);
    
    // Data from services
    const [allMilestones, setAllMilestones] = useState<Milestone[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({ name: '' });

    // State for the selection modal
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && projectId) {
            getMilestones(projectId).then(setAllMilestones);
            getUsers().then(setAllUsers);

            if (run) {
                setName(run.name);
                setDescription(run.description);
                setMilestoneId(run.milestoneId || '');
                setAssigneeId(run.assigneeId || '');
                setStartDate(run.dueDateStart ? run.dueDateStart.split('-').reverse().join('-') : '');
                setEndDate(run.dueDateEnd ? run.dueDateEnd.split('-').reverse().join('-') : '');
                setIncludeAll(run.includeAll);
                setTestCaseIds(run.testCaseIds || []);
            } else {
                // Reset form for new run
                setName('');
                setDescription('');
                setMilestoneId('');
                setAssigneeId('');
                setStartDate('');
                setEndDate('');
                setIncludeAll(true);
                setTestCaseIds([]);
            }
            setIsSaving(false);
            setErrors({ name: '' });
        }
    }, [isOpen, run, projectId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setErrors({ name: 'Run Name is required.' });
            return;
        }
        
        setIsSaving(true);
        const runData = {
            name,
            description,
            milestoneId,
            assigneeId,
            dueDateStart: startDate ? startDate.split('-').reverse().join('-') : '',
            dueDateEnd: endDate ? endDate.split('-').reverse().join('-') : '',
            includeAll,
            testCaseIds: includeAll ? [] : testCaseIds,
            projectId: projectId,
        };

        if (run) {
            onSave({ ...run, ...runData });
        } else {
            onSave(runData as NewTestRun);
        }
    };
    
    const handleTestCaseSelectionConfirm = (selectedIds: string[]) => {
        setTestCaseIds(selectedIds);
        setIsSelectionModalOpen(false);
    };

    if (!isOpen) return null;

    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl m-4 flex flex-col max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            {run ? 'Edit Test Run' : 'Add Test Run'}
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon className="w-6 h-6" /></button>
                    </div>
                    
                    <form id="run-form" onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-grow space-y-4">
                        <div>
                            <label htmlFor="runName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input type="text" id="runName" value={name} onChange={e => setName(e.target.value)} className={`${inputStyle} ${errors.name ? 'border-red-500' : ''}`} required />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="runDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea id="runDescription" value={description} onChange={e => setDescription(e.target.value)} className={`${inputStyle} resize-none h-24`} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="milestone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Milestone</label>
                                <div className="relative">
                                    <select id="milestone" value={milestoneId} onChange={e => setMilestoneId(e.target.value)} className={`${inputStyle} appearance-none pr-10`}>
                                        <option value="">None</option>
                                        {allMilestones.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign To</label>
                                <div className="relative">
                                    <select id="assignee" value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className={`${inputStyle} appearance-none pr-10`}>
                                        <option value="">Unassigned</option>
                                        {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputStyle} />
                            </div>
                        </div>

                        <fieldset className="pt-2">
                            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">Test Cases</legend>
                            <div className="mt-2 space-y-4">
                                <div className="relative flex items-start p-4 border rounded-md dark:border-gray-600">
                                    <div className="flex h-5 items-center">
                                        <input id="include-all" name="testcase-selection" type="radio" checked={includeAll} onChange={() => setIncludeAll(true)} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="include-all" className="font-medium text-gray-700 dark:text-gray-200">Include all test cases</label>
                                        <p className="text-gray-500 dark:text-gray-400">Select this option to include all test cases in this test run. If new test cases are added to the repository, they are also automatically included in this run.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-start p-4 border rounded-md dark:border-gray-600">
                                    <div className="flex h-5 items-center">
                                        <input id="select-specific" name="testcase-selection" type="radio" checked={!includeAll} onChange={() => setIncludeAll(false)} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="select-specific" className="font-medium text-gray-700 dark:text-gray-200">Select specific test cases</label>
                                        <p className="text-gray-500 dark:text-gray-400">You can alternatively select the test cases to include in this test run. New test cases are not automatically added to this run in this case.</p>
                                        {!includeAll && (
                                            <div className="mt-2">
                                                <span className="font-bold text-gray-800 dark:text-white">{testCaseIds.length}</span> test cases included
                                                (<button type="button" onClick={() => setIsSelectionModalOpen(true)} className="text-blue-600 dark:text-blue-400 hover:underline">change selection</button>)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                    </form>

                    <div className="pt-4 p-5 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 transition">Cancel</button>
                        <button type="submit" form="run-form" disabled={isSaving} className="px-4 py-2 w-36 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 transition flex justify-center items-center">
                            {isSaving ? 'Saving...' : (run ? 'Save Changes' : 'Add Test Run')}
                        </button>
                    </div>
                </div>
            </div>
            {isSelectionModalOpen && (
                <TestCaseSelectionModal
                    isOpen={isSelectionModalOpen}
                    onClose={() => setIsSelectionModalOpen(false)}
                    onConfirm={handleTestCaseSelectionConfirm}
                    projectId={projectId}
                    initialSelectedIds={testCaseIds}
                />
            )}
        </>
    );
};

export default TestRunFormModal;