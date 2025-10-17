// Path: services/testSuiteService.ts
export interface TestSuite {
  id: string;
  name: string;
  description: string;
  projectId: string;
}

export type NewTestSuite = Omit<TestSuite, 'id' | 'projectId'>;

// Data tiruan untuk simulasi
let mockTestSuites: TestSuite[] = [
  { id: 'ts-01', projectId: 'proj-001', name: 'Manajemen Akun Pengguna', description: 'Mencakup semua alur terkait pendaftaran, login, dan profil pengguna.' },
  { id: 'ts-02', projectId: 'proj-001', name: 'Proses Checkout', description: 'Pengujian fungsionalitas dari keranjang belanja hingga pembayaran berhasil.' },
  { id: 'ts-03', projectId: 'proj-002', name: 'Transfer Dana', description: 'Verifikasi semua jenis transfer antar rekening dan antar bank.' },
  { id: 'ts-04', projectId: 'proj-002', name: 'Pengecekan Saldo & Riwayat', description: 'Memastikan akurasi tampilan saldo dan riwayat transaksi.' },
  { id: 'ts-05', projectId: 'proj-003', name: 'Visualisasi Dasbor', description: 'Pengujian semua widget dan grafik pada dasbor utama.' },
  { id: 'ts-06', projectId: 'proj-001', name: 'Pencarian Produk', description: 'Menguji fungsionalitas pencarian dan filter produk.' },
];

/**
 * Mensimulasikan pengambilan daftar test suite berdasarkan ID proyek.
 * @param projectId ID Proyek
 * @returns Sebuah promise yang resolve dengan daftar test suite untuk proyek tersebut.
 */
export const getTestSuitesByProjectId = (projectId: string): Promise<TestSuite[]> => {
  console.log(`Mengambil test suite untuk proyek ID: ${projectId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const suites = mockTestSuites.filter(suite => suite.projectId === projectId);
      console.log(`Ditemukan ${suites.length} test suite.`);
      resolve(suites);
    }, 1200);
  });
};

/**
 * Mensimulasikan pengambilan satu test suite berdasarkan ID.
 * @param suiteId ID Test Suite
 * @returns Promise yang resolve dengan data test suite atau reject jika tidak ditemukan.
 */
export const getTestSuiteById = (suiteId: string): Promise<TestSuite> => {
  console.log(`Mengambil test suite dengan ID: ${suiteId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const suite = mockTestSuites.find(s => s.id === suiteId);
      if (suite) {
        console.log('Test suite ditemukan:', suite);
        resolve(suite);
      } else {
        console.error('Test suite tidak ditemukan.');
        reject(new Error('Test suite tidak ditemukan.'));
      }
    }, 500);
  });
};

/**
 * Mensimulasikan penyimpanan test suite baru.
 * @param projectId ID Proyek tempat suite akan ditambahkan.
 * @param newSuite Data test suite baru.
 * @returns Sebuah promise yang resolve dengan test suite yang telah dibuat.
 */
export const createTestSuite = (projectId: string, newSuite: NewTestSuite): Promise<TestSuite> => {
  console.log(`Membuat test suite baru untuk proyek ${projectId}...`, newSuite);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!newSuite.name || !newSuite.name.trim()) {
        return reject(new Error('Nama suite wajib diisi.'));
      }
      const createdSuite: TestSuite = {
        id: `ts-${new Date().getTime()}`,
        projectId: projectId,
        name: newSuite.name,
        description: newSuite.description || '',
      };
      mockTestSuites.push(createdSuite);
      console.log('Test suite baru berhasil dibuat.', createdSuite);
      resolve(createdSuite);
    }, 1000);
  });
};

/**
 * Mensimulasikan pembaruan test suite yang ada.
 * @param suiteId ID dari test suite yang akan diperbarui.
 * @param updatedData Data baru untuk test suite.
 * @returns Sebuah promise yang resolve dengan test suite yang telah diperbarui.
 */
export const updateTestSuite = (suiteId: string, updatedData: NewTestSuite): Promise<TestSuite> => {
  console.log(`Memperbarui test suite ${suiteId} dengan data:`, updatedData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const suiteIndex = mockTestSuites.findIndex(s => s.id === suiteId);
      if (suiteIndex !== -1) {
        mockTestSuites[suiteIndex] = { ...mockTestSuites[suiteIndex], ...updatedData };
        console.log('Test suite berhasil diperbarui:', mockTestSuites[suiteIndex]);
        resolve(mockTestSuites[suiteIndex]);
      } else {
        reject(new Error('Gagal memperbarui: Test suite tidak ditemukan.'));
      }
    }, 800);
  });
};

/**
 * Mensimulasikan penghapusan test suite.
 * @param suiteId ID dari test suite yang akan dihapus.
 * @returns Promise yang resolve saat test suite berhasil dihapus.
 */
export const deleteTestSuite = (suiteId: string): Promise<void> => {
  console.log(`Menghapus test suite dengan ID: ${suiteId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = mockTestSuites.length;
      mockTestSuites = mockTestSuites.filter(s => s.id !== suiteId);
      if (mockTestSuites.length < initialLength) {
        console.log('Test suite berhasil dihapus.');
        resolve();
      } else {
        reject(new Error('Gagal menghapus: Test suite tidak ditemukan.'));
      }
    }, 800);
  });
};