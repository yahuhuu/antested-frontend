// Path: src/components/features/test-cases/ai-generate/Step2ReviewAndSelect.tsx
import React, { useState, useEffect } from 'react';
import { AISuggestion } from '../../../../services/aiService';
import { Checkbox } from '../../../ui/Checkbox';
import { EditIcon } from '../../../ui/Icons';

interface Step2Props {
    onGenerate: (selected: AISuggestion[]) => void;
    suggestions: AISuggestion[];
    requirements: string;
}

const Step2ReviewAndSelect: React.FC<Step2Props> = ({ onGenerate, suggestions: initialSuggestions, requirements: initialRequirements }) => {
    const [suggestions, setSuggestions] = useState(initialSuggestions);
    const [requirements, setRequirements] = useState(initialRequirements);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCache, setEditCache] = useState<{ title: string; description: string } | null>(null);

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

    const handleEdit = (suggestion: AISuggestion) => {
        setEditingId(suggestion.id);
        setEditCache({ title: suggestion.title, description: suggestion.description });
    };

    const handleSaveEdit = (id: string) => {
        if (!editCache) return;
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, ...editCache } : s));
        setEditingId(null);
        setEditCache(null);
    };
    
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditCache(null);
    };

    const handleGenerate = () => {
        const selected = suggestions.filter(s => selectedIds.has(s.id));
        onGenerate(selected);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                {/* Left Column: Review & Select */}
                <div className="flex flex-col overflow-hidden pr-2">
                    <h3 className="text-md font-bold text-gray-800 dark:text-white mb-2 flex-shrink-0">Review, edit and select test cases for AI to generate.</h3>
                    <div className="flex items-center gap-3 p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <Checkbox id="select-all-ai" checked={areAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} />
                        <span className="font-semibold text-sm text-gray-600 dark:text-gray-300">TITLE AND DESCRIPTION</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 py-2">
                        {suggestions.map(sugg => (
                            <div key={sugg.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <Checkbox id={`sugg-${sugg.id}`} checked={selectedIds.has(sugg.id)} onChange={e => handleSelectItem(sugg.id, e.target.checked)} />
                                <div className="flex-1">
                                    {editingId === sugg.id ? (
                                        <div className="space-y-2">
                                            <input 
                                                type="text" 
                                                value={editCache?.title}
                                                onChange={(e) => setEditCache(prev => ({...prev!, title: e.target.value}))}
                                                className="w-full text-sm font-semibold p-1 bg-white dark:bg-gray-600 border border-blue-500 rounded"
                                            />
                                            <textarea
                                                value={editCache?.description}
                                                onChange={(e) => setEditCache(prev => ({...prev!, description: e.target.value}))}
                                                className="w-full text-xs p-1 bg-white dark:bg-gray-600 border border-blue-500 rounded"
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSaveEdit(sugg.id)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Save</button>
                                                <button onClick={handleCancelEdit} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{sugg.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sugg.description}</p>
                                        </>
                                    )}
                                </div>
                                {editingId !== sugg.id && (
                                    <button onClick={() => handleEdit(sugg)} className="text-gray-500 hover:text-blue-600 p-1 rounded">
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Product Requirements */}
                <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md overflow-hidden">
                    <h3 className="text-md font-bold text-gray-800 dark:text-white mb-2">Product Requirements</h3>
                    <textarea
                        readOnly
                        value={requirements}
                        className="flex-1 w-full p-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md resize-none"
                    />
                </div>
            </div>
            
            {/* Footer Action */}
            <div className="pt-4 flex justify-end">
                 <button
                    onClick={handleGenerate}
                    disabled={selectedIds.size === 0}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Generate Test Case ({selectedIds.size})
                </button>
            </div>
        </div>
    );
};

export default Step2ReviewAndSelect;