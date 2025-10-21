// Path: src/components/features/test-runs/StatusBreakdown.tsx
import React from 'react';
import { StatusCounts } from '../../../services/testRunService';

interface StatusBreakdownProps {
    counts: StatusCounts;
}

type StatusKey = keyof StatusCounts;

const statusConfig: Record<StatusKey, { label: string; color: string }> = {
    passed: { label: 'Passed', color: 'bg-green-500' },
    automationPassed: { label: 'Auto Passed', color: 'bg-green-600' },
    blocked: { label: 'Blocked', color: 'bg-gray-500' },
    untested: { label: 'Untested', color: 'bg-gray-300' },
    skipped: { label: 'Skipped', color: 'bg-yellow-400' },
    failed: { label: 'Failed', color: 'bg-red-500' },
    automationFailed: { label: 'Auto Failed', color: 'bg-red-600' },
    automationError: { label: 'Auto Error', color: 'bg-purple-500' },
};


const StatusBreakdown: React.FC<StatusBreakdownProps> = ({ counts }) => {
    const statusOrder: StatusKey[] = [
        'passed',
        'failed',
        'blocked',
        'skipped',
        'automationPassed',
        'automationFailed',
        'automationError',
        'untested',
    ];

    const statusEntries = statusOrder
        .map(key => ({
            key,
            count: counts[key] ?? 0,
            label: statusConfig[key].label,
            color: statusConfig[key].color,
        }));

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            {statusEntries.filter(status => status.count > 0).map(status => (
                <div key={status.key} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                    <span>{status.count} {status.label}</span>
                </div>
            ))}
        </div>
    );
};

export default StatusBreakdown;