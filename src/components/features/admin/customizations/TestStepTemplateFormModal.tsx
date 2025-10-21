// Path: src/components/features/admin/customizations/TestStepTemplateFormModal.tsx
import React, { useState, useEffect } from 'react';
import { TestStepTemplateDefinition, FieldDefinition, FieldType, createTestStepTemplate, updateTestStepTemplate } from '../../../../services/customizationService';
import { XIcon, PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, PencilIcon, EyeIcon } from '../../../ui/Icons';
import DynamicTestStepPreview from './DynamicTestStepPreview';

interface TestStepTemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  template: TestStepTemplateDefinition | null;
}

const FieldEditor: React.FC<{
    field: FieldDefinition;
    onUpdate: (updatedField: FieldDefinition) => void;
    onDelete: () => void;
    onMove: (direction: 'up' | 'down') => void;
    isFirst: boolean;
    isLast: boolean;
}> = ({ field, onUpdate, onDelete, onMove, isFirst, isLast }) => {

    const handleSubFieldUpdate = (index: number, updatedSubField: FieldDefinition) => {
        const newFields = [...(field.fields || [])];
        newFields[index] = updatedSubField;
        onUpdate({ ...field, fields: newFields });
    };

    const handleAddSubField = () => {
        const newSubField: FieldDefinition = { id: `sub-${Date.now()}`, label: 'New Field', type: 'textarea' };
        onUpdate({ ...field, fields: [...(field.fields || []), newSubField] });
    };

    const handleRemoveSubField = (index: number) => {
        onUpdate({ ...field, fields: (field.fields || []).filter((_, i) => i !== index) });
    };

    return (
        <div className="p-3 bg-white dark:bg-gray-700 rounded-md border dark:border-gray-600 space-y-2">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={field.label}
                    onChange={(e) => onUpdate({ ...field, label: e.target.value })}
                    className="flex-grow p-1 bg-transparent border-b dark:border-gray-500 focus:outline-none focus:border-blue-500"
                />
                <select
                    value={field.type}
                    onChange={(e) => onUpdate({ ...field, type: e.target.value as FieldType, fields: e.target.value === 'repeater' ? (field.fields || []) : undefined })}
                    className="p-1 bg-gray-100 dark:bg-gray-600 border dark:border-gray-500 rounded"
                >
                    <option value="textarea">Text Area</option>
                    <option value="repeater">Repeater</option>
                </select>
                <div className="flex items-center">
                    <button type="button" onClick={() => onMove('up')} disabled={isFirst} className="p-1 disabled:opacity-30"><ArrowUpIcon className="w-4 h-4" /></button>
                    <button type="button" onClick={() => onMove('down')} disabled={isLast} className="p-1 disabled:opacity-30"><ArrowDownIcon className="w-4 h-4" /></button>
                    <button type="button" onClick={onDelete} className="p-1 text-red-500"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>
            {field.type === 'repeater' && (
                <div className="pl-6 border-l-2 dark:border-gray-500 space-y-2">
                    {field.fields?.map((subField, index) => (
                        <div key={subField.id} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={subField.label}
                                onChange={e => handleSubFieldUpdate(index, {...subField, label: e.target.value})}
                                placeholder="Sub-field label"
                                className="flex-grow p-1 text-sm bg-transparent border-b dark:border-gray-500 focus:outline-none focus:border-blue-500"
                             />
                            <button type="button" onClick={() => handleRemoveSubField(index)} className="p-1 text-red-500"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddSubField} className="text-sm text-blue-600 dark:text-blue-400">+ Add sub-field</button>
                </div>
            )}
        </div>
    );
};


const TestStepTemplateFormModal: React.FC<TestStepTemplateFormModalProps> = ({ isOpen, onClose, onSave, template }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<FieldDefinition[]>([]);
    const [activeTab, setActiveTab] = useState('editor');

    useEffect(() => {
        if (isOpen) {
            if (template) {
                setName(template.name);
                setDescription(template.description);
                setFields(template.fields);
            } else {
                setName('');
                setDescription('');
                setFields([]);
            }
            setActiveTab('editor');
        }
    }, [isOpen, template]);

    const handleAddField = () => {
        setFields(prev => [...prev, { id: `field-${Date.now()}`, label: 'New Field', type: 'textarea' }]);
    };

    const handleUpdateField = (index: number, updatedField: FieldDefinition) => {
        const newFields = [...fields];
        newFields[index] = updatedField;
        setFields(newFields);
    };

    const handleDeleteField = (index: number) => {
        setFields(prev => prev.filter((_, i) => i !== index));
    };

    const handleMoveField = (index: number, direction: 'up' | 'down') => {
        const newFields = [...fields];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newFields.length) {
            [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
            setFields(newFields);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const templateData = { name, description, fields };
        try {
            if(template) {
                await updateTestStepTemplate(template.id, templateData);
            } else {
                await createTestStepTemplate(templateData);
            }
            onSave();
        } catch (error) {
            console.error("Failed to save test step template", error);
        }
    };

    if (!isOpen) return null;
    
    const inputStyle = "block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl m-4 flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{template ? 'Edit' : 'Add'} Test Step Template</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon /></button>
                </div>
                
                <form id="step-template-form" onSubmit={handleSubmit} className="p-5 flex flex-col flex-grow overflow-hidden">
                    <div className="space-y-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium">Template Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${inputStyle} h-20 resize-none`} />
                        </div>
                    </div>

                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        {[ { id: 'editor', label: 'Editor', icon: <PencilIcon className="w-4 h-4 mr-2"/> }, { id: 'preview', label: 'Preview', icon: <EyeIcon className="w-4 h-4 mr-2"/> } ].map(tab => (
                            <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center py-2 px-4 text-sm font-semibold border-b-2 -mb-px ${activeTab === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="pt-4 flex-grow overflow-auto">
                        {activeTab === 'editor' && (
                            <div className="flex flex-col flex-grow min-h-0">
                                <h3 className="text-md font-semibold mb-2">Fields</h3>
                                <div className="flex-grow overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg space-y-3">
                                   {fields.map((field, index) => (
                                       <FieldEditor 
                                         key={field.id} 
                                         field={field} 
                                         onUpdate={(updated) => handleUpdateField(index, updated)}
                                         onDelete={() => handleDeleteField(index)}
                                         onMove={(dir) => handleMoveField(index, dir)}
                                         isFirst={index === 0}
                                         isLast={index === fields.length - 1}
                                       />
                                   ))}
                                   <button type="button" onClick={handleAddField} className="w-full flex items-center justify-center gap-2 py-2 text-sm border-2 border-dashed rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <PlusIcon className="w-4 h-4" /> Add Field
                                   </button>
                                </div>
                            </div>
                        )}
                        {activeTab === 'preview' && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <DynamicTestStepPreview template={{ name, description, fields, id: template?.id || '' }} />
                            </div>
                        )}
                    </div>
                </form>

                <div className="p-5 flex justify-end space-x-3 border-t dark:border-gray-700 mt-auto">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" form="step-template-form" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                        {template ? 'Save Changes' : 'Add Template'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestStepTemplateFormModal;
