// Path: src/pages/admin/AdminProjectsPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, getProjects, createProject, updateProject, deleteProject, NewProject } from '../../services/projectService';
import ProjectFormModal from '../../components/features/admin/projects/ProjectFormModal';
import DeleteProjectModal from '../../components/features/admin/projects/DeleteProjectModal';
import { Pagination } from '../../components/ui/Pagination';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/ui/Icons';

const AdminProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProjects();
            setProjects(data);
        } catch (err) {
            setError('Failed to load projects.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        setCurrentPage(1);
    }, [rowsPerPage]);

    const handleOpenCreateModal = () => {
        setSelectedProject(null);
        setIsFormModalOpen(true);
    };
    
    const handleOpenEditModal = (project: Project) => {
        setSelectedProject(project);
        setIsFormModalOpen(true);
    };

    const handleOpenDeleteModal = (project: Project) => {
        setSelectedProject(project);
        setIsDeleteModalOpen(true);
    };

    const handleSaveProject = async (projectData: NewProject | Project) => {
        try {
            if ('id' in projectData && projectData.id) {
                await updateProject(projectData.id, projectData);
            } else {
                await createProject(projectData as NewProject);
            }
            setIsFormModalOpen(false);
            await fetchProjects();
        } catch (saveError) {
            console.error('Failed to save project:', saveError);
        }
    };
    
    const handleDeleteConfirm = async () => {
        if (!selectedProject) return;
        try {
            await deleteProject(selectedProject.id);
            setIsDeleteModalOpen(false);
            await fetchProjects();
        } catch (deleteError) {
            console.error('Failed to delete project:', deleteError);
        }
    };

    const totalProjects = projects.length;
    const totalPages = useMemo(() => Math.ceil(totalProjects / rowsPerPage), [totalProjects, rowsPerPage]);
    const paginatedProjects = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return projects.slice(start, end);
    }, [projects, currentPage, rowsPerPage]);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Projects</h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon /> Add New Project
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {['Project Name', 'Key', 'Description', 'Members', 'Actions'].map(header => (
                                    <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {loading && (
                                <tr><td colSpan={5} className="text-center p-6 text-gray-500">Loading...</td></tr>
                            )}
                            {error && (
                                <tr><td colSpan={5} className="text-center p-6 text-red-500">{error}</td></tr>
                            )}
                            {!loading && !error && paginatedProjects.map((project) => (
                                <tr key={project.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{project.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-300">{project.key}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 truncate" style={{ maxWidth: '300px' }} title={project.description}>{project.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{project.memberCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => handleOpenEditModal(project)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200">
                                            <EditIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleOpenDeleteModal(project)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    totalItems={totalProjects}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            </div>

            {isFormModalOpen && (
                <ProjectFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSave={handleSaveProject}
                    project={selectedProject}
                />
            )}
            
            {isDeleteModalOpen && selectedProject && (
                <DeleteProjectModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    projectName={selectedProject.name}
                />
            )}
        </>
    );
};

export default AdminProjectsPage;