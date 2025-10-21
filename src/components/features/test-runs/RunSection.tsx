// Path: src/components/features/test-runs/RunSection.tsx
import React, { useMemo } from 'react';
import { TestPlan, TestRun } from '../../../services/testRunService';
import RunCard from './RunCard';
import { Checkbox } from '../../ui/Checkbox';
import { TrashIcon } from '../../ui/Icons';

interface RunSectionProps {
    title: string;
    items: (TestPlan | TestRun)[];
    selectedIds: Set<string>;
    onSelectionChange: (id: string, isSelected: boolean) => void;
    onSelectAll: (isSelected: boolean) => void;
    onDelete: () => void;
    onDeleteItem: (id: string) => void;
    onEdit?: (id: string) => void;
    onViewDetails?: (id: string) => void;
    allRuns?: TestRun[];
    itemWrapper?: (item: TestPlan | TestRun, children: React.ReactNode) => React.ReactNode;
}

const RunSection: React.FC<RunSectionProps> = ({ title, items, selectedIds, onSelectionChange, onSelectAll, onDelete, onDeleteItem, onEdit, onViewDetails, allRuns, itemWrapper }) => {
    
    const areAllSelected = items.length > 0 && items.every(item => selectedIds.has(item.id));
    const isIndeterminate = !areAllSelected && items.some(item => selectedIds.has(item.id));

    const selectedCountInSection = useMemo(() => {
        return items.filter(item => selectedIds.has(item.id)).length;
    }, [items, selectedIds]);

    return (
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col h-[560px]">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h3 className="text-md font-bold text-gray-700 dark:text-gray-200 mb-2">{title}</h3>
                <div className="flex items-center gap-4">
                    <Checkbox
                        id={`select-all-${title.replace(/\s+/g, '-')}`}
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
            {items.length > 0 ? (
                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                    {items.map(item => {
                        const card = (
                            <RunCard 
                                key={item.id} 
                                item={item} 
                                isSelected={selectedIds.has(item.id)}
                                onSelectionChange={onSelectionChange}
                                onEdit={onEdit}
                                onDelete={onDeleteItem}
                                onViewDetails={onViewDetails}
                                allRuns={allRuns}
                            />
                        );
                        return itemWrapper ? itemWrapper(item, card) : card;
                    })}
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No {title.toLowerCase()} in this category.</p>
                </div>
            )}
        </section>
    );
};

export default RunSection;