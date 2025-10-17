// Path: src/pages/ProjectBugReportsPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ProjectBugReportsPage: React.FC = () => {
    const { projectId } = useParams();
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
             <div className="mb-4">
              <Link to={`/projects/${projectId}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">&larr; Back to Project Overview</Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Bug Reports</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">This page will be for tracking bug reports.</p>
        </div>
    );
};

export default ProjectBugReportsPage;
