// Path: src/components/features/admin/customizations/TestStepTemplateDetails.tsx
import React, { useState, useEffect } from 'react';
import { TestStepTemplateDefinition, Template, getTemplates } from '../../../../services/customizationService';
import { EditIcon, TrashIcon, PencilIcon, EyeIcon } from '../../../ui/Icons';
import DynamicTestStepPreview from './DynamicTestStepPreview';

interface TestStepTemplateDetailsProps {
    template: TestStepTemplateDefinition;
    onEdit: () => void;
    onDelete: () => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 text-sm text-gray-900 dark:text-gray-200">{children}</div>
    </div>
);

const FieldList: React.FC<{ fields: TestStepTemplateDefinition['fields'] }> = ({ fields }) => (
    <ul className="space-y-2">
        {fields.map(field => (
            <li key={field.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                <div className="flex justify-between items-center">
                    <span className="font-medium">{field.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">{field.type}</span>
                </div>
                {field.type === 'repeater' && field.fields && (
                    <div className="pl-6 mt-2 border-l-2 dark:border-gray-500 space-y-1">
                        {field.fields.map(subField => (
                            <div key={subField.id} className="text-xs text-gray-600 dark:text-gray-300">- {subField.label} ({subField.type})</div>
                        ))}
                    </div>
                )}
            </li>
        ))}
    </ul>
);

const TestStepTemplateDetails: React.FC<TestStepTemplateDetailsProps> = ({ template, onEdit, onDelete }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [usedInTemplates, setUsedInTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!template) return;
        
        setLoading(true);
        getTemplates()
            .then(allTemplates => {
                const filtered = allTemplates.filter(t => 
                    t.defaultTestStepTemplateId === template.id
                );
                setUsedInTemplates(filtered);
            })
            .catch(err => {
                console.error("Failed to fetch test case templates", err);
                setUsedInTemplates([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [template]);

    return (
        <div className="space-y-6 pb-6">
            <div className="pb-4 border-b dark:border-gray-600">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{template.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Test Step Template Details</p>
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

                    <DetailSection title="Used in Test Case Templates">
                        {loading ? (
                            <p>Loading...</p>
                        ) : usedInTemplates.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {usedInTemplates.map(t => (
                                    <span key={t.id} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                        {t.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p>This is not the default step template for any test case templates.</p>
                        )}
                    </DetailSection>

                    <DetailSection title="Fields">
                       <FieldList fields={template.fields} />
                    </DetailSection>
                </div>
            )}
            
            {activeTab === 'preview' && (
                 <div className="space-y-6">
                    <DynamicTestStepPreview template={template} />
                </div>
            )}
        </div>
    );
};

export default TestStepTemplateDetails;