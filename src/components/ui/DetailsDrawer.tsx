// Path: src/components/ui/DetailsDrawer.tsx
import React, { useEffect } from 'react';
import { XIcon } from './Icons';

interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

const DetailsDrawer: React.FC<DetailsDrawerProps> = ({ isOpen, onClose, title, children, headerActions }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out"
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className="relative w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-800 shadow-xl">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6 sticky top-0 z-10 border-b dark:border-gray-600">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white" id="slide-over-title">
                  {title}
                </h2>
                <div className="ml-3 flex h-7 items-center gap-2">
                  {headerActions}
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-700 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close panel</span>
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="relative mt-6 flex-1 px-4 sm:px-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsDrawer;