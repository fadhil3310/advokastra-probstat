import { useMemo, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';

const PAGE_SIZE = 15;

function StatusBadge({ status }) {
  if (status === 'Selesai') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200/80 bg-emerald-50/70 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        Selesai
      </span>
    );
  }
  if (status === 'Dalam Proses') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
        <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
        Dalam Proses
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-500">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
      Belum Diproses
    </span>
  );
}

function DatasetExplorerView({ dataset = [], datasetName = 'Default' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [prodiFilter, setProdiFilter] = useState('ALL');
  const [angkatanFilter, setAngkatanFilter] = useState('ALL');
  const [kategoriFilter, setKategoriFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const filterOptions = useMemo(() => {
    const unique = (key) =>
      Array.from(
        new Set(dataset.map((row) => String(row?.[key] ?? '')).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, 'id'));

    return {
      prodi: unique('prodi'),
      angkatan: unique('angkatan'),
      kategori: unique('kategori'),
      status: unique('status'),
    };
  }, [dataset]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return dataset.filter((row) => {
      if (prodiFilter !== 'ALL' && String(row.prodi) !== prodiFilter) return false;
      if (angkatanFilter !== 'ALL' && String(row.angkatan) !== angkatanFilter) {
        return false;
      }
      if (kategoriFilter !== 'ALL' && String(row.kategori) !== kategoriFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && String(row.status) !== statusFilter) return false;
      if (!query) return true;

      return (
        String(row.id ?? '').toLowerCase().includes(query) ||
        String(row.kategori ?? '').toLowerCase().includes(query) ||
        String(row.prodi ?? '').toLowerCase().includes(query) ||
        String(row.tanggal ?? '').toLowerCase().includes(query) ||
        String(row.urgensi ?? '').toLowerCase().includes(query)
      );
    });
  }, [
    dataset,
    searchQuery,
    prodiFilter,
    angkatanFilter,
    kategoriFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageRows = filteredRows.slice(startIdx, startIdx + PAGE_SIZE);

  const hasActiveFilter =
    searchQuery.trim() !== '' ||
    prodiFilter !== 'ALL' ||
    angkatanFilter !== 'ALL' ||
    kategoriFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setProdiFilter('ALL');
    setAngkatanFilter('ALL');
    setKategoriFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar Pencarian & Filter */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Cari ID, tanggal, prodi, kategori..."
              className="h-8 w-full rounded-lg border border-zinc-200 bg-white pr-3 pl-8 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none"
            />
          </div>

          <select
            value={prodiFilter}
            onChange={(e) => {
              setProdiFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter Program Studi"
            className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-800 focus:border-zinc-950 focus:outline-none"
          >
            <option value="ALL">Semua Prodi</option>
            {filterOptions.prodi.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            value={angkatanFilter}
            onChange={(e) => {
              setAngkatanFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter Angkatan"
            className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-800 focus:border-zinc-950 focus:outline-none"
          >
            <option value="ALL">Semua Angkatan</option>
            {filterOptions.angkatan.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            value={kategoriFilter}
            onChange={(e) => {
              setKategoriFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter Kategori"
            className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-800 focus:border-zinc-950 focus:outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            {filterOptions.kategori.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter Status"
            className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-800 focus:border-zinc-950 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            {filterOptions.status.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
          <p>
            Sumber: <span className="font-medium text-zinc-800">{datasetName}</span> ·{' '}
            <span className="font-mono tabular-nums">
              {filteredRows.length} dari {dataset.length} baris
            </span>
          </p>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-950"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabel Data Mentah */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-medium text-zinc-500">
              <tr>
                <th className="px-4 py-2.5">ID</th>
                <th className="px-4 py-2.5">Tanggal</th>
                <th className="px-3 py-2.5 text-right">Mg</th>
                <th className="px-4 py-2.5">Prodi</th>
                <th className="px-3 py-2.5">Angkatan</th>
                <th className="px-4 py-2.5">Kategori</th>
                <th className="px-4 py-2.5">Urgensi</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Durasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-xs text-zinc-500">
                    Tidak ada baris data yang cocok dengan filter saat ini.
                  </td>
                </tr>
              ) : (
                pageRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-zinc-50/70">
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[11px] text-zinc-600">
                      {row.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[11px] tabular-nums text-zinc-700">
                      {row.tanggal}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[11px] tabular-nums text-zinc-600">
                      {row.minggu_ke}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium text-zinc-900">
                      {row.prodi}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] tabular-nums text-zinc-600">
                      {row.angkatan}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-zinc-800">
                      {row.kategori}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-zinc-700">
                      <span className="inline-flex items-center gap-1.5">
                        {row.urgensi === 'Tinggi' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
                        )}
                        <span>{row.urgensi}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono text-[11px] tabular-nums text-zinc-600">
                      {row.durasi_hari !== null && row.durasi_hari !== undefined
                        ? `${row.durasi_hari} hari`
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200/80 bg-zinc-50/50 px-4 py-2.5 text-xs text-zinc-500">
          <span className="font-mono text-[11px] tabular-nums">
            {filteredRows.length === 0
              ? '0 baris'
              : `Menampilkan ${startIdx + 1}–${Math.min(startIdx + PAGE_SIZE, filteredRows.length)} dari ${filteredRows.length} baris`}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="cursor-pointer rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="px-2 font-mono text-[11px] tabular-nums text-zinc-600">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="cursor-pointer rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatasetExplorerView;
