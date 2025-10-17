// Path: services/testCaseService.ts
export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Active' | 'Obsolete';

export interface TestCase {
  id: string;
  suiteId: string;
  title: string;
  priority: Priority;
  status: Status;
}

// Data tiruan untuk simulasi
const mockTestCases: TestCase[] = [
  { id: 'tc-001', suiteId: 'ts-01', title: 'Pendaftaran pengguna baru dengan email valid', priority: 'High', status: 'Active' },
  { id: 'tc-002', suiteId: 'ts-01', title: 'Pendaftaran pengguna dengan email yang sudah ada', priority: 'Medium', status: 'Active' },
  { id: 'tc-003', suiteId: 'ts-01', title: 'Login dengan kredensial yang benar', priority: 'High', status: 'Active' },
  { id: 'tc-004', suiteId: 'ts-01', title: 'Login dengan kata sandi yang salah', priority: 'Medium', status: 'Active' },
  { id: 'tc-005', suiteId: 'ts-02', title: 'Menambahkan produk ke keranjang', priority: 'High', status: 'Active' },
  { id: 'tc-006', suiteId: 'ts-02', title: 'Menghapus produk dari keranjang', priority: 'Medium', status: 'Active' },
  { id: 'tc-007', suiteId: 'ts-02', title: 'Checkout dengan kartu kredit valid', priority: 'High', status: 'Active' },
  { id: 'tc-008', suiteId: 'ts-03', title: 'Transfer ke rekening bank yang sama', priority: 'High', status: 'Active' },
  { id: 'tc-009', suiteId: 'ts-03', title: 'Transfer dengan saldo tidak mencukupi', priority: 'Medium', status: 'Active' },
  { id: 'tc-010', suiteId: 'ts-04', title: 'Tampilan riwayat transaksi 30 hari terakhir', priority: 'High', status: 'Active' },
  { id: 'tc-011', suiteId: 'ts-05', title: 'Widget penjualan harus diperbarui secara real-time', priority: 'High', status: 'Active' },
  { id: 'tc-012', suiteId: 'ts-01', title: 'Reset kata sandi melalui email', priority: 'High', status: 'Active' },
  { id: 'tc-013', suiteId: 'ts-01', title: 'Login menggunakan akun Google (SSO)', priority: 'Low', status: 'Obsolete' },
];

/**
 * Mensimulasikan pengambilan daftar test case berdasarkan ID Test Suite.
 * @param suiteId ID dari Test Suite
 * @returns Sebuah promise yang resolve dengan daftar test case untuk suite tersebut.
 */
export const getTestCasesBySuiteId = (suiteId: string): Promise<TestCase[]> => {
  console.log(`Mengambil test case untuk suite ID: ${suiteId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const testCases = mockTestCases.filter(tc => tc.suiteId === suiteId);
      console.log(`Ditemukan ${testCases.length} test case.`);
      resolve(testCases);
    }, 1300);
  });
};