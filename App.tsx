// Path: App.tsx
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './src/components/layout/MainLayout';
import ProjectsPage from './src/pages/ProjectsPage';
import ProjectDetailPage from './src/pages/ProjectDetailPage';
import TestSuiteDetailPage from './src/pages/TestSuiteDetailPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route element={<MainLayout />}>
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/projects/:projectId/suites/:suiteId" element={<TestSuiteDetailPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;