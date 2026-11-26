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
import heroBackground from '../assets/hero-bg.png';
import BrandMark from './BrandMark';
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

function HeroPaperIllustrations() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 mx-auto max-w-[1280px]"
    >
      <div className="hero-paper hero-paper-data">
        <span className="hero-paper-tape" />
        <div className="flex items-center justify-between">
          <span className="hero-paper-kicker">DATA / 90</span>
          <span className="h-2 w-2 rounded-full bg-[#f36b2b]" />
        </div>
        <div className="mt-4 space-y-2">
          <span className="hero-paper-line w-[72%]" />
          <span className="hero-paper-line w-[88%]" />
          <span className="hero-paper-line w-[55%]" />
        </div>
        <div className="mt-5 flex h-12 items-end gap-1.5 border-b border-slate-300/70 pb-1">
          {[35, 58, 45, 82, 65, 92].map((height, index) => (
            <span
              key={height}
              className="flex-1 rounded-t-sm bg-[#f36b2b]/75"
              style={{ height: `${height}%`, opacity: 0.5 + index * 0.08 }}
            />
          ))}
        </div>
        <span className="hero-paper-note">aspirasi / minggu</span>
      </div>

      <div className="hero-paper hero-paper-test">
        <span className="hero-paper-clip" />
        <div className="flex items-start justify-between">
          <div>
            <span className="hero-paper-kicker">UJI HIPOTESIS</span>
            <p className="mt-1 font-mono text-xl font-bold text-[#132238]">χ²</p>
          </div>
          <span className="rounded-full bg-teal-100 px-2 py-0.5 font-mono text-[7px] font-bold text-teal-700">
            α .05
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-md border border-slate-300/80 text-center font-mono text-[7px] text-slate-500">
          {['O', 'E', 'Δ', '18', '15', '3', '12', '14', '-2'].map((cell) => (
            <span key={cell} className="border-r border-b border-slate-200 py-1.5">
              {cell}
            </span>
          ))}
        </div>
        <p className="mt-3 font-mono text-[8px] text-slate-500">p-value = 0.032</p>
      </div>

      <div className="hero-paper hero-paper-trend">
        <div className="flex items-center justify-between">
          <span className="hero-paper-kicker">TREND REPORT</span>
          <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
        </div>
        <svg className="mt-3 h-16 w-full" viewBox="0 0 120 56" fill="none">
          <path d="M4 46H116M4 28H116M4 10H116" stroke="#cbd5e1" strokeDasharray="2 3" />
          <path
            d="M5 43C18 39 23 42 34 34C44 27 51 34 62 25C72 17 81 23 91 15C101 7 106 11 116 5"
            stroke="#249b93"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="62" cy="25" r="3" fill="#f36b2b" />
          <circle cx="116" cy="5" r="3" fill="#f36b2b" />
        </svg>
        <div className="mt-1 flex justify-between font-mono text-[7px] text-slate-400">
          <span>W01</span>
          <span>W06</span>
          <span>W12</span>
        </div>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-white text-zinc-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          {/* Kiri: Logo + Wordmark */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex cursor-pointer items-center gap-2.5 text-left"
          >
            <BrandMark className="h-5 w-5 shrink-0" />
            <span className="text-sm font-bold tracking-tight text-zinc-950">
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
          </nav>

          {/* Kanan: Tombol Dashboard */}
          <button
            type="button"
            onClick={() => onOpenDashboard('overview')}
            className="glass-button glass-button-dark cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium text-white"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Hero Section dengan tipografi editorial */}
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat pt-16 pb-20 sm:pt-20 sm:pb-24"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_66%,transparent_100%)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[16%] left-[58%] h-52 w-52 rounded-full bg-orange-200/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[16%] bottom-[10%] h-56 w-56 rounded-full bg-teal-200/20 blur-3xl"
        />

        <div aria-hidden="true" className="hero-god-rays" />

        <HeroPaperIllustrations />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-[860px]">
            <h1 className="hero-title relative z-10 text-[clamp(2.75rem,8.2vw,7rem)] font-black leading-[0.84] tracking-[-0.065em]">
              <span className="block whitespace-nowrap">
                <span className="hero-word-ink">Ubah</span>
                <span className="hero-word-orange hero-word-aspirasi ml-[0.25em]">
                  aspirasi
                </span>
              </span>
              <span className="hero-word-ink block mt-[0.1em]">mahasiswa</span>
              <span className="mt-[0.3em] flex items-end gap-[0.12em] pl-[0.02em] whitespace-nowrap">
                <span className="hero-script hero-word-ink mb-[0.04em] text-[0.55em] font-normal tracking-[-0.06em]">
                  menjadi
                </span>
                <span className="hero-word-orange text-[0.7em] tracking-[-0.055em]">
                  keputusan
                </span>

                <span className="translate-y-10 block pr-[0.5em] text-right text-[0.72em] tracking-[-0.055em] ml-[0.05em]">
                  <span className="hero-word-teal hero-word-terukur">terukur</span>
                </span>
              </span>
            </h1>

            <div className="pt-20 max-w-[470px]">
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                Platform analisis pola distribusi, uji independensi Chi-Square,
                dan prediksi tren volume aspirasi berbasis
                data.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenDashboard('overview')}
                  className="glass-button glass-button-dark cursor-pointer rounded-xl px-5 py-3 text-sm font-medium text-white"
                >
                  Mulai Analisis
                </button>
              </div>
            </div>
          </div>

          {/* Banner Error jika upload CSV dari halaman awal gagal validasi */}
          {notification && notification.type === 'error' && (
            <div
              role="alert"
              className="glass-card mx-auto mt-8 flex max-w-[860px] items-start justify-between gap-3 rounded-xl p-3.5 text-left"
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
        <div className="glass-card mx-auto max-w-5xl rounded-t-[28px] border-b-0 px-4 pt-8 pb-0 sm:rounded-t-[36px] sm:px-8 sm:pt-10">
          {/* 3 Pill Tombol Modul */}
          <div className="mb-7 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenDashboard('overview')}
              className="glass-card glass-card-interactive flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-800"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                <BarChart2 className="h-3.5 w-3.5" />
              </span>
              <span>Pola &amp; Statistika Deskriptif</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDashboard('chisquare')}
              className="glass-card glass-card-interactive flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-800"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <Table2 className="h-3.5 w-3.5" />
              </span>
              <span>Proporsi &amp; Uji Chi-Square</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDashboard('regression')}
              className="glass-card glass-card-interactive flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-800"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-50 text-[#F97316]">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              <span>Prediksi Tren &amp; Poisson</span>
            </button>
          </div>

          {/* Interactive Mini-Preview Window */}
          <div className="glass-card mx-auto max-w-4xl rounded-t-2xl border-b-0 p-5 text-left sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">

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
              <div className="glass-card rounded-lg p-3.5">
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

              <div className="glass-card rounded-lg p-3.5">
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

              <div className="glass-card rounded-lg p-3.5">
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

              <div className="glass-card rounded-lg p-3.5">
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
              <div key={step.number} className="glass-card flex flex-col rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <span className="glass-chip inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-medium tabular-nums text-zinc-900">
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
                className="glass-card flex flex-col justify-between gap-5 rounded-xl p-6"
              >
                <div>
                  <h3 className="text-sm font-medium text-zinc-950">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    {card.description}
                  </p>
                </div>

                <div className="glass-card-subtle space-y-2 overflow-x-auto rounded-lg px-4 py-3 text-zinc-900">
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
          <div className="glass-card  items-center gap-8 rounded-2xl p-6 sm:p-8 lg:grid-cols-12">
            {/* Kiri: Ringkasan Cakupan Studi Kasus */}
            {/* <div className="lg:col-span-7">
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
                        className="glass-chip rounded-md px-2 py-0.5 text-[11px] text-zinc-700"
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
                        className="glass-chip rounded-md px-2 py-0.5 text-[11px] text-zinc-700"
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
                        className="glass-chip rounded-md px-2 py-0.5 font-mono text-[11px] tabular-nums text-zinc-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div> */}

            {/* Kanan: Kartu Ajakan Gelap */}
            <div className="glass-card-dark rounded-xl p-6 text-white lg:col-span-5">
              <h3 className="mt-3 text-lg font-medium tracking-[-0.02em] text-white">
                Siap mengeksplorasi data aspirasi?
              </h3>

              <button
                type="button"
                onClick={() => onOpenDashboard('overview')}
                className="glass-button glass-button-light mt-5 inline-flex cursor-pointer items-center rounded-lg px-4 py-2 text-xs font-medium text-zinc-950"
              >
                Buka Dashboard →
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
