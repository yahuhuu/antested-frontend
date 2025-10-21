// Path: src/components/features/test-cases/DynamicTestStepEditor.tsx
import React from 'react';
import { TestStepTemplateDefinition, FieldDefinition } from '../../../services/customizationService';
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '../../ui/Icons';

interface DynamicTestStepEditorProps {
    template: TestStepTemplateDefinition;
    value: any; // The 'steps' object from the form state
    onChange: (newValue: any) => void;
}

const RepeaterFieldEditor: React.FC<{
    field: FieldDefinition;
    value: any[];
    onChange: (newValue: any[]) => void;
}> = ({ field, value, onChange }) => {
    // Ensure value is an array, defaulting to one empty step if null/undefined
    const steps = value && Array.isArray(value) && value.length > 0 ? value : [{ id: `step-${Date.now()}` }];

    const addStep = () => onChange([...steps, { id: `step-${Date.now()}` }]);
    
    const removeStep = (idToRemove: string) => {
        const newSteps = steps.filter(s => s.id !== idToRemove);
        onChange(newSteps);
    };

    const moveStep = (index: number, direction: 'up' | 'down') => {
        const newSteps = [...steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newSteps.length) {
            [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
            onChange(newSteps);
        }
    };

    const handleStepChange = (stepIndex: number, subFieldId: string, subFieldValue: string) => {
        const newSteps = [...steps];
        newSteps[stepIndex] = { ...newSteps[stepIndex], [subFieldId]: subFieldValue };
        onChange(newSteps);
    };

    const textareaStyle = "w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none";

    return (
        <div className="space-y-4">
            {steps.map((stepData, index) => (
                <div key={stepData.id} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex gap-4">
                        <div className="text-lg font-bold text-gray-400 dark:text-gray-500 pt-1">{index + 1}</div>
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(field.fields || []).map(subField => (
                                <div key={subField.id}>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">{subField.label}</label>
                                    <textarea
                                        value={stepData[subField.id] || ''}
                                        onChange={e => handleStepChange(index, subField.id, e.target.value)}
                                        className={textareaStyle}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end items-center mt-2 gap-1">
                        <button type="button" onClick={() => moveStep(index, 'up')} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md disabled:opacity-30" disabled={index === 0}><ArrowUpIcon className="w-4 h-4" /></button>
                        <button type="button" onClick={() => moveStep(index, 'down')} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md disabled:opacity-30" disabled={index === steps.length - 1}><ArrowDownIcon className="w-4 h-4" /></button>
                        <button type="button" onClick={addStep} className="p-1.5 text-gray-500 hover:text-green-600 rounded-md"><PlusIcon className="w-4 h-4" /></button>
                        <button type="button" onClick={() => removeStep(stepData.id)} disabled={steps.length <= 1} className="p-1.5 text-gray-500 hover:text-red-600 rounded-md disabled:opacity-30"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const TextAreaFieldEditor: React.FC<{
    field: FieldDefinition;
    value: string;
    onChange: (newValue: string) => void;
}> = ({ field, value, onChange }) => {
    const textareaStyle = "w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-28 resize-none";
    return (
        <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">{field.label}</label>
            <textarea
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                className={textareaStyle}
            />
            {field.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{field.description}</p>}
        </div>
    );
};

const DynamicTestStepEditor: React.FC<DynamicTestStepEditorProps> = ({ template, value, onChange }) => {
    const handleFieldChange = (fieldId: string, fieldValue: any) => {
        onChange({ ...value, [fieldId]: fieldValue });
    };

    if (!template) {
        return (
            <div>
                <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2">Steps</h3>
                <div className="p-4 border-2 border-dashed dark:border-gray-600 rounded-lg text-center text-gray-500">
                    Select a Test Step Template to add steps.
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2">Steps</h3>
            <div className="space-y-4">
                {template.fields.map(field => {
                    const fieldValue = value?.[field.id];
                    switch (field.type) {
                        case 'textarea':
                            return <TextAreaFieldEditor key={field.id} field={field} value={fieldValue} onChange={(newValue) => handleFieldChange(field.id, newValue)} />;
                        case 'repeater':
                            return <RepeaterFieldEditor key={field.id} field={field} value={fieldValue} onChange={(newValue) => handleFieldChange(field.id, newValue)} />;
                        default:
                            return <div key={field.id}>Unsupported field type</div>;
                    }
                })}
            </div>
        </div>
    );
};

export default DynamicTestStepEditor;