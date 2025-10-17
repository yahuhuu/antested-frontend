// Path: services/testCaseService.ts
export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Active' | 'Obsolete';

export interface TestCase {
  id: string;
  projectId: string;
  title: string;
  priority: Priority;
  status: Status;
}

// Data tiruan untuk simulasi
const mockTestCases: TestCase[] = [
  { id: 'tc-001', projectId: 'proj-001', title: 'Pendaftaran pengguna baru dengan email valid', priority: 'High', status: 'Active' },
  { id: 'tc-002', projectId: 'proj-001', title: 'Pendaftaran pengguna dengan email yang sudah ada', priority: 'Medium', status: 'Active' },
  { id: 'tc-003', projectId: 'proj-001', title: 'Login dengan kredensial yang benar', priority: 'High', status: 'Active' },
  { id: 'tc-004', projectId: 'proj-001', title: 'Login dengan kata sandi yang salah', priority: 'Medium', status: 'Active' },
  { id: 'tc-005', projectId: 'proj-001', title: 'Menambahkan produk ke keranjang', priority: 'High', status: 'Active' },
  { id: 'tc-006', projectId: 'proj-001', title: 'Menghapus produk dari keranjang', priority: 'Medium', status: 'Active' },
  { id: 'tc-007', projectId: 'proj-001', title: 'Checkout dengan kartu kredit valid', priority: 'High', status: 'Active' },
  { id: 'tc-008', projectId: 'proj-002', title: 'Transfer ke rekening bank yang sama', priority: 'High', status: 'Active' },
  { id: 'tc-009', projectId: 'proj-002', title: 'Transfer dengan saldo tidak mencukupi', priority: 'Medium', status: 'Active' },
  { id: 'tc-010', projectId: 'proj-002', title: 'Tampilan riwayat transaksi 30 hari terakhir', priority: 'High', status: 'Active' },
  { id: 'tc-011', projectId: 'proj-003', title: 'Widget penjualan harus diperbarui secara real-time', priority: 'High', status: 'Active' },
  { id: 'tc-012', projectId: 'proj-001', title: 'Reset kata sandi melalui email', priority: 'High', status: 'Active' },
  { id: 'tc-013', projectId: 'proj-001', title: 'Login menggunakan akun Google (SSO)', priority: 'Low', status: 'Obsolete' },
];

/**
 * Mensimulasikan pengambilan daftar test case berdasarkan ID Project.
 * @param projectId ID dari Project
 * @returns Sebuah promise yang resolve dengan daftar test case untuk project tersebut.
 */
export const getTestCasesByProjectId = (projectId: string): Promise<TestCase[]> => {
  console.log(`Mengambil test case untuk project ID: ${projectId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const testCases = mockTestCases.filter(tc => tc.projectId === projectId);
      console.log(`Ditemukan ${testCases.length} test case.`);
      resolve(testCases);
    }, 1300);
  });
};