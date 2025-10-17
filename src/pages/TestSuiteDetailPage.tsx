// Path: pages/TestSuiteDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTestSuiteById, TestSuite } from '../services/testSuiteService';
import { getTestCasesBySuiteId, TestCase, Priority, Status } from '../services/testCaseService';

const TestSuiteDetailPage: React.FC = () => {
  const { projectId, suiteId } = useParams<{ projectId: string; suiteId: string }>();

  const [suite, setSuite] = useState<TestSuite | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loadingSuite, setLoadingSuite] = useState(true);
  const [loadingTestCases, setLoadingTestCases] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuiteDetails = useCallback(async () => {
    if (!suiteId) return;
    try {
      setLoadingSuite(true);
      const suiteData = await getTestSuiteById(suiteId);
      setSuite(suiteData);
    } catch (err) {
      setError('Gagal memuat detail test suite.');
      console.error(err);
    } finally {
      setLoadingSuite(false);
    }
  }, [suiteId]);

  const fetchTestCases = useCallback(async () => {
    if (!suiteId) return;
    try {
      setLoadingTestCases(true);
      const testCasesData = await getTestCasesBySuiteId(suiteId);
      setTestCases(testCasesData);
    } catch (err) {
      setError(error ? error + ' Gagal memuat test case.' : 'Gagal memuat test case.');
      console.error(err);
    } finally {
      setLoadingTestCases(false);
    }
  }, [suiteId, error]);

  useEffect(() => {
    fetchSuiteDetails();
    fetchTestCases();
  }, [fetchSuiteDetails, fetchTestCases]);

  const priorityBadge = (priority: Priority) => {
    const styles: { [key in Priority]: string } = {
      High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[priority]}`}>{priority}</span>;
  };

  const statusBadge = (status: Status) => {
    const styles: { [key in Status]: string } = {
      Active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      Obsolete: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
  };

  const renderTestCases = () => {
    if (loadingTestCases) {
      return <p className="text-center p-4">Memuat test case...</p>;
    }
    if (testCases.length === 0) {
      return <p className="text-center p-4">Belum ada test case di dalam suite ini.</p>;
    }
    return (
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              <th scope="col" className="py-3 px-6">Judul Test Case</th>
              <th scope="col" className="py-3 px-6">Prioritas</th>
              <th scope="col" className="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc) => (
              <tr key={tc.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{tc.title}</td>
                <td className="py-4 px-6">{priorityBadge(tc.priority)}</td>
                <td className="py-4 px-6">{statusBadge(tc.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loadingSuite) {
    return <p>Memuat...</p>;
  }
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  if (!suite) {
    return <p>Test suite tidak ditemukan.</p>;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
        <div className="mb-4">
          <Link to={`/projects/${projectId}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline dark:hover:text-blue-300">&larr; Kembali ke Proyek</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{suite.name}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{suite.description}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Test Cases</h2>
          {/* Tombol "Buat Test Case Baru" akan ditambahkan di sini nanti */}
        </div>
        {renderTestCases()}
      </div>
    </>
  );
};

export default TestSuiteDetailPage;