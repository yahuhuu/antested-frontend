
import React from 'react';

const WelcomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-4">
        Welcome to Test Case Management
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-2xl">
        This is your central hub for creating, managing, and executing test cases efficiently.
        Navigate through the application to explore different features.
      </p>
    </div>
  );
};

export default WelcomePage;
