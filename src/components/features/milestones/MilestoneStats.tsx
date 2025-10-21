// Path: src/components/features/milestones/MilestoneStats.tsx
import React from 'react';
import { MilestoneStats as Stats } from '../../../services/milestoneService';

interface MilestoneStatsProps {
    title: string;
    stats: Stats;
}

const StatItem: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
    <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
        <span className="text-xs text-gray-600 dark:text-gray-300">
            {label}: <span className="font-semibold">{value}</span>
        </span>
    </div>
);


const MilestoneStats: React.FC<MilestoneStatsProps> = ({ title, stats }) => {
    const total = stats.open + stats.overdue + stats.completed;
    if (total === 0) return null;

    return (
        <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</p>
            <div className="space-y-1.5">
                <StatItem label="Open" value={stats.open} color="bg-blue-500" />
                <StatItem label="Overdue" value={stats.overdue} color="bg-yellow-500" />
                <StatItem label="Completed" value={stats.completed} color="bg-green-500" />
            </div>
        </div>
    );
};

export default MilestoneStats;