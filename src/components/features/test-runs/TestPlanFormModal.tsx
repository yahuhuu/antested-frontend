// Path: src/components/features/test-runs/TestPlanFormModal.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import { TestPlan, NewTestPlan, TestRun, getTestRuns } from '../../../services/testRunService';
import { Milestone, getMilestones } from '../../../services/milestoneService';
import { XIcon, TrashIcon, ChevronDownIcon } from '../../ui/Icons';

interface TestPlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (planData: NewTestPlan | TestPlan) => void;
    plan: TestPlan | null;
    projectId: string;
}

const TestPlanFormModal: React.FC<TestPlanFormModalProps> = ({ isOpen, onClose, onSave, plan, projectId }) => {
    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [milestoneId, setMilestoneId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedRunIds, setSelectedRunIds] = useState<Set<string>>(new Set());
    
    // Data from services
    const [allMilestones, setAllMilestones] = useState<Milestone[]>([]);
    const [allRuns, setAllRuns] = useState<TestRun[]>([]);

    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({ name: '' });

    useEffect(() => {
        if (isOpen && projectId) {
            getMilestones(projectId).then(setAllMilestones);
            getTestRuns(projectId).then(setAllRuns);

            if (plan) {
                setName(plan.name);
                setDescription(plan.description);
                setMilestoneId(plan.milestoneId || '');
                // Convert DD-MM-YYYY from service to YYYY-MM-DD for input[type=date]
                setStartDate(plan.dueDateStart ? plan.dueDateStart.split('-').reverse().join('-') : '');
                setEndDate(plan.dueDateEnd ? plan.dueDateEnd.split('-').reverse().join('-') : '');
                setSelectedRunIds(new Set(plan.testRunIds));
            } else {
                // Reset form for new plan
                setName('');
                setDescription('');
                setMilestoneId('');
                setStartDate('');
                setEndDate('');
                setSelectedRunIds(new Set());
            }
            setIsSaving(false);
            setErrors({ name: '' });
        }
    }, [isOpen, plan, projectId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setErrors({ name: 'Plan Name is required.' });
            return;
        }
        
        setIsSaving(true);
        const planData = {
            name,
            description,
            milestoneId,
            // Convert YYYY-MM-DD from input back to DD-MM-YYYY for service
            dueDateStart: startDate ? startDate.split('-').reverse().join('-') : '',
            dueDateEnd: endDate ? endDate.split('-').reverse().join('-') : '',
            testRunIds: Array.from(selectedRunIds),
            projectId: projectId,
        };

        if (plan) {
            onSave({ ...plan, ...planData });
        } else {
            onSave(planData as NewTestPlan);
        }
    };
    
    const handleAddRun = (e: ChangeEvent<HTMLSelectElement>) => {
        const runId = e.target.value;
        if (runId) {
            setSelectedRunIds(prev => new Set(prev).add(runId));
            e.target.value = ''; // Reset select
        }
    };

    const handleRemoveRun = (runId: string) => {
        setSelectedRunIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(runId);
            return newSet;
        });
    };

    if (!isOpen) return null;

    const availableRuns = allRuns.filter(r => !selectedRunIds.has(r.id));
    const selectedRuns = Array.from(selectedRunIds).map(id => allRuns.find(r => r.id === id)).filter(Boolean) as TestRun[];

    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl m-4 flex flex-col max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {plan ? 'Edit Test Plan' : 'Add New Test Plan'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon className="w-6 h-6" /></button>
                </div>
                
                <form id="plan-form" onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-grow space-y-4">
                    <div>
                        <label htmlFor="planName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input type="text" id="planName" value={name} onChange={e => setName(e.target.value)} className={`${inputStyle} ${errors.name ? 'border-red-500' : ''}`} required />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="planDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea id="planDescription" value={description} onChange={e => setDescription(e.target.value)} className={`${inputStyle} resize-none h-24`} />
                    </div>

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

                    <div className="flex flex-col flex-1 min-h-0 pt-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Runs</label>
                        <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 flex flex-col flex-grow h-48">
                            <div className="flex-grow overflow-y-auto p-2 space-y-2">
                                {selectedRuns.length > 0 ? selectedRuns.map(run => (
                                    <div key={run.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800/50 p-2 rounded-md">
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{run.name}</p>
                                        <button type="button" onClick={() => handleRemoveRun(run.id)} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                )) : (
                                    <div className="flex items-center justify-center h-full text-xs text-gray-500 dark:text-gray-400">No test runs added to this plan.</div>
                                )}
                            </div>
                            <div className="relative border-t border-gray-300 dark:border-gray-600 flex-shrink-0">
                                <select onChange={handleAddRun} value="" className="w-full appearance-none pl-9 pr-4 py-2 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                                    <option value="" disabled>Add test run...</option>
                                    {availableRuns.map(run => <option key={run.id} value={run.id}>{run.name}</option>)}
                                </select>
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">+</span>
                                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="pt-4 p-5 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 flex-nowrap">
                    <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 transition">Cancel</button>
                    <button type="submit" form="plan-form" disabled={isSaving} className="px-4 py-2 w-40 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center">
                        {isSaving ? (
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                        ) : (
                        plan ? 'Save Changes' : 'Add Test Plan'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestPlanFormModal;