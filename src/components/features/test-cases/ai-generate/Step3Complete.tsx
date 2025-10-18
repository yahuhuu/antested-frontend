// Path: src/components/features/test-cases/ai-generate/Step3Complete.tsx
import React, { useState, useEffect } from 'react';
import { CheckSuccessIcon } from '../../../ui/Icons';

interface Step3Props {
    onClose: () => void;
    generatedCount: number;
    directoryName: string;
}

const Step3Complete: React.FC<Step3Props> = ({ onClose, generatedCount, directoryName }) => {
    const [isGenerating, setIsGenerating] = useState(true);

    useEffect(() => {
        // Simulate the generation process
        const timer = setTimeout(() => {
            setIsGenerating(false);
        }, 2500); // This duration matches the mock service delay

        return () => clearTimeout(timer);
    }, []);

    const renderGeneratingState = () => (
        <div className="text-center flex flex-col items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Generating your test cases...</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait a moment while AI does its magic.</p>
        </div>
    );
    
    const renderCompleteState = () => (
        <div className="text-center">
            <CheckSuccessIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Whoohoo! Your Test Cases Are Ready!</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
                You have <span className="font-bold">{generatedCount}</span> test cases saved in <span className="font-bold">{directoryName}</span> of Sample Project.
            </p>
            <div className="mt-8">
                 <button
                    onClick={onClose}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                >
                    Go to Test Cases
                </button>
            </div>
        </div>
    );
    
    return (
        <div className="flex flex-col h-full items-center justify-center">
            {isGenerating ? renderGeneratingState() : renderCompleteState()}
        </div>
    );
};

export default Step3Complete;