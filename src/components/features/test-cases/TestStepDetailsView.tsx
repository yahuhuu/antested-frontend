// Path: src/components/features/test-cases/TestStepDetailsView.tsx
import React from 'react';
import { TestStepTemplateDefinition } from '../../../services/customizationService';

interface TestStepDetailsViewProps {
    template: TestStepTemplateDefinition;
    data: any; // The `steps` object from TestCase
}

interface DetailSectionProps {
    title: string;
    children: React.ReactNode;
}

const DetailSection: React.FC<DetailSectionProps> = ({ title, children }) => (
    <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
        <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border dark:border-gray-600 min-h-[4rem]">
            {children || <span className="text-gray-400 italic">No data entered.</span>}
        </div>
    </div>
);

const TestStepDetailsView: React.FC<TestStepDetailsViewProps> = ({ template, data }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2">Steps</h3>
            {template.fields.map(field => {
                if (field.type === 'textarea') {
                    const value = data?.[field.id];
                    return (
                        <DetailSection key={field.id} title={field.label}>
                            {value}
                        </DetailSection>
                    );
                }
                if (field.type === 'repeater' && field.fields) {
                    const repeaterData = data?.[field.id] || [];
                    return (
                        <div key={field.id} className="space-y-4">
                            {repeaterData.map((stepData: any, index: number) => (
                                <div key={stepData.id || index} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex gap-4">
                                        <div className="text-lg font-bold text-gray-400 dark:text-gray-500 pt-1">{index + 1}</div>
                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {field.fields?.map(subField => (
                                                <DetailSection key={subField.id} title={subField.label}>
                                                    {stepData[subField.id]}
                                                </DetailSection>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {repeaterData.length === 0 && <p className="text-gray-400 italic text-sm">No steps entered.</p>}
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
};

export default TestStepDetailsView;