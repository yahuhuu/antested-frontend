// Path: src/components/features/admin/customizations/CaseFieldsTab.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { getCaseFields, CaseField, deleteCaseFields, createCaseField, updateCaseField, getTemplates, Template } from '../../../../services/customizationService';
import { SearchIcon, PlusIcon, EllipsisIcon, EditIcon, TrashIcon } from '../../../ui/Icons';
import { Pagination } from '../../../ui/Pagination';
import DeleteConfirmationModal from '../users/DeleteConfirmationModal';
import DetailsDrawer from '../../../ui/DetailsDrawer';
import CaseFieldDetails from './CaseFieldDetails';
import { Checkbox } from '../../../ui/Checkbox';
import BulkDeleteConfirmationModal from '../../../ui/BulkDeleteConfirmationModal';
import CaseFieldFormModal from './CaseFieldFormModal';

const CaseFieldsTab: React.FC = () => {
  const [caseFields, setCaseFields] = useState<CaseField[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<CaseField | null>(null);
  const [selectedFieldIds, setSelectedFieldIds] = useState<Set<string>>(new Set());
  const [detailsField, setDetailsField] = useState<CaseField | null>(null);


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fieldsData, templatesData] = await Promise.all([
          getCaseFields(),
          getTemplates()
      ]);
      setCaseFields(fieldsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error("Failed to fetch customization data", error);
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
    setSelectedFieldIds(new Set());
  }, [search, rowsPerPage]);

  const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>, fieldId: string) => {
    e.stopPropagation();
    if (openMenu === fieldId) {
        setOpenMenu(null);
        setMenuPosition(null);
    } else {
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({
            top: rect.bottom + window.scrollY,
            left: rect.right + window.scrollX,
        });
        setOpenMenu(fieldId);
    }
  };

  const handleAdd = () => {
    setSelectedField(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (field: CaseField) => {
    setSelectedField(field);
    setIsFormModalOpen(true);
    setOpenMenu(null);
    setDetailsField(null);
  };

  const handleDelete = (field: CaseField) => {
    setSelectedField(field);
    setIsDeleteModalOpen(true);
    setOpenMenu(null);
    setDetailsField(null);
  };

  const handleSaveField = async (fieldData: Omit<CaseField, 'id'> | CaseField) => {
    try {
      if ('id' in fieldData && fieldData.id) {
        await updateCaseField(fieldData.id, fieldData);
      } else {
        await createCaseField(fieldData as Omit<CaseField, 'id'>);
      }
      setIsFormModalOpen(false);
      await fetchData();
    } catch (saveError) {
      console.error('Failed to save case field:', saveError);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedField) return;
    try {
        await deleteCaseFields([selectedField.id]);
        await fetchData();
    } catch(error) {
        console.error("Failed to delete field", error);
    } finally {
        setIsDeleteModalOpen(false);
        setSelectedField(null);
    }
  };

  const handleConfirmBulkDelete = async () => {
    try {
        await deleteCaseFields(Array.from(selectedFieldIds));
        await fetchData();
    } catch (error) {
        console.error("Failed to bulk delete case fields", error);
    } finally {
        setIsBulkDeleteModalOpen(false);
        setSelectedFieldIds(new Set());
    }
  };
  
  const templateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (templates.length > 0 && caseFields.length > 0) {
        caseFields.forEach(field => {
            const count = templates.filter(template => template.fieldIds.includes(field.id)).length;
            counts.set(field.id, count);
        });
    }
    return counts;
  }, [caseFields, templates]);


  const filteredFields = useMemo(() => caseFields.filter(field =>
    field.label.toLowerCase().includes(search.toLowerCase())
  ), [caseFields, search]);

  const totalFields = filteredFields.length;
  const totalPages = useMemo(() => Math.ceil(totalFields / rowsPerPage), [totalFields, rowsPerPage]);
  const paginatedFields = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredFields.slice(start, end);
  }, [filteredFields, currentPage, rowsPerPage]);

  const handleSelectField = (fieldId: string, checked: boolean) => {
    setSelectedFieldIds(prev => {
        const newSet = new Set(prev);
        if(checked) newSet.add(fieldId);
        else newSet.delete(fieldId);
        return newSet;
    });
  };

  const handleSelectAllFields = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedFieldIds(new Set(paginatedFields.map(f => f.id)));
    } else {
        setSelectedFieldIds(new Set());
    }
  };

  const areAllVisibleSelected = selectedFieldIds.size > 0 && paginatedFields.length > 0 && paginatedFields.every(f => selectedFieldIds.has(f.id));
  const isIndeterminate = selectedFieldIds.size > 0 && !areAllVisibleSelected;

  const fieldForMenu = openMenu ? caseFields.find(f => f.id === openMenu) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
            <div className="relative w-full max-w-xs">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by label..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
        </div>
        <div className="flex items-center gap-2">
            {selectedFieldIds.size > 0 && (
                <button
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                    <TrashIcon /> Delete ({selectedFieldIds.size})
                </button>
            )}
            <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
              <PlusIcon /> Add Case Field
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
                        id="select-all-fields"
                        checked={areAllVisibleSelected}
                        indeterminate={isIndeterminate}
                        onChange={handleSelectAllFields}
                    />
                </th>
                {['Label', 'Description', 'Type', 'Test Case Templates', 'Actions'].map(header => (
                  <th key={header} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${['Actions', 'Test Case Templates'].includes(header) ? 'text-center' : ''}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {loading ? (
                <tr><td colSpan={6} className="text-center p-6 text-gray-500">Loading...</td></tr>
              ) : (
                paginatedFields.map(field => (
                  <tr key={field.id} onClick={() => setDetailsField(field)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <td onClick={e => e.stopPropagation()} className="px-4 py-3">
                        <Checkbox 
                            id={`field-${field.id}`}
                            checked={selectedFieldIds.has(field.id)}
                            onChange={e => handleSelectField(field.id, e.target.checked)}
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{field.label}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 truncate max-w-sm">{field.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{field.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{templateCounts.get(field.id) || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-center items-center">
                            <button onClick={(e) => handleMenuToggle(e, field.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-full"><EllipsisIcon /></button>
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
          totalItems={totalFields}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </div>

      <CaseFieldFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveField}
        field={selectedField}
      />

      {openMenu && menuPosition && fieldForMenu && ReactDOM.createPortal(
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
                <li onClick={() => handleEdit(fieldForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><EditIcon className="w-4 h-4" /> Edit</li>
                <li onClick={() => handleDelete(fieldForMenu)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 cursor-pointer"><TrashIcon className="w-4 h-4" /> Delete</li>
            </ul>
        </div>,
        document.body
      )}

      {selectedField && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={selectedField.label}
          itemType="case field"
        />
      )}

       <BulkDeleteConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        itemCount={selectedFieldIds.size}
        itemType="case fields"
      />

      <DetailsDrawer
        isOpen={!!detailsField}
        onClose={() => setDetailsField(null)}
        title="Case Field Details"
      >
        {detailsField && 
            <CaseFieldDetails 
                field={detailsField} 
                onEdit={() => handleEdit(detailsField)}
                onDelete={() => handleDelete(detailsField)}
            />
        }
      </DetailsDrawer>
    </div>
  );
};

export default CaseFieldsTab;