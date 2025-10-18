// Path: src/components/features/test-cases/ai-generate/Step1DefineRequirement.tsx
import React, { useState, useRef, useEffect } from 'react';
import { DirectoryNode } from '../TestCaseDirectory';
import { ChevronDownIcon, PlusIcon, InfoIcon } from '../../../ui/Icons';

interface Step1Props {
    onContinue: (requirements: string, directory: string, attachments: File[]) => void;
    directories: DirectoryNode[];
    isLoading: boolean;
}

// Recursive function to flatten the directory tree for the dropdown
const flattenDirectories = (nodes: DirectoryNode[], prefix = ''): { id: string, label: string }[] => {
    let options: { id: string, label: string }[] = [];
    nodes.forEach(node => {
        const label = prefix ? `${prefix} > ${node.label}` : node.label;
        options.push({ id: node.id, label });
        if (node.children) {
            options = options.concat(flattenDirectories(node.children, label));
        }
    });
    return options;
};

const testMethods: Record<string, string> = {
    'Default': 'The AI will automatically select the most appropriate method based on the provided requirements.',
    'Equivalence Partitioning': 'Divides input data into equivalent partitions from which test cases can be derived. This helps reduce the total number of test cases.',
    'Boundary Value Analysis': 'Focuses on testing the boundaries between partitions. It is often used with Equivalence Partitioning.',
    'Decision Table Testing': 'A systematic approach where you identify conditions and the resulting actions to consider complex business rules.',
    'State Transition Testing': 'Helps to test the behavior of a system that exhibits a finite number of states.',
};

const Step1DefineRequirement: React.FC<Step1Props> = ({ onContinue, directories, isLoading }) => {
    const [directory, setDirectory] = useState('');
    const [template, setTemplate] = useState('');
    const [requirements, setRequirements] = useState('');
    const [errors, setErrors] = useState({ directory: '', requirements: '' });
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
    const [method, setMethod] = useState('Default');
    
    const attachMenuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const directoryOptions = flattenDirectories(directories);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
                setIsAttachMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleContinue = () => {
        const newErrors = { directory: '', requirements: '' };
        let isValid = true;

        if (!directory) {
            newErrors.directory = 'Please select a directory.';
            isValid = false;
        }
        if (!requirements.trim()) {
            newErrors.requirements = 'Product requirements cannot be empty.';
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            onContinue(requirements, directory, attachments);
        }
    };

    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];
            if (file.size > MAX_FILE_SIZE) {
                alert(`File "${file.name}" is too large. The maximum size is 100 MB.`);
            } else {
                setAttachments(prev => [...prev, file]);
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset to allow same file selection
        setIsAttachMenuOpen(false);
    };

    const handleRemoveAttachment = (fileName: string) => {
        setAttachments(prev => prev.filter(file => file.name !== fileName));
    };
    
    return (
        <div className="flex flex-col h-full">
             <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
            <div className="space-y-4 flex-grow flex flex-col">
                {/* Directory */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Directory</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Select where to save the generated test cases.</p>
                    <div className="relative mt-2">
                        <select
                            value={directory}
                            onChange={(e) => {
                                setDirectory(e.target.value);
                                if (errors.directory) setErrors(prev => ({...prev, directory: ''}));
                            }}
                            className={`w-full appearance-none pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-md focus:outline-none focus:ring-2 ${
                                errors.directory 
                                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                            }`}
                        >
                            <option value="" disabled>Select a directory</option>
                            {directoryOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                     {errors.directory && <p className="text-xs text-red-500 mt-1">{errors.directory}</p>}
                </div>

                {/* Template */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Template</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">You can use a template to structure your requirements.</p>
                    <div className="relative mt-2">
                        <select
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">None</option>
                            <option value="user-story">User Story</option>
                            <option value="bug-report">Bug Report</option>
                            <option value="feature-spec">Feature Specification</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Product Requirements */}
                <div className="flex-grow flex flex-col">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Product Requirements</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Provide detailed requirements to help AI generate accurate test cases.</p>
                     <div className={`mt-2 border rounded-md flex flex-col flex-grow ${
                        errors.requirements
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                     }`}>
                        <textarea
                            value={requirements}
                            onChange={(e) => {
                                setRequirements(e.target.value);
                                if (errors.requirements) setErrors(prev => ({...prev, requirements: ''}));
                            }}
                            className="w-full p-3 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none block flex-grow resize-none"
                            placeholder="Describe the feature, user story, or acceptance criteria here..."
                        />
                        {attachments.length > 0 && (
                            <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-1 max-h-24 overflow-y-auto">
                                {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between text-xs p-1 bg-gray-100 dark:bg-gray-700 rounded">
                                        <span className="truncate pr-2">{file.name}</span>
                                        <button onClick={() => handleRemoveAttachment(file.name)} className="font-bold text-red-500 hover:text-red-700 ml-2 flex-shrink-0">&times;</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-300 dark:border-gray-600 rounded-b-md">
                           <div className="flex items-center gap-2">
                             <div className="relative" ref={attachMenuRef}>
                                <button onClick={() => setIsAttachMenuOpen(prev => !prev)} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><PlusIcon /></button>
                                {isAttachMenuOpen && (
                                    <div className="absolute bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 py-1">
                                        <button onClick={() => fileInputRef.current?.click()} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Upload file</button>
                                        <button onClick={() => setIsAttachMenuOpen(false)} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Add from Drive</button>
                                        <button onClick={() => setIsAttachMenuOpen(false)} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Import code</button>
                                    </div>
                                )}
                             </div>
                             <div className="relative group flex items-center gap-1">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Method:</label>
                                <select value={method} onChange={e => setMethod(e.target.value)} className="text-sm pl-2 pr-6 py-1 bg-transparent dark:bg-gray-800 border-none focus:ring-0">
                                    {Object.keys(testMethods).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <InfoIcon className="w-4 h-4 text-gray-400" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {testMethods[method as keyof typeof testMethods]}
                                </div>
                             </div>
                           </div>
                        </div>
                    </div>
                    {errors.requirements && <p className="text-xs text-red-500 mt-1">{errors.requirements}</p>}
                </div>
            </div>

            <div className="pt-4 flex flex-col items-end">
                <button
                    onClick={handleContinue}
                    disabled={isLoading}
                    className="px-6 py-2.5 w-32 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        'Continue'
                    )}
                </button>
            </div>
        </div>
    );
};

export default Step1DefineRequirement;