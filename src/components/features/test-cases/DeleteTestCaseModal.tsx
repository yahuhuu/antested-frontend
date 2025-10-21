// Path: src/components/features/test-cases/DeleteTestCaseModal.tsx
import React from 'react';

interface DeleteTestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoveToTrash?: () => void;
  onPermanentDelete: () => void;
  onRestore?: () => void;
  itemCount: number;
  isTrashMode: boolean;
}

const DeleteTestCaseModal: React.FC<DeleteTestCaseModalProps> = ({ 
    isOpen, 
    onClose, 
    onMoveToTrash, 
    onPermanentDelete, 
    onRestore,
    itemCount,
    isTrashMode
}) => {
  if (!isOpen || itemCount === 0) {
    return null;
  }

  const renderTrashMode = () => (
    <div className="text-left flex-grow flex flex-col">
        <div>
            <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            Manage {itemCount} Item{itemCount > 1 ? 's' : ''} from Trash
            </h3>
            <div className="mt-2 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <p>You have two options for items in the trash. Please choose carefully.</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border-l-4 border-green-400">
                    <strong className="font-semibold text-gray-800 dark:text-gray-100">Restore</strong>
                    <p className="text-xs">Moves the selected test case(s) back to their original directory with 'Draft' status.</p>
                </div>
                 <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md border-l-4 border-red-500">
                    <strong className="font-semibold text-red-800 dark:text-red-300">Delete Permanently</strong>
                    <p className="text-xs">This action is irreversible. The test case(s) will be permanently deleted and cannot be recovered.</p>
                </div>
            </div>
        </div>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-3 sm:gap-0">
            <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={onPermanentDelete}
                className="w-full sm:w-auto px-4 py-2 bg-transparent text-red-600 dark:text-red-400 font-semibold rounded-lg border border-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
                Delete Permanently
            </button>
            <button
                type="button"
                onClick={onRestore}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
            >
                Restore
            </button>
        </div>
    </div>
  );

  const renderDefaultMode = () => (
    <div className="text-left flex-grow flex flex-col">
        <div>
            <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            Delete {itemCount} Test Case{itemCount > 1 ? 's' : ''}
            </h3>
            <div className="mt-2 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <p>You have two options for deletion. Please choose carefully.</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border-l-4 border-orange-400">
                    <strong className="font-semibold text-gray-800 dark:text-gray-100">Move to Trash</strong>
                    <p className="text-xs">Moves the selected test case(s) to the Trash directory. You can restore them later.</p>
                </div>
                 <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md border-l-4 border-red-500">
                    <strong className="font-semibold text-red-800 dark:text-red-300">Delete Permanently</strong>
                    <p className="text-xs">This action is irreversible. The test case(s) will be permanently deleted and cannot be recovered.</p>
                </div>
            </div>
        </div>
         <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-3 sm:gap-0">
            <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={onPermanentDelete}
                className="w-full sm:w-auto px-4 py-2 bg-transparent text-red-600 dark:text-red-400 font-semibold rounded-lg border border-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
                Delete Permanently
            </button>
            <button
                type="button"
                onClick={onMoveToTrash}
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700"
            >
                Move to Trash
            </button>
        </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center"
      aria-labelledby="delete-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            </div>
            {isTrashMode ? renderTrashMode() : renderDefaultMode()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteTestCaseModal;