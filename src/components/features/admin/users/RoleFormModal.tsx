// Path: src/components/features/admin/users/RoleFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Role, getPermissions, PermissionGroup } from '../../../../services/roleService';
import { XIcon } from '../../../ui/Icons';
import { Checkbox } from '../../../ui/Checkbox';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  role: Role | null;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ isOpen, onClose, onSave, role }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      getPermissions().then(setPermissionGroups);
      if (role) {
        setName(role.name);
        setDescription(role.description);
        setSelectedPermissions(new Set(role.permissions));
      } else {
        setName('');
        setDescription('');
        setSelectedPermissions(new Set());
      }
    }
  }, [isOpen, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) newSet.delete(permissionId);
      else newSet.add(permissionId);
      return newSet;
    });
  };

  if (!isOpen) return null;

  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  
  const crudGroups = permissionGroups.filter(g => g.id !== 'pg-admin');
  const adminGroup = permissionGroups.find(g => g.id === 'pg-admin');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{role ? 'Edit Role' : 'Add Role'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon /></button>
        </div>

        <form id="role-form" onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role Name</label>
            <input type="text" id="roleName" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required />
          </div>
          <div>
            <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea id="roleDescription" value={description} onChange={e => setDescription(e.target.value)} className={`${inputStyle} h-24 resize-none`} />
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Permissions</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {crudGroups.map(group => {
                const createPerm = group.permissions.find(p => p.label === 'Create');
                const editPerm = group.permissions.find(p => p.label === 'Edit');
                const viewPerm = group.permissions.find(p => p.label === 'View');
                const deletePerm = group.permissions.find(p => p.label === 'Delete');

                return (
                  <div key={group.id}>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{group.name}</h4>
                    <div className="p-4 border dark:border-gray-600 rounded-md">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {createPerm && <Checkbox id={`perm-${createPerm.id}`} label={createPerm.label} checked={selectedPermissions.has(createPerm.id)} onChange={() => handlePermissionToggle(createPerm.id)} />}
                        {editPerm && <Checkbox id={`perm-${editPerm.id}`} label={editPerm.label} checked={selectedPermissions.has(editPerm.id)} onChange={() => handlePermissionToggle(editPerm.id)} />}
                        {viewPerm && <Checkbox id={`perm-${viewPerm.id}`} label={viewPerm.label} checked={selectedPermissions.has(viewPerm.id)} onChange={() => handlePermissionToggle(viewPerm.id)} />}
                        {deletePerm && <Checkbox id={`perm-${deletePerm.id}`} label={deletePerm.label} checked={selectedPermissions.has(deletePerm.id)} onChange={() => handlePermissionToggle(deletePerm.id)} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {adminGroup && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{adminGroup.name}</h4>
                <div className="p-4 border dark:border-gray-600 rounded-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {adminGroup.permissions.map(perm => (
                      <Checkbox
                        key={perm.id}
                        id={`perm-${perm.id}`}
                        label={perm.label}
                        checked={selectedPermissions.has(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="p-5 flex justify-end space-x-3 border-t dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" form="role-form" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
            {role ? 'Save Changes' : 'Add Role'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleFormModal;
