// Path: src/components/features/admin/customizations/DynamicTestStepPreview.tsx
import React, { useState } from 'react';
import { TestStepTemplateDefinition, FieldDefinition } from '../../../../services/customizationService';
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '../../../ui/Icons';

interface DynamicTestStepPreviewProps {
    template: TestStepTemplateDefinition;
}

const RepeaterFieldPreview: React.FC<{ field: FieldDefinition }> = ({ field }) => {
    const [steps, setSteps] = useState([ { id: `step-${Date.now()}` } ]); // Start with one step

    const addStep = () => setSteps(prev => [...prev, { id: `step-${Date.now()}` }]);
    const removeStep = (id: string) => setSteps(prev => prev.filter(s => s.id !== id));
    
    const moveStep = (index: number, direction: 'up' | 'down') => {
        setSteps(prevSteps => {
            const newSteps = [...prevSteps];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
            if (targetIndex >= 0 && targetIndex < newSteps.length) {
                // Swap elements
                [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
            }
            
            return newSteps;
        });
    };

    const textareaStyle = "w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none";

    return (
        <div className="space-y-4">
            {steps.map((step, index) => (
                 <div key={step.id} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex gap-4">
                        <div className="text-lg font-bold text-gray-400 dark:text-gray-500 pt-1">{index + 1}</div>
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(field.fields || []).map(subField => (
                                <div key={subField.id}>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">{subField.label}</label>
                                    <textarea className={textareaStyle} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end items-center mt-2 gap-1">
                        <button type="button" onClick={() => moveStep(index, 'up')} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md disabled:opacity-30" disabled={index === 0}><ArrowUpIcon className="w-4 h-4" /></button>
                        <button type="button" onClick={() => moveStep(index, 'down')} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md disabled:opacity-30" disabled={index === steps.length - 1}><ArrowDownIcon className="w-4 h-4" /></button>
                        <button type="button" onClick={addStep} className="p-1.5 text-gray-500 hover:text-green-600 rounded-md"><PlusIcon className="w-4 h-4" /></button>
                        <button type="button" onClick={() => removeStep(step.id)} disabled={steps.length <= 1} className="p-1.5 text-gray-500 hover:text-red-600 rounded-md disabled:opacity-30"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const TextAreaFieldPreview: React.FC<{ field: FieldDefinition }> = ({ field }) => {
    const textareaStyle = "w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-28 resize-none";
    return (
        <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">{field.label}</label>
            <textarea className={textareaStyle} />
            {field.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{field.description}</p>}
        </div>
    );
};


const DynamicTestStepPreview: React.FC<DynamicTestStepPreviewProps> = ({ template }) => {
    if (!template) {
        return (
            <div>
                <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2">Steps</h3>
                <div className="p-4 border-2 border-dashed dark:border-gray-600 rounded-lg text-center text-gray-500">
                    Select a Test Step Template to see a preview.
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2">Steps</h3>
            <div className="space-y-4">
                {template.fields.map(field => {
                    switch (field.type) {
                        case 'textarea':
                            return <TextAreaFieldPreview key={field.id} field={field} />;
                        case 'repeater':
                            return <RepeaterFieldPreview key={field.id} field={field} />;
                        default:
                            return <div key={field.id}>Unsupported field type</div>;
                    }
                })}
            </div>
        </div>
    );
};

export default DynamicTestStepPreview;