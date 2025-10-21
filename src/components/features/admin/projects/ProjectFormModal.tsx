// Path: src/components/features/admin/projects/ProjectFormModal.tsx
import React, { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { Project, NewProject } from '../../../../services/projectService';
import { User, Group, getUsers, getGroups } from '../../../../services/userService';
import { Template, getTemplates } from '../../../../services/customizationService';
import { UserIcon, ShieldCheckIcon, TrashIcon, ChevronDownIcon, XIcon } from '../../../ui/Icons';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: NewProject | Project) => Promise<void>;
  project: Project | null;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ isOpen, onClose, onSave, project }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'access'>('details');
  
  // Details State
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [enableApprovals, setEnableApprovals] = useState(false);
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [defaultTestCaseTemplateId, setDefaultTestCaseTemplateId] = useState<string>('');

  // Access State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({ name: '', key: ''});

  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm";

  // Reset form when modal opens or project changes
  useEffect(() => {
    if (isOpen) {
        getUsers().then(setAllUsers);
        getGroups().then(setAllGroups);
        getTemplates().then(setAllTemplates);

        if (project) {
            setName(project.name);
            setKey(project.key);
            setDescription(project.description);
            setEnableApprovals(project.enableApprovals);
            setDefaultTestCaseTemplateId(project.defaultTestCaseTemplateId || '');
            setSelectedUsers(project.users);
            setSelectedGroups(project.groups);
        } else {
            setName('');
            setKey('');
            setDescription('');
            setEnableApprovals(false);
            setDefaultTestCaseTemplateId('');
            setSelectedUsers([]);
            setSelectedGroups([]);
        }
        setErrors({ name: '', key: '' });
        setIsSaving(false);
        setActiveTab('details');
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) {
      setErrors({
          name: !name.trim() ? 'Project Name is required.' : '',
          key: !key.trim() ? 'Project Key is required.' : '',
      });
      setActiveTab('details'); // Switch to details tab if there's an error
      return;
    }
    setErrors({ name: '', key: '' });
    setIsSaving(true);
    
    const projectData = { name, key, description, enableApprovals, users: selectedUsers, groups: selectedGroups, defaultTestCaseTemplateId };
    
    try {
        if (project) await onSave({ ...project, ...projectData });
        else await onSave(projectData as NewProject);
    } finally {
        setIsSaving(false);
    }
  };

  const handleAddUser = (e: ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (!userId) return;
    const userToAdd = allUsers.find(u => u.id === userId);
    if (userToAdd && !selectedUsers.find(u => u.id === userId)) {
        setSelectedUsers(prev => [...prev, userToAdd]);
    }
    e.target.value = ''; // Reset select
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleAddGroup = (e: ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    if (!groupId) return;
    const groupToAdd = allGroups.find(g => g.id === groupId);
    if (groupToAdd && !selectedGroups.find(g => g.id === groupId)) {
        setSelectedGroups(prev => [...prev, groupToAdd]);
    }
    e.target.value = '';
  };

  const handleRemoveGroup = (groupId: string) => {
    setSelectedGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const availableUsers = allUsers.filter(u => !selectedUsers.some(su => su.id === u.id));
  const availableGroups = allGroups.filter(g => !selectedGroups.some(sg => sg.id === g.id));
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon className="w-6 h-6" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-5 flex-shrink-0">
            {[
                { id: 'details', label: 'Details', icon: <UserIcon className="w-5 h-5 mr-2" /> },
                { id: 'access', label: 'Access', icon: <ShieldCheckIcon className="w-5 h-5 mr-2" /> }
            ].map(tab => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}>
                    {tab.icon} {tab.label}
                 </button>
            ))}
        </div>
          
        <form id="project-form" onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-grow h-[480px]">
          {activeTab === 'details' && (
            <div className="flex flex-col h-full gap-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
                <input type="text" id="projectName" value={name} onChange={(e) => setName(e.target.value)}
                  className={`${inputStyle} ${errors.name ? 'border-red-500' : ''}`} required />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="projectKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Key</label>
                <input type="text" id="projectKey" value={key} onChange={(e) => setKey(e.target.value.toUpperCase())}
                  className={`${inputStyle} ${errors.key ? 'border-red-500' : ''}`} maxLength={5} required />
                {errors.key && <p className="text-xs text-red-500 mt-1">{errors.key}</p>}
              </div>
              <div className="flex flex-col">
                <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea id="projectDescription" value={description} onChange={(e) => setDescription(e.target.value)}
                  className={`${inputStyle} resize-none h-24`} />
              </div>
               <div>
                <label htmlFor="defaultTemplate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Test Case Template</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Select a default template for new test cases in this project.</p>
                <div className="relative mt-2">
                  <select
                    id="defaultTemplate"
                    value={defaultTestCaseTemplateId}
                    onChange={(e) => setDefaultTestCaseTemplateId(e.target.value)}
                    className={`${inputStyle} appearance-none pr-10`}
                  >
                    <option value="">None (Use system default)</option>
                    {allTemplates.map(tmpl => (
                      <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-start pt-2">
                  <div className="flex items-center h-5">
                    <input type="checkbox" id="enableApprovals" checked={enableApprovals} onChange={(e) => setEnableApprovals(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableApprovals" className="font-medium text-gray-900 dark:text-gray-300">Enable test case approvals</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Enables test case statuses and approvals for the project. Test runs which use all test cases will only use test cases with approved statuses. Additional test case status filters will be available when setting test run filters.</p>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="flex flex-col h-full gap-6">
                {/* Users Section */}
                <div className="flex flex-col flex-1 min-h-0">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex-shrink-0">Users</h3>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 flex flex-col flex-grow">
                      <div className="flex-grow overflow-y-auto p-2 space-y-2">
                          {selectedUsers.length > 0 ? selectedUsers.map(user => (
                              <div key={user.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800/50 p-2 rounded-md">
                                  <div className="flex items-center gap-3">
                                      <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                      <div>
                                          <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{user.name}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                      </div>
                                  </div>
                                  <button type="button" onClick={() => handleRemoveUser(user.id)} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                              </div>
                          )) : (
                            <div className="flex items-center justify-center h-full text-xs text-gray-500 dark:text-gray-400">No users have been added.</div>
                          )}
                      </div>
                      <div className="relative border-t border-gray-300 dark:border-gray-600 flex-shrink-0">
                          <select onChange={handleAddUser} value="" className="w-full appearance-none pl-9 pr-4 py-2 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                              <option value="" disabled>Add user...</option>
                              {availableUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                          </select>
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">+</span>
                          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                </div>

                {/* Groups Section */}
                <div className="flex flex-col flex-1 min-h-0">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex-shrink-0">Groups</h3>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 flex flex-col flex-grow">
                        <div className="flex-grow overflow-y-auto p-2 space-y-2">
                          {selectedGroups.length > 0 ? selectedGroups.map(group => (
                              <div key={group.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800/50 p-2 rounded-md">
                                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{group.name}</p>
                                  <button type="button" onClick={() => handleRemoveGroup(group.id)} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                              </div>
                          )) : (
                            <div className="flex items-center justify-center h-full text-xs text-gray-500 dark:text-gray-400">No groups have been added.</div>
                          )}
                        </div>
                        <div className="relative border-t border-gray-300 dark:border-gray-600 flex-shrink-0">
                            <select onChange={handleAddGroup} value="" className="w-full appearance-none pl-9 pr-4 py-2 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                                <option value="" disabled>Add group...</option>
                                {availableGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                            </select>
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">+</span>
                             <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="pt-4 p-5 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 transition">Cancel</button>
          <button type="submit" form="project-form" disabled={isSaving} className="px-4 py-2 w-32 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center">
            {isSaving ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            ) : (
              'Save Project'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectFormModal;