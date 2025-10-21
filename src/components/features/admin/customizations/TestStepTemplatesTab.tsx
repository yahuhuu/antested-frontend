// Path: src/components/features/admin/customizations/TestStepTemplatesTab.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { getTestStepTemplates, TestStepTemplateDefinition, deleteTestStepTemplates, Template, getTemplates } from '../../../../services/customizationService';
import { SearchIcon, PlusIcon, TrashIcon, EllipsisIcon, EditIcon } from '../../../ui/Icons';
import { Pagination } from '../../../ui/Pagination';
import { Checkbox } from '../../../ui/Checkbox';
import BulkDeleteConfirmationModal from '../../../ui/BulkDeleteConfirmationModal';
import TestStepTemplateFormModal from './TestStepTemplateFormModal';
import DetailsDrawer from '../../../ui/DetailsDrawer';
import TestStepTemplateDetails from './TestStepTemplateDetails';
import DeleteConfirmationModal from '../users/DeleteConfirmationModal';

const TestStepTemplatesTab: React.FC = () => {
    const [templates, setTemplates] = useState<TestStepTemplateDefinition[]>([]);
    const [caseTemplates, setCaseTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TestStepTemplateDefinition | null>(null);
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
    const [detailsTemplate, setDetailsTemplate] = useState<TestStepTemplateDefinition | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [stepTemplatesData, caseTemplatesData] = await Promise.all([
                getTestStepTemplates(),
                getTemplates()
            ]);
            setTemplates(stepTemplatesData);
            setCaseTemplates(caseTemplatesData);
        } catch (error) {
            console.error("Failed to fetch templates", error);
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


    const handleAdd = () => {
        setSelectedTemplate(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (template: TestStepTemplateDefinition) => {
        setSelectedTemplate(template);
        setIsFormModalOpen(true);
        setDetailsTemplate(null); // Close drawer when editing
        setOpenMenu(null);
    };

    const handleDelete = (template: TestStepTemplateDefinition) => {
        setSelectedTemplate(template);
        setIsDeleteModalOpen(true);
        setDetailsTemplate(null); // Close drawer
        setOpenMenu(null);
    };
    
    const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>, templateId: string) => {
        e.stopPropagation();
        if (openMenu === templateId) {
            setOpenMenu(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY,
                left: rect.right + window.scrollX,
            });
            setOpenMenu(templateId);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedTemplate) return;
        try {
            await deleteTestStepTemplates([selectedTemplate.id]);
            await fetchData();
        } catch (error) {
            console.error("Failed to delete template", error);
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedTemplate(null);
        }
    };

    const handleSave = async () => {
        setIsFormModalOpen(false);
        await fetchData();
    };

    const handleConfirmBulkDelete = async () => {
        try {
            await deleteTestStepTemplates(Array.from(selectedTemplateIds));
            await fetchData();
        } catch (error) {
            console.error("Failed to bulk delete templates", error);
        } finally {
            setIsBulkDeleteModalOpen(false);
            setSelectedTemplateIds(new Set());
        }
    };

    const usageCounts = useMemo(() => {
        const counts = new Map<string, number>();
        if (caseTemplates.length > 0 && templates.length > 0) {
            templates.forEach(stepTemplate => {
                const count = caseTemplates.filter(
                    caseTmpl => caseTmpl.defaultTestStepTemplateId === stepTemplate.id
                ).length;
                counts.set(stepTemplate.id, count);
            });
        }
        return counts;
    }, [templates, caseTemplates]);
    
    const filteredTemplates = useMemo(() => templates.filter(template =>
        template.name.toLowerCase().includes(search.toLowerCase())
    ), [templates, search]);

    const totalTemplates = filteredTemplates.length;
    const totalPages = useMemo(() => Math.ceil(totalTemplates / rowsPerPage), [totalTemplates, rowsPerPage]);
    const paginatedTemplates = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredTemplates.slice(start, end);
    }, [filteredTemplates, currentPage, rowsPerPage]);
    
    const handleSelectTemplate = (id: string, checked: boolean) => {
        setSelectedTemplateIds(prev => {
            const newSet = new Set(prev);
            if (checked) newSet.add(id);
            else newSet.delete(id);
            return newSet;
        });
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTemplateIds(new Set(paginatedTemplates.map(t => t.id)));
        } else {
            setSelectedTemplateIds(new Set());
        }
    };
    
    const areAllVisibleSelected = selectedTemplateIds.size > 0 && paginatedTemplates.length > 0 && paginatedTemplates.every(t => selectedTemplateIds.has(t.id));
    const isIndeterminate = selectedTemplateIds.size > 0 && !areAllVisibleSelected;
    const templateForMenu = openMenu ? templates.find(t => t.id === openMenu) : null;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-xs">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {selectedTemplateIds.size > 0 && (
                        <button
                            onClick={() => setIsBulkDeleteModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                        >
                            <TrashIcon /> Delete ({selectedTemplateIds.size})
                        </button>
                    )}
                    <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                        <PlusIcon /> Add Step Template
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
                                        id="select-all-step-templates"
                                        checked={areAllVisibleSelected}
                                        indeterminate={isIndeterminate}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                {['Name', 'Description', 'Test Case Templates', 'Actions'].map(header => (
                                    <th key={header} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${['Actions', 'Test Case Templates'].includes(header) ? 'text-center' : ''}`}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-6 text-gray-500">Loading...</td></tr>
                            ) : (
                                paginatedTemplates.map(template => (
                                    <tr key={template.id} onClick={() => setDetailsTemplate(template)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                        <td onClick={e => e.stopPropagation()} className="px-4 py-3">
                                            <Checkbox
                                                id={`template-${template.id}`}
                                                checked={selectedTemplateIds.has(template.id)}
                                                onChange={e => handleSelectTemplate(template.id, e.target.checked)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{template.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 truncate max-w-md">{template.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{usageCounts.get(template.id) || 0}</td>
                                        <td onClick={e => e.stopPropagation()} className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex justify-center items-center">
                                                <button onClick={(e) => handleMenuToggle(e, template.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-full"><EllipsisIcon /></button>
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
                    totalItems={totalTemplates}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            </div>

             {openMenu && menuPosition && templateForMenu && ReactDOM.createPortal(
                <div
                    style={{ position: 'absolute', top: `${menuPosition.top}px`, left: `${menuPosition.left}px`, transform: 'translate(-100%, 0)' }}
                    className="z-50 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700"
                    onMouseDown={e => e.stopPropagation()}
                >
                    <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                        <li onClick={() => handleEdit(templateForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><EditIcon className="w-4 h-4"/> Edit</li>
                        <li onClick={() => handleDelete(templateForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 cursor-pointer"><TrashIcon className="w-4 h-4"/> Delete</li>
                    </ul>
                </div>,
                document.body
            )}
            
            <TestStepTemplateFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSave}
                template={selectedTemplate}
            />

            {selectedTemplate && (
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    itemName={selectedTemplate.name}
                    itemType="test step template"
                />
            )}

            <BulkDeleteConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                itemCount={selectedTemplateIds.size}
                itemType="test step templates"
            />
            
            <DetailsDrawer 
                isOpen={!!detailsTemplate} 
                onClose={() => setDetailsTemplate(null)} 
                title="Test Step Template Details"
            >
                {detailsTemplate && (
                    <TestStepTemplateDetails 
                        template={detailsTemplate}
                        onEdit={() => handleEdit(detailsTemplate)}
                        onDelete={() => handleDelete(detailsTemplate)}
                    />
                )}
            </DetailsDrawer>
        </div>
    );
};

export default TestStepTemplatesTab;