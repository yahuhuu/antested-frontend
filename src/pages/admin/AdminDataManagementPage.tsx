// Path: src/pages/admin/AdminDataManagementPage.tsx
import React from 'react';

const AdminDataManagementPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Data Management</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">Manage data imports, exports, and backups.</p>
    </div>
  );
};

export default AdminDataManagementPage;