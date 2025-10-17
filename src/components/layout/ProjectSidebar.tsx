// Path: src/components/layout/ProjectSidebar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useParams, useNavigate } from 'react-router-dom';
import { getProjects, Project } from '../../services/projectService';
import {
  ChevronDownIcon,
  OverviewIcon,
  TestCaseIcon,
  TestRunIcon,
  MilestoneIcon,
  BugIcon,
} from '../ui/Icons';


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
    `flex items-center px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-in-out rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
      isActive ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-l-4 border-blue-500 px-3' : ''
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
        <div className="mb-2 text-xs font-semibold text-gray-400 uppercase">Current Project</div>
        <button
          onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
          className="w-full flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <div className="flex flex-col items-start text-left">
            <span className="font-bold text-gray-800 dark:text-white truncate">{currentProject?.name || 'Loading...'}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{currentProject?.client}</span>
          </div>
          <ChevronDownIcon className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isSwitcherOpen ? 'rotate-180' : ''}`} />
        </button>
        {isSwitcherOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-20">
            {projects.filter(p => p.id !== projectId).map(p => (
              <button
                key={p.id}
                onClick={() => handleProjectChange(p.id)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {p.name}
              </button>
            ))}
            <div className="border-t dark:border-gray-700 my-1"></div>
            <Link to="/projects" className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold">
                View All Projects
            </Link>
          </div>
        )}
      </div>
      <nav className="flex-grow p-4 space-y-2">
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