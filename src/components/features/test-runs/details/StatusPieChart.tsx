// Path: src/components/features/test-runs/details/StatusPieChart.tsx
import React from 'react';
import { StatusCounts } from '../../../../services/testRunService';

interface StatusPieChartProps {
    counts: StatusCounts | null;
}

type StatusKey = keyof StatusCounts;

const statusConfig: Record<StatusKey, { label: string; color: string }> = {
    passed: { label: 'Passed', color: '#22c55e' }, // green-500
    failed: { label: 'Failed', color: '#ef4444' }, // red-500
    blocked: { label: 'Blocked', color: '#6b7280' }, // gray-500
    skipped: { label: 'Skipped', color: '#facc15' }, // yellow-400
    untested: { label: 'Untested', color: '#d1d5db' }, // gray-300
    automationPassed: { label: 'Automation Passed', color: '#16a34a' }, // green-600
    automationFailed: { label: 'Automation Failed', color: '#dc2626' }, // red-600
    automationError: { label: 'Automation Error', color: '#9333ea' }, // purple-600
};

const manualStatuses: StatusKey[] = ['passed', 'failed', 'skipped', 'blocked', 'untested'];
const automationStatuses: StatusKey[] = ['automationPassed', 'automationFailed', 'automationError'];


const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
};

const StatusRow: React.FC<{ label: string; count: number; percentage: number; color: string }> = ({ label, count, percentage, color }) => (
    <div className="flex justify-between items-center text-sm py-1">
        <div className="flex items-center gap-2">
            <span style={{ backgroundColor: color }} className={`w-3 h-3 rounded-full`}></span>
            <span className="text-gray-600 dark:text-gray-300">{label}</span>
        </div>
        <span className="font-semibold text-gray-800 dark:text-white">{percentage}% ({count})</span>
    </div>
);


const StatusPieChart: React.FC<StatusPieChartProps> = ({ counts }) => {
    if (!counts) {
        return <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">Loading Chart...</div>;
    }

    // FIX: Explicitly convert values to `Number` during reduction to avoid type errors with `unknown` values from `Object.values`.
    // Replaced reduce with a loop to ensure `total` is correctly typed as a number.
    let total = 0;
    for (const key in counts) {
        if (Object.prototype.hasOwnProperty.call(counts, key)) {
            total += Number(counts[key as keyof StatusCounts] || 0);
        }
    }

    if (total === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Status Breakdown</h3>
                <div className="flex justify-center items-center h-48 text-gray-500">No data available.</div>
            </div>
        );
    }
    
    let cumulativePercent = 0;
    const allStatusKeys: StatusKey[] = [...manualStatuses, ...automationStatuses];
    const slices = allStatusKeys.map(key => {
        // FIX: Ensure count is treated as a number to prevent type errors in comparisons and calculations.
        const count = Number(counts[key] ?? 0);
        if (count === 0) return null;
        
        const percent = count / total;
        
        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
        cumulativePercent += percent;
        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
        const largeArcFlag = percent > 0.5 ? 1 : 0;
        
        const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
        ].join(' ');
        
        return {
            path: pathData,
            color: statusConfig[key].color,
        };
    }).filter(Boolean);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex-shrink-0">Status Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start flex-grow">
                {/* Chart */}
                <div className="flex justify-center items-center md:col-span-1">
                    <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-auto max-w-[180px] mx-auto">
                        {slices.map((slice, index) => (
                           <path key={index} d={slice!.path} fill={slice!.color} />
                        ))}
                    </svg>
                </div>
                {/* Manual Status */}
                <div className="space-y-1 md:col-span-1">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b dark:border-gray-600 pb-1">Manual Status</h4>
                    {manualStatuses.map(key => {
                        // FIX: Ensure count is treated as a number to prevent type errors.
                        const count = Number(counts[key] ?? 0);
                        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                             <StatusRow
                                key={key}
                                label={statusConfig[key].label}
                                count={count}
                                percentage={percentage}
                                color={statusConfig[key].color}
                            />
                        )
                    })}
                </div>
                {/* Automation Status */}
                <div className="space-y-1 md:col-span-1">
                     <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b dark:border-gray-600 pb-1">Automation Status</h4>
                     {automationStatuses.map(key => {
                        // FIX: Ensure count is treated as a number to prevent type errors.
                        const count = Number(counts[key] ?? 0);
                        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                             <StatusRow
                                key={key}
                                label={statusConfig[key].label}
                                count={count}
                                percentage={percentage}
                                color={statusConfig[key].color}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default StatusPieChart;