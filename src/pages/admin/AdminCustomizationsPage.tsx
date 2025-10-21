// Path: src/pages/admin/AdminCustomizationsPage.tsx
import React, { useState } from 'react';
import CaseFieldsTab from '../../components/features/admin/customizations/CaseFieldsTab';
import TestCaseTemplatesTab from '../../components/features/admin/customizations/TestCaseTemplatesTab';
import TestStepTemplatesTab from '../../components/features/admin/customizations/TestStepTemplatesTab';
import { SparklesIcon, DocumentIcon, PencilIcon } from '../../components/ui/Icons';

type Tab = 'caseFields' | 'testCaseTemplates' | 'testStepTemplates';

const AdminCustomizationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('caseFields');

  const tabs = [
    { id: 'caseFields', label: 'Case Fields', icon: <SparklesIcon className="w-5 h-5 mr-2" /> },
    { id: 'testStepTemplates', label: 'Test Step Templates', icon: <PencilIcon className="w-5 h-5 mr-2" /> },
    { id: 'testCaseTemplates', label: 'Test Case Templates', icon: <DocumentIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Customizations</h1>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center py-3 px-5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-grow mt-6">
        {activeTab === 'caseFields' && <CaseFieldsTab />}
        {activeTab === 'testCaseTemplates' && <TestCaseTemplatesTab />}
        {activeTab === 'testStepTemplates' && <TestStepTemplatesTab />}
      </div>
    </div>
  );
};

export default AdminCustomizationsPage;