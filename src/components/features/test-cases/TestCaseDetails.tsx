// Path: src/components/features/test-cases/TestCaseDetails.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TestCase, TestCaseHistoryEntry } from '../../../services/testCaseService';
import { User } from '../../../services/userService';
import {
    getTemplates, Template,
    getCaseFields, CaseField,
    getTestStepTemplates, TestStepTemplateDefinition
} from '../../../services/customizationService';
import TestStepDetailsView from './TestStepDetailsView';
import { EditIcon, TrashIcon, PaperclipIcon, ChevronDownIcon } from '../../ui/Icons';
import { Checkbox } from '../../ui/Checkbox';

type RunCaseStatus = 'Untested' | 'Passed' | 'Failed' | 'Blocked' | 'Skipped';
const runStatusOptions: RunCaseStatus[] = ['Untested', 'Passed', 'Failed', 'Blocked', 'Skipped'];

// --- Sub-Components & Types ---

// A generic status badge for history
const HistoryStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    // Combine all possible status colors here
    const colors: Record<string, string> = {
        Passed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        Failed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        Blocked: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        Skipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        Untested: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
        Approved: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
        'In Review': 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-400',
        'Need Update': 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400',
        Draft: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300',
        Ready: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-400',
    };
    const colorClass = colors[status] || colors.Untested;
    return <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>{status}</span>;
};


const statusConfig: Record<string, { color: string }> = {
    Passed: { color: '#22c55e' }, // green-500
    Failed: { color: '#ef4444' }, // red-500
    Blocked: { color: '#facc15' }, // yellow-400
    Skipped: { color: '#3b82f6' }, // blue-500
    Untested: { color: '#9ca3af' }, // gray-400
    Approved: { color: '#22c55e' },
    'In Review': { color: '#14b8a6' },
    'Need Update': { color: '#f97316' },
    Draft: { color: '#9ca3af' },
    Ready: { color: '#38bdf8' },
};


const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 text-sm text-gray-900 dark:text-gray-200">{children}</div>
    </div>
);

interface TestCaseDetailsProps {
    testCase: TestCase;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    // Generic props for result section
    showResultSection?: boolean;
    resultStatusOptions?: string[];
    onAddResult?: (testCaseId: string, updates: { status: string; comment: string; assignedToId: string; attachments: File[] }) => void;
    onAddResultAndNext?: (testCaseId:string, updates: { status: string; comment: string; assignedToId: string; attachments: File[] }) => void;
    users?: User[];
    onAssigneeChange?: (testCaseId: string, newAssigneeName: string) => void;
    isAssigneeEditable?: boolean;
}

const TestCaseDetails: React.FC<TestCaseDetailsProps> = ({ 
    testCase, onEdit, onDelete, 
    showResultSection, resultStatusOptions, onAddResult, onAddResultAndNext, 
    users = [],
    onAssigneeChange,
    isAssigneeEditable
}) => {
    const [loading, setLoading] = useState(true);
    const [template, setTemplate] = useState<Template | null>(null);
    const [stepTemplate, setStepTemplate] = useState<TestStepTemplateDefinition | null>(null);
    const [allCaseFields, setAllCaseFields] = useState<CaseField[]>([]);
    
    // State for result inputs
    const [currentStatus, setCurrentStatus] = useState<string>('');
    const [comment, setComment] = useState('');
    const [assignedToId, setAssignedToId] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const availableStatusOptions = useMemo(() => resultStatusOptions || runStatusOptions, [resultStatusOptions]);

    useEffect(() => {
        // When a new test case is viewed, or options change, reset inputs
        setCurrentStatus(availableStatusOptions[0] || '');
        setComment('');
        setAssignedToId('');
        setAttachments([]);
    }, [testCase.id, availableStatusOptions]);


    useEffect(() => {
        const loadDefinitions = async () => {
            setLoading(true);
            try {
                const [templates, stepTemplates, caseFields] = await Promise.all([
                    getTemplates(),
                    getTestStepTemplates(),
                    getCaseFields()
                ]);

                const foundTemplate = templates.find(t => t.id === testCase.templateId) || null;
                const foundStepTemplate = stepTemplates.find(t => t.id === testCase.testStepTemplateId) || null;

                setTemplate(foundTemplate);
                setStepTemplate(foundStepTemplate);
                setAllCaseFields(caseFields);
            } catch (error) {
                console.error("Failed to load test case definition data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDefinitions();
    }, [testCase]);

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
    
    const resetInputs = () => {
        setCurrentStatus(availableStatusOptions[0] || '');
        setComment('');
        setAssignedToId('');
        setAttachments([]);
    };

    const handleSaveResult = () => {
        if (!currentStatus) return;
        onAddResult?.(testCase.id, { status: currentStatus, comment, assignedToId, attachments });
        resetInputs();
    };
    
    const handleSaveAndNextResult = () => {
        if (!currentStatus) return;
        onAddResultAndNext?.(testCase.id, { status: currentStatus, comment, assignedToId, attachments });
        resetInputs();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoveAttachment = (fileToRemove: File) => {
        setAttachments(prev => prev.filter(f => f !== fileToRemove));
    };

    const renderFieldValue = (fieldDef: CaseField, value: any) => {
        if (fieldDef.type === 'Checkbox') {
            return <Checkbox id={`detail-${fieldDef.id}`} checked={!!value} disabled />;
        }
        if (value === undefined || value === null || value === '') {
            return <span className="text-gray-400 italic">Not set</span>;
        }
        if (fieldDef.type === 'Text') {
            return <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded border dark:border-gray-600 whitespace-pre-wrap min-h-[6rem]">{value}</div>;
        }
        return <p>{value.toString()}</p>;
    };

    if (loading) {
        return <div className="p-6">Loading details...</div>;
    }

    if (!template || !stepTemplate) {
        return <div className="p-6">Error: Could not load template definitions for this test case.</div>
    }

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="pb-4 border-b dark:border-gray-600">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-mono text-blue-600 dark:text-blue-400">{testCase.caseId}</p>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{testCase.name}</h2>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {onEdit && (
                            <button onClick={() => onEdit(testCase.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                                <EditIcon className="w-4 h-4" /> Edit
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={() => onDelete(testCase.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900">
                                <TrashIcon className="w-4 h-4" /> Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Row Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <DetailSection title="Directory"><p>{testCase.directory}</p></DetailSection>
                <DetailSection title="Test Step Template"><p>{stepTemplate.name}</p></DetailSection>
                <DetailSection title="Status"><p>{testCase.status}</p></DetailSection>
            </div>
            
            <hr className="dark:border-gray-600"/>

            {/* Custom Fields */}
            <div>
                <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Fields</h3>
                <div className="space-y-4">
                    {/* String-like fields grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DetailSection title="Priority"><p>{testCase.priority}</p></DetailSection>
                        <DetailSection title="Assignee">
                            {isAssigneeEditable && onAssigneeChange ? (
                                <div className="relative">
                                    <select
                                        value={testCase.assignee}
                                        onChange={(e) => onAssigneeChange(testCase.id, e.target.value)}
                                        className="w-full p-1 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 appearance-none pr-8"
                                    >
                                        {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                    </select>
                                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            ) : (
                                <p>{testCase.assignee}</p>
                            )}
                        </DetailSection>
                        {stringFields.map(field => (
                             <DetailSection key={field.id} title={field.label}>
                                {renderFieldValue(field, testCase.customFields[field.id])}
                             </DetailSection>
                        ))}
                    </div>
                    {/* Text fields */}
                    {textFields.map(field => (
                        <DetailSection key={field.id} title={field.label}>
                            {renderFieldValue(field, testCase.customFields[field.id])}
                        </DetailSection>
                    ))}
                    {/* Checkbox fields */}
                    {checkboxFields.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-4 pt-2">
                             {checkboxFields.map(field => (
                                <DetailSection key={field.id} title={field.label}>
                                    {renderFieldValue(field, testCase.customFields[field.id])}
                                </DetailSection>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <hr className="dark:border-gray-600"/>

            {/* Steps */}
            <TestStepDetailsView template={stepTemplate} data={testCase.steps} />
            
            {showResultSection && (
                <>
                    <hr className="dark:border-gray-600"/>
                    
                    {/* Result Section */}
                    <DetailSection title="Result">
                        {/* History Section */}
                        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
                             {testCase.history?.map(entry => {
                                const creator = users.find(u => u.name === entry.createdBy);
                                const assignedTo = users.find(u => u.id === entry.assignedToId);
                                const borderColor = statusConfig[entry.status]?.color || statusConfig.Untested.color;
                                return (
                                    <div key={entry.id} className="flex border-l-4 rounded-md bg-gray-50 dark:bg-gray-700/50 overflow-hidden border dark:border-gray-600" style={{ borderColor }}>
                                        {/* Left Side (30%) */}
                                        <div className="w-[30%] p-3 border-r dark:border-gray-600 space-y-2 flex flex-col justify-start">
                                            <HistoryStatusBadge status={entry.status} />
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                <p>by <strong>{creator?.name || entry.createdBy}</strong></p>
                                                <p>on {entry.createdAt}</p>
                                                {assignedTo && <p className="mt-1">Assigned To: <br/><strong>{assignedTo.name}</strong></p>}
                                            </div>
                                        </div>
                                         {/* Right Side (70%) */}
                                        <div className="w-[70%] p-3 text-sm">
                                            <p className="whitespace-pre-wrap">{entry.comment || <i className="text-gray-400">No comment provided.</i>}</p>
                                            {entry.attachments.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Attachments:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {entry.attachments.map((file, i) => (
                                                            <a href="#" key={i} onClick={(e) => e.preventDefault()} className="flex items-center gap-1.5 text-xs bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 px-2 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                                                <PaperclipIcon className="w-3 h-3" />
                                                                <span>{file.name}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                         {/* Input Section */}
                        <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                             <div className="grid grid-cols-2 gap-4">
                                <select 
                                    value={currentStatus}
                                    onChange={(e) => setCurrentStatus(e.target.value)}
                                    className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                                >
                                    {availableStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select 
                                    value={assignedToId}
                                    onChange={(e) => setAssignedToId(e.target.value)}
                                    className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                                >
                                    <option value="">Assign To (Optional)</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <textarea 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment about the result..."
                                    className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 h-24 resize-none"
                                />
                                <div className="flex justify-between items-center mt-1">
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-600 hover:underline">Attach file</button>
                                    <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                </div>
                                {attachments.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {attachments.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                                                <span>{file.name}</span>
                                                <button onClick={() => handleRemoveAttachment(file)} className="font-bold">&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveResult}
                                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                                >
                                    Add Result
                                </button>
                                {onAddResultAndNext && (
                                    <button
                                        onClick={handleSaveAndNextResult}
                                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
                                    >
                                        Add Result & Next
                                    </button>
                                )}
                            </div>
                        </div>
                    </DetailSection>
                </>
            )}

        </div>
    );
};

export default TestCaseDetails;