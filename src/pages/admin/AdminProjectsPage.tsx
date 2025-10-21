// Path: src/pages/admin/AdminProjectsPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Project, getProjects, createProject, updateProject, deleteProject, deleteProjects, NewProject } from '../../services/projectService';
import ProjectFormModal from '../../components/features/admin/projects/ProjectFormModal';
import DeleteProjectModal from '../../components/features/admin/projects/DeleteProjectModal';
import { Pagination } from '../../components/ui/Pagination';
import { PlusIcon, EditIcon, TrashIcon, EllipsisIcon, SearchIcon } from '../../components/ui/Icons';
import DetailsDrawer from '../../components/ui/DetailsDrawer';
import ProjectDetails from '../../components/features/admin/projects/ProjectDetails';
import { Checkbox } from '../../components/ui/Checkbox';
import BulkDeleteConfirmationModal from '../../components/ui/BulkDeleteConfirmationModal';


const AdminProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [detailsProject, setDetailsProject] = useState<Project | null>(null);
    const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

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
        const handleClose = () => {
            setOpenMenu(null);
            setMenuPosition(null);
        };

        if (openMenu) {
            document.addEventListener('mousedown', handleClose);
            window.addEventListener('scroll', handleClose, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClose);
            window.removeEventListener('scroll', handleClose, true);
        };
    }, [openMenu]);

    useEffect(() => {
        setCurrentPage(1);
        setSelectedProjects(new Set());
    }, [rowsPerPage, search]);

    const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>, projectId: string) => {
        e.stopPropagation();
        if (openMenu === projectId) {
            setOpenMenu(null);
            setMenuPosition(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPosition({
                top: rect.top + window.scrollY,
                left: rect.right + window.scrollX,
            });
            setOpenMenu(projectId);
        }
    };

    const handleOpenCreateModal = () => {
        setSelectedProject(null);
        setIsFormModalOpen(true);
    };
    
    const handleOpenEditModal = (project: Project) => {
        setSelectedProject(project);
        setIsFormModalOpen(true);
        setOpenMenu(null);
        setDetailsProject(null);
    };

    const handleOpenDeleteModal = (project: Project) => {
        setSelectedProject(project);
        setIsDeleteModalOpen(true);
        setOpenMenu(null);
        setDetailsProject(null);
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
            setSelectedProjects(new Set());
        } catch (deleteError) {
            console.error('Failed to delete project:', deleteError);
        }
    };
    
    const handleConfirmBulkDelete = async () => {
        try {
            await deleteProjects(Array.from(selectedProjects));
            await fetchProjects();
        } catch (err) {
            console.error("Failed to delete projects:", err);
        } finally {
            setIsBulkDeleteModalOpen(false);
            setSelectedProjects(new Set());
        }
    };
    
    const filteredProjects = useMemo(() => projects.filter(project =>
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.key.toLowerCase().includes(search.toLowerCase())
    ), [projects, search]);

    const totalProjects = filteredProjects.length;
    const totalPages = useMemo(() => Math.ceil(totalProjects / rowsPerPage), [totalProjects, rowsPerPage]);
    const paginatedProjects = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredProjects.slice(start, end);
    }, [filteredProjects, currentPage, rowsPerPage]);
    
    const projectForMenu = openMenu ? projects.find(p => p.id === openMenu) : null;
    
    const handleSelectProject = (projectId: string, checked: boolean) => {
        setSelectedProjects(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(projectId);
            } else {
                newSet.delete(projectId);
            }
            return newSet;
        });
    };

    const handleSelectAllProjects = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProjects(new Set(paginatedProjects.map(p => p.id)));
        } else {
            setSelectedProjects(new Set());
        }
    };

    const areAllVisibleSelected = selectedProjects.size > 0 && paginatedProjects.length > 0 && paginatedProjects.every(p => selectedProjects.has(p.id));
    const isIndeterminate = selectedProjects.size > 0 && !areAllVisibleSelected;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Projects</h1>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-full max-w-xs">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or key..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    {selectedProjects.size > 0 && (
                        <button
                            onClick={() => setIsBulkDeleteModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                        >
                            <TrashIcon /> Delete ({selectedProjects.size})
                        </button>
                    )}
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon /> Add New Project
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col flex-1">
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 w-12">
                                    <Checkbox 
                                        id="select-all-projects"
                                        checked={areAllVisibleSelected}
                                        indeterminate={isIndeterminate}
                                        onChange={handleSelectAllProjects}
                                    />
                                </th>
                                {['Project Name', 'Key', 'Description', 'Users', 'Groups', 'Actions'].map(header => (
                                    <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${['Actions', 'Users', 'Groups'].includes(header) ? 'text-center' : ''}`}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {loading && (
                                <tr><td colSpan={7} className="text-center p-6 text-gray-500">Loading...</td></tr>
                            )}
                            {error && (
                                <tr><td colSpan={7} className="text-center p-6 text-red-500">{error}</td></tr>
                            )}
                            {!loading && !error && paginatedProjects.map((project) => (
                                <tr key={project.id} onClick={() => setDetailsProject(project)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                    <td onClick={(e) => e.stopPropagation()} className="px-4 py-3">
                                        <Checkbox 
                                            id={`project-${project.id}`}
                                            checked={selectedProjects.has(project.id)}
                                            onChange={(e) => handleSelectProject(project.id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate" title={project.name}>{project.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-300">{project.key}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 truncate" style={{ maxWidth: '300px' }} title={project.description}>{project.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{project.users.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{project.groups.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex justify-center items-center">
                                            <button onClick={(e) => handleMenuToggle(e, project.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-full">
                                                <EllipsisIcon />
                                            </button>
                                        </div>
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

            <BulkDeleteConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                itemCount={selectedProjects.size}
                itemType="projects"
            />

            {openMenu && menuPosition && projectForMenu && ReactDOM.createPortal(
                <div
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                        transform: 'translate(-100%, 0)',
                    }}
                    className="z-50 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700"
                >
                    <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                        <li onClick={() => handleOpenEditModal(projectForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><EditIcon className="w-4 h-4" /> Edit</li>
                        <li onClick={() => handleOpenDeleteModal(projectForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 cursor-pointer"><TrashIcon className="w-4 h-4" /> Delete</li>
                    </ul>
                </div>,
                document.body
            )}
            
            <DetailsDrawer
                isOpen={!!detailsProject}
                onClose={() => setDetailsProject(null)}
                title="Project Details"
            >
                {detailsProject && 
                    <ProjectDetails 
                        project={detailsProject} 
                        onEdit={() => handleOpenEditModal(detailsProject)}
                        onDelete={() => handleOpenDeleteModal(detailsProject)}
                    />
                }
            </DetailsDrawer>
        </div>
    );
};

export default AdminProjectsPage;