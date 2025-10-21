// Path: src/components/features/admin/projects/ProjectDetails.tsx
import React, { useState, useEffect } from 'react';
import { Project } from '../../../../services/projectService';
import { EditIcon, TrashIcon } from '../../../ui/Icons';
import { Template, getTemplates } from '../../../../services/customizationService';

interface ProjectDetailsProps {
    project: Project;
    onEdit: () => void;
    onDelete: () => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 text-sm text-gray-900 dark:text-gray-200">{children}</div>
    </div>
);

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onEdit, onDelete }) => {
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        getTemplates().then(setTemplates);
    }, []);

    const defaultTemplateName = templates.find(t => t.id === project.defaultTestCaseTemplateId)?.name || 'None';

    return (
        <div className="space-y-6 pb-6">
            <div className="pb-4 border-b dark:border-gray-600">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{project.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Project Overview</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={onEdit} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <EditIcon className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={onDelete} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900 transition-colors">
                            <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>
            </div>

            <DetailSection title="Project Key">
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{project.key}</span>
            </DetailSection>

            <DetailSection title="Description">
                <p className="whitespace-pre-wrap">{project.description || 'No description provided.'}</p>
            </DetailSection>

            <DetailSection title="Settings">
                <p>{project.enableApprovals ? 'Test case approvals are enabled.' : 'Test case approvals are disabled.'}</p>
            </DetailSection>

            <DetailSection title="Default Test Case Template">
                <p>{defaultTemplateName}</p>
            </DetailSection>

            <DetailSection title="Users">
                {project.users.length > 0 ? (
                    <ul className="space-y-2">
                        {project.users.map(user => (
                            <li key={user.id} className="flex items-center gap-3">
                                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                <span>{user.name}</span>
                            </li>
                        ))}
                    </ul>
                ) : <p>No users assigned to this project.</p>}
            </DetailSection>

            <DetailSection title="Groups">
                {project.groups.length > 0 ? (
                    <ul className="space-y-2">
                        {project.groups.map(group => (
                            <li key={group.id} className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-md">
                                {group.name}
                            </li>
                        ))}
                    </ul>
                ) : <p>No groups assigned to this project.</p>}
            </DetailSection>
        </div>
    );
};

export default ProjectDetails;