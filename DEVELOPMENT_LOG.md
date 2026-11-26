# Log Pengembangan & Dokumentasi Perubahan Source Code

Dokumen ini merupakan log terpusat untuk mencatat seluruh pengerjaan task, keputusan teknis, perubahan pada source code (penambahan, modifikasi, maupun penghapusan file), serta hasil verifikasi pada proyek **Aplikasi Analisis Pola dan Prediksi Tren Aspirasi Mahasiswa Advokastra UPI Cibiru**.

> **Aturan Pencatatan:** Setiap kali ada pengerjaan task baru atau perubahan pada source code, detail perubahan (file terdampak, simbol/fungsi yang berubah, dan hasil verifikasi) **wajib** ditambahkan ke dokumen ini secara kronologis.

---

## [Task #14] — 2026-11-26
**Judul:** Migrasi Data Analitik & Autentikasi ke Firebase

### Ringkasan Pekerjaan
1. Memindahkan dataset default 90 baris, domain analisis, opsi statistik, dan contoh template CSV dari runtime source ke seed fixture serta Cloud Firestore.
2. Menambahkan Firebase Web SDK untuk Cloud Firestore dan Firebase Authentication (Email/Password serta Anonymous/guest).
3. Menghapus sesi login simulasi berbasis `sessionStorage`; status pengguna kini mengikuti observer Firebase Auth.
4. Menambahkan seed script server Firestore yang idempotent, `.env.example`, aturan Firestore read-only untuk client, dokumentasi setup, dan `AGENTS.md` untuk agent pengembang.
5. Landing-page copy dan formula tetap berada di source code sesuai keputusan scope; CSV unggahan tetap bersifat dataset sementara di memori.

### Struktur Firestore
- `datasets/default`
- `datasets/default/aspirations/{id}`
- `app_config/analysis`
- `app_config/csv_template`

### Perintah Setup
```sh
cp .env.example .env.local
npm run seed:firebase
firebase deploy --only firestore:rules
```

### Verifikasi
- `npm test`: seluruh unit test lulus.
- `npm run lint`: 0 error.
- `npm run build`: build produksi berhasil.
- `npm audit`: 0 vulnerability.

---

## [Task #13] — 2026-11-26 01:36 WIB
**Judul:** Inisialisasi Commit & Push Proyek ke Repository GitHub (`maddhdyt/advokastra-probstat`)

### Ringkasan Pekerjaan
- Melakukan staging seluruh source code proyek (mengabaikan `node_modules/` dan `dist/` sesuai `.gitignore`), membuat commit awal pada branch `main`, dan melakukan push ke remote `origin` (`https://github.com/maddhdyt/advokastra-probstat.git`).

---

## [Task #12] — 2026-11-26 01:34 WIB
**Judul:** Peningkatan Visibilitas Transisi Loading Antar Rute, Perpindahan Tab, dan Import CSV

### Ringkasan Pekerjaan
1. Memperkuat animasi masuk halaman pada `src/index.css` (`@keyframes pageEnter` `360ms` dengan `translateY(10px)` + `scale(0.996)`, serta `@keyframes overlayFadeIn` `160ms`).
2. Mengupgrade `src/components/TopProgressBar.jsx` menjadi kombinasi bilah loading `3px` di bagian atas dan transition curtain halus (`bg-[#FAFAFA]/88 backdrop-blur-[2px]` dengan spinner `Loader2` `#F97316` + pesan status dinamis) saat perpindahan antar view (`landing` ↔ `login` ↔ `dashboard`) atau pemrosesan CSV.
3. Mengganti jeda antar tab di `src/App.jsx` dengan state loading terstruktur (`loadingTabLabel`, ~280ms) yang menampilkan spinner dan label modul (`Memuat <Nama Menu>...`) sebelum konten baru masuk dengan `.animate-page-enter`, serta memperpanjang jeda feedback verifikasi login pada `src/components/LoginPage.jsx` menjadi `520ms` agar transisi benar-benar terasa.

### Perubahan Source Code
| Status | Path File | Ringkasan Perubahan & Simbol Utama |
| :--- | :--- | :--- |
| Diubah | `src/index.css` | Memperkuat animasi `.animate-page-enter` (`360ms`) dan menambahkan `.animate-overlay-in`. |
| Diubah | `src/components/TopProgressBar.jsx` | Menambahkan progress bar `3px` serta overlay transisi layar penuh opsional (`message` + `Loader2` `#F97316`). |
| Diubah | `src/components/LoginPage.jsx` | Memperpanjang durasi feedback `triggerLogin` menjadi `520ms`. |
| Diubah | `src/components/TopHeader.jsx` | Mempertegas garis progress bawah header menjadi `h-[2.5px]`. |
| Diubah | `src/App.jsx` | Mengganti `isNavigating`/`isTabLoading` menjadi `routeLoadingMessage` dan `loadingTabLabel` dengan overlay transisi rute, indikator loading antar tab, serta jeda feedback import CSV `480ms`. |

### Verifikasi
- `npm test` (`node --test tests/*.test.js`): **10/10 lulus** (`pass 10`, `fail 0`).
- `npm run lint` (`oxlint`): **0 warning, 0 error** pada 22 file.
- `npm run build` (`vite build`): **berhasil** (`dist/index.html` 1.02 kB, `dist/assets/index-jZ2Fs1Ml.css` 67.45 kB, `dist/assets/index-yNeX0klk.js` 868.56 kB).

---

## [Task #11] — 2026-11-26 01:31 WIB
**Judul:** Penambahan Transisi Loading Halus pada Navigasi View, Login, Perpindahan Tab, dan Import CSV

### Ringkasan Pekerjaan
1. Menambahkan keyframe animasi CSS ringan (`@keyframes pageEnter`, `@keyframes progressIndeterminate`, `.animate-page-enter`, `.animate-progress-line`) beserta dukungan `prefers-reduced-motion: reduce` pada `src/index.css`.
2. Membuat komponen `src/components/TopProgressBar.jsx` sebagai bilah loading tipis 2px beraksen `#F97316` di bagian atas viewport saat perpindahan halaman (`landing` ↔ `login` ↔ `dashboard`) atau saat memproses file CSV.
3. Menambahkan loading state (`loadingMode`, ikon spinner `Loader2`, dan disable kontrol selama proses verifikasi ~320ms) pada tombol `Masuk ke Dashboard` dan `Masuk sebagai Tamu / Dosen Penguji` di `src/components/LoginPage.jsx`.
4. Menambahkan progress bar 2px di batas bawah `src/components/TopHeader.jsx` saat perpindahan menu atau import CSV, spinner `Loader2` pada tombol `Import CSV` & `Import Dataset CSV` (`LandingPage.jsx`), serta transisi halus antar tab (`isNavigating`, `isTabLoading`, fade-in `.animate-page-enter`) pada `src/App.jsx`.

### Perubahan Source Code
| Status | Path File | Ringkasan Perubahan & Simbol Utama |
| :--- | :--- | :--- |
| Diubah | `src/index.css` | Menambahkan keyframe `pageEnter` & `progressIndeterminate` serta class utilitas `.animate-page-enter` & `.animate-progress-line`. |
| Ditambah | `src/components/TopProgressBar.jsx` | Komponen `TopProgressBar` untuk menampilkan progress bar 2px beraksen `#F97316` saat navigasi atau import CSV. |
| Diubah | `src/components/LoginPage.jsx` | Menambahkan state `loadingMode`, `triggerLogin`, pembersihan timer `timerRef`, serta indikator spinner `Loader2` pada tombol login. |
| Diubah | `src/components/TopHeader.jsx` | Menambahkan prop `isLoading`, spinner `Loader2` pada tombol `Import CSV`, dan garis progress 2px di batas bawah header. |
| Diubah | `src/components/LandingPage.jsx` | Menambahkan animasi `.animate-page-enter` dan spinner `Loader2` saat mengimpor CSV dari halaman awal. |
| Diubah | `src/App.jsx` | Menambahkan `TopProgressBar`, state `isNavigating` dan `isTabLoading`, helper `transitionToView`, `handleSelectTab`, `waitMs`, serta transisi halus saat reset/import dataset. |

### Verifikasi
- `npm test` (`node --test tests/*.test.js`): **10/10 lulus** (`pass 10`, `fail 0`).
- `npm run lint` (`oxlint`): **0 warning, 0 error** pada 22 file.
- `npm run build` (`vite build`): **berhasil** (`dist/index.html` 1.02 kB, `dist/assets/index-0Nperxwy.css` 66.01 kB, `dist/assets/index-CGTFM-8H.js` 867.32 kB).

---

## [Task #10] — 2026-11-26 01:29 WIB
**Judul:** Penggantian Wireframe dengan 6 Modul Dashboard Interaktif Nyata & Penyederhanaan Judul/Deskripsi Anti-Clutter

### Ringkasan Pekerjaan
1. Menghapus seluruh tampilan placeholder wireframe (`src/components/wireframes/DashboardWireframes.jsx`) dan kotak abu-abu kosong sesuai masukan pengguna.
2. Menghilangkan teks deskripsi berulang di bawah `TopHeader.jsx` serta subjudul panjang pada kartu-kartu Dashboard agar tata letak tetap ringkas, padat data, dan sesuai estetika `app.dub.co`.
3. Mengimplementasikan 6 modul Dashboard nyata yang langsung terhubung ke `dataset` (`defaultDataset` 90 baris atau CSV unggahan), `statsEngine.js`, `Chart.js` (`react-chartjs-2`), dan `MathFormula` (`KaTeX`):
   - `OverviewView.jsx` (`Ikhtisar & Pola`): Pemilih dimensi analisis, 4 kartu KPI, grafik batang distribusi Chart.js, ringkasan statistik durasi penanganan (`durasi_hari`), serta tabel distribusi frekuensi + modus.
   - `DatasetExplorerView.jsx` (`Explorer Dataset`): Pencarian teks, 4 filter dropdown (`Prodi`, `Angkatan`, `Kategori`, `Status`), tabel data terpaginasi (15 baris/halaman), dan badge status.
   - `ProportionView.jsx` (`Estimasi Proporsi (CI)`): Pemilih variabel, nilai target, tingkat kepercayaan (`90%`, `95%`, `99%`), metrik `p̂`/`SE`/`ME`, visualisasi rentang interval + cek syarat normalitas, dan tabel perbandingan seluruh kelas.
   - `ChiSquareView.jsx` (`Uji Independensi Chi-Square`): Pemilih variabel baris/kolom, taraf signifikansi `α` (`0.01`, `0.05`, `0.10`), metrik `χ²`, `df`, `p-value`, keputusan hipotesis, serta tabel kontingensi mode `O/E`, `Observasi (O)`, dan `Harapan (E)`.
   - `RegressionView.jsx` (`Prediksi Tren (Regresi)`): Filter kategori, slider horizon prediksi (`1–6` minggu), grafik garis Chart.js (Aktual, Garis Regresi, Proyeksi), persamaan `y = a + bx`, `r`, `R²`, dan tabel agregasi mingguan.
   - `PoissonView.jsx` (`Peluang Lonjakan (Poisson)`): Filter kategori, simulator target `x` (slider + input numerik), metrik `λ`, `P(X = x)`, `P(X ≥ x)`, `P(X ≤ x)`, grafik batang PMF Chart.js dengan highlight oranye `#F97316`, dan tabel distribusi PMF.

### Perubahan Source Code
| Status | Path File | Ringkasan Perubahan & Simbol Utama |
| :--- | :--- | :--- |
| Dihapus | `src/components/wireframes/DashboardWireframes.jsx` | Dihapus seluruh kerangka wireframe placeholder. |
| Ditambah | `src/components/dashboard/chartSetup.js` | Helper registrasi modul `Chart.js` (`ensureChartsRegistered`, `BASE_CHART_FONT`, `BASE_TOOLTIP_STYLE`). |
| Ditambah | `src/components/dashboard/OverviewView.jsx` | Modul interaktif `OverviewView` (`calculateDescriptive` + Chart.js `Bar` + tabel frekuensi). |
| Ditambah | `src/components/dashboard/DatasetExplorerView.jsx` | Modul interaktif `DatasetExplorerView` (filter, pencarian, tabel terpaginasi `StatusBadge`). |
| Ditambah | `src/components/dashboard/ProportionView.jsx` | Modul interaktif `ProportionView` (`calculateProportionCI` + gauge interval + perbandingan kelas). |
| Ditambah | `src/components/dashboard/ChiSquareView.jsx` | Modul interaktif `ChiSquareView` (`calculateChiSquare` + matriks kontingensi `O_ij` & `E_ij`). |
| Ditambah | `src/components/dashboard/RegressionView.jsx` | Modul interaktif `RegressionView` (`calculateLinearRegression` + Chart.js `Line` + tabel proyeksi). |
| Ditambah | `src/components/dashboard/PoissonView.jsx` | Modul interaktif `PoissonView` (`calculatePoisson` + Chart.js `Bar` PMF + simulator target `x`). |
| Diubah | `src/components/TopHeader.jsx` | Menghapus baris deskripsi di bawah breadcrumb agar header kanvas ringkas satu baris (`Workspace > Nama Menu`). |
| Diubah | `src/App.jsx` | Menghapus `menuDescription` dan menghubungkan `renderDashboardContent` ke keenam komponen view nyata. |

### Verifikasi
- `npm test` (`node --test tests/*.test.js`): **10/10 lulus** (`pass 10`, `fail 0`).
- `npm run lint` (`oxlint`): **0 warning, 0 error** pada 21 file.
- `npm run build` (`vite build`): **berhasil** (`dist/index.html` 1.02 kB, `dist/assets/index-CacQsJHp.css` 64.86 kB, `dist/assets/index-CieQgcMr.js` 864.87 kB).

---

## [Task #9] — 2026-11-26 01:25 WIB
**Judul:** Upgrade Navigasi Dashboard Terkelompok (`app.dub.co` + `Linear`) & Semi-Wireframe 6 Menu (`DashboardWireframes.jsx`)

### Ringkasan Pekerjaan
1. Mengupgrade `src/components/Sidebar.jsx` (`w-64`) dengan workspace switcher pill `UPI Cibiru · 5B`, 3 kelompok menu sentence-case (**Ringkasan**: `Ikhtisar & Pola`, `Explorer Dataset` + badge jumlah baris; **Analisis Inferensial**: `Estimasi Proporsi (CI)`, `Uji Independensi Chi-Square`; **Pemodelan & Prediksi**: `Prediksi Tren (Regresi)`, `Peluang Lonjakan (Poisson)` dengan titik `#F97316` 5px), kartu status dataset dengan tombol cepat `Ganti CSV`, serta baris profil sesi (`Pengurus Advokastra` / `Tamu Penguji`) + tombol `Keluar`.
2. Mengupgrade `src/components/TopHeader.jsx` (`h-14`) dengan breadcrumb minimalis `Workspace > Nama Menu Aktif`, deskripsi 1 baris tipis, pill filter konteks statis (`Periode: 12 Minggu · 5 Prodi`), dan tombol aksi (`Template CSV`, `Import CSV`, serta `Reset` kondisional).
3. Membuat komponen `src/components/wireframes/DashboardWireframes.jsx` berisi kerangka semi-wireframe spesifik untuk seluruh 6 menu (`overview`, `dataset`, `proportion`, `chisquare`, `regression`, `poisson`) lengkap dengan slot bernomor, keterangan output statistik, dan sub-placeholder proporsi tata letak (termasuk toolbar filter + tabel terstruktur pada `Explorer Dataset`).
4. Memperbarui mapping target menu pada `src/components/LandingPage.jsx` dan `src/App.jsx` (`MENU_CONFIG`, default `overview`, `contextLabel`).

### Perubahan Source Code
| Status | Path File | Ringkasan Perubahan & Simbol Utama |
| :--- | :--- | :--- |
| Diubah | `src/components/Sidebar.jsx` | Diperluas ke `w-64`, menambahkan pill `UPI Cibiru · 5B`, 3 grup navigasi (`navGroups`), tombol cepat `Ganti CSV` (`fileInputRef`), dan label profil `Pengurus Advokastra` / `Tamu Penguji`. |
| Diubah | `src/components/TopHeader.jsx` | Menambahkan breadcrumb `Workspace > menuTitle`, `menuDescription`, dan pill konteks `contextLabel`. |
| Ditambah | `src/components/wireframes/DashboardWireframes.jsx` | Komponen `DashboardWireframes` dengan 6 layout semi-wireframe: `OverviewWireframe`, `DatasetWireframe`, `ProportionWireframe`, `ChiSquareWireframe`, `RegressionWireframe`, dan `PoissonWireframe`. |
| Diubah | `src/components/LandingPage.jsx` | Menyelaraskan ID target tombol modul ke `'overview'`, `'chisquare'`, dan `'regression'`. |
| Diubah | `src/App.jsx` | Memperbarui `MENU_CONFIG` untuk 6 menu, menghitung `contextLabel` dinamis, menghubungkan `onImportCSV` ke `Sidebar`, dan merender `DashboardWireframes`. |

### Verifikasi
- `npm test` (`node --test tests/*.test.js`): **10/10 lulus** (`pass 10`, `fail 0`).
- `npm run lint` (`oxlint`): **0 warning, 0 error** pada 15 file.
- `npm run build` (`vite build`): **berhasil** (`dist/index.html` 1.02 kB, `dist/assets/index-g7QrM0-T.css` 62.89 kB, `dist/assets/index-B0Qx2Mko.js` 641.75 kB).

---

## [Task #8] — 2026-11-26 01:22 WIB
**Judul:** Pembuatan Halaman Login Simulasi (`LoginPage.jsx`) Bergaya `dub.co` & Integrasi Alur Autentikasi

### Ringkasan Pekerjaan
1. Membuat komponen `src/components/LoginPage.jsx` bergaya `dub.co` dengan latar `#FAFAFA` berpola grid tipis `64px × 64px` yang memudar ke bawah, top bar `← Kembali ke Beranda`, kartu login utama (`max-w-[380px]`), form kredensial simulasi (`advokastra@upi.edu`), tombol primer `Masuk ke Dashboard`, pemisah `atau`, dan tombol demo 1-klik `Masuk sebagai Tamu / Dosen Penguji` beraksen titik `#F97316`.
2. Mengintegrasikan alur autentikasi simulasi berbasis `sessionStorage` (`advokastra_probstat_session`) di `src/App.jsx`: klik `Dashboard`, `Mulai Analisis`, atau pill modul dari `LandingPage` akan mengarahkan ke `view = 'login'` jika belum ada sesi aktif, lalu masuk ke `view = 'dashboard'` pada tab tujuan setelah login berhasil; import CSV dari `LandingPage` mengarahkan ke `login` dengan banner `"Dataset siap, silakan masuk untuk melihat hasil."` bila belum login.
3. Menambahkan tampilan akun aktif ringkas (`Advokastra · UPI Cibiru` atau `Tamu Penguji`) dan tombol `Keluar` (`LogOut` `14px`) di bagian bawah `src/components/Sidebar.jsx` untuk mereset sesi login dan kembali ke halaman awal.

### Perubahan Source Code
| Status | Path File | Ringkasan Perubahan & Simbol Utama |
| :--- | :--- | :--- |
| Ditambah | `src/components/LoginPage.jsx` | Komponen `LoginPage` dengan form login simulasi (`handleFormSubmit`), login tamu (`handleGuestLogin`), banner `loginHint`, dan tombol kembali ke beranda. |
| Diubah | `src/components/Sidebar.jsx` | Menambahkan prop `authUser` dan `onLogout`, serta panel footer akun aktif + tombol `Keluar` berikon `LogOut`. |
| Diubah | `src/App.jsx` | Menambahkan manajemen sesi `authUser` (`loadSavedSession`, `persistSession`), state `pendingTab` dan `loginHint`, handler `handleLoginSuccess` & `handleLogout`, serta integrasi `view = 'login'`. |

### Verifikasi
- `npm test` (`node --test tests/*.test.js`): **10/10 lulus** (`pass 10`, `fail 0`).
- `npm run lint` (`oxlint`): **0 warning, 0 error** pada 14 file.
- `npm run build` (`vite build`): **berhasil** (`dist/index.html` 1.02 kB, `dist/assets/index-vN3sEB-_.css` 59.04 kB, `dist/assets/index-BY_thQoZ.js` 622.08 kB).

---

## [Task #7] — 2026-11-26 01:19 WIB
**Judul:** Integrasi KaTeX (`MathFormula.jsx`) untuk Rendering Rumus Matematika Asli pada `LandingPage.jsx`

### Ringkasan Pekerjaan
1. Menginstall package `katex` (`^0.19.1`) dan mengimpor stylesheet `katex/dist/katex.min.css` pada `src/main.jsx` agar tersedia secara global untuk Landing Page maupun modul Dashboard.
2. Membuat komponen helper reusable `src/components/MathFormula.jsx` menggunakan `katex.renderToString(latex, { throwOnError: false, displayMode })` dengan dukungan mode block (`displayMode = true`) dan inline (`displayMode = false`).
3. Mengganti seluruh kotak rumus ASCII pada Section Landasan Metodologi (`METHODOLOGY_CARDS`) di `src/components/LandingPage.jsx` dengan `<MathFormula />` untuk ekspresi LaTeX Estimasi Proporsi, Uji Independensi Chi-Square, serta Regresi Linear & Distribusi Poisson (2 baris), dengan styling wadah `bg-zinc-50 border border-zinc-200/80 rounded-lg px-4 py-3 text-zinc-900 overflow-x-auto`.

### Perubahan Source Code & Konfigurasi
| Status | Path File | Ringkasan Perubahan & Simbol Utama |
| :--- | :--- | :--- |
| Diubah | `package.json` | Menambahkan dependensi `"katex": "^0.19.1"`. |
| Diubah | `src/main.jsx` | Mengimpor `katex/dist/katex.min.css`. |
| Ditambah | `src/components/MathFormula.jsx` | Komponen `MathFormula` berbasis `katex.renderToString` dengan memoization `useMemo`. |
| Diubah | `src/components/LandingPage.jsx` | Mengimpor `MathFormula`, mengubah `METHODOLOGY_CARDS` menjadi ekspresi LaTeX (`formulas`), dan merender rumus KaTeX di dalam wadah `bg-zinc-50 border border-zinc-200/80 rounded-lg px-4 py-3 text-zinc-900 overflow-x-auto`. |

### Verifikasi
- `npm test` (`node --test tests/*.test.js`): **10/10 lulus** (`pass 10`, `fail 0`).
- `npm run lint` (`oxlint`): **0 warning, 0 error** pada 13 file.
- `npm run build` (`vite build`): **berhasil** (`dist/index.html` 1.02 kB, `dist/assets/index-SwO1nrnD.css` 57.56 kB, `dist/assets/index-DyJCY-xA.js` 615.82 kB, termasuk aset font KaTeX).

---

## [Task #6] — 2026-11-26 01:15 WIB
**Judul:** Penyempurnaan Tipografi `Geist` & `Geist Mono` serta Penambahan Section Alur Kerja, Metodologi Rumus, Cakupan Studi Kasus, dan Footer pada `LandingPage.jsx`

### Ringkasan Pekerjaan
1. Menambahkan Google Fonts `Geist` (400, 500, 600, 700) dan `Geist Mono` di `index.html`, serta mengatur `--font-sans` dan `--font-mono` di `src/index.css` agar tipografi identik dengan `dub.co`.
2. Menyesuaikan bobot headline utama `LandingPage.jsx` menjadi `font-medium` (`500`) dengan `tracking-[-0.03em]` dan `leading-[1.12]`.
3. Melengkapi bagian bawah `LandingPage.jsx` dengan 3 section terstruktur dan footer minimalis:
   - **Section A (`#dataset`)**: Alur Kerja Analisis 3 langkah bernomor (`01`–`03`) dengan garis penghubung tipis (`WORKFLOW_STEPS`).
   - **Section B (`#metodologi`)**: 3 kartu Landasan Metodologi Probstat beserta kotak rumus monospace bersih (`METHODOLOGY_CARDS`).
   - **Section C (`#tentang`)**: Kartu 2 kolom Cakupan Variabel Studi Kasus (5 Prodi, 5 Kategori, 4 Angkatan) dan kartu ajakan gelap beraksen titik `#F97316` dengan tombol `Buka Dashboard Analisis →`.
   - **Footer Minimalis**: `Advokastra Analytics · UPI Kampus Cibiru` dan `Proyek Akhir Mata Kuliah Probabilitas & Statistika`.

### Perubahan Source Code
| Status | Path File | Ringkasan Perubahan & Simbol Utama |
| :--- | :--- | :--- |
| Diubah | `index.html` | Menambahkan Google Fonts `Geist` (400, 500, 600, 700) dan `Geist Mono` pada tag `<link>`. |
| Diubah | `src/index.css` | Mengubah `--font-sans` ke `"Geist", "Inter", system-ui, sans-serif` dan `--font-mono` ke `"Geist Mono", "JetBrains Mono", monospace`. |
| Diubah | `src/components/LandingPage.jsx` | Memperbarui styling headline hero (`font-medium tracking-[-0.03em] leading-[1.12]`), menghapus duplikasi `id="dataset"` pada showcase preview, serta menambahkan konstanta `WORKFLOW_STEPS`, `METHODOLOGY_CARDS`, `STUDY_PRODI`, `STUDY_KATEGORI`, `STUDY_ANGKATAN`, Section A–C, dan footer minimalis. |

### Verifikasi
- `npm test` (`node --test tests/*.test.js`): **10/10 lulus** (`pass 10`, `fail 0`).
- `npm run lint` (`oxlint`): **0 warning, 0 error** pada 12 file.
- `npm run build` (`vite build`): **berhasil** (`dist/index.html` 1.02 kB, `dist/assets/index-D-avOwv1.css` 27.45 kB, `dist/assets/index-DiiqfgF9.js` 355.45 kB).

---

## [Task #5] — 2026-11-26 01:04 WIB
**Judul:** Pembuatan Halaman Awal (`LandingPage.jsx`) Bergaya `dub.co` & Integrasi Routing View

### Ringkasan Pekerjaan
1. Membuat komponen `src/components/LandingPage.jsx` sebagai gerbang pembuka aplikasi sebelum masuk ke workspace Dashboard.
2. Membangun Top Navigation Bar (`advokastra`, 3 tautan smooth-scroll `Metodologi`, `Dataset`, `Tentang Studi Kasus`, serta tombol `Dashboard`).
3. Membangun Hero Section dengan latar grid tipis `64px x 64px` yang memudar ke bawah, Announcement Pill (`Studi Kasus BEM UPI Kampus Cibiru` | `Unduh Template CSV ↗`), headline utama, subheadline, dan 2 CTA (`Mulai Analisis` dan `Import Dataset CSV` yang otomatis masuk ke Dashboard setelah validasi sukses).
4. Membangun area showcase `#F7F6F3` dengan 3 pill tombol modul interaktif (mengarahkan langsung ke Tab 1, Tab 2, atau Tab 3 Dashboard) serta Interactive Mini-Preview Window berisi ringkasan metrik nyata dari dataset aktif (`calculateDescriptive`, `calculateLinearRegression`, `calculatePoisson`).
5. Menambahkan section metodologi 3 kolom minimalis dan ringkasan studi kasus BEM UPI Kampus Cibiru di bagian bawah halaman.
6. Mengintegrasikan state `view` (`'landing'` sebagai default awal, dan `'dashboard'`) di `src/App.jsx`, serta menjadikan logo `Advokastra` di `src/components/Sidebar.jsx` dapat diklik untuk kembali ke halaman awal.

### Perubahan Source Code
| Status | Path File | Ringkasan Perubahan & Simbol Utama |
| :--- | :--- | :--- |
| Diubah | `src/index.css` | Menambahkan `scroll-behavior: smooth;` pada selector `html`. |
| Ditambah | `src/components/LandingPage.jsx` | Komponen `LandingPage` berisi Top Bar, Hero Grid, Announcement Pill, CTA `Mulai Analisis` & `Import Dataset CSV`, 3 Pill Modul Interaktif, Interactive Mini-Preview Window (`previewStats`), section `#metodologi`, dan `#studi-kasus`. |
| Diubah | `src/components/Sidebar.jsx` | Menambahkan prop `onBackToLanding` dan mengubah logo `Advokastra` di pojok kiri atas menjadi tombol navigasi kembali ke halaman awal (`view = 'landing'`). |
| Diubah | `src/App.jsx` | Menambahkan state `view` (default `'landing'`), fungsi `handleOpenDashboard`, parameter `enterDashboardOnSuccess` pada `handleImportCSV`, serta render kondisional `LandingPage` vs Dashboard Shell. |

### Verifikasi
- `npm test` (`node --test tests/*.test.js`): **10/10 lulus** (`pass 10`, `fail 0`).
- `npm run lint` (`oxlint`): **0 warning, 0 error** pada 12 file.
- `npm run build` (`vite build`): **berhasil** (`dist/index.html` 0.95 kB, `dist/assets/index-9w-yPNcs.css` 26.53 kB, `dist/assets/index-xDK9qWnd.js` 351.10 kB).

---

## [Task #4] — 2026-11-26 00:51 WIB
**Judul:** Refactor Layout ke Arsitektur Dashboard `app.dub.co` (Sidebar + White Canvas Shell + DatasetDrawer)

### Ringkasan Pekerjaan
1. Menghapus total komponen dan elemen bergaya template generik: menghapus `src/components/Navbar.jsx`, menghapus badge kapital bertanda garis miring (`ADVOKASTRA // PROBSTAT`, `MODUL 01 // ...`, `INSPEKTOR DATASET // ...`), menghapus kotak `DATA AKTIF: n = 90`, menghapus footer teknis, menghapus garis bawah oranye pada tab, dan menghapus latar `radial-gradient`.
2. Mengimplementasikan arsitektur `app.dub.co` pada `src/App.jsx` (`min-h-screen bg-[#FAFAFA] flex` dengan sidebar kiri tetap dan kontainer kanvas putih penuh di kanan).
3. Membuat `src/components/Sidebar.jsx` berisi brand header ringkas satu baris (`24x24px` ikon kotak hitam dengan aksen sudut `#F97316` 4px, teks `Advokastra`, label `UPI Cibiru`), menu navigasi vertikal (`BarChart2`, `Table2`, `TrendingUp`), dan kartu status dataset ringkas (`Default · 90 baris`) dengan tombol `Lihat semua data →`.
4. Membuat `src/components/TopHeader.jsx` (`h-14` di dalam kanvas putih) berisi judul tab aktif di kiri serta tombol kompak `Template CSV`, `Import CSV`, dan `Reset` (kondisional) di kanan.
5. Membuat `src/components/DatasetDrawer.jsx` sebagai slide-over drawer tabel data mentah aspirasi yang dibuka dari tautan `Lihat semua data →` di sidebar.

### Perubahan Source Code
| Status | Path File | Ringkasan Perubahan & Simbol Utama |
| :--- | :--- | :--- |
| Dihapus | `src/components/Navbar.jsx` | Dihapus dan dipecah menjadi `Sidebar.jsx` dan `TopHeader.jsx`. |
| Ditambah | `src/components/Sidebar.jsx` | Komponen `Sidebar` (`NAV_ITEMS`, brand header ringkas `Advokastra` + `UPI Cibiru`, menu vertikal aktif/non-aktif, serta kartu status dataset & pemicu `onOpenDrawer`). |
| Ditambah | `src/components/TopHeader.jsx` | Komponen `TopHeader` di dalam kanvas putih dengan tombol `Template CSV`, `Import CSV`, dan `Reset` kondisional. |
| Ditambah | `src/components/DatasetDrawer.jsx` | Komponen `DatasetDrawer` slide-over untuk menampilkan seluruh baris data mentah (`id`, `tanggal`, `minggu_ke`, `prodi`, `angkatan`, `kategori`, `urgensi`, `status`, `durasi_hari`) dengan dukungan tombol `Escape`. |
| Diubah | `src/App.jsx` | Direfactor total ke arsitektur Sidebar + White Canvas Shell; menghubungkan `Sidebar`, `TopHeader`, `DatasetDrawer`, `parseAspirasiCSV`, `downloadCSVTemplate`, banner notifikasi bersih, serta area kerja bersih per tab (`TAB_CONFIG`). |

### Verifikasi
- `npm test` (`node --test tests/*.test.js`): **10/10 lulus** (`pass 10`, `fail 0`).
- `npm run lint` (`oxlint`): **0 warning, 0 error** pada 11 file.
- `npm run build` (`vite build`): **berhasil** (`dist/index.html` 0.95 kB, `dist/assets/index-D23BlNe6.css` 16.99 kB, `dist/assets/index-B55Mv-7Y.js` 275.96 kB).

---

## [Task #3] — 2026-11-26 00:46 WIB
**Judul:** Implementasi Fondasi Desain (Design Tokens), App Shell, Navbar, Navigasi Tab, dan Integrasi Import CSV

### Ringkasan Pekerjaan
1. Menetapkan Design Tokens **90% Dub.co Clean + 10% Grafana Fun Accent (`#F97316`)** di `index.html` dan `src/index.css` (`--color-canvas`, `--color-surface`, `--color-border`, `--color-ink`, `--color-muted`, `--color-accent`, font `Inter` & `JetBrains Mono`).
2. Membangun komponen `src/components/Navbar.jsx` dengan latar putih aksen grid dot halus (`bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px]`), logo geometris hitam/oranye bertuliskan `ADVOKASTRA // PROBSTAT`, status dataset aktif dengan dot indikator oranye, serta tombol `Import CSV`, `Template`, `Lihat Data` (dengan badge jumlah baris), dan `Reset` (kondisional saat dataset non-default).
3. Membangun navigasi 3 tab bergaya pill-container ala Dub.co dengan garis bawah oranye pada tab aktif (`01. Pola & Deskriptif`, `02. Proporsi & Chi-Square`, `03. Prediksi & Poisson`) beserta kerangka placeholder rapi untuk masing-masing tab dan panel ringkasan `Lihat Data`.
4. Menghubungkan `parseAspirasiCSV` dan `downloadCSVTemplate` di `src/App.jsx` lengkap dengan banner notifikasi status sukses, peringatan (misal auto-kalkulasi `minggu_ke`), dan error validasi CSV.

### Perubahan Source Code & Konfigurasi
| Status | Path File | Ringkasan Perubahan & Simbol Utama |
| :--- | :--- | :--- |
| Diubah | `index.html` | Mengatur class `<body>` ke `bg-[#FAFAFA] text-[#09090B]` dengan aksen seleksi oranye halus. |
| Diubah | `src/index.css` | Menambahkan token warna Dub.co + Grafana (`--color-canvas: #fafafa`, `--color-surface: #ffffff`, `--color-border: #e4e4e7`, `--color-ink: #09090b`, `--color-muted: #71717a`, `--color-accent: #f97316`) dan `color-scheme: light`. |
| Ditambah | `src/components/Navbar.jsx` | Komponen `Navbar` berisi header dot-grid, mark geometris hitam/oranye, badge `ADVOKASTRA // PROBSTAT`, pill status dataset aktif (`animate-pulse`), serta tombol kontrol CSV (`Import CSV`, `Template`, `Lihat Data`, `Reset`). |
| Diubah | `src/App.jsx` | Menyusun App Shell dengan state `dataset`, `datasetSource`, `activeTab`, `isImporting`, `isDataModalOpen`, dan `notification`; menghubungkan `parseAspirasiCSV` dan `downloadCSVTemplate`; menambahkan tab pill-container (`TABS`) dan placeholder berborder putus-putus untuk Tab 01–03. |

### Verifikasi
- `npm test` (`node --test tests/*.test.js`): **10/10 lulus** (`pass 10`, `fail 0`).
- `npm run lint` (`oxlint`): **0 warning, 0 error** pada 9 file.
- `npm run build` (`vite build`): **berhasil** (`dist/index.html` 0.95 kB, `dist/assets/index-BH6DqWbh.css` 19.68 kB, `dist/assets/index-DCUPAVBr.js` 278.28 kB).

---

## [Task #2] — 2026-11-26 00:19 WIB
**Judul:** Pembuatan Dokumen Log Pengembangan Terpusat

### Ringkasan Pekerjaan
- Membuat dokumen log tunggal (`DEVELOPMENT_LOG.md`) sebagai catatan resmi seluruh aktivitas pengembangan dan perubahan source code dari awal inisialisasi proyek hingga pembaruan selanjutnya.

### Perubahan File
| Status | Path File | Keterangan |
| :--- | :--- | :--- |
| Ditambah | `DEVELOPMENT_LOG.md` | Dokumen log utama untuk dokumentasi task dan riwayat perubahan source code |

---

## [Task #1] — 2026-11-26 00:08–00:16 WIB
**Judul:** Inisialisasi Proyek React + Vite + Tailwind v4, Dataset Dummy, Utilitas CSV, dan Mesin Statistik

### Ringkasan Pekerjaan
1. Menginisialisasi proyek Vite React (JavaScript) dan memasang dependensi: `tailwindcss`, `@tailwindcss/vite`, `lucide-react`, `papaparse`, `chart.js`, `react-chartjs-2`, `simple-statistics`, dan `jstat`.
2. Mengonfigurasi Tailwind CSS v4 pada Vite serta memuat font **Inter** dan **JetBrains Mono**.
3. Membuat dataset dummy realistis sebanyak 90 entri untuk periode 12 minggu (September–November 2026) dengan tren naik dan lonjakan pada minggu KRS & UTS.
4. Membuat helper CSV berbasis `papaparse` untuk parsing file/teks CSV (delimiter `,` dan `;`), validasi kolom wajib, kalkulasi otomatis `minggu_ke`, dan unduh template CSV.
5. Membuat mesin analisis statistik murni berbasis `simple-statistics` dan `jstat` beserta komentar penjelasan rumus, lalu memverifikasinya dengan unit test, linter, dan build produksi.

### Perubahan Source Code & Konfigurasi
| Status | Path File | Ringkasan Perubahan & Simbol Utama |
| :--- | :--- | :--- |
| Diubah | `package.json` | Mengubah `name` menjadi `"advokastra-probstat"`, menambahkan script `"test": "node --test tests/*.test.js"`, dan mendaftarkan dependensi (`tailwindcss`, `@tailwindcss/vite`, `lucide-react`, `papaparse`, `chart.js`, `react-chartjs-2`, `simple-statistics`, `jstat`). |
| Diubah | `vite.config.js` | Menambahkan plugin `tailwindcss()` dari `@tailwindcss/vite` bersama `react()`. |
| Diubah | `index.html` | Mengatur `lang="id"`, memperbarui `<title>` aplikasi, dan memuat Google Fonts `Inter` serta `JetBrains Mono`. |
| Diubah | `src/index.css` | Mengonfigurasi `@import "tailwindcss";`, definisi `--font-sans` dan `--font-mono` di blok `@theme`, serta styling dasar pada `@layer base`. |
| Diubah | `src/App.jsx` | Mengganti komponen bawaan Vite dengan tampilan ringkas dashboard status awal yang memanggil `defaultDataset`, `downloadCSVTemplate`, dan kelima fungsi pada `statsEngine.js`. |
| Dihapus | `src/App.css` | Dihapus karena seluruh styling aplikasi menggunakan Tailwind CSS v4 pada `src/index.css`. |
| Ditambah | `src/data/defaultDataset.js` | Mengekspor `VALID_PRODI`, `VALID_ANGKATAN`, `VALID_KATEGORI`, `VALID_URGENSI`, `VALID_STATUS`, dan array `defaultDataset` (90 objek aspirasi mahasiswa dari `2026-09-01` s.d. `2026-11-23`; distribusi mingguan `6, 8, 5, 6, 6, 7, 7, 10, 11, 7, 8, 9`; `durasi_hari: null` untuk status `Belum Diproses` dan integer `1–20` untuk status lainnya). |
| Ditambah | `src/utils/csvHelper.js` | Mengekspor `REQUIRED_COLUMNS`, `TEMPLATE_COLUMNS`, `TEMPLATE_FILENAME` (`template_aspirasi_advokastra.csv`), `detectCsvDelimiter`, `parseAspirasiCSV` (validasi kolom `tanggal`, `prodi`, `angkatan`, `kategori`, `urgensi`, `status`, dukungan delimiter `,`/`;`, serta auto-kalkulasi `minggu_ke`), `generateCSVTemplate`, dan `downloadCSVTemplate`. |
| Ditambah | `src/utils/statsEngine.js` | Mengekspor pure functions terdokumentasi rumus: `calculateDescriptive`, `calculateProportionCI`, `calculateChiSquare`, `calculateLinearRegression`, dan `calculatePoisson`. |
| Ditambah | `tests/datasetAndHelpers.test.js` | Menambahkan 5 unit test untuk memvalidasi struktur/distribusi `defaultDataset` serta fungsi `csvHelper.js` (delimiter `,`/`;`, BOM, validasi kolom/tanggal, auto `minggu_ke`, round-trip template). |
| Ditambah | `tests/statsEngine.test.js` | Menambahkan 5 unit test untuk menguji perhitungan numerik & edge-case seluruh fungsi pada `statsEngine.js` terhadap hitungan manual dan `defaultDataset`. |

### Detail Modul Statistik (`src/utils/statsEngine.js`)
- **`calculateDescriptive(data, field)`**: Menghitung frekuensi absolut ($f_i$), frekuensi relatif ($\%$), frekuensi kumulatif ($F_i$ dan $\%$), modus (mendukung multi-modal), serta ringkasan numerik `durasi_hari` (`count`, `mean`, `median`, `stdDev` sampel, `min`, `max`).
- **`calculateProportionCI(data, field, targetValue, confidenceLevel)`**: Menghitung proporsi sampel ($\hat{p} = x/n$), nilai kritis $z_{\alpha/2}$ (`jStat.normal.inv`), `SE`, `ME`, batas selang kepercayaan `[lowerBound, upperBound]`, pengecekan syarat aproksimasi normal ($n\hat{p} \ge 5$ dan $n(1-\hat{p}) \ge 5$), serta `interpretation`.
- **`calculateChiSquare(data, rowField, colField, alpha)`**: Menyusun matriks observasi $O_{ij}$ dan matriks harapan $E_{ij} = (R_i \cdot C_j)/N$, menghitung $\chi^2_{\text{hitung}}$, derajat bebas $df = (r-1)(c-1)$, nilai kritis $\chi^2_{\text{tabel}}$ (`jStat.chisquare.inv`), `pValue` (`1 - jStat.chisquare.cdf`), evaluasi syarat Cochran ($E_{ij} < 5$), status signifikansi, dan `conclusion`.
- **`calculateLinearRegression(data, categoryFilter = 'ALL', predictAhead = 3)`**: Mengagregasi data per `minggu_ke` (termasuk minggu bernilai `0` pada rentang pengamatan saat difilter), menghitung $y = a + bx$ (`slope`, `intercept`, `r`, `rSquared` via `simple-statistics`), dan menghasilkan titik prediksi untuk `predictAhead` minggu berikutnya.
- **`calculatePoisson(data, targetX, categoryFilter = 'ALL')`**: Menghitung laju kedatangan mingguan $\lambda$, peluang $P(X = x)$, $P(X \ge x)$, $P(X \le x)$, serta tabel distribusi probabilitas PMF (`pmfDistribution`) dari $k = 0$ sampai $k_{\max}$.

### Verifikasi
- `npm test` (`node --test tests/*.test.js`): **10/10 lulus** (`pass 10`, `fail 0`).
- `npm run lint` (`oxlint`): **0 warning, 0 error** pada 8 file.
- `npm run build` (`vite build`): **berhasil** menghasilkan artefak produksi di `dist/`.
