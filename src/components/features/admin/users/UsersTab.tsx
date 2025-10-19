// Path: src/components/features/admin/users/UsersTab.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getUsers, User, activateUser, deactivateUser, deleteUser } from '../../../../services/userService';
import { SearchIcon, PlusIcon, EllipsisIcon, EditIcon, TrashIcon, UserCircleIcon, LockClosedIcon as DeactivateIcon } from '../../../ui/Icons';
import { Checkbox } from '../../../ui/Checkbox';
import UserFormModal from './UserFormModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ToggleStatusConfirmationModal from './ToggleStatusConfirmationModal';

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
        const data = await getUsers();
        setUsers(data);
    } catch (error) {
        console.error("Failed to fetch users", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenMenu(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setOpenMenu(null);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
    setOpenMenu(null);
  };

  const handleSaveUser = async () => {
      setIsModalOpen(false);
      await fetchUsers();
  };

  const handleToggleUserStatus = (user: User) => {
    setSelectedUser(user);
    setIsToggleStatusModalOpen(true);
    setOpenMenu(null);
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedUser) return;
    try {
      if (selectedUser.status === 'Active') {
        await deactivateUser(selectedUser.id);
      } else {
        await activateUser(selectedUser.id);
      }
      await fetchUsers();
    } catch (error) {
      console.error("Failed to toggle user status", error);
    } finally {
      setIsToggleStatusModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon /> Add User
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 w-12"><Checkbox id="select-all-users" /></th>
              {['Name', 'Role', 'Status', 'Last Active', 'Actions'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {loading ? (
              <tr><td colSpan={6} className="text-center p-6 text-gray-500">Loading...</td></tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-4 py-3"><Checkbox id={`user-${user.id}`} /></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.lastActive}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <button onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-full"><EllipsisIcon /></button>
                     {openMenu === user.id && (
                         <div ref={menuRef} className="absolute right-8 top-full z-10 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700">
                            <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                                <li onClick={() => handleEditUser(user)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><EditIcon className="w-4 h-4" /> Edit</li>
                                <li onClick={() => handleToggleUserStatus(user)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                  {user.status === 'Active' ? <DeactivateIcon className="w-4 h-4" /> : <UserCircleIcon className="w-4 h-4" />}
                                  {user.status === 'Active' ? 'Deactivate' : 'Activate'} User
                                </li>
                                <li onClick={() => handleDeleteUser(user)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 cursor-pointer"><TrashIcon className="w-4 h-4" /> Delete User</li>
                            </ul>
                        </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
      />
      
      {selectedUser && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={selectedUser.name}
          itemType="user"
        />
      )}
      
      <ToggleStatusConfirmationModal
        isOpen={isToggleStatusModalOpen}
        onClose={() => setIsToggleStatusModalOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        user={selectedUser}
      />
    </>
  );
};

export default UsersTab;
