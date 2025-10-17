// Path: src/components/layout/ProjectSidebar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useParams, useNavigate } from 'react-router-dom';
import { getProjects, Project } from '../../services/projectService';

// --- Icons ---
const OverviewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const TestCaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const TestRunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MilestoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BugIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-3-5v5m-3-8v8M9 9H5.21c-1.1 0-2 1.12-2 2.5v1C3.21 14.38 4.11 15.5 5.21 15.5H9m7-6.5h3.79c1.1 0 2 1.12 2 2.5v1c0 1.38-.9 2.5-2 2.5H16M9 9V7a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

const ProjectSidebar: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjectsData = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
        const foundProject = data.find(p => p.id === projectId);
        setCurrentProject(foundProject || null);
      } catch (error) {
        console.error("Failed to fetch projects for sidebar", error);
      }
    };
    fetchProjectsData();
  }, [projectId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProjectChange = (newProjectId: string) => {
    setIsSwitcherOpen(false);
    navigate(`/projects/${newProjectId}`);
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150 ease-in-out text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100 ${
      isActive ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 border-r-4 border-blue-500' : ''
    }`;

  const menuItems = [
    { to: `/projects/${projectId}`, label: 'Project Overview', icon: <OverviewIcon />, end: true },
    { to: `/projects/${projectId}/test-cases`, label: 'Test Cases', icon: <TestCaseIcon /> },
    { to: `/projects/${projectId}/runs`, label: 'Test Runs & Plans', icon: <TestRunIcon /> },
    { to: `/projects/${projectId}/milestones`, label: 'Milestones', icon: <MilestoneIcon /> },
    { to: `/projects/${projectId}/bugs`, label: 'Bug Reports', icon: <BugIcon /> },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 flex flex-col z-10">
      <div className="p-4 border-b dark:border-gray-700 relative" ref={switcherRef}>
        <button
          onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
          className="w-full flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <div className="flex flex-col items-start">
            <span className="text-sm text-gray-500 dark:text-gray-400">Current Project</span>
            <span className="font-bold text-gray-800 dark:text-white">{currentProject?.name || 'Loading...'}</span>
          </div>
          <ChevronDownIcon />
        </button>
        {isSwitcherOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-20">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => handleProjectChange(p.id)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {p.name}
              </button>
            ))}
            <Link to="/projects" className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold">
                View All Projects
            </Link>
          </div>
        )}
      </div>
      <nav className="flex-grow pt-4">
        {menuItems.map(item => (
          <NavLink key={item.to} to={item.to} className={navLinkClasses} end={item.end}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default ProjectSidebar;
