import { useRef } from 'react';
import { ChevronRight, Download, Loader2, RotateCcw, Upload } from 'lucide-react';

/**
 * Top bar ringkas di dalam kanvas putih utama.
 */
function TopHeader({
  menuTitle,
  contextLabel = 'Periode: 12 Minggu · 5 Prodi',
  isDefaultDataset = true,
  isImporting = false,
  isLoading = false,
  onImportCSV,
  onDownloadTemplate,
  onResetDataset,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && onImportCSV) {
      onImportCSV(file);
    }
    event.target.value = '';
  };

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between gap-4 border-b border-zinc-200/80 px-6">
      <div className="flex min-w-0 items-center gap-1.5 text-xs">
        <span className="text-zinc-400">Workspace</span>
        <ChevronRight className="h-3 w-3 shrink-0 text-zinc-400" aria-hidden="true" />
        <h1 className="truncate font-semibold text-zinc-900">{menuTitle}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden items-center rounded-full border border-zinc-200 bg-[#FAFAFA] px-2.5 py-1 font-mono text-[11px] tabular-nums text-zinc-500 lg:inline-flex">
          {contextLabel}
        </span>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Pilih file CSV aspirasi"
        />

        <button
          type="button"
          onClick={onDownloadTemplate}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <Download className="h-3.5 w-3.5 text-zinc-500" />
          <span>Template CSV</span>
        </button>

        <button
          type="button"
          disabled={isImporting}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-950 px-3 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isImporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          <span>{isImporting ? 'Memproses...' : 'Import CSV'}</span>
        </button>

        {!isDefaultDataset && (
          <button
            type="button"
            onClick={onResetDataset}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            title="Kembalikan ke dataset default"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-500" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Garis progress halus di batas bawah top bar saat berpindah tab atau memuat CSV */}
      {(isLoading || isImporting) && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2.5px] overflow-hidden bg-zinc-100"
        >
          <div className="h-full w-1/2 rounded-full bg-[#F97316] animate-progress-line" />
        </div>
      )}
    </header>
  );
}

export default TopHeader;
