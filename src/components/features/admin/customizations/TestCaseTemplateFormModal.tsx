// Path: src/components/features/admin/customizations/TestCaseTemplateFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Template, CaseField, getCaseFields, TestStepTemplateDefinition, getTestStepTemplates } from '../../../../services/customizationService';
import { XIcon, PencilIcon, EyeIcon, LockClosedIcon, PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '../../../ui/Icons';
import { Checkbox } from '../../../ui/Checkbox';
import DynamicTestStepPreview from './DynamicTestStepPreview';


interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: Omit<Template, 'id'> | Template) => Promise<void>;
  template: Template | null;
}

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({ isOpen, onClose, onSave, template }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [activeTab, setActiveTab] = useState('editor');
    
    const [allCaseFields, setAllCaseFields] = useState<CaseField[]>([]);
    
    // Split template fields into sections for constrained reordering
    const [stringFields, setStringFields] = useState<CaseField[]>([]);
    const [textFields, setTextFields] = useState<CaseField[]>([]);
    const [checkboxFields, setCheckboxFields] = useState<CaseField[]>([]);

    const [availableFields, setAvailableFields] = useState<CaseField[]>([]);

    const [allTestStepTemplates, setAllTestStepTemplates] = useState<TestStepTemplateDefinition[]>([]);
    const [previewTestStepTemplateId, setPreviewTestStepTemplateId] = useState('');


    const builtInFields: (CaseField & { isLocked: boolean })[] = [
        { id: 'builtin-title', label: 'Title', type: 'String', isLocked: true, description: '', isRequired: true },
        { id: 'builtin-dir', label: 'Directory', type: 'String', isLocked: true, description: '', isRequired: true },
        { id: 'builtin-step-template', label: 'Test Step Template', type: 'Dropdown', isLocked: true, description: '', isRequired: true },
    ];

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                getCaseFields(),
                getTestStepTemplates()
            ]).then(([fields, stepTemplates]) => {
                setAllCaseFields(fields);
                setAllTestStepTemplates(stepTemplates);
                
                if (template) {
                    const currentFieldIds = new Set(template.fieldIds);
                    const currentTemplateFields = template.fieldIds.map(id => fields.find(f => f.id === id)).filter(Boolean) as CaseField[];

                    setStringFields(currentTemplateFields.filter(f => f.type !== 'Text' && f.type !== 'Checkbox'));
                    setTextFields(currentTemplateFields.filter(f => f.type === 'Text'));
                    setCheckboxFields(currentTemplateFields.filter(f => f.type === 'Checkbox'));

                    setAvailableFields(fields.filter(f => !currentFieldIds.has(f.id)));
                    setName(template.name);
                    setDescription(template.description);
                    setPreviewTestStepTemplateId(stepTemplates[0]?.id || ''); // Default to first for preview
                } else {
                    setStringFields([]);
                    setTextFields([]);
                    setCheckboxFields([]);
                    setAvailableFields(fields);
                    setName('');
                    setDescription('');
                    setPreviewTestStepTemplateId(stepTemplates[0]?.id || '');
                }
            });
            setActiveTab('editor');
        }
    }, [isOpen, template]);

    const addFieldToTemplate = (fieldToAdd: CaseField) => {
        if (fieldToAdd.type === 'Checkbox') {
            setCheckboxFields(prev => [...prev, fieldToAdd]);
        } else if (fieldToAdd.type === 'Text') {
            setTextFields(prev => [...prev, fieldToAdd]);
        } else {
            setStringFields(prev => [...prev, fieldToAdd]);
        }
        setAvailableFields(prev => prev.filter(f => f.id !== fieldToAdd.id));
    };

    const removeFieldFromTemplate = (fieldToRemove: CaseField) => {
        if (fieldToRemove.type === 'Checkbox') {
            setCheckboxFields(prev => prev.filter(f => f.id !== fieldToRemove.id));
        } else if (fieldToRemove.type === 'Text') {
            setTextFields(prev => prev.filter(f => f.id !== fieldToRemove.id));
        } else {
            setStringFields(prev => prev.filter(f => f.id !== fieldToRemove.id));
        }
        setAvailableFields(prev => [fieldToRemove, ...prev].sort((a,b) => a.label.localeCompare(b.label)));
    };
    
    const moveField = (index: number, direction: 'up' | 'down', fieldType: CaseField['type']) => {
        const getMover = (setter: React.Dispatch<React.SetStateAction<CaseField[]>>) => () => {
             setter(prevFields => {
                const newFields = [...prevFields];
                const targetIndex = direction === 'up' ? index - 1 : index + 1;
                if (targetIndex >= 0 && targetIndex < newFields.length) {
                    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
                }
                return newFields;
            });
        };
        
        if (fieldType === 'Checkbox') {
            getMover(setCheckboxFields)();
        } else if (fieldType === 'Text') {
            getMover(setTextFields)();
        } else {
            getMover(setStringFields)();
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const combinedFieldIds = [
            ...stringFields.map(f => f.id),
            ...textFields.map(f => f.id),
            ...checkboxFields.map(f => f.id),
        ];

        const templateData = {
            name,
            description,
            fieldIds: combinedFieldIds,
        };

        if (template) {
            await onSave({ ...template, ...templateData });
        } else {
            await onSave(templateData);
        }
    };

    if (!isOpen) return null;
    
    const inputStyle = "block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    
    const FieldSection: React.FC<{ title: string, fields: CaseField[] }> = ({ title, fields }) => (
        <>
            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2">{title}</h4>
            {fields.map((field, index) => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-md border dark:border-gray-600">
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{field.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{field.type}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <button type="button" onClick={() => moveField(index, 'up', field.type)} disabled={index === 0} className="disabled:opacity-20"><ArrowUpIcon className="w-5 h-5" /></button>
                        <button type="button" onClick={() => moveField(index, 'down', field.type)} disabled={index === fields.length - 1} className="disabled:opacity-20"><ArrowDownIcon className="w-5 h-5" /></button>
                        <button type="button" onClick={() => removeFieldFromTemplate(field)} className="text-red-500"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                </div>
            ))}
        </>
    );

    // --- Preview Rendering Logic ---
    const renderPreviewField = (field: CaseField | (CaseField & { isLocked: boolean })) => {
        let fieldPreview: React.ReactNode;
        
        if (field.id === 'builtin-step-template') {
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">{field.label}</label>
                    <select
                        value={previewTestStepTemplateId}
                        onChange={(e) => setPreviewTestStepTemplateId(e.target.value)}
                        className={inputStyle}
                    >
                        {allTestStepTemplates.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </select>
                </div>
            );
        }

        switch (field.type) {
            case 'String':
            case 'URL':
                fieldPreview = <input type="text" placeholder={field.placeholder} className={inputStyle} />; break;
            case 'Text':
                fieldPreview = <textarea placeholder={field.placeholder} className={`${inputStyle} h-20 resize-none`} />; break;
            case 'Number':
                fieldPreview = <input type="number" className={inputStyle} />; break;
            case 'Checkbox':
                 return <div key={field.id} className="pt-2"><Checkbox id={`preview-${field.id}`} label={field.label} /></div>;
            case 'Date':
                fieldPreview = <input type="text" placeholder={field.dateFormat} className={inputStyle} />; break;
            case 'Dropdown':
                fieldPreview = <select className={inputStyle}>{field.options?.map(opt => <option key={opt}>{opt}</option>)}</select>; break;
            case 'User':
                fieldPreview = <select className={inputStyle}><option>Select a user...</option></select>; break;
            default:
                fieldPreview = <div className={`${inputStyle} text-gray-400`}>Preview not available</div>;
        }
        return (
            <div key={field.id}>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">{field.label}</label>
                {fieldPreview}
            </div>
        )
    }
    
    const allTemplateFieldsForPreview = [...stringFields, ...textFields, ...checkboxFields];
    const titleField = builtInFields.find(f => f.id === 'builtin-title')!;
    const directoryField = builtInFields.find(f => f.id === 'builtin-dir')!;
    const stepTemplateField = builtInFields.find(f => f.id === 'builtin-step-template')!;
    const previewTextFields = allTemplateFieldsForPreview.filter(f => f.type === 'Text');
    const previewCheckboxFields = allTemplateFieldsForPreview.filter(f => f.type === 'Checkbox');
    
    const remainingGridFields = allTemplateFieldsForPreview.filter(f =>
        f.type !== 'Text' && f.type !== 'Checkbox'
    );
    const selectedTestStepTemplate = allTestStepTemplates.find(tst => tst.id === previewTestStepTemplateId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl m-4 flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{template ? 'Edit Template' : 'Add Template'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon /></button>
                </div>
                
                <form id="template-form" onSubmit={handleSubmit} className="p-5 flex flex-col flex-grow overflow-hidden">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Template Name</label>
                            <input type="text" id="templateName" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required />
                        </div>
                        <div>
                            <label htmlFor="templateDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <input type="text" id="templateDescription" value={description} onChange={e => setDescription(e.target.value)} className={inputStyle} />
                        </div>
                    </div>

                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        {[ { id: 'editor', label: 'Editor', icon: <PencilIcon className="w-4 h-4 mr-2"/> }, { id: 'preview', label: 'Preview', icon: <EyeIcon className="w-4 h-4 mr-2"/> } ].map(tab => (
                            <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center py-2 px-4 text-sm font-semibold border-b-2 -mb-px ${activeTab === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'editor' && (
                        <div className="grid grid-cols-2 gap-6 pt-4 flex-grow overflow-auto">
                            {/* Left Column: Template Fields */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg flex flex-col">
                                <h3 className="text-lg font-semibold mb-2">Template Fields</h3>
                                <div className="space-y-2 overflow-y-auto">
                                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2">Built-in Fields</h4>
                                    {builtInFields.map(field => (
                                        <div key={field.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-md border dark:border-gray-600">
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-white">{field.label}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{field.type as string}</p>
                                            </div>
                                            <LockClosedIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                    ))}
                                    
                                    <FieldSection title="Fields" fields={stringFields} />
                                    <FieldSection title="Text Areas" fields={textFields} />
                                    <FieldSection title="Checkboxes" fields={checkboxFields} />

                                </div>
                            </div>
                            {/* Right Column: Available Fields */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg flex flex-col">
                                <h3 className="text-lg font-semibold mb-2">Available Fields</h3>
                                <div className="space-y-2 overflow-y-auto">
                                    {availableFields.map(field => (
                                         <div key={field.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-md border dark:border-gray-600">
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-white">{field.label}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{field.type}</p>
                                            </div>
                                            <button type="button" onClick={() => addFieldToTemplate(field)} className="text-blue-600 dark:text-blue-400"><PlusIcon className="w-5 h-5" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'preview' && (
                        <div className="pt-4 overflow-y-auto space-y-6">
                            {renderPreviewField(titleField)}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                {renderPreviewField(directoryField)}
                                {renderPreviewField(stepTemplateField)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {remainingGridFields.map(field => renderPreviewField(field as CaseField))}
                            </div>
                            
                            {previewTextFields.map(field => renderPreviewField(field as CaseField))}

                            {previewCheckboxFields.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                     {previewCheckboxFields.map(field => renderPreviewField(field as CaseField))}
                                </div>
                            )}
                            
                            {selectedTestStepTemplate && <DynamicTestStepPreview template={selectedTestStepTemplate} />}

                        </div>
                    )}
                </form>

                <div className="p-5 flex justify-end space-x-3 border-t dark:border-gray-700 mt-auto">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" form="template-form" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                        {template ? 'Save Changes' : 'Add Template'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplateFormModal;