// Path: src/components/features/test-runs/details/OverallProgress.tsx
import React from 'react';
import { TestRun } from '../../../../services/testRunService';
import ProgressBar from '../ProgressBar';
import { UserIcon } from '../../../ui/Icons';

interface OverallProgressProps {
    run: TestRun | null;
    assigneeNames?: string[];
}

const OverallProgress: React.FC<OverallProgressProps> = ({ run, assigneeNames = [] }) => {
    if (!run) {
        return <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">Loading...</div>;
    }

    const { totalTestCases, statusCounts } = run;
    const executed = totalTestCases - statusCounts.untested;
    const completionPercentage = totalTestCases > 0 ? Math.round((executed / totalTestCases) * 100) : 0;

    const displayNames = assigneeNames.slice(0, 2);
    const remainingCount = assigneeNames.length - displayNames.length;
    const assigneeText = displayNames.join(', ') + (remainingCount > 0 ? ` and ${remainingCount} more` : '');
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex-shrink-0">Overall Progress</h3>
            <div className="mt-4 space-y-4 flex-grow flex flex-col justify-center">
                <ProgressBar counts={statusCounts} />
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <span>Progress</span>
                    <span className="font-semibold">{completionPercentage}%</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <span>Executed</span>
                    <span className="font-semibold">{executed} of {totalTestCases}</span>
                </div>
                 <div className="pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
                            <p className="font-semibold" title={assigneeNames.join(', ')}>{assigneeText || 'Unassigned'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverallProgress;