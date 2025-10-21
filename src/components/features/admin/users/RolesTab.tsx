// Path: src/components/features/admin/users/RolesTab.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { getRoles, Role, deleteRole, deleteRoles } from '../../../../services/roleService';
import { SearchIcon, PlusIcon, EllipsisIcon, EditIcon, TrashIcon } from '../../../ui/Icons';
import { Pagination } from '../../../ui/Pagination';
import RoleFormModal from './RoleFormModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DetailsDrawer from '../../../ui/DetailsDrawer';
import RoleDetails from './RoleDetails';
import { Checkbox } from '../../../ui/Checkbox';
import BulkDeleteConfirmationModal from '../../../ui/BulkDeleteConfirmationModal';


const RolesTab: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
    const [detailsRole, setDetailsRole] = useState<Role | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getRoles();
            setRoles(data);
        } catch (error) {
            console.error("Failed to fetch roles", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    // Effect to close menu on outside click or scroll
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
        setSelectedRoleIds(new Set());
    }, [search, rowsPerPage]);
    
    const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>, roleId: string) => {
        e.stopPropagation(); // Prevent the document's mousedown listener from firing immediately
        if (openMenu === roleId) {
            setOpenMenu(null);
            setMenuPosition(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPosition({
                top: rect.top + window.scrollY,      // Position relative to top of button
                left: rect.right + window.scrollX,   // Position relative to right of button
            });
            setOpenMenu(roleId);
        }
    };

    const handleAddRole = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
        setOpenMenu(null);
        setDetailsRole(null);
    };

    const handleDeleteRole = (role: Role) => {
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
        setOpenMenu(null);
        setDetailsRole(null);
    };

    const handleConfirmDelete = async () => {
        if (!selectedRole) return;
        try {
            await deleteRole(selectedRole.id);
            setIsDeleteModalOpen(false);
            setSelectedRole(null);
            await fetchRoles();
        } catch (error) {
            console.error("Failed to delete role", error);
        }
    };

    const handleConfirmBulkDelete = async () => {
        try {
            await deleteRoles(Array.from(selectedRoleIds));
            await fetchRoles();
        } catch (error) {
            console.error("Failed to bulk delete roles", error);
        } finally {
            setIsBulkDeleteModalOpen(false);
            setSelectedRoleIds(new Set());
        }
    };

    const handleSaveRole = async () => {
        setIsModalOpen(false);
        await fetchRoles();
    }

    const filteredRoles = useMemo(() => roles.filter(role =>
        role.name.toLowerCase().includes(search.toLowerCase())
    ), [roles, search]);

    const totalRoles = filteredRoles.length;
    const totalPages = useMemo(() => Math.ceil(totalRoles / rowsPerPage), [totalRoles, rowsPerPage]);
    const paginatedRoles = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredRoles.slice(start, end);
    }, [filteredRoles, currentPage, rowsPerPage]);
    
    const handleSelectRole = (roleId: string, checked: boolean) => {
        setSelectedRoleIds(prev => {
            const newSet = new Set(prev);
            if (checked) newSet.add(roleId);
            else newSet.delete(roleId);
            return newSet;
        });
    };

    const handleSelectAllRoles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRoleIds(new Set(paginatedRoles.map(r => r.id)));
        } else {
            setSelectedRoleIds(new Set());
        }
    };

    const areAllVisibleSelected = selectedRoleIds.size > 0 && paginatedRoles.length > 0 && paginatedRoles.every(r => selectedRoleIds.has(r.id));
    const isIndeterminate = selectedRoleIds.size > 0 && !areAllVisibleSelected;

    const roleForMenu = openMenu ? roles.find(r => r.id === openMenu) : null;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-4">
                    <div className="relative w-full max-w-xs">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search roles..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {selectedRoleIds.size > 0 && (
                        <button
                            onClick={() => setIsBulkDeleteModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                        >
                            <TrashIcon /> Delete ({selectedRoleIds.size})
                        </button>
                    )}
                    <button
                        onClick={handleAddRole}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon /> Add Role
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
                                        id="select-all-roles"
                                        checked={areAllVisibleSelected}
                                        indeterminate={isIndeterminate}
                                        onChange={handleSelectAllRoles}
                                    />
                                </th>
                                {['Name', 'Description', 'Users', 'Actions'].map(header => (
                                    <th key={header} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${header === 'Actions' ? 'text-center' : ''}`}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-6 text-gray-500">Loading...</td></tr>
                            ) : (
                                paginatedRoles.map(role => (
                                    <tr key={role.id} onClick={() => setDetailsRole(role)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                        <td onClick={e => e.stopPropagation()} className="px-4 py-3">
                                            <Checkbox 
                                                id={`role-${role.id}`}
                                                checked={selectedRoleIds.has(role.id)}
                                                onChange={e => handleSelectRole(role.id, e.target.checked)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{role.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 truncate max-w-sm">{role.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{role.users}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex justify-center items-center">
                                                <button onClick={(e) => handleMenuToggle(e, role.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-full">
                                                    <EllipsisIcon />
                                                </button>
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
                    totalItems={totalRoles}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            </div>
            
            {openMenu && menuPosition && roleForMenu && ReactDOM.createPortal(
                <div
                    onMouseDown={e => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()} // Prevents clicks inside the menu from closing it
                    style={{
                        position: 'absolute',
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                        transform: 'translate(-100%, 0)', 
                    }}
                    className="z-50 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700"
                >
                    <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                        <li onClick={() => handleEditRole(roleForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><EditIcon className="w-4 h-4" /> Edit</li>
                        <li onClick={() => handleDeleteRole(roleForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 cursor-pointer"><TrashIcon className="w-4 h-4" /> Delete</li>
                    </ul>
                </div>,
                document.body
            )}

            <RoleFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveRole}
                role={selectedRole}
            />
            {selectedRole && (
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    itemName={selectedRole.name}
                    itemType="role"
                />
            )}
             <BulkDeleteConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                itemCount={selectedRoleIds.size}
                itemType="roles"
            />
            <DetailsDrawer
                isOpen={!!detailsRole}
                onClose={() => setDetailsRole(null)}
                title="Role Details"
            >
                {detailsRole && 
                    <RoleDetails 
                        role={detailsRole} 
                        onEdit={() => handleEditRole(detailsRole)}
                        onDelete={() => handleDeleteRole(detailsRole)}
                    />
                }
            </DetailsDrawer>
        </div>
    );
};

export default RolesTab;
