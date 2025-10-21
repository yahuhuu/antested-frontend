// Path: src/components/features/milestones/MilestoneCard.tsx
import React from 'react';
import { Milestone } from '../../../services/milestoneService';
import { Checkbox } from '../../ui/Checkbox';
import { EditIcon, TrashIcon } from '../../ui/Icons';
import MilestoneStats from './MilestoneStats';
import MilestoneProgressBar from './MilestoneProgressBar';

interface MilestoneCardProps {
    milestone: Milestone;
    isSelected: boolean;
    onSelectionChange: (id: string, isSelected: boolean) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, isSelected, onSelectionChange, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            {/* Top Row: Selection, Name, Actions */}
            <div className="flex items-start gap-4">
                <Checkbox id={`cb-${milestone.id}`} checked={isSelected} onChange={e => onSelectionChange(milestone.id, e.target.checked)} />
                <div className="flex-grow">
                    <p className="font-bold text-gray-900 dark:text-white text-md">{milestone.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created by {milestone.createdBy} on {milestone.createdAt}
                    </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onEdit(milestone.id)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(milestone.id)} className="p-1.5 text-gray-500 hover:text-red-600 rounded-md"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Middle Row: Stats Grid */}
            <div className="pl-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                <MilestoneStats title="Test Plans" stats={milestone.stats.testPlans} />
                <MilestoneStats title="Test Runs" stats={milestone.stats.testRuns} />
            </div>

            {/* Bottom Row: Due Date & Progress */}
            <div className="pl-9 space-y-2">
                 <p className="text-xs text-gray-500 dark:text-gray-400">
                    Due date: {milestone.dueDateStart} - {milestone.dueDateEnd}
                </p>
                <MilestoneProgressBar progress={milestone.progress} />
            </div>
        </div>
    );
};

export default MilestoneCard;