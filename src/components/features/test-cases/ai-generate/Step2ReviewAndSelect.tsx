// Path: src/components/features/test-cases/ai-generate/Step2ReviewAndSelect.tsx
import React, { useState, useEffect, useRef } from 'react';
import { AISuggestion } from '../../../../services/aiService';
import { Checkbox } from '../../../ui/Checkbox';
import { EditIcon, SparklesIcon, FileIcon, ImageIcon, VideoIcon, CodeIcon } from '../../../ui/Icons';

interface Step2Props {
    onGenerate: (selected: AISuggestion[]) => void;
    suggestions: AISuggestion[];
    requirements: string;
    onRegenerate: (newRequirements: string) => Promise<void>;
    isRegenerating: boolean;
    onGenerateMore: () => Promise<void>;
    isGeneratingMore: boolean;
    onCancel: () => void;
}

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
    onRegenerate, 
    isRegenerating, 
    onGenerateMore,
    isGeneratingMore,
    onCancel 
}) => {
    const [suggestions, setSuggestions] = useState(initialSuggestions);
    const [localRequirements, setLocalRequirements] = useState(initialRequirements);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()); // Not selected by default
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCache, setEditCache] = useState<{ title: string; description: string } | null>(null);
    
    const [isEditingRequirements, setIsEditingRequirements] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSuggestions(initialSuggestions);
        // Do not update selected IDs here, keep user's selection across regenerations
    }, [initialSuggestions]);

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
        setAttachments([]);
    };
    const handleRegenerateClick = async () => {
        await onRegenerate(localRequirements);
        setIsEditingRequirements(false);
        setAttachments([]);
    };

    // --- Attachment Handlers ---
    const handleAddAttachment = () => fileInputRef.current?.click();
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setAttachments(prev => [...prev, ...Array.from(event.target.files!)]);
        }
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
                    <textarea readOnly={!isEditingRequirements} value={localRequirements} onChange={(e) => setLocalRequirements(e.target.value)} className="flex-1 w-full p-2 mt-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md resize-none disabled:bg-gray-100 dark:disabled:bg-gray-800" disabled={!isEditingRequirements}/>
                    {isEditingRequirements && (
                        <div className="pt-2">
                            <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md">
                                <button onClick={handleAddAttachment} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"><FileIcon /></button>
                                <button onClick={handleAddAttachment} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"><ImageIcon /></button>
                                <button onClick={handleAddAttachment} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"><VideoIcon /></button>
                                <button onClick={handleAddAttachment} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"><CodeIcon /></button>
                            </div>
                            {attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {attachments.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between text-xs p-1 bg-gray-100 dark:bg-gray-700 rounded">
                                            <span className="truncate">{file.name}</span>
                                            <button onClick={() => handleRemoveAttachment(file.name)} className="text-red-500 hover:text-red-700 ml-2">&times;</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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