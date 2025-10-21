// Path: src/components/features/test-runs/details/CompleteRunConfirmationModal.tsx
import React from 'react';
import { StatusCounts } from '../../../../services/testRunService';
import ProgressBar from '../ProgressBar';

interface CompleteRunConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  statusCounts: StatusCounts;
  totalTestCases: number;
}

const DetailRow: React.FC<{ label: string; value: number; colorClass: string }> = ({ label, value, colorClass }) => (
    <div className="flex justify-between items-center text-sm py-1">
        <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></span>
            <span className="text-gray-600 dark:text-gray-300">{label}</span>
        </div>
        <span className="font-semibold text-gray-800 dark:text-white">{value}</span>
    </div>
);


const CompleteRunConfirmationModal: React.FC<CompleteRunConfirmationModalProps> = ({ isOpen, onClose, onConfirm, statusCounts, totalTestCases }) => {
  if (!isOpen) {
    return null;
  }

  const executed = totalTestCases - statusCounts.untested;
  const completionPercentage = totalTestCases > 0 ? Math.round((executed / totalTestCases) * 100) : 0;
  
  const passedTotal = statusCounts.passed + statusCounts.automationPassed;
  const failedTotal = statusCounts.failed + statusCounts.automationFailed + statusCounts.automationError;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="text-center">
            <svg className="mx-auto mb-4 h-12 w-12 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirm Test Run Completion
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {completionPercentage < 100 
                ? `This test run is only ${completionPercentage}% complete. ` 
                : 'This test run has failing or blocked test cases. '
              }
              Are you sure you want to mark it as completed?
            </p>
          </div>
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">Current Progress</h4>
              <ProgressBar counts={statusCounts} />
              <div className="pt-2">
                <DetailRow label="Passed" value={passedTotal} colorClass="bg-green-500" />
                <DetailRow label="Failed" value={failedTotal} colorClass="bg-red-500" />
                <DetailRow label="Blocked" value={statusCounts.blocked} colorClass="bg-gray-500" />
                <DetailRow label="Skipped" value={statusCounts.skipped} colorClass="bg-yellow-400" />
                <DetailRow label="Untested" value={statusCounts.untested} colorClass="bg-gray-300" />
              </div>
          </div>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
            >
              Yes, Complete Run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteRunConfirmationModal;