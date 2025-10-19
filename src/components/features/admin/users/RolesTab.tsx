// Path: src/components/features/admin/users/RolesTab.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { getRoles, Role, deleteRole } from '../../../../services/roleService';
import { SearchIcon, PlusIcon, EllipsisIcon, EditIcon, TrashIcon } from '../../../ui/Icons';
import { Pagination } from '../../../ui/Pagination';
import RoleFormModal from './RoleFormModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';


const RolesTab: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

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
    };

    const handleDeleteRole = (role: Role) => {
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
        setOpenMenu(null);
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
    
    const roleForMenu = openMenu ? roles.find(r => r.id === openMenu) : null;

    return (
        <>
            <div className="flex justify-between items-center mb-4">
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
                <button
                    onClick={handleAddRole}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon /> Add Role
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {['Name', 'Description', 'Users', 'Actions'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center p-6 text-gray-500">Loading...</td></tr>
                            ) : (
                                paginatedRoles.map(role => (
                                    <tr key={role.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{role.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 truncate max-w-sm">{role.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{role.users}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={(e) => handleMenuToggle(e, role.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-full">
                                                <EllipsisIcon />
                                            </button>
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
                    onClick={(e) => e.stopPropagation()} // Prevents clicks inside the menu from closing it
                    style={{
                        position: 'absolute',
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                        // Positions the menu's bottom-right corner at the button's top-right corner
                        transform: 'translate(-100%, -100%)', 
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
        </>
    );
};

export default RolesTab;
