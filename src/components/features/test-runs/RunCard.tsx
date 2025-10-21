// Path: src/components/features/test-runs/RunCard.tsx
import React from 'react';
import { TestPlan, TestRun } from '../../../services/testRunService';
import { Checkbox } from '../../ui/Checkbox';
import { EditIcon, TrashIcon } from '../../ui/Icons';
import ProgressBar from './ProgressBar';
import StatusBreakdown from './StatusBreakdown';

interface RunCardProps {
    item: TestPlan | TestRun;
    isSelected: boolean;
    onSelectionChange: (id: string, isSelected: boolean) => void;
    onEdit?: (id: string) => void;
    onDelete: (id: string) => void;
    onViewDetails?: (id: string) => void;
    allRuns?: TestRun[];
}

const RunCard: React.FC<RunCardProps> = ({ item, isSelected, onSelectionChange, onEdit, onDelete, onViewDetails, allRuns }) => {
    const isTestPlan = 'testRunIds' in item;

    const testRunStats = React.useMemo(() => {
        if (!isTestPlan || !allRuns) {
            return null;
        }
        const associatedRuns = allRuns.filter(run => item.testRunIds.includes(run.id));
        const open = associatedRuns.filter(r => r.status === 'Open').length;
        const overdue = associatedRuns.filter(r => r.status === 'Overdue').length;
        const completed = associatedRuns.filter(r => r.status === 'Completed').length;
        return { total: item.testRunIds.length, open, overdue, completed };
    }, [item, allRuns, isTestPlan]);
    
    const handleCardClick = () => {
        if (onViewDetails) {
            onViewDetails(item.id);
        }
    }

    return (
        <div 
            onClick={handleCardClick}
            className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3 bg-gray-50 dark:bg-gray-800/50 transition-colors ${onViewDetails ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/60' : ''}`}
        >
            {/* Top Row: Selection, Name, Actions */}
            <div className="flex items-start gap-3">
                <div className="pt-0.5" onClick={e => e.stopPropagation()}>
                    <Checkbox id={`cb-${item.id}`} checked={isSelected} onChange={e => onSelectionChange(item.id, e.target.checked)} />
                </div>
                <div className="flex-grow">
                    <p className="font-bold text-gray-800 dark:text-white leading-tight">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created by {item.createdBy} on {item.createdAt}
                    </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {onEdit && (
                        <button onClick={(e) => { e.preventDefault(); onEdit(item.id); }} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md"><EditIcon className="w-4 h-4" /></button>
                    )}
                    <button onClick={(e) => { e.preventDefault(); onDelete(item.id); }} className="p-1.5 text-gray-500 hover:text-red-600 rounded-md"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Middle Row: Stats */}
            <div className="pl-7 space-y-2">
                {isTestPlan && testRunStats && (
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1 mb-2">
                        <p>Total test runs: <span className="font-bold">{testRunStats.total}</span></p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                            <p>Open: <span className="font-bold">{testRunStats.open}</span></p>
                            <p>Overdue: <span className="font-bold">{testRunStats.overdue}</span></p>
                            <p>Completed: <span className="font-bold">{testRunStats.completed}</span></p>
                        </div>
                    </div>
                )}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Total test cases: <span className="font-bold">{item.totalTestCases}</span></p>
                <StatusBreakdown counts={item.statusCounts} />
            </div>

            {/* Bottom Row: Due Date & Progress */}
            <div className="pl-7 space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Due date: {item.dueDateStart} - {item.dueDateEnd}
                </p>
                <ProgressBar counts={item.statusCounts} />
            </div>
        </div>
    );
};

export default RunCard;