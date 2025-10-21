// Path: src/components/features/admin/customizations/TestCaseTemplateDetails.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Template, CaseField, getCaseFields, TestStepTemplateDefinition, getTestStepTemplates } from '../../../../services/customizationService';
import { EditIcon, TrashIcon, PencilIcon, EyeIcon } from '../../../ui/Icons';
import DynamicTestStepPreview from './DynamicTestStepPreview';
import { Checkbox } from '../../../ui/Checkbox';

interface TemplateDetailsProps {
    template: Template;
    onEdit: () => void;
    onDelete: () => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 text-sm text-gray-900 dark:text-gray-200">{children}</div>
    </div>
);

const FieldList: React.FC<{ fields: { label: string; type: string }[] }> = ({ fields }) => (
    <ul className="space-y-2">
        {fields.map(field => (
            <li key={field.label} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <span className="font-medium">{field.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{field.type}</span>
            </li>
        ))}
    </ul>
);

const TestCaseTemplateDetails: React.FC<TemplateDetailsProps> = ({ template, onEdit, onDelete }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [allCaseFields, setAllCaseFields] = useState<CaseField[]>([]);
    const [allTestStepTemplates, setAllTestStepTemplates] = useState<TestStepTemplateDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewStepTemplateId, setPreviewStepTemplateId] = useState('');

    const builtInFields: CaseField[] = [
        { id: 'builtin-title', label: 'Title', type: 'String', description: '', isRequired: true },
        { id: 'builtin-dir', label: 'Directory', type: 'String', description: '', isRequired: true },
        { id: 'builtin-step-template', label: 'Test Step Template', type: 'Dropdown', description: '', isRequired: true },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [fields, stepTemplates] = await Promise.all([getCaseFields(), getTestStepTemplates()]);
                setAllCaseFields(fields);
                setAllTestStepTemplates(stepTemplates);
                if (stepTemplates.length > 0) {
                    setPreviewStepTemplateId(stepTemplates[0].id);
                }
            } catch (error) {
                console.error("Failed to load details data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const { stringFields, textFields, checkboxFields } = useMemo(() => {
        if (loading) return { stringFields: [], textFields: [], checkboxFields: [], allTemplateFields: [] };

        const templateFields = template.fieldIds
            .map(id => allCaseFields.find(f => f.id === id))
            .filter((f): f is CaseField => !!f);
        
        return {
            stringFields: templateFields.filter(f => f.type !== 'Text' && f.type !== 'Checkbox'),
            textFields: templateFields.filter(f => f.type === 'Text'),
            checkboxFields: templateFields.filter(f => f.type === 'Checkbox'),
        };
    }, [template, allCaseFields, loading]);

    const selectedStepTemplate = useMemo(() => {
        if (loading) return null;
        return allTestStepTemplates.find(tst => tst.id === previewStepTemplateId) || null;
    }, [previewStepTemplateId, allTestStepTemplates, loading]);
    
    
    const renderPreviewField = (field: CaseField) => {
        const inputStyle = "block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm";
        let fieldPreview: React.ReactNode;
        
        if (field.id === 'builtin-step-template') {
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">{field.label}</label>
                    <select 
                        value={previewStepTemplateId} 
                        onChange={(e) => setPreviewStepTemplateId(e.target.value)} 
                        className={inputStyle}
                        disabled={loading}
                    >
                        {allTestStepTemplates.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </select>
                </div>
            );
        }

        switch (field.type) {
            case 'String': case 'URL': fieldPreview = <input type="text" placeholder={field.placeholder} className={inputStyle} disabled />; break;
            case 'Text': fieldPreview = <textarea placeholder={field.placeholder} className={`${inputStyle} h-20 resize-none`} disabled />; break;
            case 'Number': fieldPreview = <input type="number" className={inputStyle} disabled />; break;
            case 'Checkbox': return <div key={field.id} className="pt-2"><Checkbox id={`preview-${field.id}`} label={field.label} disabled /></div>;
            case 'Date': fieldPreview = <input type="text" placeholder={field.dateFormat} className={inputStyle} disabled />; break;
            case 'Dropdown': fieldPreview = <select className={inputStyle} disabled>{field.options?.map(opt => <option key={opt}>{opt}</option>)}</select>; break;
            case 'User': fieldPreview = <select className={inputStyle} disabled><option>Select a user...</option></select>; break;
            default: fieldPreview = <div className={`${inputStyle} text-gray-400`}>Preview not available</div>;
        }
        return (
            <div key={field.id}>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">{field.label}</label>
                {fieldPreview}
            </div>
        )
    };
    
    const allTemplateFieldsForPreview = [...stringFields, ...textFields, ...checkboxFields];
    const titleField = builtInFields.find(f => f.id === 'builtin-title')!;
    const directoryField = builtInFields.find(f => f.id === 'builtin-dir')!;
    const stepTemplateField = builtInFields.find(f => f.id === 'builtin-step-template')!;
    const previewTextFields = allTemplateFieldsForPreview.filter(f => f.type === 'Text');
    const previewCheckboxFields = allTemplateFieldsForPreview.filter(f => f.type === 'Checkbox');
    
    const remainingGridFields = allTemplateFieldsForPreview.filter(f =>
        f.type !== 'Text' && f.type !== 'Checkbox'
    );
    const selectedTestStepTemplate = allTestStepTemplates.find(tst => tst.id === previewStepTemplateId);
    
    return (
        <div className="space-y-6 pb-6">
            <div className="pb-4 border-b dark:border-gray-600">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{template.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Template Details</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={onEdit} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <EditIcon className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={onDelete} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900 transition-colors">
                            <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[ { id: 'details', label: 'Details', icon: <PencilIcon className="w-4 h-4 mr-2"/> }, { id: 'preview', label: 'Preview', icon: <EyeIcon className="w-4 h-4 mr-2"/> } ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center py-2 px-4 text-sm font-semibold border-b-2 -mb-px ${activeTab === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'details' && (
                <div className="space-y-6">
                    <DetailSection title="Description">
                        <p className="whitespace-pre-wrap">{template.description || 'No description provided.'}</p>
                    </DetailSection>

                    <DetailSection title="Template Fields">
                        {loading ? <p>Loading fields...</p> : (
                            <div className="space-y-4">
                                <div><h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Built-in Fields</h4><FieldList fields={builtInFields} /></div>
                                {stringFields.length > 0 && <div><h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 my-2">Fields</h4><FieldList fields={stringFields} /></div>}
                                {textFields.length > 0 && <div><h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 my-2">Text Areas</h4><FieldList fields={textFields} /></div>}
                                {checkboxFields.length > 0 && <div><h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 my-2">Checkboxes</h4><FieldList fields={checkboxFields} /></div>}
                            </div>
                        )}
                    </DetailSection>
                </div>
            )}
            
            {activeTab === 'preview' && (
                 <div className="space-y-6">
                    {renderPreviewField(titleField)}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        {renderPreviewField(directoryField)}
                        {renderPreviewField(stepTemplateField)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stringFields.map(field => renderPreviewField(field))}
                    </div>
                    {textFields.map(field => renderPreviewField(field))}
                    {checkboxFields.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-2">
                            {checkboxFields.map(field => renderPreviewField(field))}
                        </div>
                    )}
                    {selectedStepTemplate && <DynamicTestStepPreview template={selectedStepTemplate} />}
                </div>
            )}
        </div>
    );
};

export default TestCaseTemplateDetails;