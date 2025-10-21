// Path: src/components/features/test-runs/TestPlanDetails.tsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TestPlan, TestRun, StatusCounts } from '../../../services/testRunService';
import { Milestone } from '../../../services/milestoneService';
import { EditIcon, TrashIcon, CheckSuccessIcon } from '../../ui/Icons';
import ProgressBar from './ProgressBar';
import StatusBreakdown from './StatusBreakdown';
import CompletePlanConfirmationModal from './details/CompletePlanConfirmationModal';

interface TestPlanDetailsProps {
    plan: TestPlan;
    allRuns: TestRun[];
    allMilestones: Milestone[];
    onEdit: () => void;
    onDelete: () => void;
    onCompletePlan: (planId: string) => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 text-sm text-gray-900 dark:text-gray-200">{children}</div>
    </div>
);

const TestPlanDetails: React.FC<TestPlanDetailsProps> = ({ plan, allRuns, allMilestones, onEdit, onDelete, onCompletePlan }) => {
    const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
    const milestone = allMilestones.find(m => m.id === plan.milestoneId);
    const associatedRuns = allRuns.filter(run => plan.testRunIds.includes(run.id));

    const aggregatedStats = useMemo<StatusCounts>(() => {
        const newCounts: StatusCounts = { passed: 0, failed: 0, blocked: 0, skipped: 0, untested: 0, automationPassed: 0, automationFailed: 0, automationError: 0 };
        associatedRuns.forEach(run => {
            for (const key in newCounts) {
                newCounts[key as keyof StatusCounts] += run.statusCounts[key as keyof StatusCounts];
            }
        });
        return newCounts;
    }, [associatedRuns]);

    const totalTestCases = useMemo(() => {
        return associatedRuns.reduce((sum, run) => sum + run.totalTestCases, 0);
    }, [associatedRuns]);
    
    const hasNonCompletedRuns = useMemo(() => associatedRuns.some(r => r.status !== 'Completed'), [associatedRuns]);

    const handleCompleteClick = () => {
        const executedTestCases = totalTestCases - aggregatedStats.untested;
        const hasIssues = aggregatedStats.failed > 0 || aggregatedStats.blocked > 0 || aggregatedStats.automationFailed > 0 || aggregatedStats.automationError > 0;
        const progressPercentage = totalTestCases > 0 ? Math.round((executedTestCases / totalTestCases) * 100) : 100;

        if (progressPercentage < 100 || hasNonCompletedRuns || hasIssues) {
            setIsCompleteConfirmOpen(true);
        } else {
            onCompletePlan(plan.id);
        }
    };
    
    const handleConfirmCompletion = () => {
        onCompletePlan(plan.id);
        setIsCompleteConfirmOpen(false);
    };

    const openRuns = associatedRuns.filter(r => r.status === 'Open').length;
    const overdueRuns = associatedRuns.filter(r => r.status === 'Overdue').length;
    const completedRuns = associatedRuns.filter(r => r.status === 'Completed').length;

    return (
        <>
            <div className="space-y-6 pb-6">
                {/* Header */}
                <div className="pb-4 border-b dark:border-gray-600">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Created by {plan.createdBy} on {plan.createdAt}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {plan.status !== 'Completed' && (
                                <button
                                    onClick={handleCompleteClick}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    <CheckSuccessIcon className="w-4 h-4" /> Complete Plan
                                </button>
                            )}
                            <button 
                                onClick={onEdit} 
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <EditIcon className="w-4 h-4" /> Edit
                            </button>
                            <button 
                                onClick={onDelete} 
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <DetailSection title="Description">
                    <p className="whitespace-pre-wrap">{plan.description || 'No description provided.'}</p>
                </DetailSection>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailSection title="Due Date">
                        <p>{plan.dueDateStart} - {plan.dueDateEnd}</p>
                    </DetailSection>
                    <DetailSection title="Milestone">
                        <p>{milestone?.name || 'None'}</p>
                    </DetailSection>
                </div>

                <DetailSection title="Test Runs Status">
                    <p>Total test runs: <span className="font-bold">{associatedRuns.length}</span></p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <p>Open: <span className="font-bold">{openRuns}</span></p>
                        <p>Overdue: <span className="font-bold">{overdueRuns}</span></p>
                        <p>Completed: <span className="font-bold">{completedRuns}</span></p>
                    </div>
                </DetailSection>
                
                <DetailSection title="Overall Status">
                    <div className="space-y-3">
                        <StatusBreakdown counts={aggregatedStats} />
                        <ProgressBar counts={aggregatedStats} />
                    </div>
                </DetailSection>

                <DetailSection title="Included Test Runs">
                    {associatedRuns.length > 0 ? (
                        <div className="space-y-3">
                            {associatedRuns.map(run => (
                                <Link key={run.id} to={`/projects/${plan.projectId}/runs/${run.id}`} className="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600 space-y-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{run.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Created by {run.createdBy} on {run.createdAt}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${run.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : run.status === 'Overdue' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>
                                            {run.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Total test cases: <span className="font-bold">{run.totalTestCases}</span></p>
                                        <StatusBreakdown counts={run.statusCounts} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Due date: {run.dueDateStart} - {run.dueDateEnd}
                                        </p>
                                        <ProgressBar counts={run.statusCounts} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">No test runs are included in this plan.</p>
                    )}
                </DetailSection>
            </div>
            <CompletePlanConfirmationModal
                isOpen={isCompleteConfirmOpen}
                onClose={() => setIsCompleteConfirmOpen(false)}
                onConfirm={handleConfirmCompletion}
                statusCounts={aggregatedStats}
                totalTestCases={totalTestCases}
                hasNonCompletedRuns={hasNonCompletedRuns}
            />
        </>
    );
};

export default TestPlanDetails;