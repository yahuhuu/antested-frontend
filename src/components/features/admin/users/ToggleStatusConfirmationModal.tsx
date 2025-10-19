// Path: src/components/features/admin/users/ToggleStatusConfirmationModal.tsx
import React from 'react';
import { User } from '../../../../services/userService';

interface ToggleStatusConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
}

const ToggleStatusConfirmationModal: React.FC<ToggleStatusConfirmationModalProps> = ({ isOpen, onClose, onConfirm, user }) => {
  if (!isOpen || !user) {
    return null;
  }

  const action = user.status === 'Active' ? 'deactivate' : 'activate';
  const title = user.status === 'Active' ? 'Deactivate User' : 'Activate User';
  const buttonText = user.status === 'Active' ? 'Yes, Deactivate' : 'Yes, Activate';
  const buttonClass = user.status === 'Active'
    ? 'bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700'
    : 'bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="text-center">
            <svg className="mx-auto mb-4 h-12 w-12 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to {action} the user <span className="font-bold">{user.name}</span>?
            </p>
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
              className={`px-6 py-2 ${buttonClass}`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToggleStatusConfirmationModal;
