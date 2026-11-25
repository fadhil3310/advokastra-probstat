import { useMemo, useRef } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  BarChart2,
  Loader2,
  Table2,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  calculateDescriptive,
  calculateLinearRegression,
  calculatePoisson,
} from '../utils/statsEngine';
import MathFormula from './MathFormula';

const WORKFLOW_STEPS = [
  {
    number: '01',
    title: 'Ingesti & Validasi Data',
    description:
      'Unggah ekspor CSV dari Google Form Advokastra atau gunakan dataset simulasi 90 aspirasi mahasiswa UPI Cibiru (12 minggu).',
  },
  {
    number: '02',
    title: 'Pengujian Hipotesis & Estimasi',
    description:
      'Hitung distribusi frekuensi, selang kepercayaan proporsi, dan uji independensi Chi-Square antar variabel kampus.',
  },
  {
    number: '03',
    title: 'Proyeksi Tren & Kesiapan Layanan',
    description:
      'Prediksi volume aspirasi minggu berikutnya dengan Regresi Linear dan peluang lonjakan laporan via Distribusi Poisson.',
  },
];

const METHODOLOGY_CARDS = [
  {
    title: 'Estimasi Proporsi & Deskriptif',
    description:
      'Mengukur dominasi kategori laporan, ringkasan durasi penanganan, serta rentang proporsi sebenarnya pada populasi mahasiswa dengan tingkat kepercayaan terukur.',
    formulas: [String.raw`\hat{p} \pm z_{\alpha/2}\sqrt{\frac{\hat{p}(1-\hat{p})}{n}}`],
  },
  {
    title: 'Uji Independensi Chi-Square (χ²)',
    description:
      'Menguji apakah distribusi kategori aspirasi, tingkat urgensi, atau status penyelesaian memiliki keterkaitan signifikan terhadap program studi dan angkatan.',
    formulas: [String.raw`\chi^2 = \sum \frac{(O_{ij} - E_{ij})^2}{E_{ij}}`],
  },
  {
    title: 'Regresi Linear & Distribusi Poisson',
    description:
      'Memetakan arah laju pertumbuhan aspirasi antar minggu serta menghitung peluang terjadinya lonjakan jumlah laporan dalam satu pekan layanan.',
    formulas: [
      String.raw`\hat{y} = a + bx`,
      String.raw`P(X = x) = \frac{\lambda^x e^{-\lambda}}{x!}`,
    ],
  },
];

const STUDY_PRODI = ['RPL', 'Tekkom', 'PGSD', 'PGPAUD', 'Multimedia'];
const STUDY_KATEGORI = [
  'Fasilitas Kampus',
  'Akademik & Perkuliahan',
  'UKT & Keuangan',
  'Layanan Administrasi',
  'Kemahasiswaan',
];
const STUDY_ANGKATAN = ['2022', '2023', '2024', '2025'];

/**
 * Halaman pembuka aplikasi bergaya dub.co yang menjadi gerbang menuju Workspace Dashboard.
 */
function LandingPage({
  dataset = [],
  datasetSource = { isDefault: true, name: 'Default' },
  isImporting = false,
  notification = null,
  onDismissNotification,
  onOpenDashboard,
  onImportCSV,
  onDownloadTemplate,
}) {
  const fileInputRef = useRef(null);

  const previewStats = useMemo(() => {
    const descriptive = calculateDescriptive(dataset, 'kategori');
    const regression = calculateLinearRegression(dataset, 'ALL', 3);
    const poisson = calculatePoisson(dataset, 8, 'ALL');
    const topCategory = descriptive.frequencies[0] ?? null;

    return {
      total: descriptive.totalCount,
      topCategory,
      topCategories: descriptive.frequencies.slice(0, 4),
      lambda: poisson.lambda,
      slope: regression.slope,
      rSquared: regression.rSquared,
      totalWeeks: poisson.totalWeeks,
    };
  }, [dataset]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && onImportCSV) {
      onImportCSV(file);
    }
    event.target.value = '';
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="animate-page-enter min-h-screen bg-white text-zinc-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          {/* Kiri: Logo + Wordmark */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex cursor-pointer items-center gap-2.5 text-left"
          >
            <div
              className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-950"
              aria-hidden="true"
            >
              <span className="absolute top-1 right-1 h-1 w-1 rounded-[1px] bg-[#F97316]" />
              <span className="h-2 w-2 rounded-[2px] border border-zinc-400/70" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-950">
              advokastra
            </span>
          </button>

          {/* Tengah: 3 Link Navigasi Bersih */}
          <nav aria-label="Navigasi halaman awal" className="hidden items-center gap-7 sm:flex">
            <button
              type="button"
              onClick={() => scrollToSection('metodologi')}
              className="cursor-pointer text-[13px] font-medium text-zinc-600 transition-colors hover:text-zinc-950"
            >
              Metodologi
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('dataset')}
              className="cursor-pointer text-[13px] font-medium text-zinc-600 transition-colors hover:text-zinc-950"
            >
              Dataset
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('tentang')}
              className="cursor-pointer text-[13px] font-medium text-zinc-600 transition-colors hover:text-zinc-950"
            >
              Tentang Studi Kasus
            </button>
          </nav>

          {/* Kanan: Tombol Dashboard */}
          <button
            type="button"
            onClick={() => onOpenDashboard('overview')}
            className="cursor-pointer rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Hero Section dengan Latar Grid Halus */}
      <section className="relative overflow-hidden pt-16 pb-14 sm:pt-20 sm:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #f4f4f5 1px, transparent 1px), linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Announcement Pill */}
          <div className="mb-6 inline-flex items-center overflow-hidden rounded-full border border-zinc-200 bg-white text-xs shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <span className="px-3 py-1 font-medium text-zinc-700">
              Studi Kasus BEM UPI Kampus Cibiru
            </span>
            <button
              type="button"
              onClick={onDownloadTemplate}
              className="flex cursor-pointer items-center gap-1 border-l border-zinc-200 px-3 py-1 text-zinc-500 transition-colors hover:text-zinc-900"
            >
              <span>Unduh Template CSV</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          {/* Headline Utama (proporsi ringan identik dub.co) */}
          <h1 className="mx-auto max-w-2xl text-4xl font-medium leading-[1.12] tracking-[-0.03em] text-zinc-950 sm:text-5xl">
            Ubah aspirasi mahasiswa menjadi keputusan terukur
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-500">
            Platform analisis pola distribusi, uji independensi Chi-Square, dan prediksi tren volume aspirasi Advokastra UPI Cibiru berbasis data.
          </p>

          {/* 2 Tombol CTA Utama */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Import Dataset CSV"
            />

            <button
              type="button"
              onClick={() => onOpenDashboard('overview')}
              className="cursor-pointer rounded-lg bg-zinc-950 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Mulai Analisis
            </button>

            <button
              type="button"
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isImporting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isImporting ? 'Memproses CSV...' : 'Import Dataset CSV'}</span>
            </button>
          </div>

          {/* Banner Error jika upload CSV dari halaman awal gagal validasi */}
          {notification && notification.type === 'error' && (
            <div
              role="alert"
              className="mx-auto mt-6 flex max-w-xl items-start justify-between gap-3 rounded-xl border border-red-200 bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-zinc-900">
                    {notification.title}
                  </p>
                  <ul className="space-y-0.5 text-xs text-zinc-500">
                    {notification.details?.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                type="button"
                onClick={onDismissNotification}
                className="cursor-pointer rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="Tutup pesan error"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3 Pill Modul Interaktif & Frame Preview Dashboard (Transisi Latar Lembut ala dub.co) */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-t-[28px] border border-b-0 border-zinc-200/80 bg-[#F7F6F3] px-4 pt-8 pb-0 sm:rounded-t-[36px] sm:px-8 sm:pt-10">
          {/* 3 Pill Tombol Modul */}
          <div className="mb-7 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenDashboard('overview')}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-medium text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-zinc-300"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                <BarChart2 className="h-3.5 w-3.5" />
              </span>
              <span>Pola &amp; Statistika Deskriptif</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDashboard('chisquare')}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-medium text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-zinc-300"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <Table2 className="h-3.5 w-3.5" />
              </span>
              <span>Proporsi &amp; Uji Chi-Square</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDashboard('regression')}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-medium text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-zinc-300"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-50 text-[#F97316]">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              <span>Prediksi Tren &amp; Poisson</span>
            </button>
          </div>

          {/* Interactive Mini-Preview Window */}
          <div className="mx-auto max-w-4xl rounded-t-2xl border border-b-0 border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 rounded-full bg-[#F97316]"
                  aria-hidden="true"
                />
                <span className="text-xs font-medium text-zinc-900">
                  Ringkasan Dataset Aktif
                </span>
                <span className="font-mono text-xs tabular-nums text-zinc-500">
                  ({datasetSource.isDefault ? 'Default' : datasetSource.name} ·{' '}
                  {previewStats.total} baris · {previewStats.totalWeeks} minggu)
                </span>
              </div>

              <button
                type="button"
                onClick={() => onOpenDashboard('overview')}
                className="cursor-pointer text-xs font-medium text-zinc-700 transition-colors hover:text-zinc-950"
              >
                Buka Workspace Lengkap →
              </button>
            </div>

            {/* Baris Metrik Nyata */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-3.5">
                <p className="text-[11px] font-medium text-zinc-500">
                  Total Aspirasi
                </p>
                <p className="mt-1.5 font-mono text-xl font-medium tabular-nums text-zinc-950">
                  {previewStats.total}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Periode {previewStats.totalWeeks} minggu
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-3.5">
                <p className="text-[11px] font-medium text-zinc-500">
                  Kategori Dominan
                </p>
                <p className="mt-1.5 truncate text-sm font-medium text-zinc-950">
                  {previewStats.topCategory ? previewStats.topCategory.value : '-'}
                </p>
                <p className="mt-1 font-mono text-[11px] tabular-nums text-zinc-500">
                  {previewStats.topCategory
                    ? `${previewStats.topCategory.count} kasus (${previewStats.topCategory.relativeFreq.toFixed(1)}%)`
                    : '0 kasus'}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-3.5">
                <p className="text-[11px] font-medium text-zinc-500">
                  Laju Kedatangan (λ)
                </p>
                <p className="mt-1.5 font-mono text-xl font-medium tabular-nums text-zinc-950">
                  {previewStats.lambda.toFixed(2)}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Aspirasi / minggu (Poisson)
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-3.5">
                <p className="text-[11px] font-medium text-zinc-500">
                  Kemiringan Tren (b)
                </p>
                <p className="mt-1.5 font-mono text-xl font-medium tabular-nums text-zinc-950">
                  {previewStats.slope >= 0 ? '+' : ''}
                  {previewStats.slope.toFixed(2)}
                </p>
                <p className="mt-1 font-mono text-[11px] tabular-nums text-zinc-500">
                  R² = {(previewStats.rSquared * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Cuplikan Distribusi Kategori Teratas */}
            <div className="mt-5 space-y-2.5 border-t border-zinc-100 pt-4">
              {previewStats.topCategories.map((item) => (
                <div key={item.value} className="grid grid-cols-12 items-center gap-3 text-xs">
                  <span className="col-span-5 truncate text-zinc-700 sm:col-span-4">
                    {item.value}
                  </span>
                  <div className="col-span-5 h-2 overflow-hidden rounded-full bg-zinc-100 sm:col-span-6">
                    <div
                      className="h-full rounded-full bg-zinc-900"
                      style={{ width: `${Math.min(100, item.relativeFreq)}%` }}
                    />
                  </div>
                  <span className="col-span-2 text-right font-mono text-[11px] tabular-nums text-zinc-500">
                    {item.count} ({item.relativeFreq.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section A — Alur Kerja Analisis */}
      <section id="dataset" className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="max-w-xl">
            <p className="text-xs font-medium text-zinc-500">
              Alur Kerja Sistem
            </p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.02em] text-zinc-950">
              Dari rekap formulir aspirasi menjadi dasar kebijakan
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step.number} className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-[#FAFAFA] font-mono text-xs font-medium tabular-nums text-zinc-900">
                    {step.number}
                  </span>
                  <div
                    className={`h-px flex-1 ${
                      index < WORKFLOW_STEPS.length - 1
                        ? 'bg-zinc-200'
                        : 'bg-zinc-100 md:bg-transparent'
                    }`}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mt-4 text-sm font-medium text-zinc-950">
                  {step.number}. {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section B — Landasan Metodologi & Rumus Probstat */}
      <section id="metodologi" className="border-t border-zinc-200 bg-[#FAFAFA] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-xl">
            <p className="text-xs font-medium text-zinc-500">
              Landasan Metodologi
            </p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.02em] text-zinc-950">
              Formulasi probabilitas dan statistika inferensial
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {METHODOLOGY_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex flex-col justify-between gap-5 rounded-xl border border-zinc-200 bg-white p-6"
              >
                <div>
                  <h3 className="text-sm font-medium text-zinc-950">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    {card.description}
                  </p>
                </div>

                <div className="space-y-2 rounded-lg border border-zinc-200/80 bg-zinc-50 px-4 py-3 text-zinc-900 overflow-x-auto">
                  {card.formulas.map((latexExpr, idx) => (
                    <MathFormula key={idx} latex={latexExpr} displayMode />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section C — Cakupan Variabel Studi Kasus & Bottom CTA */}
      <section id="tentang" className="border-t border-zinc-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 lg:grid-cols-12">
            {/* Kiri: Ringkasan Cakupan Studi Kasus */}
            <div className="lg:col-span-7">
              <p className="text-xs font-medium text-zinc-500">
                Tentang Studi Kasus
              </p>
              <h2 className="mt-1.5 text-xl font-medium tracking-[-0.02em] text-zinc-950">
                Cakupan Variabel Advokastra BEM UPI Kampus Cibiru
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                Struktur data dirancang menyerupai pencatatan aspirasi mahasiswa lintas prodi, angkatan, tingkat urgensi, dan durasi tindak lanjut layanan advokasi kampus.
              </p>

              <div className="mt-5 space-y-3 border-t border-zinc-100 pt-4 text-xs">
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
                  <span className="w-32 shrink-0 font-medium text-zinc-700">
                    5 Program Studi
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {STUDY_PRODI.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
                  <span className="w-32 shrink-0 font-medium text-zinc-700">
                    5 Kategori
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {STUDY_KATEGORI.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
                  <span className="w-32 shrink-0 font-medium text-zinc-700">
                    4 Angkatan
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {STUDY_ANGKATAN.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[11px] tabular-nums text-zinc-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Kanan: Kartu Ajakan Gelap */}
            <div className="rounded-xl bg-zinc-950 p-6 text-white lg:col-span-5">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full bg-[#F97316]"
                  aria-hidden="true"
                />
                <span className="font-mono text-[11px] text-zinc-400">
                  {previewStats.total} entri siap dianalisis
                </span>
              </div>

              <h3 className="mt-3 text-lg font-medium tracking-[-0.02em] text-white">
                Siap mengeksplorasi data aspirasi?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                Masuk ke workspace untuk menguji proporsi, tabel kontingensi Chi-Square, regresi tren mingguan, dan distribusi Poisson.
              </p>

              <button
                type="button"
                onClick={() => onOpenDashboard('overview')}
                className="mt-5 inline-flex cursor-pointer items-center rounded-lg bg-white px-4 py-2 text-xs font-medium text-zinc-950 transition-colors hover:bg-zinc-100"
              >
                Buka Dashboard Analisis →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Minimalis */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-2 px-6 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <p>Advokastra Analytics · UPI Kampus Cibiru</p>
          <p>Proyek Akhir Mata Kuliah Probabilitas &amp; Statistika</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
