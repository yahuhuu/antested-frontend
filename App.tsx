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

// Admin Pages
import AdminProjectsPage from './src/pages/admin/AdminProjectsPage';
import AdminUsersRolesPage from './src/pages/admin/AdminUsersRolesPage';
import AdminCustomizationsPage from './src/pages/admin/AdminCustomizationsPage';
import AdminIntegrationPage from './src/pages/admin/AdminIntegrationPage';
import AdminDataManagementPage from './src/pages/admin/AdminDataManagementPage';
import AdminSiteSettingsPage from './src/pages/admin/AdminSiteSettingsPage';


const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route element={<MainLayout />}>
        {/* Project Routes */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectOverviewPage />} />
        <Route path="/projects/:projectId/test-cases" element={<ProjectTestCasesPage />} />
        <Route path="/projects/:projectId/runs" element={<ProjectTestRunsPage />} />
        <Route path="/projects/:projectId/milestones" element={<ProjectMilestonesPage />} />
        <Route path="/projects/:projectId/bugs" element={<ProjectBugReportsPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/projects" replace />} />
        <Route path="/admin/projects" element={<AdminProjectsPage />} />
        <Route path="/admin/users" element={<AdminUsersRolesPage />} />
        <Route path="/admin/customizations" element={<AdminCustomizationsPage />} />
        <Route path="/admin/integration" element={<AdminIntegrationPage />} />
        <Route path="/admin/data" element={<AdminDataManagementPage />} />
        <Route path="/admin/site" element={<AdminSiteSettingsPage />} />
      </Route>
    </Routes>
  );
};

export default App;