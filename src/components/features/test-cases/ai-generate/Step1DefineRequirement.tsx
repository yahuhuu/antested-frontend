// Path: src/components/features/test-cases/ai-generate/Step1DefineRequirement.tsx
import React, { useState } from 'react';
import { DirectoryNode } from '../TestCaseDirectory';
import { ChevronDownIcon, FileIcon, ImageIcon, VideoIcon, CodeIcon } from '../../../ui/Icons';

interface Step1Props {
    onContinue: (requirements: string, directory: string) => void;
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

const Step1DefineRequirement: React.FC<Step1Props> = ({ onContinue, directories, isLoading }) => {
    const [directory, setDirectory] = useState('');
    const [template, setTemplate] = useState('Default');
    const [requirements, setRequirements] = useState('');

    const directoryOptions = flattenDirectories(directories);

    const handleContinue = () => {
        if (requirements.trim() && directory) {
            onContinue(requirements, directory);
        } else {
            // Simple validation feedback
            alert("Please select a directory and provide product requirements.");
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow space-y-6">
                {/* Directory */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Directory</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Select where to save the generated test cases.</p>
                    <div className="relative mt-2">
                        <select
                            value={directory}
                            onChange={(e) => setDirectory(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Select a directory</option>
                            {directoryOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Template */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Template</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Select a template for generating test cases. <a href="#" className="text-blue-600 dark:text-blue-400">Read more</a></p>
                    <div className="relative mt-2">
                        <select
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>Default</option>
                            <option>API Testing Template</option>
                            <option>UI/UX Flow Template</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Product Requirements */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Product Requirements</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Provide detailed requirements to help AI generate accurate test cases.</p>
                    <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md flex flex-col">
                        <textarea
                            rows={8}
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none block flex-grow"
                            placeholder="Describe the feature, user story, or acceptance criteria here..."
                        />
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-300 dark:border-gray-600 rounded-b-md">
                            <button className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"><FileIcon /></button>
                            <button className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"><ImageIcon /></button>
                            <button className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"><VideoIcon /></button>
                            <button className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"><CodeIcon /></button>
                        </div>
                    </div>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">AI is your new assistant – the more context you give, the better the test cases it generates.</p>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    onClick={handleContinue}
                    disabled={isLoading}
                    className="px-6 py-2.5 w-32 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center"
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