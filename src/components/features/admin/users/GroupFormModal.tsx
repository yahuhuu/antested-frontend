// Path: src/components/features/admin/users/GroupFormModal.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Group, User, getUsers } from '../../../../services/userService';
import { XIcon, ChevronDownIcon, TrashIcon } from '../../../ui/Icons';

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  group: Group | null;
}

const GroupFormModal: React.FC<GroupFormModalProps> = ({ isOpen, onClose, onSave, group }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      getUsers().then(setAllUsers);
      if (group) {
        setName(group.name);
        setDescription(group.description);
        setSelectedUserIds(new Set(group.users));
      } else {
        setName('');
        setDescription('');
        setSelectedUserIds(new Set());
      }
    }
  }, [isOpen, group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave();
  };
  
  const handleAddUser = (e: ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (userId) {
        setSelectedUserIds(prev => new Set(prev).add(userId));
        e.target.value = ''; // Reset select
    }
  };

  const handleRemoveUser = (userId: string) => {
      setSelectedUserIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
      });
  };

  if (!isOpen) return null;

  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const availableUsers = allUsers.filter(u => !selectedUserIds.has(u.id));
  const selectedUsers = Array.from(selectedUserIds).map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{group ? 'Edit Group' : 'Add Group'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon /></button>
        </div>

        <form id="group-form" onSubmit={handleSubmit} className="p-5 space-y-4 flex flex-col flex-grow">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input type="text" id="groupName" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required />
          </div>
          <div>
            <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea id="groupDescription" value={description} onChange={e => setDescription(e.target.value)} className={`${inputStyle} h-24 resize-none`} />
          </div>
          <div className="flex flex-col flex-grow min-h-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Users</label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 flex flex-col flex-grow min-h-0">
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
        </form>

        <div className="p-5 flex justify-end space-x-3 border-t dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" form="group-form" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
            {group ? 'Save Changes' : 'Add Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupFormModal;