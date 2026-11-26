import { useRef } from 'react';
import {
  Activity,
  Database,
  LayoutGrid,
  LogOut,
  PieChart,
  Table2,
  TrendingUp,
} from 'lucide-react';
import BrandMark from './BrandMark';

/**
 * Sidebar navigasi tetap kiri bergaya app.dub.co + Linear (lebar w-64).
 */
function Sidebar({
  activeTab,
  onSelectTab,
  onBackToLanding,
  onLogout,
  onImportCSV,
  onOpenDrawer,
  authUser = null,
  datasetName = '',
  rowCount = 0,
}) {
  const fileInputRef = useRef(null);

  const displayName = datasetName;
  const profileLabel = authUser?.isGuest
    ? 'Tamu Penguji'
    : authUser?.email || 'Pengurus Advokastra';

  const navGroups = [
    {
      label: 'Ringkasan',
      items: [
        {
          id: 'overview',
          label: 'Ikhtisar & Pola',
          icon: LayoutGrid,
        },
        {
          id: 'dataset',
          label: 'Explorer Dataset',
          icon: Database,
          badge: rowCount,
        },
      ],
    },
    {
      label: 'Analisis Inferensial',
      items: [
        {
          id: 'proportion',
          label: 'Estimasi Proporsi (CI)',
          icon: PieChart,
        },
        {
          id: 'chisquare',
          label: 'Uji Independensi Chi-Square',
          icon: Table2,
        },
      ],
    },
    {
      label: 'Pemodelan & Prediksi',
      items: [
        {
          id: 'regression',
          label: 'Prediksi Tren (Regresi)',
          icon: TrendingUp,
        },
        {
          id: 'poisson',
          label: 'Peluang Lonjakan (Poisson)',
          icon: Activity,
          hasAccentDot: true,
        },
      ],
    },
  ];

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && onImportCSV) {
      onImportCSV(file);
    }
    event.target.value = '';
  };

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between bg-[#FAFAFA] p-3 md:sticky md:top-0 md:h-screen md:w-64">
      <div>
        {/* Header Brand + Workspace Switcher Pill */}
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex min-w-0 cursor-pointer items-center gap-2.5 text-left transition-opacity hover:opacity-80"
            title="Kembali ke halaman awal"
          >
            <BrandMark className="h-7 w-7 shrink-0" />
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-900">
              Advokastra
            </span>
          </button>

          <span className="shrink-0 rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-zinc-500">
            UPI Cibiru · 5B
          </span>
        </div>

        {/* Menu Navigasi Terkelompok */}
        <nav aria-label="Menu utama dashboard" className="mt-2">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mt-5 mb-1.5 px-2.5 text-[11px] font-medium text-zinc-400">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectTab(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
                        isActive
                          ? 'bg-zinc-200/70 font-medium text-zinc-950'
                          : 'font-normal text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>

                      {item.badge !== undefined && (
                        <span className="shrink-0 rounded border border-zinc-200/90 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums text-zinc-600">
                          {item.badge}
                        </span>
                      )}

                      {item.hasAccentDot && (
                        <span
                          className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#F97316]"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Sidebar: Status Dataset + Profil Sesi */}
      <div className="mt-6 space-y-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F97316]"
              aria-hidden="true"
            />
            <p className="truncate text-zinc-700" title={`${displayName} · ${rowCount} baris`}>
              <span className="font-medium text-zinc-900">{displayName}</span>
              <span className="text-zinc-400"> · </span>
              <span className="font-mono tabular-nums text-zinc-500">
                {rowCount} baris
              </span>
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Ganti file CSV dari sidebar"
          />

          <div className="mt-2 flex items-center justify-between gap-2 border-t border-zinc-100 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer text-[11px] font-medium text-zinc-700 transition-colors hover:text-zinc-950"
            >
              Ganti CSV
            </button>
            <button
              type="button"
              onClick={onOpenDrawer}
              className="cursor-pointer text-[11px] font-medium text-zinc-400 transition-colors hover:text-zinc-700"
            >
              Pratinjau →
            </button>
          </div>
        </div>

        {/* Baris Profil Sesi Aktif & Tombol Keluar */}
        <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200/80 bg-white px-2.5 py-2">
          <p
            className="truncate text-xs font-medium text-zinc-800"
            title={authUser?.email || profileLabel}
          >
            {profileLabel}
          </p>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            title="Keluar dari sesi dan kembali ke halaman awal"
            aria-label="Keluar"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
