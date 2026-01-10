// Path: src/pages/ProjectTestRunsPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTestPlans, getTestRuns, TestPlan, TestRun, NewTestPlan, createTestPlan, updateTestPlan, NewTestRun, createTestRun, updateTestRun } from '../services/testRunService';
import { getMilestones, Milestone } from '../services/milestoneService';
import RunSection from '../components/features/test-runs/RunSection';
import TestPlanFormModal from '../components/features/test-runs/TestPlanFormModal';
import TestRunFormModal from '../components/features/test-runs/TestRunFormModal';
import DeleteConfirmationModal from '../components/features/test-runs/DeleteConfirmationModal';
import TestPlanDetails from '../components/features/test-runs/TestPlanDetails';
import DetailsDrawer from '../components/ui/DetailsDrawer';
import { PlusIcon } from '../components/ui/Icons';

const ProjectTestRunsPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
    const [testRuns, setTestRuns] = useState<TestRun[]>([]);
    const [allMilestones, setAllMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedPlanIds, setSelectedPlanIds] = useState<Set<string>>(new Set());
    const [selectedRunIds, setSelectedRunIds] = useState<Set<string>>(new Set());
    
    // Test Plan Modal State
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<TestPlan | null>(null);
    const [detailsPlan, setDetailsPlan] = useState<TestPlan | null>(null);

    // Test Run Modal State
    const [isRunModalOpen, setIsRunModalOpen] = useState(false);
    const [editingRun, setEditingRun] = useState<TestRun | null>(null);

    // State for delete confirmation
    const [deleteInfo, setDeleteInfo] = useState<{ type: 'plan' | 'run', ids: Set<string> } | null>(null);


    const fetchData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError('');
        try {
            const [plans, runs, milestones] = await Promise.all([
                getTestPlans(projectId),
                getTestRuns(projectId),
                getMilestones(projectId)
            ]);
            setTestPlans(plans);
            setTestRuns(runs);
            setAllMilestones(milestones);
        } catch (err) {
            console.error("Failed to fetch test runs and plans:", err);
            setError('Could not load data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const categorizedPlans = useMemo(() => ({
        open: testPlans.filter(p => p.status === 'Open'),
        overdue: testPlans.filter(p => p.status === 'Overdue'),
        completed: testPlans.filter(p => p.status === 'Completed'),
    }), [testPlans]);

    const categorizedRuns = useMemo(() => ({
        open: testRuns.filter(r => r.status === 'Open'),
        overdue: testRuns.filter(r => r.status === 'Overdue'),
        completed: testRuns.filter(r => r.status === 'Completed'),
    }), [testRuns]);

    // --- Selection Handlers ---
    const handlePlanSelectionChange = (id: string, isSelected: boolean) => {
        setSelectedPlanIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) newSet.add(id);
            else newSet.delete(id);
            return newSet;
        });
    };
    
    const handleRunSelectionChange = (id: string, isSelected: boolean) => {
        setSelectedRunIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) newSet.add(id);
            else newSet.delete(id);
            return newSet;
        });
    };

    const handleSelectAllPlans = (plansInCategory: TestPlan[], isSelected: boolean) => {
        setSelectedPlanIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                plansInCategory.forEach(p => newSet.add(p.id));
            } else {
                plansInCategory.forEach(p => newSet.delete(p.id));
            }
            return newSet;
        });
    };

    const handleSelectAllRuns = (runsInCategory: TestRun[], isSelected: boolean) => {
        setSelectedRunIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                runsInCategory.forEach(r => newSet.add(r.id));
            } else {
                runsInCategory.forEach(r => newSet.delete(r.id));
            }
            return newSet;
        });
    };
    
    // --- Delete Handlers ---
    const handleDeletePlans = () => {
        if (selectedPlanIds.size > 0) {
            setDeleteInfo({ type: 'plan', ids: selectedPlanIds });
        }
    };

    const handleDeleteRuns = () => {
        if (selectedRunIds.size > 0) {
            setDeleteInfo({ type: 'run', ids: selectedRunIds });
        }
    };

    const handleDeleteSingleItem = (type: 'plan' | 'run', id: string) => {
        setDetailsPlan(null); // Close details drawer if open
        setDeleteInfo({ type, ids: new Set([id]) });
    };

    const handleConfirmDelete = () => {
        if (!deleteInfo) return;

        if (deleteInfo.type === 'plan') {
            setTestPlans(prevPlans => prevPlans.filter(plan => !deleteInfo.ids.has(plan.id)));
            setSelectedPlanIds(new Set());
        } else {
            setTestRuns(prevRuns => prevRuns.filter(run => !deleteInfo.ids.has(run.id)));
            setSelectedRunIds(new Set());
        }
        
        setDeleteInfo(null);
    };
    
    // --- Test Plan Handlers ---
    const handleAddPlan = () => {
        setEditingPlan(null);
        setIsPlanModalOpen(true);
    };
    
    const handleEditPlan = (id: string) => {
        const planToEdit = testPlans.find(p => p.id === id);
        if (planToEdit) {
            setDetailsPlan(null); // Close details drawer if open
            setEditingPlan(planToEdit);
            setIsPlanModalOpen(true);
        }
    };

    const handleViewDetails = (id: string) => {
        const plan = testPlans.find(p => p.id === id);
        if (plan) {
            setDetailsPlan(plan);
        }
    }

    const handleSavePlan = async (planData: NewTestPlan | TestPlan) => {
        try {
            if ('id' in planData && planData.id) {
                await updateTestPlan(planData.id, planData as Partial<NewTestPlan>);
            } else {
                await createTestPlan(planData as NewTestPlan);
            }
            await fetchData();
        } catch (error) {
            console.error("Failed to save test plan", error);
            setError("Failed to save the test plan. Please try again.");
        } finally {
            setIsPlanModalOpen(false);
        }
    };

    const handleCompletePlan = (planId: string) => {
        const planToComplete = testPlans.find(p => p.id === planId);
        if (!planToComplete) return;

        setTestPlans(prevPlans => 
            prevPlans.map(p => p.id === planId ? { ...p, status: 'Completed' } : p)
        );

        const runIdsToComplete = new Set(planToComplete.testRunIds);
        setTestRuns(prevRuns =>
            prevRuns.map(r => runIdsToComplete.has(r.id) ? { ...r, status: 'Completed' } : r)
        );

        setDetailsPlan(null);
    };

    // --- Test Run Handlers ---
    const handleAddRun = () => {
        setEditingRun(null);
        setIsRunModalOpen(true);
    };

    const handleEditRun = (id: string) => {
        const runToEdit = testRuns.find(r => r.id === id);
        if (runToEdit) {
            setEditingRun(runToEdit);
            setIsRunModalOpen(true);
        }
    };

    const handleSaveRun = async (runData: NewTestRun | TestRun, testPlanId?: string) => {
        try {
            if ('id' in runData && runData.id) {
                // Logic for updating a run. Association changes are complex and not handled here.
                await updateTestRun(runData.id, runData as Partial<NewTestRun>);
            } else {
                // Logic for creating a new run
                const newRun = await createTestRun(runData as NewTestRun);
                // If a test plan was selected, update it to include the new run
                if (testPlanId && newRun) {
                    const planToUpdate = testPlans.find(p => p.id === testPlanId);
                    if (planToUpdate) {
                        const updatedRunIds = [...planToUpdate.testRunIds, newRun.id];
                        await updateTestPlan(testPlanId, { ...planToUpdate, testRunIds: updatedRunIds });
                    }
                }
            }
            await fetchData(); // This will refresh both runs and plans
        } catch (error) {
            console.error("Failed to save test run", error);
            setError("Failed to save the test run. Please try again.");
        } finally {
            setIsRunModalOpen(false);
        }
    };

    // --- Render Logic ---
    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-8">Loading...</div>;
        }
        if (error) {
            return <div className="text-center p-8 text-red-500">{error}</div>;
        }
        
        const sections: { title: string, status: 'open' | 'overdue' | 'completed'}[] = [
            { title: 'Open', status: 'open' },
            { title: 'Overdue', status: 'overdue' },
            { title: 'Completed', status: 'completed' },
        ];

        return (
             <div className="space-y-8">
                {sections.map(section => (
                    (categorizedPlans[section.status].length > 0 || categorizedRuns[section.status].length > 0) && (
                        <div key={section.title}>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{section.title}</h2>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <RunSection 
                                    title="Test Runs" 
                                    items={categorizedRuns[section.status]}
                                    selectedIds={selectedRunIds}
                                    onSelectionChange={handleRunSelectionChange}
                                    onSelectAll={(isSelected) => handleSelectAllRuns(categorizedRuns[section.status], isSelected)}
                                    onDelete={handleDeleteRuns}
                                    onDeleteItem={(id) => handleDeleteSingleItem('run', id)}
                                    onEdit={handleEditRun}
                                    itemWrapper={(item, children) => (
                                        <Link to={`/projects/${projectId}/runs/${item.id}`} className="block">
                                            {children}
                                        </Link>
                                    )}
                                />
                                <RunSection 
                                    title="Test Plans" 
                                    items={categorizedPlans[section.status]}
                                    selectedIds={selectedPlanIds}
                                    onSelectionChange={handlePlanSelectionChange}
                                    onSelectAll={(isSelected) => handleSelectAllPlans(categorizedPlans[section.status], isSelected)}
                                    onDelete={handleDeletePlans}
                                    onEdit={handleEditPlan}
                                    onDeleteItem={(id) => handleDeleteSingleItem('plan', id)}
                                    allRuns={testRuns}
                                    onViewDetails={handleViewDetails}
                                />
                            </div>
                        </div>
                    )
                ))}
            </div>
        );
    };

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Test Runs & Plans</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAddRun}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon /> Add Test Run
                        </button>
                        <button
                            onClick={handleAddPlan}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon /> Add Test Plan
                        </button>
                    </div>
                </div>
                {renderContent()}
            </div>
            <TestPlanFormModal
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
                onSave={handleSavePlan}
                plan={editingPlan}
                projectId={projectId!}
            />
             <TestRunFormModal
                isOpen={isRunModalOpen}
                onClose={() => setIsRunModalOpen(false)}
                onSave={handleSaveRun}
                run={editingRun}
                projectId={projectId!}
            />
            <DeleteConfirmationModal
                isOpen={!!deleteInfo}
                onClose={() => setDeleteInfo(null)}
                onConfirm={handleConfirmDelete}
                itemCount={deleteInfo?.ids.size || 0}
                itemType={deleteInfo?.type === 'plan' ? 'Test Plan' : 'Test Run'}
            />
            <DetailsDrawer
                isOpen={!!detailsPlan}
                onClose={() => setDetailsPlan(null)}
                title="Test Plan Details"
            >
                {detailsPlan && (
                    <TestPlanDetails
                        plan={detailsPlan}
                        allRuns={testRuns}
                        allMilestones={allMilestones}
                        onEdit={() => handleEditPlan(detailsPlan.id)}
                        onDelete={() => handleDeleteSingleItem('plan', detailsPlan.id)}
                        onCompletePlan={handleCompletePlan}
                    />
                )}
            </DetailsDrawer>
        </>
    );
};

export default ProjectTestRunsPage;