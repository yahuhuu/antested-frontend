// Path: src/components/features/milestones/MilestoneSection.tsx
import React, { useMemo } from 'react';
import { Milestone } from '../../../services/milestoneService';
import MilestoneCard from './MilestoneCard';
import { Checkbox } from '../../ui/Checkbox';
import { TrashIcon } from '../../ui/Icons';

interface MilestoneSectionProps {
    title: string;
    milestones: Milestone[];
    selectedIds: Set<string>;
    onSelectionChange: (id: string, isSelected: boolean) => void;
    onSelectAll: (isSelected: boolean) => void;
    onDelete: () => void;
}

const MilestoneSection: React.FC<MilestoneSectionProps> = ({ title, milestones, selectedIds, onSelectionChange, onSelectAll, onDelete }) => {
    
    const areAllSelected = milestones.length > 0 && milestones.every(item => selectedIds.has(item.id));
    const isIndeterminate = !areAllSelected && milestones.some(item => selectedIds.has(item.id));

    const selectedCountInSection = useMemo(() => {
        const milestoneIdsInSection = new Set(milestones.map(m => m.id));
        return Array.from(selectedIds).filter(id => milestoneIdsInSection.has(id)).length;
    }, [milestones, selectedIds]);

    const handleEdit = (id: string) => console.log(`Editing milestone ${id}`);
    const handleDelete = (id: string) => console.log(`Deleting milestone ${id}`);

    return (
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col h-[550px]">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
                <div className="flex items-center gap-4">
                    <Checkbox
                        id={`select-all-${title}`}
                        checked={areAllSelected}
                        indeterminate={isIndeterminate}
                        onChange={(e) => onSelectAll(e.target.checked)}
                        label="Select All"
                    />
                    {selectedCountInSection > 0 && (
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" /> Delete ({selectedCountInSection})
                        </button>
                    )}
                </div>
            </div>
            {milestones.length > 0 ? (
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {milestones.map(milestone => (
                        <MilestoneCard 
                            key={milestone.id} 
                            milestone={milestone} 
                            isSelected={selectedIds.has(milestone.id)}
                            onSelectionChange={onSelectionChange}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No milestones in this category.</p>
                </div>
            )}
        </section>
    );
};

export default MilestoneSection;