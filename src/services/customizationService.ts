// Path: src/services/customizationService.ts

export type CaseFieldType = 'String' | 'Text' | 'Number' | 'Checkbox' | 'Date' | 'Dropdown' | 'URL' | 'User';

export interface CaseField {
    id: string;
    label: string;
    description: string;
    type: CaseFieldType;
    isRequired: boolean;
    placeholder?: string;
    defaultValueString?: string;
    minLength?: number;
    defaultValueNumber?: number;
    allowNegative?: boolean;
    defaultValueBoolean?: boolean;
    dateType?: 'DateOnly' | 'DateTime';
    dateFormat?: string;
    defaultValueDate?: string;
    options?: string[];
}

let mockCaseFields: CaseField[] = [
    { id: 'cf-type', label: 'Test Case Type', description: 'Type of the test case.', type: 'Dropdown', isRequired: true, options: ['Functional', 'UI/UX', 'Performance', 'Security', 'Smoke'] },
    { id: 'cf-priority', label: 'Priority', description: 'Priority of the test case.', type: 'Dropdown', isRequired: true, options: ['Low', 'Medium', 'High', 'Critical'] },
    { id: 'cf-assignee', label: 'Assign To', description: 'The user assigned to this test case.', type: 'User', isRequired: false },
    { id: 'cf-preconditions', label: 'Preconditions', description: 'Conditions that must be met before the test case can be executed.', type: 'Text', isRequired: false },
    { id: 'cf-is-automated', label: 'Is Automated', description: 'Check if this test case is automated.', type: 'Checkbox', isRequired: false, defaultValueBoolean: false },
    { id: 'cf-sprint', label: 'Sprint', description: 'The sprint number associated with this test case.', type: 'String', isRequired: false, placeholder: 'e.g., Sprint 24.1' },
    { id: 'cf-browser', label: 'Browser', description: 'The browser used for testing.', type: 'Dropdown', isRequired: true, options: ['Chrome', 'Firefox', 'Safari', 'Edge', 'All'] },
];

const simulateDelay = <T,>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), 300));

export const getCaseFields = (): Promise<CaseField[]> => simulateDelay([...mockCaseFields]);

export const createCaseField = (fieldData: Omit<CaseField, 'id'>): Promise<CaseField> => {
    const newField: CaseField = {
        ...fieldData,
        id: `cf-${new Date().getTime()}`,
    };
    mockCaseFields.push(newField);
    return simulateDelay(newField);
};

export const updateCaseField = (id: string, updates: Partial<Omit<CaseField, 'id'>>): Promise<CaseField | undefined> => {
    let updatedField: CaseField | undefined;
    mockCaseFields = mockCaseFields.map(field => {
        if (field.id === id) {
            updatedField = { ...field, ...updates };
            return updatedField;
        }
        return field;
    });
    return simulateDelay(updatedField);
};

export const deleteCaseFields = (ids: string[]): Promise<void> => {
    mockCaseFields = mockCaseFields.filter(f => !ids.includes(f.id));
    return simulateDelay(undefined);
};


// Test Case Templates
export interface Template {
    id: string;
    name: string;
    description: string;
    fieldIds: string[];
    defaultTestStepTemplateId?: string;
}

// FIX: Export 'mockTemplates' to make it accessible to other modules.
export let mockTemplates: Template[] = [
    { 
        id: 'tmpl-bdd', 
        name: 'template: Behaviour Driven Development', 
        description: 'A template for writing BDD scenarios using Gherkin syntax (Given, When, Then).', 
        fieldIds: [],
        defaultTestStepTemplateId: 'tst-bdd',
    },
    { 
        id: 'tmpl-multi', 
        name: 'template: Multiple Steps', 
        description: 'A comprehensive template for detailed test cases with multiple steps.', 
        fieldIds: ['cf-type', 'cf-priority', 'cf-assignee', 'cf-preconditions', 'cf-is-automated'],
        defaultTestStepTemplateId: 'tst-multi',
    },
    { 
        id: 'tmpl-single', 
        name: 'template: Single Steps', 
        description: 'A standard template for test cases with a single set of steps.', 
        fieldIds: ['cf-type', 'cf-priority', 'cf-sprint', 'cf-browser', 'cf-preconditions'],
        defaultTestStepTemplateId: 'tst-single',
    },
    { 
        id: 'tmpl-exploratory', 
        name: 'template: Exploratory Sessions', 
        description: 'A template for guiding exploratory testing sessions with missions and goals.', 
        fieldIds: ['cf-priority', 'cf-preconditions'],
        defaultTestStepTemplateId: 'tst-exploratory',
    },
];

export const getTemplates = (): Promise<Template[]> => simulateDelay([...mockTemplates]);

export const createTemplate = (templateData: Omit<Template, 'id'>): Promise<Template> => {
    const newTemplate: Template = {
        ...templateData,
        id: `tmpl-${new Date().getTime()}`,
    };
    mockTemplates.push(newTemplate);
    return simulateDelay(newTemplate);
};

export const updateTemplate = (id: string, updates: Partial<Omit<Template, 'id'>>): Promise<Template | undefined> => {
    let updatedTemplate: Template | undefined;
    mockTemplates = mockTemplates.map(tmpl => {
        if (tmpl.id === id) {
            updatedTemplate = { ...tmpl, ...updates };
            return updatedTemplate;
        }
        return tmpl;
    });
    return simulateDelay(updatedTemplate);
};

export const deleteTemplates = (ids: string[]): Promise<void> => {
    mockTemplates = mockTemplates.filter(t => !ids.includes(t.id));
    return simulateDelay(undefined);
};


// Test Step Templates (Dynamic)
export type FieldType = 'textarea' | 'repeater';

export interface FieldDefinition {
    id: string;
    label: string;
    type: FieldType;
    description?: string;
    fields?: FieldDefinition[]; // For repeater type
}

export interface TestStepTemplateDefinition {
    id: string;
    name: string;
    description: string;
    fields: FieldDefinition[];
}

// FIX: Export 'mockTestStepTemplates' to make it accessible to other modules.
export let mockTestStepTemplates: TestStepTemplateDefinition[] = [
    {
        id: 'tst-single',
        name: 'Test Step (Single Step)',
        description: 'A simple template with one area for steps and one for expected results.',
        fields: [
            { id: 'field-steps', label: 'Steps', type: 'textarea', description: 'The required steps to execute the test case.' },
            { id: 'field-expected', label: 'Expected Result', type: 'textarea', description: 'The expected result after executing the test case.' }
        ]
    },
    {
        id: 'tst-multi',
        name: 'Test Step (Multiple Steps)',
        description: 'A template for test cases with multiple, distinct steps.',
        fields: [
            {
                id: 'repeater-steps',
                label: 'Step',
                type: 'repeater',
                fields: [
                    { id: 'sub-step-desc', label: 'Step Description', type: 'textarea' },
                    { id: 'sub-step-expected', label: 'Expected Result', type: 'textarea' }
                ]
            }
        ]
    },
    {
        id: 'tst-bdd',
        name: 'Behaviour Driven Development',
        description: 'A template for writing BDD scenarios using Gherkin syntax (Given, When, Then).',
        fields: [
            { id: 'field-bdd-scenario', label: 'Scenario Description', type: 'textarea', description: 'Write your BDD scenario here.' }
        ]
    },
    {
        id: 'tst-exploratory',
        name: 'Exploratory Sessions',
        description: 'A template for guiding exploratory testing sessions.',
        fields: [
            { id: 'field-mission', label: 'Mission', type: 'textarea', description: 'A high-level overview of what to test and which areas to cover, usually just 1-2 sentences.' },
            { id: 'field-goals', label: 'Goals', type: 'textarea', description: 'A detailed list of quests to cover as part of the exploratory sessions.' }
        ]
    }
];

export const getTestStepTemplates = (): Promise<TestStepTemplateDefinition[]> => simulateDelay([...mockTestStepTemplates]);

export const createTestStepTemplate = (data: Omit<TestStepTemplateDefinition, 'id'>): Promise<TestStepTemplateDefinition> => {
    const newTemplate: TestStepTemplateDefinition = { ...data, id: `tst-${new Date().getTime()}` };
    mockTestStepTemplates.push(newTemplate);
    return simulateDelay(newTemplate);
};

export const updateTestStepTemplate = (id: string, updates: Partial<Omit<TestStepTemplateDefinition, 'id'>>): Promise<TestStepTemplateDefinition | undefined> => {
    let updated: TestStepTemplateDefinition | undefined;
    mockTestStepTemplates = mockTestStepTemplates.map(t => {
        if (t.id === id) {
            updated = { ...t, ...updates };
            return updated;
        }
        return t;
    });
    return simulateDelay(updated);
};

export const deleteTestStepTemplates = (ids: string[]): Promise<void> => {
    mockTestStepTemplates = mockTestStepTemplates.filter(t => !ids.includes(t.id));
    return simulateDelay(undefined);
};