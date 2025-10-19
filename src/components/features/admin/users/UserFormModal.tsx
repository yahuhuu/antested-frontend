// Path: src/components/features/admin/users/UserFormModal.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import { User } from '../../../../services/userService';
import { getProjects, Project } from '../../../../services/projectService';
import { getGroups, Group } from '../../../../services/userService';
import { getRoles, Role } from '../../../../services/roleService';
import { Checkbox } from '../../../ui/Checkbox';
import { XIcon, UserIcon as DetailsIcon, ShieldCheckIcon, FolderIcon, ChevronDownIcon, TrashIcon } from '../../../ui/Icons';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  user: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const [activeTab, setActiveTab] = useState('details');

  // Data from services
  const [projects, setProjects] = useState<Project[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [passwordMethod, setPasswordMethod] = useState<'invite' | 'manual'>('invite');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [selectedProjectAccess, setSelectedProjectAccess] = useState<Map<string, string>>(new Map());
  const [errors, setErrors] = useState({ password: '' });


  useEffect(() => {
    if (isOpen) {
      // Fetch all data first, then initialize the form state once.
      // This prevents re-renders from fetched data resetting user interactions.
      Promise.all([
        getProjects(),
        getGroups(),
        getRoles()
      ]).then(([fetchedProjects, fetchedGroups, fetchedRoles]) => {
        setProjects(fetchedProjects);
        setGroups(fetchedGroups);
        setRoles(fetchedRoles);

        if (user) {
          // Populate form for an existing user
          setName(user.name);
          setEmail(user.email);
          setIsActive(user.status === 'Active');
          setSelectedRole(user.role); // The user model uses role name
          setSelectedGroupIds(new Set(user.groups));
          
          // Reset fields not present in the user object to a clean state
          setPasswordMethod('invite');
          setPassword('');
          setConfirmPassword('');
          setIsAdmin(false); // The user model does not have an admin flag, reset for clarity
          setSelectedProjectAccess(new Map());
        } else {
          // Reset for a new user
          setName('');
          setEmail('');
          setPasswordMethod('invite');
          setPassword('');
          setConfirmPassword('');
          setIsActive(true);
          setIsAdmin(false);
          const defaultRole = fetchedRoles.find(r => r.name === 'Tester');
          setSelectedRole(defaultRole ? defaultRole.name : '');
          setSelectedGroupIds(new Set());
          setSelectedProjectAccess(new Map());
        }
      });

      // Reset errors on open
      setErrors({ password: '' });
      setActiveTab('details');
    }
  }, [isOpen, user]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMethod === 'manual') {
      if (!password || password !== confirmPassword) {
        setErrors({ password: 'Passwords do not match or are empty.' });
        return;
      }
    }
    setErrors({ password: '' });
    await onSave();
  };

  const handleAddGroup = (e: ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    if (groupId) {
        setSelectedGroupIds(prev => new Set(prev).add(groupId));
        e.target.value = '';
    }
  };

  const handleRemoveGroup = (groupId: string) => {
    setSelectedGroupIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
    });
  };

  const handleAddProject = (e: ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    if (projectId) {
        setSelectedProjectAccess(prev => new Map(prev).set(projectId, 'Default'));
        e.target.value = '';
    }
  };

  const handleRemoveProject = (projectId: string) => {
    setSelectedProjectAccess(prev => {
        const newMap = new Map(prev);
        newMap.delete(projectId);
        return newMap;
    });
  };

  const handleProjectRoleChange = (projectId: string, roleName: string) => {
      setSelectedProjectAccess(prev => new Map(prev).set(projectId, roleName));
  };


  if (!isOpen) return null;

  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const availableGroups = groups.filter(g => !selectedGroupIds.has(g.id));
  const selectedGroups = Array.from(selectedGroupIds).map(id => groups.find(g => g.id === id)).filter(Boolean) as Group[];
  const availableProjects = projects.filter(p => !selectedProjectAccess.has(p.id));
  const selectedProjects = Array.from(selectedProjectAccess.keys()).map(id => projects.find(p => p.id === id)).filter(Boolean) as Project[];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user ? 'Edit User' : 'Add User'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon /></button>
        </div>

        <div className="flex border-b dark:border-gray-700 px-5">
            {[ { id: 'details', label: 'Details', icon: <DetailsIcon className="w-5 h-5 mr-2"/> }, { id: 'access', label: 'Access', icon: <ShieldCheckIcon className="w-5 h-5 mr-2"/> }, { id: 'projects', label: 'Projects', icon: <FolderIcon className="w-5 h-5 mr-2"/> } ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>

        <form id="user-form" onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-grow h-[480px]">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" id="fullName" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} required />
              </div>
              <Checkbox id="email-notifications" label="Enable email notifications" />
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">Email notifications are sent for test changes and test results. Note: global email notifications must also be enabled to use this feature.</p>
              
              <fieldset className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input id="invite-email" name="password-method" type="radio" checked={passwordMethod === 'invite'} onChange={() => setPasswordMethod('invite')} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="invite-email" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200">Invite user via email</label>
                  </div>
                  <div className="flex items-center">
                    <input id="manual-password" name="password-method" type="radio" checked={passwordMethod === 'manual'} onChange={() => setPasswordMethod('manual')} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="manual-password" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200">Manually specify password (no invitation is sent)</label>
                  </div>
                  {passwordMethod === 'manual' && (
                      <div className="ml-7 space-y-3 pt-2 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className={`${inputStyle} ${errors.password ? 'border-red-500' : ''}`} required />
                          </div>
                           <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                            <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`${inputStyle} ${errors.password ? 'border-red-500' : ''}`} required />
                          </div>
                          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                      </div>
                  )}
                </div>
              </fieldset>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="space-y-4 flex flex-col h-full">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <div className="relative">
                  <select id="role" value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className={`w-full appearance-none pl-4 pr-10 py-2 ${inputStyle}`} required>
                    {roles.map(role => <option key={role.id} value={role.name}>{role.name}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <Checkbox id="is-active" label="This user is active" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              <Checkbox id="is-admin" label="This user is an administrator" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} />
              
               <div className="flex flex-col flex-1 min-h-0 pt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Groups</label>
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
                              {availableGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">+</span>
                          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'projects' && (
             <div className="space-y-4 flex flex-col h-full">
               <p className="text-sm text-gray-600 dark:text-gray-300">Specify project access for this user. You can override the global role for specific projects.</p>
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 flex flex-col flex-grow">
                      <div className="flex-grow overflow-y-auto p-2 space-y-2">
                          {selectedProjects.length > 0 ? selectedProjects.map(project => (
                              <div key={project.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800/50 p-2 rounded-md gap-4">
                                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 flex-1 truncate">{project.name}</p>
                                  <select 
                                    value={selectedProjectAccess.get(project.id)}
                                    onChange={e => handleProjectRoleChange(project.id, e.target.value)}
                                    className="p-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md"
                                   >
                                    <option>Default</option>
                                    {roles.map(role => <option key={role.id}>{role.name}</option>)}
                                  </select>
                                  <button type="button" onClick={() => handleRemoveProject(project.id)} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                              </div>
                          )) : (
                            <div className="flex items-center justify-center h-full text-xs text-gray-500 dark:text-gray-400">No projects have been added.</div>
                          )}
                      </div>
                      <div className="relative border-t border-gray-300 dark:border-gray-600 flex-shrink-0">
                          <select onChange={handleAddProject} value="" className="w-full appearance-none pl-9 pr-4 py-2 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                              <option value="" disabled>Add project access...</option>
                              {availableProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">+</span>
                          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                </div>
             </div>
          )}
        </form>

        <div className="p-5 flex justify-end space-x-3 border-t dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" form="user-form" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
            {user ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
