// Path: src/pages/admin/AdminCustomizationsPage.tsx
import React from 'react';

const AdminCustomizationsPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Customizations</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">Customize fields, statuses, and workflows for test cases and bug reports.</p>
    </div>
  );
};

export default AdminCustomizationsPage;