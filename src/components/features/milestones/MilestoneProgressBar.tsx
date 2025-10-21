// Path: src/components/features/milestones/MilestoneProgressBar.tsx
import React from 'react';

interface MilestoneProgressBarProps {
    progress: number;
}

const MilestoneProgressBar: React.FC<MilestoneProgressBarProps> = ({ progress }) => {
    return (
        <div className="flex items-center gap-3">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div 
                    className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-10 text-right">
                {progress}%
            </span>
        </div>
    );
};

export default MilestoneProgressBar;
