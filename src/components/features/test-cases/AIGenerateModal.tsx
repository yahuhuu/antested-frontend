// Path: src/components/features/test-cases/AIGenerateModal.tsx
import React, { useState } from 'react';
import { DirectoryNode } from './TestCaseDirectory';
import { AISuggestion, getAISuggestions, generateTestCases, getMoreAISuggestions } from '../../../services/aiService';
import Step1DefineRequirement from './ai-generate/Step1DefineRequirement';
import Step2ReviewAndSelect from './ai-generate/Step2ReviewAndSelect';
import Step3Complete from './ai-generate/Step3Complete';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: (didGenerate: boolean) => void;
  directories: DirectoryNode[];
  projectId: string;
}

const AIGenerateModal: React.FC<AIGenerateModalProps> = ({ isOpen, onClose, directories, projectId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

  // Data shared across steps
  const [requirements, setRequirements] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState<string>('');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [generatedCount, setGeneratedCount] = useState(0);

  const handleContinueFromStep1 = async (reqs: string, dir: string) => {
    setIsLoading(true);
    setRequirements(reqs);
    setSelectedDirectory(dir);
    try {
        const suggs = await getAISuggestions(reqs);
        setSuggestions(suggs);
        setCurrentStep(2);
    } catch (error) {
        console.error("Failed to get AI suggestions", error);
        // Handle error state in UI
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegenerate = async (reqs: string) => {
    setIsLoading(true);
    setRequirements(reqs);
    try {
        const suggs = await getAISuggestions(reqs);
        setSuggestions(suggs);
    } catch (error) {
        console.error("Failed to regenerate AI suggestions", error);
        // Handle error state in UI
    } finally {
        setIsLoading(false);
    }
  };

  const handleGenerateMore = async () => {
    setIsGeneratingMore(true);
    try {
        const moreSuggestions = await getMoreAISuggestions();
        setSuggestions(prev => [...prev, ...moreSuggestions]);
    } catch (error) {
        console.error("Failed to get more AI suggestions", error);
    } finally {
        setIsGeneratingMore(false);
    }
  };


  const handleGenerateFromStep2 = async (finalSuggestions: AISuggestion[]) => {
      setIsLoading(true);
      setCurrentStep(3);
      try {
          const newTestCases = await generateTestCases(finalSuggestions, selectedDirectory, projectId);
          setGeneratedCount(newTestCases.length);
          // The loading state in Step3Complete will be handled internally for its animation
      } catch (error) {
          console.error("Failed to generate test cases", error);
          // Handle error state in UI
      } finally {
        // Do not set isLoading to false here, as Step3 handles its own loading state display
      }
  };
  
  const handleClose = (didGenerate: boolean = false) => {
    // Reset state on close
    setTimeout(() => {
        setCurrentStep(1);
        setIsLoading(false);
        setRequirements('');
        setSelectedDirectory('');
        setSuggestions([]);
        setGeneratedCount(0);
    }, 300); // Delay to allow animation
    onClose(didGenerate);
  };


  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
      onClick={() => handleClose()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">AI Generate Test Cases</h2>
                <button onClick={() => handleClose()} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" aria-label="Close">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            {/* Step Indicator */}
            <div className="flex justify-center items-center mb-6">
                {/* Step lines and circles logic could be more complex, simple version for now */}
                <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">{currentStep > 1 ? '✓' : '1'}</div>
                    <span className="ml-2 font-semibold">Define Requirement</span>
                </div>
                <div className={`flex-1 mx-4 h-0.5 ${currentStep > 1 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">{currentStep > 2 ? '✓' : '2'}</div>
                    <span className="ml-2 font-semibold">Review, Edit & Select</span>
                </div>
                <div className={`flex-1 mx-4 h-0.5 ${currentStep > 2 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">3</div>
                    <span className="ml-2 font-semibold">Generate Test Cases</span>
                </div>
            </div>

            {/* Step Content */}
            <div className="h-[580px] flex flex-col">
                {currentStep === 1 && <Step1DefineRequirement onContinue={handleContinueFromStep1} directories={directories} isLoading={isLoading} />}
                {currentStep === 2 && <Step2ReviewAndSelect 
                    onGenerate={handleGenerateFromStep2} 
                    suggestions={suggestions} 
                    requirements={requirements}
                    onRegenerate={handleRegenerate}
                    isRegenerating={isLoading}
                    onGenerateMore={handleGenerateMore}
                    isGeneratingMore={isGeneratingMore}
                    onCancel={() => handleClose(false)}
                />}
                {currentStep === 3 && <Step3Complete onClose={() => handleClose(true)} generatedCount={generatedCount} directoryName={selectedDirectory} />}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerateModal;