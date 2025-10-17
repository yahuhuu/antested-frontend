// Path: pages/ProjectDetailPage.tsx
import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, updateProject, deleteProject, Project, NewProject } from '../services/projectService';
import { getTestSuitesByProjectId, createTestSuite, updateTestSuite, deleteTestSuite, TestSuite, NewTestSuite } from '../services/testSuiteService';
import DeleteConfirmationModal from '../components/features/projects/DeleteConfirmationModal';
import CreateTestSuiteModal from '../components/features/testsuites/CreateTestSuiteModal';
import DeleteTestSuiteModal from '../components/features/testsuites/DeleteTestSuiteModal';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Project state
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Project editing state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [formData, setFormData] = useState<NewProject>({ name: '', key: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Test Suites state
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [suitesLoading, setSuitesLoading] = useState<boolean>(true);
  const [suitesError, setSuitesError] = useState<string | null>(null);
  const [isSuiteModalOpen, setIsSuiteModalOpen] = useState<boolean>(false);
  const [editingSuite, setEditingSuite] = useState<TestSuite | null>(null);
  const [suiteToDelete, setSuiteToDelete] = useState<TestSuite | null>(null);

  const fetchSuites = useCallback(async () => {
    if (!projectId) return;
    try {
      setSuitesLoading(true);
      setSuitesError(null);
      const suiteData = await getTestSuitesByProjectId(projectId);
      setSuites(suiteData);
    } catch (err) {
      setSuitesError('Gagal memuat test suite.');
      console.error(err);
    } finally {
      setSuitesLoading(false);
    }
  }, [projectId]);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectById(projectId);
      setProject(data);
      setFormData({ name: data.name, key: data.key });
    } catch (err) {
      setError('Gagal memuat detail proyek.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectDetails();
    fetchSuites();
  }, [fetchProjectDetails, fetchSuites]);

  const handleEditToggle = () => {
    if (project) {
        setIsEditing(!isEditing);
        setFormData({ name: project.name, key: project.key });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'key' ? value.toUpperCase() : value }));
  };

  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId || !formData.name.trim() || !formData.key.trim()) {
        alert("Nama dan Key tidak boleh kosong.");
        return;
    }
    setIsSaving(true);
    try {
      await updateProject(projectId, formData);
      await fetchProjectDetails();
      setIsEditing(false);
    } catch (updateError) {
      alert('Gagal memperbarui proyek.');
      console.error(updateError);
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!projectId) return;
    try {
        await deleteProject(projectId);
        setIsDeleting(false);
        navigate('/projects');
    } catch (deleteError) {
        alert('Gagal menghapus proyek.');
        console.error(deleteError);
        setIsDeleting(false);
    }
  };

  // Test Suite Handlers
  const handleOpenCreateSuiteModal = () => {
    setEditingSuite(null);
    setIsSuiteModalOpen(true);
  };

  const handleOpenEditSuiteModal = (suite: TestSuite) => {
    setEditingSuite(suite);
    setIsSuiteModalOpen(true);
  };

  const handleSaveTestSuite = async (suiteData: NewTestSuite) => {
    if (!projectId) return;
    try {
      if (editingSuite) {
        await updateTestSuite(editingSuite.id, suiteData);
      } else {
        await createTestSuite(projectId, suiteData);
      }
      setIsSuiteModalOpen(false);
      setEditingSuite(null);
      await fetchSuites();
    } catch (saveError) {
      console.error('Gagal menyimpan test suite:', saveError);
      alert('Gagal menyimpan test suite. Periksa konsol untuk detail.');
    }
  };

  const handleConfirmDeleteSuite = async () => {
    if (!suiteToDelete) return;
    try {
      await deleteTestSuite(suiteToDelete.id);
      setSuiteToDelete(null);
      await fetchSuites();
    } catch (deleteError) {
      alert('Gagal menghapus test suite.');
      console.error(deleteError);
      setSuiteToDelete(null);
    }
  };

  const handleSuiteRowClick = (suiteId: string) => {
    navigate(`/projects/${projectId}/suites/${suiteId}`);
  };


  const renderSuitesContent = () => {
    if (suitesLoading) {
        return <p className="text-center text-gray-500 py-4">Memuat test suite...</p>;
    }
    if (suitesError) {
        return <p className="text-center text-red-500 py-4">{suitesError}</p>;
    }
    if (suites.length === 0) {
        return <p className="text-center text-gray-500 py-4">Belum ada test suite untuk proyek ini.</p>;
    }
    return (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                    <tr>
                        <th scope="col" className="py-3 px-6">Nama Suite</th>
                        <th scope="col" className="py-3 px-6">Deskripsi</th>
                        <th scope="col" className="py-3 px-6 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {suites.map((suite) => (
                        <tr 
                          key={suite.id} 
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => handleSuiteRowClick(suite.id)}
                        >
                            <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{suite.name}</td>
                            <td className="py-4 px-6">{suite.description}</td>
                            <td 
                              className="py-4 px-6 text-center"
                              onClick={(e) => e.stopPropagation()} // Prevent row click when clicking actions
                            >
                                <button onClick={() => handleOpenEditSuiteModal(suite)} className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline mr-4">Edit</button>
                                <button onClick={() => setSuiteToDelete(suite)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
  };

  if (loading) return <p>Memuat detail proyek...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!project) return <p>Proyek tidak ditemukan.</p>;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        {!isEditing ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{project.name}</h1>
              <div className="flex space-x-3">
                <button onClick={handleEditToggle} className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700">Edit</button>
                <button onClick={() => setIsDeleting(true)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">Hapus</button>
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Project Key: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{project.key}</span></p>
          </div>
        ) : (
          <form onSubmit={handleUpdateSubmit}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Edit Proyek</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">Nama Proyek</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400" required />
              </div>
              <div>
                <label htmlFor="key" className="block text-sm font-medium">Key Proyek</label>
                <input type="text" name="key" id="key" value={formData.key} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400" maxLength={5} required />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onClick={handleEditToggle} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700">Batal</button>
              <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Test Suites</h2>
            <button
                onClick={handleOpenCreateSuiteModal}
                className="px-4 py-2 bg-green-600 text-white dark:bg-green-500 dark:hover:bg-green-600 font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-green-500 dark:focus:ring-green-400 transition duration-150 ease-in-out"
            >
                Buat Test Suite Baru
            </button>
        </div>
        {renderSuitesContent()}
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDeleteConfirm}
        projectName={project.name}
      />

      <CreateTestSuiteModal
        isOpen={isSuiteModalOpen}
        onClose={() => {
          setIsSuiteModalOpen(false);
          setEditingSuite(null);
        }}
        onSave={handleSaveTestSuite}
        editingSuite={editingSuite}
      />

      <DeleteTestSuiteModal
        isOpen={!!suiteToDelete}
        onClose={() => setSuiteToDelete(null)}
        onConfirm={handleConfirmDeleteSuite}
        suiteName={suiteToDelete?.name || ''}
      />
    </>
  );
};

export default ProjectDetailPage;