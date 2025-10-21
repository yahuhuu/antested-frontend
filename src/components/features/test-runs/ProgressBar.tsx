// Path: src/components/features/test-runs/ProgressBar.tsx
import React from 'react';
import { StatusCounts } from '../../../services/testRunService';

interface ProgressBarProps {
    counts: StatusCounts;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ counts }) => {
    // FIX: Explicitly convert `count` to a `Number` to prevent type errors during the reduction,
    // as `Object.values` can return `unknown[]` in strict TypeScript configurations.
    const total = Object.values(counts).reduce((sum, count) => sum + Number(count), 0);
    
    if (total === 0) {
        return (
             <div className="flex items-center gap-3">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5"></div>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 w-10 text-right">0%</span>
            </div>
        );
    }

    const segments = [
        { key: 'passed', value: counts.passed, color: 'bg-green-500' },
        { key: 'automationPassed', value: counts.automationPassed, color: 'bg-green-600' },
        { key: 'failed', value: counts.failed, color: 'bg-red-500' },
        { key: 'automationFailed', value: counts.automationFailed, color: 'bg-red-600' },
        { key: 'automationError', value: counts.automationError, color: 'bg-purple-600' },
        { key: 'blocked', value: counts.blocked, color: 'bg-gray-500' },
        { key: 'skipped', value: counts.skipped, color: 'bg-yellow-400' },
        { key: 'untested', value: counts.untested, color: 'bg-gray-200 dark:bg-gray-600' },
    ];

    const passedTotal = counts.passed + counts.automationPassed;
    const progressPercentage = Math.round((passedTotal / total) * 100);

    return (
        <div className="flex items-center gap-3">
            <div className="w-full flex h-2.5 overflow-hidden rounded-full text-xs">
                {segments.map(segment => {
                    if (segment.value > 0) {
                        const width = (segment.value / total) * 100;
                        return (
                            <div
                                key={segment.key}
                                style={{ width: `${width}%` }}
                                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${segment.color}`}
                                title={`${segment.value} ${segment.key}`}
                            ></div>
                        );
                    }
                    return null;
                })}
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-10 text-right">
                {progressPercentage}%
            </span>
        </div>
    );
};

export default ProgressBar;