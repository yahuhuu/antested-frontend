// Path: src/components/features/admin/users/UsersTab.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { getUsers, User, activateUser, deactivateUser, deleteUser, deleteUsers } from '../../../../services/userService';
import { getProjects, Project } from '../../../../services/projectService';
import { SearchIcon, PlusIcon, EllipsisIcon, EditIcon, TrashIcon, UserCircleIcon, LockClosedIcon as DeactivateIcon, ChevronDownIcon } from '../../../ui/Icons';
import { Checkbox } from '../../../ui/Checkbox';
import { Pagination } from '../../../ui/Pagination';
import UserFormModal from './UserFormModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ToggleStatusConfirmationModal from './ToggleStatusConfirmationModal';
import DetailsDrawer from '../../../ui/DetailsDrawer';
import UserDetails from './UserDetails';
import BulkDeleteConfirmationModal from '../../../ui/BulkDeleteConfirmationModal';

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsUser, setDetailsUser] = useState<User | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    getProjects().then(setProjects).catch(err => console.error("Failed to fetch projects", err));
  }, [fetchUsers]);

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
    setSelectedUserIds(new Set());
  }, [search, rowsPerPage, statusFilter]);

  const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>, userId: string) => {
    e.stopPropagation();
    if (openMenu === userId) {
        setOpenMenu(null);
        setMenuPosition(null);
    } else {
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({
            top: rect.top + window.scrollY,
            left: rect.right + window.scrollX,
        });
        setOpenMenu(userId);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setOpenMenu(null);
    setDetailsUser(null);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
    setOpenMenu(null);
    setDetailsUser(null);
  };

  const handleSaveUser = async () => {
      setIsModalOpen(false);
      await fetchUsers();
  };

  const handleToggleUserStatus = (user: User) => {
    setSelectedUser(user);
    setIsToggleStatusModalOpen(true);
    setOpenMenu(null);
    setDetailsUser(null);
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

  const handleConfirmBulkDelete = async () => {
    try {
      await deleteUsers(Array.from(selectedUserIds));
      await fetchUsers();
    } catch (err) {
      console.error("Failed to bulk delete users:", err);
    } finally {
      setIsBulkDeleteModalOpen(false);
      setSelectedUserIds(new Set());
    }
  };

  const userProjectCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (projects.length > 0 && users.length > 0) {
        users.forEach(user => {
            let count = 0;
            projects.forEach(project => {
                const isDirectMember = project.users.some(projectUser => projectUser.id === user.id);
                const isGroupMember = project.groups.some(projectGroup => user.groups.includes(projectGroup.id));
                if (isDirectMember || isGroupMember) {
                    count++;
                }
            });
            counts.set(user.id, count);
        });
    }
    return counts;
  }, [users, projects]);

  const filteredUsers = useMemo(() => users.filter(user =>
    (user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || user.status === statusFilter)
  ), [users, search, statusFilter]);

  const totalUsers = filteredUsers.length;
  const totalPages = useMemo(() => Math.ceil(totalUsers / rowsPerPage), [totalUsers, rowsPerPage]);
  const paginatedUsers = useMemo(() => {
      const start = (currentPage - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (checked) newSet.add(userId);
      else newSet.delete(userId);
      return newSet;
    });
  };

  const handleSelectAllUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(new Set(paginatedUsers.map(u => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const areAllVisibleSelected = selectedUserIds.size > 0 && paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUserIds.has(u.id));
  const isIndeterminate = selectedUserIds.size > 0 && !areAllVisibleSelected;

  const userForMenu = openMenu ? users.find(u => u.id === openMenu) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
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
             <div className="relative w-full sm:w-44">
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                    <option value="All">Status: All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
        </div>
        <div className="flex items-center gap-2">
            {selectedUserIds.size > 0 && (
                <button
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                    <TrashIcon /> Delete ({selectedUserIds.size})
                </button>
            )}
            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon /> Add User
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
                        id="select-all-users"
                        checked={areAllVisibleSelected}
                        indeterminate={isIndeterminate}
                        onChange={handleSelectAllUsers}
                    />
                </th>
                {['Name', 'Role', 'Status', 'Groups', 'Projects', 'Last Active', 'Actions'].map(header => (
                  <th key={header} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${['Actions', 'Groups', 'Projects'].includes(header) ? 'text-center' : ''}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {loading ? (
                <tr><td colSpan={8} className="text-center p-6 text-gray-500">Loading...</td></tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id} onClick={() => setDetailsUser(user)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <td onClick={(e) => e.stopPropagation()} className="px-4 py-3">
                        <Checkbox 
                            id={`user-${user.id}`}
                            checked={selectedUserIds.has(user.id)}
                            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                        />
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{user.groups.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{userProjectCounts.get(user.id) || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.lastActive}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center items-center">
                        <button onClick={(e) => handleMenuToggle(e, user.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-full"><EllipsisIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalItems={totalUsers}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </div>

      {openMenu && menuPosition && userForMenu && ReactDOM.createPortal(
        <div
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            style={{
                position: 'absolute',
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                transform: 'translate(-100%, 0)',
            }}
            className="z-50 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700"
        >
            <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                <li onClick={() => handleEditUser(userForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><EditIcon className="w-4 h-4" /> Edit</li>
                <li onClick={() => handleToggleUserStatus(userForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  {userForMenu.status === 'Active' ? <DeactivateIcon className="w-4 h-4" /> : <UserCircleIcon className="w-4 h-4" />}
                  {userForMenu.status === 'Active' ? 'Deactivate' : 'Activate'} User
                </li>
                <li onClick={() => handleDeleteUser(userForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 cursor-pointer"><TrashIcon className="w-4 h-4" /> Delete User</li>
            </ul>
        </div>,
        document.body
      )}

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
      
      <BulkDeleteConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        itemCount={selectedUserIds.size}
        itemType="users"
      />

      <ToggleStatusConfirmationModal
        isOpen={isToggleStatusModalOpen}
        onClose={() => setIsToggleStatusModalOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        user={selectedUser}
      />

      <DetailsDrawer
        isOpen={!!detailsUser}
        onClose={() => setDetailsUser(null)}
        title="User Details"
      >
        {detailsUser && 
            <UserDetails 
                user={detailsUser}
                onEdit={() => handleEditUser(detailsUser)}
                onDelete={() => handleDeleteUser(detailsUser)}
            />
        }
      </DetailsDrawer>
    </div>
  );
};

export default UsersTab;
