// Path: src/components/features/test-cases/TestCaseFormModal.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, getProjectById } from '../../../services/projectService';
import { TestCase, getTestCaseById, NewTestCase } from '../../../services/testCaseService';
import { User, getUsers } from '../../../services/userService';
import { 
    Template, getTemplates, 
    CaseField, getCaseFields, 
    TestStepTemplateDefinition, getTestStepTemplates 
} from '../../../services/customizationService';
import { DirectoryNode } from './TestCaseDirectory';
import DynamicTestStepEditor from './DynamicTestStepEditor';
import { Checkbox } from '../../ui/Checkbox';
import { XIcon, ChevronDownIcon } from '../../ui/Icons';

interface TestCaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<NewTestCase, 'projectId'>) => Promise<void>;
  projectId: string;
  testCaseId: string | null;
  directories: DirectoryNode[];
}

// Recursive function to flatten the directory tree for the dropdown
const flattenDirectories = (nodes: DirectoryNode[], prefix = ''): { id: string, label: string }[] => {
    let options: { id: string, label: string }[] = [];
    nodes.forEach(node => {
        const label = prefix ? `${prefix} / ${node.label}` : node.label;
        options.push({ id: node.id, label });
        if (node.children) {
            options = options.concat(flattenDirectories(node.children, label));
        }
    });
    return options;
};

const TestCaseFormModal: React.FC<TestCaseFormModalProps> = ({ isOpen, onClose, onSave, projectId, testCaseId, directories }) => {
    const [project, setProject] = useState<Project | null>(null);
    const [template, setTemplate] = useState<Template | null>(null);
    const [allCaseFields, setAllCaseFields] = useState<CaseField[]>([]);
    const [allStepTemplates, setAllStepTemplates] = useState<TestStepTemplateDefinition[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [formState, setFormState] = useState<Record<string, any>>({});
    const [stepTemplateId, setStepTemplateId] = useState('');

    const directoryOptions = flattenDirectories(directories);
    
    const initialize = useCallback(async () => {
        if (!isOpen) return;
        setLoading(true);
        try {
            const [proj, allTmpl, allFields, allStpTmpl, allUsers, editingCase] = await Promise.all([
                getProjectById(projectId),
                getTemplates(),
                getCaseFields(),
                getTestStepTemplates(),
                getUsers(),
                testCaseId ? getTestCaseById(testCaseId) : Promise.resolve(null)
            ]);
            
            if (!proj) throw new Error("Project not found");

            const defaultTemplateId = editingCase?.templateId || proj.defaultTestCaseTemplateId || allTmpl[0]?.id;
            const caseTemplate = allTmpl.find(t => t.id === defaultTemplateId) || null;
            
            setProject(proj);
            setTemplate(caseTemplate);
            setAllCaseFields(allFields);
            setAllStepTemplates(allStpTmpl);
            setUsers(allUsers);
            
            const initialStepTemplateId = editingCase?.testStepTemplateId || caseTemplate?.defaultTestStepTemplateId || allStpTmpl[0]?.id || '';
            setStepTemplateId(initialStepTemplateId);

            // Set initial form state
            let initialState: Record<string, any> = {};

            if (editingCase) {
                // Populate form for an existing user
                initialState = {
                    ...editingCase.customFields,
                    name: editingCase.name,
                    directory: editingCase.directory,
                    steps: editingCase.steps,
                };
                // Map top-level properties to their custom field IDs if they exist in the template
                if (caseTemplate?.fieldIds.includes('cf-priority')) {
                    initialState['cf-priority'] = editingCase.priority;
                }
                if (caseTemplate?.fieldIds.includes('cf-assignee')) {
                    initialState['cf-assignee'] = editingCase.assignee;
                }
            } else {
                // Set default values for a new test case
                initialState = {
                    name: '',
                    directory: (directoryOptions.length > 0 ? directoryOptions[0].id : ''),
                    steps: {},
                };
                if (caseTemplate) {
                    // Pre-fill with default values from the template's case fields
                    caseTemplate.fieldIds.forEach(fieldId => {
                        const field = allFields.find(f => f.id === fieldId);
                        if (field) {
                            switch(field.type) {
                                case 'Checkbox': initialState[field.id] = field.defaultValueBoolean ?? false; break;
                                case 'String': 
                                case 'Text':
                                case 'URL':
                                    initialState[field.id] = field.defaultValueString ?? ''; break;
                                case 'Number': initialState[field.id] = field.defaultValueNumber ?? 0; break;
                                case 'Dropdown': initialState[field.id] = field.options?.[0] ?? ''; break;
                                case 'User': initialState[field.id] = users[0]?.name || ''; break;
                                default: initialState[field.id] = '';
                            }
                        }
                    });
                    // Set default for mapped fields if they exist
                     if (caseTemplate.fieldIds.includes('cf-priority')) {
                        initialState['cf-priority'] = 'Medium';
                    }
                    if (caseTemplate.fieldIds.includes('cf-assignee')) {
                         initialState['cf-assignee'] = users[0]?.name || 'Unassigned';
                    }
                }
            }
            setFormState(initialState);

        } catch (error) {
            console.error("Failed to initialize form modal:", error);
        } finally {
            setLoading(false);
        }
    }, [isOpen, projectId, testCaseId]);

    useEffect(() => {
        initialize();
    }, [initialize]);
    
    const { stringFields, textFields, checkboxFields } = useMemo(() => {
        if (!template) return { stringFields: [], textFields: [], checkboxFields: [] };

        const templateFields = template.fieldIds
            .map(id => allCaseFields.find(f => f.id === id))
            .filter((f): f is CaseField => !!f);

        return {
            stringFields: templateFields.filter(f => f.type !== 'Text' && f.type !== 'Checkbox'),
            textFields: templateFields.filter(f => f.type === 'Text'),
            checkboxFields: templateFields.filter(f => f.type === 'Checkbox'),
        };
    }, [template, allCaseFields]);


    const handleFormChange = (fieldId: string, value: any) => {
        setFormState(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Destructure form state to separate TestCase properties from custom fields
        const {
            name,
            directory,
            steps,
            'cf-priority': priorityValue,
            'cf-assignee': assigneeValue,
            ...restCustomFields
        } = formState;

        const submissionData: Omit<NewTestCase, 'projectId'> = {
            name: name,
            directory: directory,
            priority: priorityValue || 'Medium',
            assignee: assigneeValue || 'Unassigned',
            status: 'Draft' as const,
            templateId: template!.id,
            testStepTemplateId: stepTemplateId,
            steps: steps || {},
            customFields: restCustomFields,
        };

        onSave(submissionData);
    };

    const renderField = (field: CaseField) => {
        const value = formState[field.id] ?? '';
        const inputStyle = "block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
        
        switch (field.type) {
            case 'String':
            case 'URL':
                return <input type="text" value={value} onChange={e => handleFormChange(field.id, e.target.value)} className={inputStyle} />;
            case 'Text':
                return <textarea value={value} onChange={e => handleFormChange(field.id, e.target.value)} className={`${inputStyle} h-24 resize-none`} />;
            case 'Checkbox':
                return <Checkbox id={field.id} label={field.label} checked={!!value} onChange={e => handleFormChange(field.id, e.target.checked)} />;
            case 'Dropdown':
                return (
                    <div className="relative">
                        <select value={value} onChange={e => handleFormChange(field.id, e.target.value)} className={`${inputStyle} appearance-none`}>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                         <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                );
            case 'User':
                 return (
                    <div className="relative">
                        <select value={value} onChange={e => handleFormChange(field.id, e.target.value)} className={`${inputStyle} appearance-none`}>
                            {users.map(user => <option key={user.id} value={user.name}>{user.name}</option>)}
                        </select>
                         <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                );
            default: return null;
        }
    };
    
    if (!isOpen) return null;

    const selectedStepTemplate = allStepTemplates.find(t => t.id === stepTemplateId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl m-4 flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{testCaseId ? 'Edit Test Case' : 'Create Test Case'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon /></button>
                </div>

                {loading ? (
                     <div className="flex-grow flex items-center justify-center"><p>Loading form...</p></div>
                ) : (
                    <form onSubmit={handleSubmit} id="test-case-form" className="p-5 flex-grow overflow-y-auto space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                            <input type="text" value={formState.name || ''} onChange={e => handleFormChange('name', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Directory */}
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Directory</label>
                                <div className="relative">
                                    <select value={formState.directory || ''} onChange={e => handleFormChange('directory', e.target.value)} className="mt-1 block w-full appearance-none px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                        {directoryOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            {/* Test Step Template */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Test Step Template</label>
                                <div className="relative">
                                    <select value={stepTemplateId} onChange={e => setStepTemplateId(e.target.value)} className="mt-1 block w-full appearance-none px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                        {allStepTemplates.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        
                        <hr className="dark:border-gray-600"/>

                        {/* Dynamic Fields */}
                        {stringFields.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {stringFields.map(field => (
                                    <div key={field.id}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                                        {renderField(field)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {textFields.length > 0 && (
                            <div className="space-y-4">
                                {textFields.map(field => (
                                    <div key={field.id}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                                        {renderField(field)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {checkboxFields.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-2 pt-2">
                                {checkboxFields.map(field => renderField(field))}
                            </div>
                        )}
                        
                         {/* Steps Editor */}
                         <div className="pt-2 min-h-[250px]">
                             {selectedStepTemplate && (
                                <DynamicTestStepEditor
                                    template={selectedStepTemplate}
                                    value={formState.steps}
                                    onChange={(newSteps) => handleFormChange('steps', newSteps)}
                                />
                             )}
                         </div>

                    </form>
                )}

                <div className="p-5 flex justify-end space-x-3 border-t dark:border-gray-700 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" form="test-case-form" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                        {testCaseId ? 'Save Changes' : 'Create Test Case'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestCaseFormModal;