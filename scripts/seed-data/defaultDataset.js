/**
 * Seed fixture untuk migrasi awal Firestore.
 * File ini hanya boleh diimpor oleh seed script dan test; runtime aplikasi
 * membaca dataset default dari Firestore.
 *
 * Dataset dummy default aspirasi mahasiswa Advokastra UPI Kampus Cibiru
 * Periode: 12 minggu terakhir (1 September – 23 November 2026)
 * Total: 90 entri dengan tren mingguan naik bertahap serta lonjakan di minggu KRS (Minggu 2) dan UTS (Minggu 8–9).
 *
 * Distribusi jumlah aspirasi per minggu:
 * M1: 6, M2: 8 (KRS), M3: 5, M4: 6, M5: 6, M6: 7, M7: 7, M8: 10 (Pra-UTS), M9: 11 (Puncak UTS), M10: 7, M11: 8, M12: 9
 */

export const VALID_PRODI = ['RPL', 'Tekkom', 'PGSD', 'PGPAUD', 'Multimedia'];
export const VALID_ANGKATAN = ['2022', '2023', '2024', '2025'];
export const VALID_KATEGORI = [
  'Fasilitas Kampus',
  'Akademik & Perkuliahan',
  'UKT & Keuangan',
  'Layanan Administrasi',
  'Kemahasiswaan',
];
export const VALID_URGENSI = ['Rendah', 'Sedang', 'Tinggi'];
export const VALID_STATUS = ['Belum Diproses', 'Dalam Proses', 'Selesai'];

export const defaultDataset = [
  // ================= MINGGU 1 (2026-09-01 s.d. 2026-09-07) — 6 aspirasi (Awal Semester & KRS) =================
  { id: 'ASP-001', tanggal: '2026-09-01', minggu_ke: 1, prodi: 'RPL', angkatan: '2024', kategori: 'Akademik & Perkuliahan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 3 },
  { id: 'ASP-002', tanggal: '2026-09-02', minggu_ke: 1, prodi: 'PGSD', angkatan: '2025', kategori: 'Layanan Administrasi', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 4 },
  { id: 'ASP-003', tanggal: '2026-09-03', minggu_ke: 1, prodi: 'Tekkom', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 9 },
  { id: 'ASP-004', tanggal: '2026-09-04', minggu_ke: 1, prodi: 'Multimedia', angkatan: '2024', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 11 },
  { id: 'ASP-005', tanggal: '2026-09-05', minggu_ke: 1, prodi: 'PGPAUD', angkatan: '2025', kategori: 'Kemahasiswaan', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 5 },
  { id: 'ASP-006', tanggal: '2026-09-07', minggu_ke: 1, prodi: 'PGSD', angkatan: '2022', kategori: 'Layanan Administrasi', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 6 },

  // ================= MINGGU 2 (2026-09-08 s.d. 2026-09-14) — 8 aspirasi (Lonjakan Masa KRS / PRS) =================
  { id: 'ASP-007', tanggal: '2026-09-08', minggu_ke: 2, prodi: 'RPL', angkatan: '2024', kategori: 'Akademik & Perkuliahan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 2 },
  { id: 'ASP-008', tanggal: '2026-09-09', minggu_ke: 2, prodi: 'Tekkom', angkatan: '2024', kategori: 'Akademik & Perkuliahan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 4 },
  { id: 'ASP-009', tanggal: '2026-09-10', minggu_ke: 2, prodi: 'PGSD', angkatan: '2023', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 12 },
  { id: 'ASP-010', tanggal: '2026-09-10', minggu_ke: 2, prodi: 'Multimedia', angkatan: '2025', kategori: 'Layanan Administrasi', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 5 },
  { id: 'ASP-011', tanggal: '2026-09-11', minggu_ke: 2, prodi: 'RPL', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 8 },
  { id: 'ASP-012', tanggal: '2026-09-12', minggu_ke: 2, prodi: 'PGPAUD', angkatan: '2024', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 3 },
  { id: 'ASP-013', tanggal: '2026-09-13', minggu_ke: 2, prodi: 'Tekkom', angkatan: '2022', kategori: 'Layanan Administrasi', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 6 },
  { id: 'ASP-014', tanggal: '2026-09-14', minggu_ke: 2, prodi: 'PGSD', angkatan: '2025', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 14 },

  // ================= MINGGU 3 (2026-09-15 s.d. 2026-09-21) — 5 aspirasi =================
  { id: 'ASP-015', tanggal: '2026-09-15', minggu_ke: 3, prodi: 'Multimedia', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 10 },
  { id: 'ASP-016', tanggal: '2026-09-17', minggu_ke: 3, prodi: 'PGSD', angkatan: '2024', kategori: 'Kemahasiswaan', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 4 },
  { id: 'ASP-017', tanggal: '2026-09-18', minggu_ke: 3, prodi: 'RPL', angkatan: '2025', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 7 },
  { id: 'ASP-018', tanggal: '2026-09-20', minggu_ke: 3, prodi: 'PGPAUD', angkatan: '2023', kategori: 'Layanan Administrasi', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 5 },
  { id: 'ASP-019', tanggal: '2026-09-21', minggu_ke: 3, prodi: 'Tekkom', angkatan: '2024', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 6 },

  // ================= MINGGU 4 (2026-09-22 s.d. 2026-09-28) — 6 aspirasi =================
  { id: 'ASP-020', tanggal: '2026-09-22', minggu_ke: 4, prodi: 'PGSD', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 11 },
  { id: 'ASP-021', tanggal: '2026-09-23', minggu_ke: 4, prodi: 'RPL', angkatan: '2022', kategori: 'Layanan Administrasi', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 4 },
  { id: 'ASP-022', tanggal: '2026-09-24', minggu_ke: 4, prodi: 'Multimedia', angkatan: '2024', kategori: 'Kemahasiswaan', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 5 },
  { id: 'ASP-023', tanggal: '2026-09-26', minggu_ke: 4, prodi: 'Tekkom', angkatan: '2025', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 15 },
  { id: 'ASP-024', tanggal: '2026-09-27', minggu_ke: 4, prodi: 'PGSD', angkatan: '2024', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 3 },
  { id: 'ASP-025', tanggal: '2026-09-28', minggu_ke: 4, prodi: 'PGPAUD', angkatan: '2022', kategori: 'Kemahasiswaan', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 7 },

  // ================= MINGGU 5 (2026-09-29 s.d. 2026-10-05) — 6 aspirasi =================
  { id: 'ASP-026', tanggal: '2026-09-29', minggu_ke: 5, prodi: 'RPL', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 9 },
  { id: 'ASP-027', tanggal: '2026-09-30', minggu_ke: 5, prodi: 'Multimedia', angkatan: '2025', kategori: 'Fasilitas Kampus', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 12 },
  { id: 'ASP-028', tanggal: '2026-10-01', minggu_ke: 5, prodi: 'PGSD', angkatan: '2024', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 16 },
  { id: 'ASP-029', tanggal: '2026-10-03', minggu_ke: 5, prodi: 'Tekkom', angkatan: '2023', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 5 },
  { id: 'ASP-030', tanggal: '2026-10-04', minggu_ke: 5, prodi: 'PGPAUD', angkatan: '2025', kategori: 'Layanan Administrasi', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 4 },
  { id: 'ASP-031', tanggal: '2026-10-05', minggu_ke: 5, prodi: 'PGSD', angkatan: '2022', kategori: 'Kemahasiswaan', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 6 },

  // ================= MINGGU 6 (2026-10-06 s.d. 2026-10-12) — 7 aspirasi =================
  { id: 'ASP-032', tanggal: '2026-10-06', minggu_ke: 6, prodi: 'Tekkom', angkatan: '2024', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 10 },
  { id: 'ASP-033', tanggal: '2026-10-07', minggu_ke: 6, prodi: 'RPL', angkatan: '2024', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 4 },
  { id: 'ASP-034', tanggal: '2026-10-08', minggu_ke: 6, prodi: 'PGSD', angkatan: '2023', kategori: 'Layanan Administrasi', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 5 },
  { id: 'ASP-035', tanggal: '2026-10-09', minggu_ke: 6, prodi: 'Multimedia', angkatan: '2022', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 13 },
  { id: 'ASP-036', tanggal: '2026-10-10', minggu_ke: 6, prodi: 'PGPAUD', angkatan: '2024', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 18 },
  { id: 'ASP-037', tanggal: '2026-10-11', minggu_ke: 6, prodi: 'RPL', angkatan: '2025', kategori: 'Kemahasiswaan', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 3 },
  { id: 'ASP-038', tanggal: '2026-10-12', minggu_ke: 6, prodi: 'PGSD', angkatan: '2025', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 6 },

  // ================= MINGGU 7 (2026-10-13 s.d. 2026-10-19) — 7 aspirasi =================
  { id: 'ASP-039', tanggal: '2026-10-13', minggu_ke: 7, prodi: 'Multimedia', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 8 },
  { id: 'ASP-040', tanggal: '2026-10-14', minggu_ke: 7, prodi: 'Tekkom', angkatan: '2022', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 5 },
  { id: 'ASP-041', tanggal: '2026-10-15', minggu_ke: 7, prodi: 'PGSD', angkatan: '2024', kategori: 'Layanan Administrasi', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 4 },
  { id: 'ASP-042', tanggal: '2026-10-16', minggu_ke: 7, prodi: 'RPL', angkatan: '2023', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 17 },
  { id: 'ASP-043', tanggal: '2026-10-17', minggu_ke: 7, prodi: 'PGPAUD', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 9 },
  { id: 'ASP-044', tanggal: '2026-10-18', minggu_ke: 7, prodi: 'PGSD', angkatan: '2025', kategori: 'Kemahasiswaan', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 6 },
  { id: 'ASP-045', tanggal: '2026-10-19', minggu_ke: 7, prodi: 'Tekkom', angkatan: '2025', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Dalam Proses', durasi_hari: 14 },

  // ================= MINGGU 8 (2026-10-20 s.d. 2026-10-26) — 10 aspirasi (Lonjakan Pra-UTS / Pekan UTS) =================
  { id: 'ASP-046', tanggal: '2026-10-20', minggu_ke: 8, prodi: 'RPL', angkatan: '2024', kategori: 'Akademik & Perkuliahan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 2 },
  { id: 'ASP-047', tanggal: '2026-10-20', minggu_ke: 8, prodi: 'PGSD', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 7 },
  { id: 'ASP-048', tanggal: '2026-10-21', minggu_ke: 8, prodi: 'Tekkom', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 6 },
  { id: 'ASP-049', tanggal: '2026-10-22', minggu_ke: 8, prodi: 'Multimedia', angkatan: '2024', kategori: 'Akademik & Perkuliahan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 3 },
  { id: 'ASP-050', tanggal: '2026-10-22', minggu_ke: 8, prodi: 'PGPAUD', angkatan: '2025', kategori: 'Layanan Administrasi', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 4 },
  { id: 'ASP-051', tanggal: '2026-10-23', minggu_ke: 8, prodi: 'PGSD', angkatan: '2022', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 19 },
  { id: 'ASP-052', tanggal: '2026-10-24', minggu_ke: 8, prodi: 'RPL', angkatan: '2025', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 8 },
  { id: 'ASP-053', tanggal: '2026-10-25', minggu_ke: 8, prodi: 'Tekkom', angkatan: '2024', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 5 },
  { id: 'ASP-054', tanggal: '2026-10-25', minggu_ke: 8, prodi: 'Multimedia', angkatan: '2023', kategori: 'Layanan Administrasi', urgensi: 'Sedang', status: 'Dalam Proses', durasi_hari: 12 },
  { id: 'ASP-055', tanggal: '2026-10-26', minggu_ke: 8, prodi: 'PGSD', angkatan: '2024', kategori: 'Fasilitas Kampus', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 9 },

  // ================= MINGGU 9 (2026-10-27 s.d. 2026-11-02) — 11 aspirasi (Puncak UTS) =================
  { id: 'ASP-056', tanggal: '2026-10-27', minggu_ke: 9, prodi: 'RPL', angkatan: '2023', kategori: 'Akademik & Perkuliahan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 3 },
  { id: 'ASP-057', tanggal: '2026-10-27', minggu_ke: 9, prodi: 'Tekkom', angkatan: '2024', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 5 },
  { id: 'ASP-058', tanggal: '2026-10-28', minggu_ke: 9, prodi: 'PGSD', angkatan: '2025', kategori: 'Akademik & Perkuliahan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 4 },
  { id: 'ASP-059', tanggal: '2026-10-28', minggu_ke: 9, prodi: 'Multimedia', angkatan: '2024', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Dalam Proses', durasi_hari: 11 },
  { id: 'ASP-060', tanggal: '2026-10-29', minggu_ke: 9, prodi: 'PGPAUD', angkatan: '2022', kategori: 'Layanan Administrasi', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 5 },
  { id: 'ASP-061', tanggal: '2026-10-30', minggu_ke: 9, prodi: 'RPL', angkatan: '2022', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Selesai', durasi_hari: 13 },
  { id: 'ASP-062', tanggal: '2026-10-30', minggu_ke: 9, prodi: 'PGSD', angkatan: '2023', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 6 },
  { id: 'ASP-063', tanggal: '2026-10-31', minggu_ke: 9, prodi: 'Tekkom', angkatan: '2025', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Dalam Proses', durasi_hari: 16 },
  { id: 'ASP-064', tanggal: '2026-11-01', minggu_ke: 9, prodi: 'PGSD', angkatan: '2024', kategori: 'Kemahasiswaan', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 7 },
  { id: 'ASP-065', tanggal: '2026-11-01', minggu_ke: 9, prodi: 'Multimedia', angkatan: '2025', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Dalam Proses', durasi_hari: 20 },
  { id: 'ASP-066', tanggal: '2026-11-02', minggu_ke: 9, prodi: 'RPL', angkatan: '2024', kategori: 'Layanan Administrasi', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 4 },

  // ================= MINGGU 10 (2026-11-03 s.d. 2026-11-09) — 7 aspirasi =================
  { id: 'ASP-067', tanggal: '2026-11-03', minggu_ke: 10, prodi: 'PGSD', angkatan: '2023', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 5 },
  { id: 'ASP-068', tanggal: '2026-11-04', minggu_ke: 10, prodi: 'Tekkom', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Dalam Proses', durasi_hari: 10 },
  { id: 'ASP-069', tanggal: '2026-11-05', minggu_ke: 10, prodi: 'PGPAUD', angkatan: '2024', kategori: 'Kemahasiswaan', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 3 },
  { id: 'ASP-070', tanggal: '2026-11-06', minggu_ke: 10, prodi: 'RPL', angkatan: '2025', kategori: 'Fasilitas Kampus', urgensi: 'Sedang', status: 'Dalam Proses', durasi_hari: 9 },
  { id: 'ASP-071', tanggal: '2026-11-07', minggu_ke: 10, prodi: 'Multimedia', angkatan: '2022', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Dalam Proses', durasi_hari: 15 },
  { id: 'ASP-072', tanggal: '2026-11-08', minggu_ke: 10, prodi: 'PGSD', angkatan: '2022', kategori: 'Layanan Administrasi', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 6 },
  { id: 'ASP-073', tanggal: '2026-11-09', minggu_ke: 10, prodi: 'Tekkom', angkatan: '2024', kategori: 'Kemahasiswaan', urgensi: 'Sedang', status: 'Belum Diproses', durasi_hari: null },

  // ================= MINGGU 11 (2026-11-10 s.d. 2026-11-16) — 8 aspirasi =================
  { id: 'ASP-074', tanggal: '2026-11-10', minggu_ke: 11, prodi: 'RPL', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Dalam Proses', durasi_hari: 8 },
  { id: 'ASP-075', tanggal: '2026-11-11', minggu_ke: 11, prodi: 'PGSD', angkatan: '2024', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 4 },
  { id: 'ASP-076', tanggal: '2026-11-12', minggu_ke: 11, prodi: 'Multimedia', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Dalam Proses', durasi_hari: 7 },
  { id: 'ASP-077', tanggal: '2026-11-12', minggu_ke: 11, prodi: 'PGPAUD', angkatan: '2025', kategori: 'Layanan Administrasi', urgensi: 'Rendah', status: 'Selesai', durasi_hari: 5 },
  { id: 'ASP-078', tanggal: '2026-11-13', minggu_ke: 11, prodi: 'Tekkom', angkatan: '2022', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Dalam Proses', durasi_hari: 11 },
  { id: 'ASP-079', tanggal: '2026-11-14', minggu_ke: 11, prodi: 'PGSD', angkatan: '2025', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Dalam Proses', durasi_hari: 6 },
  { id: 'ASP-080', tanggal: '2026-11-15', minggu_ke: 11, prodi: 'RPL', angkatan: '2024', kategori: 'UKT & Keuangan', urgensi: 'Sedang', status: 'Belum Diproses', durasi_hari: null },
  { id: 'ASP-081', tanggal: '2026-11-16', minggu_ke: 11, prodi: 'Multimedia', angkatan: '2024', kategori: 'Kemahasiswaan', urgensi: 'Rendah', status: 'Belum Diproses', durasi_hari: null },

  // ================= MINGGU 12 (2026-11-17 s.d. 2026-11-23) — 9 aspirasi =================
  { id: 'ASP-082', tanggal: '2026-11-17', minggu_ke: 12, prodi: 'PGSD', angkatan: '2023', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Dalam Proses', durasi_hari: 5 },
  { id: 'ASP-083', tanggal: '2026-11-18', minggu_ke: 12, prodi: 'Tekkom', angkatan: '2025', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Dalam Proses', durasi_hari: 4 },
  { id: 'ASP-084', tanggal: '2026-11-18', minggu_ke: 12, prodi: 'RPL', angkatan: '2022', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Selesai', durasi_hari: 3 },
  { id: 'ASP-085', tanggal: '2026-11-19', minggu_ke: 12, prodi: 'PGPAUD', angkatan: '2024', kategori: 'Layanan Administrasi', urgensi: 'Sedang', status: 'Dalam Proses', durasi_hari: 2 },
  { id: 'ASP-086', tanggal: '2026-11-20', minggu_ke: 12, prodi: 'Multimedia', angkatan: '2025', kategori: 'Fasilitas Kampus', urgensi: 'Tinggi', status: 'Belum Diproses', durasi_hari: null },
  { id: 'ASP-087', tanggal: '2026-11-21', minggu_ke: 12, prodi: 'PGSD', angkatan: '2024', kategori: 'UKT & Keuangan', urgensi: 'Tinggi', status: 'Belum Diproses', durasi_hari: null },
  { id: 'ASP-088', tanggal: '2026-11-21', minggu_ke: 12, prodi: 'RPL', angkatan: '2025', kategori: 'Akademik & Perkuliahan', urgensi: 'Sedang', status: 'Belum Diproses', durasi_hari: null },
  { id: 'ASP-089', tanggal: '2026-11-22', minggu_ke: 12, prodi: 'Tekkom', angkatan: '2023', kategori: 'Layanan Administrasi', urgensi: 'Rendah', status: 'Belum Diproses', durasi_hari: null },
  { id: 'ASP-090', tanggal: '2026-11-23', minggu_ke: 12, prodi: 'PGSD', angkatan: '2022', kategori: 'Kemahasiswaan', urgensi: 'Rendah', status: 'Belum Diproses', durasi_hari: null },
];

export default defaultDataset;
