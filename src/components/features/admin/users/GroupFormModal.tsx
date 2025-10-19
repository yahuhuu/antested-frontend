// Path: src/components/features/admin/users/GroupFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Group, User, getUsers } from '../../../../services/userService';
import { XIcon } from '../../../ui/Icons';

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
  
  const handleUserToggle = (userId: string) => {
      setSelectedUserIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(userId)) {
              newSet.delete(userId);
          } else {
              newSet.add(userId);
          }
          return newSet;
      })
  }

  if (!isOpen) return null;

  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{group ? 'Edit Group' : 'Add Group'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon /></button>
        </div>

        <form id="group-form" onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input type="text" id="groupName" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required />
          </div>
          <div>
            <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea id="groupDescription" value={description} onChange={e => setDescription(e.target.value)} className={`${inputStyle} h-24 resize-none`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Users</label>
            <div className="mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md h-48 overflow-y-auto space-y-1">
                {allUsers.map(user => (
                    <label key={user.id} className="flex items-center space-x-3 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                        <input type="checkbox" checked={selectedUserIds.has(user.id)} onChange={() => handleUserToggle(user.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 dark:text-gray-200">{user.name}</span>
                    </label>
                ))}
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
