// Path: src/components/features/dashboard/ActivityFeed.tsx
import React, { useState } from 'react';
import { Activity } from '../../../services/dashboardService';

interface ActivityFeedProps {
  activities: Activity[];
  isLoading: boolean;
}

type Tab = 'History' | 'Test Changes';

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;


const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, isLoading }) => {
  const [activeTab, setActiveTab] = useState<Tab>('History');

  const getIcon = (type: Activity['type']) => {
      return type === 'test_change' ? <DocumentIcon/> : <UserIcon/>;
  }

  const renderSkeleton = () => (
      <div className="space-y-4 animate-pulse max-h-36 overflow-hidden">
          {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
              </div>
          ))}
      </div>
  );

  const filteredActivities = activities.filter(act => {
    if (activeTab === 'History') return act.type === 'history';
    if (activeTab === 'Test Changes') return act.type === 'test_change';
    return true;
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Activity</h2>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-3">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {(['History', 'Test Changes'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? renderSkeleton() : (
        <ul className="space-y-3 max-h-36 overflow-y-auto pr-2">
          {filteredActivities.map(activity => (
            <li key={activity.id} className="flex items-start space-x-3">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 mt-1">
                {getIcon(activity.type)}
              </div>
              <div>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-bold">{activity.user}</span> {activity.action}.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activity.timestamp}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityFeed;