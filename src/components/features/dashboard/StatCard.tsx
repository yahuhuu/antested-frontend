// Path: src/components/features/dashboard/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  data: number | undefined;
  icon: React.ReactNode;
  isLoading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, data, icon, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{data ?? 0}</p>
        </div>
        <div className="text-blue-500 dark:text-blue-400 opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;