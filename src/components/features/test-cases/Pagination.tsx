// Path: src/components/features/test-cases/Pagination.tsx
import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../ui/Icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange
}) => {
  const [goToPage, setGoToPage] = useState(currentPage.toString());

  useEffect(() => {
    setGoToPage(currentPage.toString());
  }, [currentPage]);

  const handleGoToPage = () => {
    let page = parseInt(goToPage, 10);
    if (!isNaN(page)) {
      page = Math.max(1, Math.min(page, totalPages || 1));
      onPageChange(page);
    }
  };
  
  const handleGoToPageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          handleGoToPage();
      }
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 gap-4">
      <div className="flex-shrink-0">
        <span>{startItem}-{endItem} of {totalItems} items</span>
      </div>
      <div className="flex items-center justify-center sm:justify-end gap-x-6 gap-y-3 flex-wrap flex-grow">
        <div className="flex items-center gap-2">
          <label htmlFor="rows-per-page" className="whitespace-nowrap">Rows per page:</label>
          <select
            id="rows-per-page"
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
            <label htmlFor="go-to-page" className="whitespace-nowrap">Go to page:</label>
            <input
                id="go-to-page"
                type="number"
                min="1"
                max={totalPages || 1}
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                onKeyDown={handleGoToPageKeyDown}
                className="w-16 px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
        </div>

        <div className="flex items-center gap-4">
          <span className="whitespace-nowrap">Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              aria-label="Previous page"
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              aria-label="Next page"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};