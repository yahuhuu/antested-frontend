// Path: src/components/features/admin/users/GroupsTab.tsx
import React, { useState, useEffect, useRef } from 'react';
import { getGroups, Group } from '../../../../services/userService';
import { SearchIcon, PlusIcon, EllipsisIcon, EditIcon, TrashIcon } from '../../../ui/Icons';
import GroupFormModal from './GroupFormModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const GroupsTab: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true);
            const data = await getGroups();
            setGroups(data);
            setLoading(false);
        };
        fetchGroups();
    }, []);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, []);

    const handleAddGroup = () => {
        setSelectedGroup(null);
        setIsModalOpen(true);
    };

    const handleEditGroup = (group: Group) => {
        setSelectedGroup(group);
        setIsModalOpen(true);
        setOpenMenu(null);
    };

    const handleDeleteGroup = (group: Group) => {
        setSelectedGroup(group);
        setIsDeleteModalOpen(true);
        setOpenMenu(null);
    };

    const handleSaveGroup = async () => {
        setIsModalOpen(false);
        setLoading(true);
        const data = await getGroups();
        setGroups(data);
        setLoading(false);
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="flex justify-between items-center mb-4">
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
                <button
                    onClick={handleAddGroup}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon /> Add Group
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
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
                            filteredGroups.map(group => (
                                <tr key={group.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{group.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 truncate max-w-sm">{group.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{group.users.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                                        <button onClick={() => setOpenMenu(openMenu === group.id ? null : group.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-full"><EllipsisIcon /></button>
                                        {openMenu === group.id && (
                                            <div ref={menuRef} className="absolute right-8 top-full z-10 mt-2 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700">
                                                <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                                                    <li onClick={() => handleEditGroup(group)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><EditIcon className="w-4 h-4" /> Edit</li>
                                                    <li onClick={() => handleDeleteGroup(group)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 cursor-pointer"><TrashIcon className="w-4 h-4" /> Delete</li>
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
                    onConfirm={() => setIsDeleteModalOpen(false)}
                    itemName={selectedGroup.name}
                    itemType="group"
                />
            )}
        </>
    );
};

export default GroupsTab;
