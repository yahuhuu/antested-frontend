// Path: components/features/testsuites/CreateTestSuiteModal.tsx
import React, { useState, FormEvent, useEffect } from 'react';
import { NewTestSuite, TestSuite } from '../../../services/testSuiteService';

interface CreateTestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (suiteData: NewTestSuite) => Promise<void>;
  editingSuite: TestSuite | null;
}

const CreateTestSuiteModal: React.FC<CreateTestSuiteModalProps> = ({ isOpen, onClose, onSave, editingSuite }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!editingSuite;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setName(editingSuite.name);
        setDescription(editingSuite.description);
      } else {
        setName('');
        setDescription('');
      }
      setError('');
      setIsSaving(false);
    }
  }, [isOpen, editingSuite, isEditMode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama Suite tidak boleh kosong.');
      return;
    }
    setError('');
    setIsSaving(true);
    await onSave({ name, description });
    setIsSaving(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {isEditMode ? 'Edit Test Suite' : 'Buat Test Suite Baru'}
            </h2>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              aria-label="Tutup"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="suiteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nama Suite
              </label>
              <input
                type="text"
                id="suiteName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                placeholder="Contoh: Pengujian Login Pengguna"
                required
              />
            </div>
            <div>
              <label htmlFor="suiteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Deskripsi <span className="text-gray-500">(Opsional)</span>
              </label>
              <textarea
                id="suiteDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                placeholder="Jelaskan secara singkat tujuan dari test suite ini"
              />
            </div>
            
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 w-36 bg-green-600 text-white dark:bg-green-500 dark:hover:bg-green-600 font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none disabled:opacity-50 flex justify-center items-center"
              >
                {isSaving ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  isEditMode ? 'Simpan Perubahan' : 'Simpan Suite'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTestSuiteModal;