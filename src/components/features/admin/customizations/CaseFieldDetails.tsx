// Path: src/components/features/admin/customizations/CaseFieldDetails.tsx
import React, { useState, useEffect } from 'react';
import { CaseField, Template, getTemplates } from '../../../../services/customizationService';
import { EditIcon, TrashIcon } from '../../../ui/Icons';
import { Checkbox } from '../../../ui/Checkbox';

interface CaseFieldDetailsProps {
    field: CaseField;
    onEdit: () => void;
    onDelete: () => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 text-sm text-gray-900 dark:text-gray-200">{children}</div>
    </div>
);

const CaseFieldDetails: React.FC<CaseFieldDetailsProps> = ({ field, onEdit, onDelete }) => {
    const [usedInTemplates, setUsedInTemplates] = useState<Template[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);

    useEffect(() => {
        if (!field) return;
        
        setLoadingTemplates(true);
        getTemplates()
            .then(allTemplates => {
                const filtered = allTemplates.filter(template => 
                    template.fieldIds.includes(field.id)
                );
                setUsedInTemplates(filtered);
            })
            .catch(err => {
                console.error("Failed to fetch templates", err);
                setUsedInTemplates([]);
            })
            .finally(() => {
                setLoadingTemplates(false);
            });
    }, [field]);
    
    const renderTypeSpecificDetails = () => {
        const details: React.ReactNode[] = [];

        switch (field.type) {
            case 'String':
            case 'Text':
                if (field.placeholder) details.push(<DetailSection key="ph" title="Placeholder"><p>{field.placeholder}</p></DetailSection>);
                if (field.defaultValueString) details.push(<DetailSection key="dvs" title="Default Value"><p>{field.defaultValueString}</p></DetailSection>);
                if (field.minLength !== undefined) details.push(<DetailSection key="ml" title="Minimal Characters"><p>{field.minLength}</p></DetailSection>);
                break;
            case 'URL':
                 if (field.placeholder) details.push(<DetailSection key="ph-url" title="Placeholder"><p>{field.placeholder}</p></DetailSection>);
                 if (field.defaultValueString) details.push(<DetailSection key="dv-url" title="Default Value"><p>{field.defaultValueString}</p></DetailSection>);
                break;
            case 'Number':
                if (field.defaultValueNumber !== undefined) details.push(<DetailSection key="dvn" title="Default Value"><p>{field.defaultValueNumber}</p></DetailSection>);
                details.push(<DetailSection key="an" title="Allow Negative Values"><p>{field.allowNegative ? 'Yes' : 'No'}</p></DetailSection>);
                break;
            case 'Checkbox':
                details.push(<DetailSection key="dvb" title="Default State"><p>{field.defaultValueBoolean ? 'Checked' : 'Unchecked'}</p></DetailSection>);
                break;
            case 'Date':
                if (field.dateType) details.push(<DetailSection key="dt" title="Date Type"><p>{field.dateType}</p></DetailSection>);
                if (field.dateFormat) details.push(<DetailSection key="df" title="Date Format"><p>{field.dateFormat}</p></DetailSection>);
                break;
            case 'Dropdown':
                details.push(
                    <DetailSection key="opt" title="Options">
                        {field.options && field.options.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {field.options.map(opt => (
                                    <span key={opt} className="bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full text-sm">{opt}</span>
                                ))}
                            </div>
                        ) : <p>No options configured.</p>}
                    </DetailSection>
                );
                break;
            default:
                break;
        }
        
        return details.length > 0 ? (
            <>
                <hr className="dark:border-gray-600" />
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 pt-2">Configuration</h3>
                <div className="space-y-6">
                    {details}
                </div>
            </>
        ) : null;
    };
    
    const renderPreview = () => {
        const label = field.label || 'Field Label';
        const inputStyle = "mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm disabled:cursor-not-allowed";
        let fieldPreview: React.ReactNode;

        switch(field.type) {
            case 'String':
            case 'URL':
                fieldPreview = <input type="text" placeholder={field.placeholder} defaultValue={field.defaultValueString} className={inputStyle} disabled />;
                break;
            case 'Text':
                fieldPreview = <textarea placeholder={field.placeholder} defaultValue={field.defaultValueString} className={`${inputStyle} h-20 resize-none`} disabled />;
                break;
            case 'Number':
                fieldPreview = <input type="number" defaultValue={field.defaultValueNumber} className={inputStyle} disabled />;
                break;
            case 'Checkbox':
                return (
                    <div className="mt-4">
                        <Checkbox id={`preview-${field.id}`} label={label} checked={field.defaultValueBoolean} disabled />
                    </div>
                );
            case 'Date':
                fieldPreview = <input type="text" placeholder={field.dateFormat} defaultValue={field.defaultValueDate} className={inputStyle} disabled />;
                break;
            case 'Dropdown':
                fieldPreview = (
                    <select defaultValue={field.options && field.options.length > 0 ? field.options[0] : ''} className={inputStyle} disabled>
                        {field.options?.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                );
                break;
            case 'User':
                fieldPreview = <select className={inputStyle} disabled><option>Select a user...</option></select>;
                break;
            default:
                fieldPreview = <div className={`${inputStyle} text-gray-400`}>Preview not available</div>;
        }

        return (
            <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    {label}
                    {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{field.description}</p>
                {fieldPreview}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-6">
            <div className="pb-4 border-b dark:border-gray-600">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{field.label}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Case Field Details</p>
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

            <DetailSection title="Type">
                <p className="font-medium bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full inline-block">{field.type}</p>
            </DetailSection>

            <DetailSection title="Description">
                <p className="whitespace-pre-wrap">{field.description || 'No description provided.'}</p>
            </DetailSection>

            <DetailSection title="Required">
                <p>{field.isRequired ? 'Yes' : 'No'}</p>
            </DetailSection>

            <DetailSection title="Used In Test Case Templates">
                {loadingTemplates ? (
                    <p>Loading...</p>
                ) : usedInTemplates.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {usedInTemplates.map(template => (
                            <span key={template.id} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                {template.name}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p>This field is not used in any test case templates.</p>
                )}
            </DetailSection>

            {renderTypeSpecificDetails()}

            <DetailSection title="Preview">
                <div className="p-4 border-2 border-dashed dark:border-gray-600 rounded-md">
                    {renderPreview()}
                </div>
            </DetailSection>
        </div>
    );
};

export default CaseFieldDetails;
