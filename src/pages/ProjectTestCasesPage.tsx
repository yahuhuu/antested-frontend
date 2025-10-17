// Path: src/pages/ProjectTestCasesPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTestCasesByProjectId, TestCase, Priority, Status } from '../services/testCaseService';

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
    const colors = {
        High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[priority]}`}>{priority}</span>;
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
    const colors = {
        Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        Obsolete: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>{status}</span>;
};

const ProjectTestCasesPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTestCases = async () => {
            if (!projectId) return;
            try {
                setLoading(true);
                setError('');
                const data = await getTestCasesByProjectId(projectId);
                setTestCases(data);
            } catch (err) {
                setError('Failed to load test cases.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTestCases();
    }, [projectId]);

    const renderContent = () => {
        if (loading) return <p className="text-center py-10">Loading test cases...</p>;
        if (error) return <p className="text-center py-10 text-red-500">{error}</p>;
        if (testCases.length === 0) {
            return <p className="text-center text-gray-500 dark:text-gray-400 py-10">No test cases found for this project.</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {testCases.map(tc => (
                            <tr key={tc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tc.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><PriorityBadge priority={tc.priority} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={tc.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Test Cases</h1>
                 <Link to={`/projects/${projectId}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">&larr; Back to Project Overview</Link>
            </div>
            {renderContent()}
        </div>
    );
};

export default ProjectTestCasesPage;