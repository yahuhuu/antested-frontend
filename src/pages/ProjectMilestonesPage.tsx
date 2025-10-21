// Path: src/pages/ProjectMilestonesPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getMilestones, Milestone } from '../services/milestoneService';
import MilestoneSection from '../components/features/milestones/MilestoneSection';

const ProjectMilestonesPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const fetchData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError('');
        try {
            const data = await getMilestones(projectId);
            setMilestones(data);
        } catch (err) {
            console.error("Failed to fetch milestones:", err);
            setError('Could not load milestones. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const categorizedMilestones = useMemo(() => {
        return {
            open: milestones.filter(m => m.status === 'Open'),
            overdue: milestones.filter(m => m.status === 'Overdue'),
            completed: milestones.filter(m => m.status === 'Completed'),
        };
    }, [milestones]);

    const handleSelectionChange = (id: string, isSelected: boolean) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) newSet.add(id);
            else newSet.delete(id);
            return newSet;
        });
    };

    const handleSelectAll = (milestonesInCategory: Milestone[], isSelected: boolean) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                milestonesInCategory.forEach(m => newSet.add(m.id));
            } else {
                milestonesInCategory.forEach(m => newSet.delete(m.id));
            }
            return newSet;
        });
    };

    const handleDeleteSelected = () => {
        setMilestones(prev => prev.filter(m => !selectedIds.has(m.id)));
        setSelectedIds(new Set());
    };

    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-8 text-gray-500 dark:text-gray-400">Loading milestones...</div>;
        }
        if (error) {
            return <div className="text-center p-8 text-red-500">{error}</div>;
        }
        
        const sections: { title: string; data: Milestone[] }[] = [
            { title: 'Open', data: categorizedMilestones.open },
            { title: 'Overdue', data: categorizedMilestones.overdue },
            { title: 'Completed', data: categorizedMilestones.completed },
        ];

        return (
             <div className="space-y-8">
                {sections.map(section => (
                    section.data.length > 0 && (
                        <MilestoneSection
                            key={section.title}
                            title={section.title}
                            milestones={section.data}
                            selectedIds={selectedIds}
                            onSelectionChange={handleSelectionChange}
                            onSelectAll={(isSelected) => handleSelectAll(section.data, isSelected)}
                            onDelete={handleDeleteSelected}
                        />
                    )
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Milestones</h1>
            {renderContent()}
        </div>
    );
};

export default ProjectMilestonesPage;