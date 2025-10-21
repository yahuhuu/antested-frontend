// Path: src/components/features/admin/users/GroupsTab.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { getGroups, Group, deleteGroups } from '../../../../services/userService';
import { getProjects, Project } from '../../../../services/projectService';
import { SearchIcon, PlusIcon, EllipsisIcon, EditIcon, TrashIcon } from '../../../ui/Icons';
import { Pagination } from '../../../ui/Pagination';
import GroupFormModal from './GroupFormModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DetailsDrawer from '../../../ui/DetailsDrawer';
import GroupDetails from './GroupDetails';
import { Checkbox } from '../../../ui/Checkbox';
import BulkDeleteConfirmationModal from '../../../ui/BulkDeleteConfirmationModal';


const GroupsTab: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
    const [detailsGroup, setDetailsGroup] = useState<Group | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [groupsData, projectsData] = await Promise.all([getGroups(), getProjects()]);
            setGroups(groupsData);
            setProjects(projectsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
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
        setSelectedGroupIds(new Set());
    }, [search, rowsPerPage]);

    const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>, groupId: string) => {
        e.stopPropagation();
        if (openMenu === groupId) {
            setOpenMenu(null);
            setMenuPosition(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPosition({
                top: rect.top + window.scrollY,
                left: rect.right + window.scrollX,
            });
            setOpenMenu(groupId);
        }
    };

    const handleAddGroup = () => {
        setSelectedGroup(null);
        setIsModalOpen(true);
    };

    const handleEditGroup = (group: Group) => {
        setSelectedGroup(group);
        setIsModalOpen(true);
        setOpenMenu(null);
        setDetailsGroup(null);
    };

    const handleDeleteGroup = (group: Group) => {
        setSelectedGroup(group);
        setIsDeleteModalOpen(true);
        setOpenMenu(null);
        setDetailsGroup(null);
    };

    const handleSaveGroup = async () => {
        setIsModalOpen(false);
        await fetchData();
    };

    const handleConfirmDelete = async () => {
        if (!selectedGroup) return;
        try {
            await deleteGroups([selectedGroup.id]);
            await fetchData();
        } catch (error) {
            console.error("Failed to delete group", error);
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedGroup(null);
        }
    };

    const handleConfirmBulkDelete = async () => {
        try {
            await deleteGroups(Array.from(selectedGroupIds));
            await fetchData();
        } catch (error) {
            console.error("Failed to bulk delete groups", error);
        } finally {
            setIsBulkDeleteModalOpen(false);
            setSelectedGroupIds(new Set());
        }
    };

    const groupProjectCounts = useMemo(() => {
        const counts = new Map<string, number>();
        if (projects.length > 0 && groups.length > 0) {
            groups.forEach(group => {
                const count = projects.filter(project => 
                    project.groups.some(g => g.id === group.id)
                ).length;
                counts.set(group.id, count);
            });
        }
        return counts;
    }, [groups, projects]);

    const filteredGroups = useMemo(() => groups.filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase())
    ), [groups, search]);

    const totalGroups = filteredGroups.length;
    const totalPages = useMemo(() => Math.ceil(totalGroups / rowsPerPage), [totalGroups, rowsPerPage]);
    const paginatedGroups = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredGroups.slice(start, end);
    }, [filteredGroups, currentPage, rowsPerPage]);

    const handleSelectGroup = (groupId: string, checked: boolean) => {
        setSelectedGroupIds(prev => {
            const newSet = new Set(prev);
            if (checked) newSet.add(groupId);
            else newSet.delete(groupId);
            return newSet;
        });
    };

    const handleSelectAllGroups = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedGroupIds(new Set(paginatedGroups.map(g => g.id)));
        } else {
            setSelectedGroupIds(new Set());
        }
    };

    const areAllVisibleSelected = selectedGroupIds.size > 0 && paginatedGroups.length > 0 && paginatedGroups.every(g => selectedGroupIds.has(g.id));
    const isIndeterminate = selectedGroupIds.size > 0 && !areAllVisibleSelected;

    const groupForMenu = openMenu ? groups.find(g => g.id === openMenu) : null;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-full max-w-xs">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {selectedGroupIds.size > 0 && (
                        <button
                            onClick={() => setIsBulkDeleteModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                        >
                            <TrashIcon /> Delete ({selectedGroupIds.size})
                        </button>
                    )}
                    <button
                        onClick={handleAddGroup}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon /> Add Group
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
                                        id="select-all-groups"
                                        checked={areAllVisibleSelected}
                                        indeterminate={isIndeterminate}
                                        onChange={handleSelectAllGroups}
                                    />
                                </th>
                                {['Name', 'Description', 'Users', 'Projects', 'Actions'].map(header => (
                                    <th key={header} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${['Actions', 'Users', 'Projects'].includes(header) ? 'text-center' : ''}`}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center p-6 text-gray-500">Loading...</td></tr>
                            ) : (
                                paginatedGroups.map(group => (
                                    <tr key={group.id} onClick={() => setDetailsGroup(group)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                        <td onClick={e => e.stopPropagation()} className="px-4 py-3">
                                            <Checkbox 
                                                id={`group-${group.id}`}
                                                checked={selectedGroupIds.has(group.id)}
                                                onChange={e => handleSelectGroup(group.id, e.target.checked)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{group.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 truncate max-w-sm">{group.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{group.users.length}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{groupProjectCounts.get(group.id) || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex justify-center items-center">
                                                <button onClick={(e) => handleMenuToggle(e, group.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-full"><EllipsisIcon /></button>
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
                    totalItems={totalGroups}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            </div>

            {openMenu && menuPosition && groupForMenu && ReactDOM.createPortal(
                <div
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                        transform: 'translate(-100%, 0)',
                    }}
                    className="z-50 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700"
                >
                    <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                        <li onClick={() => handleEditGroup(groupForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><EditIcon className="w-4 h-4" /> Edit</li>
                        <li onClick={() => handleDeleteGroup(groupForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 cursor-pointer"><TrashIcon className="w-4 h-4" /> Delete</li>
                    </ul>
                </div>,
                document.body
            )}

            <GroupFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveGroup}
                group={selectedGroup}
            />

            {selectedGroup && (
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    itemName={selectedGroup.name}
                    itemType="group"
                />
            )}
            
            <BulkDeleteConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                itemCount={selectedGroupIds.size}
                itemType="groups"
            />

            <DetailsDrawer
                isOpen={!!detailsGroup}
                onClose={() => setDetailsGroup(null)}
                title="Group Details"
            >
                {detailsGroup && 
                    <GroupDetails 
                        group={detailsGroup} 
                        onEdit={() => handleEditGroup(detailsGroup)}
                        onDelete={() => handleDeleteGroup(detailsGroup)}
                    />
                }
            </DetailsDrawer>
        </div>
    );
};

export default GroupsTab;