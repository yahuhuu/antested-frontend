// Path: services/projectService.ts
export interface Project {
  id: string;
  name: string;
  client: string;
  key: string;
}

export type NewProject = Omit<Project, 'id' | 'client'> & { client?: string };

// Data tiruan untuk simulasi
let mockProjects: Project[] = [
  { id: 'proj-001', name: 'Sistem E-commerce', client: 'Klien A', key: 'ECA' },
  { id: 'proj-002', name: 'Aplikasi Mobile Banking', client: 'Bank Sejahtera', key: 'MBANK' },
  { id: 'proj-003', name: 'Platform Analitik Data', client: 'Internal', key: 'PADI' },
  { id: 'proj-004', name: 'Sistem Manajemen Inventaris', client: 'Gudang Jaya', key: 'SMI' },
];

/**
 * Mensimulasikan pengambilan daftar proyek dari API.
 * @returns Sebuah promise yang akan resolve dengan daftar proyek setelah 1.5 detik.
 */
export const getProjects = (): Promise<Project[]> => {
  console.log('Mengambil data proyek...');
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Data proyek berhasil diambil.');
      resolve([...mockProjects]);
    }, 1500);
  });
};

/**
 * Mensimulasikan pengambilan satu proyek berdasarkan ID.
 * @param id ID Proyek
 * @returns Sebuah promise yang resolve dengan data proyek atau reject jika tidak ditemukan.
 */
export const getProjectById = (id: string): Promise<Project> => {
  console.log(`Mengambil proyek dengan ID: ${id}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const project = mockProjects.find(p => p.id === id);
      if (project) {
        console.log('Proyek ditemukan:', project);
        resolve(project);
      } else {
        console.error('Proyek tidak ditemukan.');
        reject(new Error('Proyek tidak ditemukan.'));
      }
    }, 500);
  });
};


/**
 * Mensimulasikan penyimpanan proyek baru ke API.
 * @param newProject Data proyek baru yang akan disimpan.
 * @returns Sebuah promise yang akan resolve dengan proyek yang telah dibuat setelah 1 detik.
 */
export const createProject = (newProject: NewProject): Promise<Project> => {
  console.log('Menyimpan proyek baru...', newProject);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!newProject.name || !newProject.key) {
        return reject(new Error('Nama dan Key proyek wajib diisi.'));
      }
      const createdProject: Project = {
        id: `proj-${new Date().getTime()}`,
        client: newProject.client || 'N/A',
        ...newProject,
      };
      mockProjects.push(createdProject);
      console.log('Proyek baru berhasil disimpan.', createdProject);
      resolve(createdProject);
    }, 1000);
  });
};

/**
 * Mensimulasikan pembaruan proyek yang ada.
 * @param id ID Proyek yang akan diperbarui
 * @param updatedData Data yang akan diperbarui
 * @returns Promise yang resolve dengan proyek yang telah diperbarui.
 */
export const updateProject = (id: string, updatedData: NewProject): Promise<Project> => {
  console.log(`Memperbarui proyek ${id} dengan data:`, updatedData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const projectIndex = mockProjects.findIndex(p => p.id === id);
      if (projectIndex !== -1) {
        mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...updatedData };
        console.log('Proyek berhasil diperbarui:', mockProjects[projectIndex]);
        resolve(mockProjects[projectIndex]);
      } else {
        reject(new Error('Gagal memperbarui: Proyek tidak ditemukan.'));
      }
    }, 1000);
  });
};

/**
 * Mensimulasikan penghapusan proyek.
 * @param id ID Proyek yang akan dihapus
 * @returns Promise yang resolve saat proyek berhasil dihapus.
 */
export const deleteProject = (id: string): Promise<void> => {
  console.log(`Menghapus proyek dengan ID: ${id}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = mockProjects.length;
      mockProjects = mockProjects.filter(p => p.id !== id);
      if (mockProjects.length < initialLength) {
        console.log('Proyek berhasil dihapus.');
        resolve();
      } else {
        reject(new Error('Gagal menghapus: Proyek tidak ditemukan.'));
      }
    }, 1000);
  });
};