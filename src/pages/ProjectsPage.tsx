// Path: pages/ProjectsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, Project, NewProject } from '../services/projectService';
import CreateProjectModal from '../components/features/projects/CreateProjectModal';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSaveProject = async (projectData: NewProject) => {
    try {
      await createProject(projectData);
      setIsModalOpen(false);
      await fetchProjects();
    } catch (saveError) {
      console.error('Failed to save project:', saveError);
      alert('Failed to save project. Check console for details.');
    }
  };
  
  const handleCardClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-10 mt-8">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-600 dark:text-gray-400">Loading projects...</span>
        </div>
      );
    }

    if (error) {
      return <p className="text-center text-red-500 mt-8">{error}</p>;
    }

    if (projects.length === 0 && !loading) {
        return <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No projects found. Get started by adding a new project.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out border dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
            onClick={() => handleCardClick(project.id)}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={project.name}>{project.name}</h2>
              <span className="flex-shrink-0 ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">{project.key}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Click to view details and test suites.</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Projects</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-150 ease-in-out flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </button>
      </div>
      
      {renderContent()}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
      />
    </>
  );
};

export default ProjectsPage;