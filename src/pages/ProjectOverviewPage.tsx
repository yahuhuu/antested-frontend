// Path: pages/ProjectOverviewPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById, Project } from '../services/projectService';
import { 
    getProjectStats, 
    getRecentMilestones,
    getRecentTestRuns,
    getProjectActivity,
    getTestCaseTrend,
    ProjectStats,
    Milestone,
    TestRun,
    Activity,
    TestCaseTrendPoint
} from '../services/dashboardService';

import StatCard from '../components/features/dashboard/StatCard';
import TestCaseChart from '../components/features/dashboard/TestCaseChart';
import ActivityFeed from '../components/features/dashboard/ActivityFeed';

// --- Icon Components ---
const MilestoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TestPlanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 13v- உண்மையில்" /></svg>;
const TestRunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TestCaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const BugIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-3-5v5m-3-8v8M9 9H5.21c-1.1 0-2 1.12-2 2.5v1C3.21 14.38 4.11 15.5 5.21 15.5H9m7-6.5h3.79c-1.1 0-2 1.12-2 2.5v1c0 1.38-.9 2.5-2 2.5H16M9 9V7a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6" /></svg>;


const ProjectOverviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [trendData, setTrendData] = useState<TestCaseTrendPoint[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [loading, setLoading] = useState({
      project: true,
      stats: true,
      chart: true,
      milestones: true,
      runs: true,
      activity: true
  });
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!projectId) return;
    
    const fetchWithState = async <T,>(
        fetcher: () => Promise<T>, 
        stateSetter: React.Dispatch<React.SetStateAction<T>>, 
        loadingKey: keyof typeof loading
    ) => {
        try {
            setLoading(prev => ({ ...prev, [loadingKey]: true }));
            const data = await fetcher();
            stateSetter(data);
        } catch (err) {
            console.error(`Failed to load ${loadingKey}`, err);
            setError(prev => prev ? `${prev}, ${loadingKey}` : `Failed to load ${loadingKey}`);
        } finally {
            setLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    fetchWithState(() => getProjectById(projectId), setProject, 'project');
    fetchWithState(() => getProjectStats(projectId), setStats, 'stats');
    fetchWithState(() => getTestCaseTrend(projectId), setTrendData, 'chart');
    fetchWithState(() => getRecentMilestones(projectId), setMilestones, 'milestones');
    fetchWithState(() => getRecentTestRuns(projectId), setTestRuns, 'runs');
    fetchWithState(() => getProjectActivity(projectId), setActivities, 'activity');

  }, [projectId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const statCards = [
    { title: "Milestones", data: stats?.milestones, icon: <MilestoneIcon />, isLoading: loading.stats },
    { title: "Test Plans", data: stats?.testPlans, icon: <TestPlanIcon />, isLoading: loading.stats },
    { title: "Test Runs", data: stats?.testRuns, icon: <TestRunIcon />, isLoading: loading.stats },
    { title: "Test Cases", data: stats?.testCases, icon: <TestCaseIcon />, isLoading: loading.stats },
    { title: "Open Bugs", data: stats?.openBugs, icon: <BugIcon />, isLoading: loading.stats },
  ];

  if (loading.project) return <p>Loading Project...</p>;
  if (error && !project) return <p className="text-red-500">Could not load project details.</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{project.name} Overview</h1>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map(card => <StatCard key={card.title} {...card} />)}
      </div>

      {/* Test Case Trend (Full Width) */}
      <TestCaseChart data={trendData} isLoading={loading.chart} />

      {/* Milestones and Test Runs (Side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Milestones Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Milestones</h2>
                <Link to={`/projects/${projectId}/milestones`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
            </div>
            {loading.milestones ? <p>Loading milestones...</p> : (
                <ul className="space-y-3">
                    {milestones.map(m => (
                        <li key={m.id}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{m.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{m.dueDate}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${m.progress}%` }}></div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        
        {/* Test Runs Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Recent Test Runs</h2>
                <Link to={`/projects/${projectId}/runs`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
            </div>
            {loading.runs ? <p>Loading test runs...</p> : (
                <ul className="space-y-2">
                    {testRuns.map(run => (
                        <li key={run.id} className="flex items-center justify-between p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                            <div>
                                <p className="font-semibold text-sm">{run.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Passed: {run.passed}/{run.total}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${run.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                {run.status}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
      
      {/* Activity Feed (Full Width) */}
      <ActivityFeed activities={activities} isLoading={loading.activity} />
    </div>
  );
};

export default ProjectOverviewPage;