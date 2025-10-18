// Path: src/components/features/test-cases/ai-generate/Step2ReviewAndSelect.tsx
import React, { useState, useEffect, useRef } from 'react';
import { AISuggestion } from '../../../../services/aiService';
import { Checkbox } from '../../../ui/Checkbox';
import { EditIcon, SparklesIcon, PlusIcon, InfoIcon } from '../../../ui/Icons';

interface Step2Props {
    onGenerate: (selected: AISuggestion[]) => void;
    suggestions: AISuggestion[];
    requirements: string;
    attachments: File[];
    onRegenerate: (newRequirements: string, newAttachments: File[]) => Promise<void>;
    isRegenerating: boolean;
    onGenerateMore: () => Promise<void>;
    isGeneratingMore: boolean;
    onCancel: () => void;
}

const testMethods: Record<string, string> = {
    'Default': 'The AI will automatically select the most appropriate method based on the provided requirements.',
    'Equivalence Partitioning': 'Divides input data into equivalent partitions from which test cases can be derived. This helps reduce the total number of test cases.',
    'Boundary Value Analysis': 'Focuses on testing the boundaries between partitions. It is often used with Equivalence Partitioning.',
    'Decision Table Testing': 'A systematic approach where you identify conditions and the resulting actions to consider complex business rules.',
    'State Transition Testing': 'Helps to test the behavior of a system that exhibits a finite number of states.',
};

const EditConfirmationModal: React.FC<{ isOpen: boolean; onCancel: () => void; onConfirm: () => void; }> = ({ isOpen, onCancel, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center" onClick={onCancel}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 p-6" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <h3 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                        Confirm Edit
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Editing requirements and regenerating will replace all existing generated test cases with new ones. Are you sure you want to continue editing?
                    </p>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                    <button onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

const Step2ReviewAndSelect: React.FC<Step2Props> = ({ 
    onGenerate, 
    suggestions: initialSuggestions, 
    requirements: initialRequirements,
    attachments: initialAttachments,
    onRegenerate, 
    isRegenerating, 
    onGenerateMore,
    isGeneratingMore,
    onCancel 
}) => {
    const [suggestions, setSuggestions] = useState(initialSuggestions);
    const [localRequirements, setLocalRequirements] = useState(initialRequirements);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCache, setEditCache] = useState<{ title: string; description: string } | null>(null);
    
    const [isEditingRequirements, setIsEditingRequirements] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    // State for editing requirements section
    const [attachments, setAttachments] = useState<File[]>(initialAttachments);
    const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
    const [method, setMethod] = useState('Default');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSuggestions(initialSuggestions);
    }, [initialSuggestions]);

    useEffect(() => {
        setLocalRequirements(initialRequirements);
        setAttachments(initialAttachments);
    }, [initialRequirements, initialAttachments]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
                setIsAttachMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const areAllSelected = selectedIds.size > 0 && selectedIds.size === suggestions.length;

    const handleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? new Set(suggestions.map(s => s.id)) : new Set());
    };

    const handleSelectItem = (id: string, checked: boolean) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (checked) newSet.add(id);
            else newSet.delete(id);
            return newSet;
        });
    };

    const handleEditSuggestion = (suggestion: AISuggestion) => {
        setEditingId(suggestion.id);
        setEditCache({ title: suggestion.title, description: suggestion.description });
    };

    const handleSaveSuggestionEdit = (id: string) => {
        if (!editCache) return;
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, ...editCache } : s));
        setEditingId(null);
        setEditCache(null);
    };
    
    const handleCancelSuggestionEdit = () => {
        setEditingId(null);
        setEditCache(null);
    };

    const handleGenerate = () => {
        const selected = suggestions.filter(s => selectedIds.has(s.id));
        onGenerate(selected);
    };
    
    const handleEditRequirementsClick = () => setShowConfirmModal(true);
    const handleConfirmEditRequirements = () => {
        setShowConfirmModal(false);
        setIsEditingRequirements(true);
    };
    const handleCancelEditRequirements = () => {
        setIsEditingRequirements(false);
        setLocalRequirements(initialRequirements);
        setAttachments(initialAttachments);
    };
    const handleRegenerateClick = async () => {
        await onRegenerate(localRequirements, attachments);
        setIsEditingRequirements(false);
    };

    // --- Attachment Handlers ---
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;

        const newFiles = Array.from(event.target.files);
        const validFiles: File[] = [];
        
        for (const file of newFiles) {
            if (file.size > MAX_FILE_SIZE) {
                alert(`File "${file.name}" is too large. The maximum size is 100 MB.`);
            } else {
                validFiles.push(file);
            }
        }

        if (validFiles.length > 0) {
            setAttachments(prev => [...prev, ...validFiles]);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset to allow same file selection again
        }
        setIsAttachMenuOpen(false);
    };

    const handleRemoveAttachment = (fileName: string) => {
        setAttachments(prev => prev.filter(file => file.name !== fileName));
    };

    return (
        <>
        <EditConfirmationModal 
            isOpen={showConfirmModal}
            onCancel={() => setShowConfirmModal(false)}
            onConfirm={handleConfirmEditRequirements}
        />
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple />

        <div className="flex flex-col h-full">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                {/* Left Column: Review & Select */}
                <div className="flex flex-col overflow-hidden border-r dark:border-gray-700 pr-4">
                    <h3 className="text-md font-bold text-gray-800 dark:text-white mb-2 flex-shrink-0">Review, edit and select test cases for AI to generate.</h3>
                    <div className="flex items-center gap-3 p-2 border-y border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <Checkbox id="select-all-ai" checked={areAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} />
                        <span className="font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase">Title and Description</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-2">
                        {suggestions.map(sugg => (
                            <div key={sugg.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <Checkbox id={`sugg-${sugg.id}`} checked={selectedIds.has(sugg.id)} onChange={e => handleSelectItem(sugg.id, e.target.checked)} />
                                <div className="flex-1">
                                    {editingId === sugg.id ? (
                                        <div className="space-y-2">
                                            <input type="text" value={editCache?.title} onChange={(e) => setEditCache(prev => ({...prev!, title: e.target.value}))} className="w-full text-sm font-semibold p-1 bg-white dark:bg-gray-600 border border-blue-500 rounded" />
                                            <textarea value={editCache?.description} onChange={(e) => setEditCache(prev => ({...prev!, description: e.target.value}))} className="w-full text-xs p-1 bg-white dark:bg-gray-600 border border-blue-500 rounded" rows={3} />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSaveSuggestionEdit(sugg.id)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Save</button>
                                                <button onClick={handleCancelSuggestionEdit} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{sugg.title}</p>
                                                <button onClick={() => handleEditSuggestion(sugg)} className="text-gray-500 hover:text-blue-600 p-1 rounded"><EditIcon className="w-4 h-4" /></button>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sugg.description}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-2 flex-shrink-0">
                        <button onClick={onGenerateMore} disabled={isGeneratingMore} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-full justify-center disabled:opacity-50">
                            {isGeneratingMore ? 'Generating...' : <><SparklesIcon className="w-4 h-4" /> Generate More</>}
                        </button>
                    </div>
                </div>

                {/* Right Column: Product Requirements */}
                <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md overflow-hidden">
                    <div className="flex justify-between items-center"><h3 className="text-md font-bold text-gray-800 dark:text-white">Product Requirements *</h3>
                        {!isEditingRequirements ? (<button onClick={handleEditRequirementsClick} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Edit Requirement</button>) : (<button onClick={() => setLocalRequirements('')} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">clear</button>)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter clear, detailed requirements for more relevant test coverage.</p>
                    
                     <div className={`mt-2 border rounded-md flex flex-col flex-grow ${
                        isEditingRequirements ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'
                     }`}>
                        <textarea
                            value={localRequirements}
                            readOnly={!isEditingRequirements}
                            onChange={(e) => setLocalRequirements(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none block flex-grow resize-none disabled:bg-gray-100 dark:disabled:bg-gray-800"
                            placeholder="Describe the feature, user story, or acceptance criteria here..."
                            disabled={!isEditingRequirements}
                        />
                         {attachments.length > 0 && (
                            <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-1 max-h-24 overflow-y-auto">
                                {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between text-xs p-1 bg-gray-100 dark:bg-gray-700 rounded">
                                        <span className="truncate pr-2">{file.name}</span>
                                        {isEditingRequirements && (
                                            <button onClick={() => handleRemoveAttachment(file.name)} className="font-bold text-red-500 hover:text-red-700 ml-2 flex-shrink-0">&times;</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {isEditingRequirements && (
                            <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-300 dark:border-gray-600 rounded-b-md">
                               <div className="flex items-center gap-2">
                                 <div className="relative" ref={attachMenuRef}>
                                    <button onClick={() => setIsAttachMenuOpen(prev => !prev)} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><PlusIcon /></button>
                                    {isAttachMenuOpen && (
                                        <div className="absolute bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 py-1 z-10">
                                            <button onClick={() => { fileInputRef.current?.click(); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Upload file</button>
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
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        {testMethods[method as keyof typeof testMethods]}
                                    </div>
                                 </div>
                               </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Footer Action */}
            <div className="pt-4 flex justify-end items-center gap-4">
                 {isEditingRequirements ? (
                    <>
                        <button onClick={handleCancelEditRequirements} className="px-6 py-2 bg-transparent text-gray-700 dark:text-gray-300 font-semibold rounded-lg border border-red-300 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400">
                            Cancel
                        </button>
                        <button onClick={handleRegenerateClick} disabled={isRegenerating || !localRequirements.trim()} className="px-6 py-2.5 whitespace-nowrap bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-600 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                            {isRegenerating ? (<svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : (<SparklesIcon className="w-5 h-5" />)}
                            Regenerate Test Case
                        </button>
                    </>
                 ) : (
                    <>
                    <button onClick={onCancel} className="px-6 py-2 bg-transparent text-gray-700 dark:text-gray-300 font-semibold rounded-lg border border-red-300 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400">
                        Cancel
                    </button>
                    <button onClick={handleGenerate} disabled={selectedIds.size === 0} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                        Generate Test Case ({selectedIds.size})
                    </button>
                    </>
                 )}
            </div>
        </div>
        </>
    );
};

export default Step2ReviewAndSelect;