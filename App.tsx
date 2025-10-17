// Path: App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './src/components/layout/MainLayout';
import ProjectsPage from './src/pages/ProjectsPage';
import ProjectOverviewPage from './src/pages/ProjectOverviewPage';
import ProjectTestCasesPage from './src/pages/ProjectTestCasesPage';
import ProjectTestRunsPage from './src/pages/ProjectTestRunsPage';
import ProjectMilestonesPage from './src/pages/ProjectMilestonesPage';
import ProjectBugReportsPage from './src/pages/ProjectBugReportsPage';


const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route element={<MainLayout />}>
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectOverviewPage />} />
        <Route path="/projects/:projectId/test-cases" element={<ProjectTestCasesPage />} />
        <Route path="/projects/:projectId/runs" element={<ProjectTestRunsPage />} />
        <Route path="/projects/:projectId/milestones" element={<ProjectMilestonesPage />} />
        <Route path="/projects/:projectId/bugs" element={<ProjectBugReportsPage />} />
      </Route>
    </Routes>
  );
};

export default App;