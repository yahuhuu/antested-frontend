// Path: src/pages/admin/AdminSiteSettingsPage.tsx
import React from 'react';

const AdminSiteSettingsPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Site Settings</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">Configure site-wide settings, such as authentication and appearance.</p>
    </div>
  );
};

export default AdminSiteSettingsPage;