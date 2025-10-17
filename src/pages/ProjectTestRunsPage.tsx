// Path: src/pages/ProjectTestRunsPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ProjectTestRunsPage: React.FC = () => {
    const { projectId } = useParams();
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="mb-4">
              <Link to={`/projects/${projectId}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">&larr; Back to Project Overview</Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Test Runs & Plans</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">This page will be used for managing test runs and plans.</p>
        </div>
    );
};

export default ProjectTestRunsPage;
