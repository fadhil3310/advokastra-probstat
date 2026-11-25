import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Slide-over drawer untuk meninjau seluruh baris data mentah aspirasi mahasiswa.
 */
function DatasetDrawer({
  isOpen,
  onClose,
  dataset = [],
  datasetName = 'Default',
  isDefaultDataset = true,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Data Aspirasi Mahasiswa"
    >
      <div
        className="fixed inset-0 bg-zinc-950/20 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full w-full max-w-4xl flex-col border-l border-zinc-200 bg-white">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200/80 px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <h2 className="truncate text-sm font-semibold text-zinc-900">
              Data Mentah Aspirasi
            </h2>
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[11px] tabular-nums text-zinc-600">
              {isDefaultDataset ? 'Default' : datasetName} · {dataset.length} baris
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            aria-label="Tutup panel data"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 border-b border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
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
              {dataset.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-zinc-50/70">
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-[11px] text-zinc-600">
                    {row.id}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-[11px] tabular-nums text-zinc-700">
                    {row.tanggal}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-[11px] tabular-nums text-zinc-600">
                    {row.minggu_ke}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-zinc-800">
                    {row.prodi}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] tabular-nums text-zinc-600">
                    {row.angkatan}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-zinc-800">
                    {row.kategori}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-zinc-700">
                    {row.urgensi}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-zinc-700">
                    {row.status}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-mono text-[11px] tabular-nums text-zinc-600">
                    {row.durasi_hari !== null && row.durasi_hari !== undefined
                      ? `${row.durasi_hari} hr`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DatasetDrawer;
