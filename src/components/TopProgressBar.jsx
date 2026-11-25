import { Loader2 } from 'lucide-react';

/**
 * Indikator loading top bar 3px + optional full-screen transition curtain untuk perpindahan halaman.
 */
function TopProgressBar({ active = false, message = null }) {
  if (!active && !message) return null;

  return (
    <>
      {active && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden bg-zinc-200/80"
        >
          <div className="h-full w-1/2 rounded-full bg-[#F97316] animate-progress-line" />
        </div>
      )}

      {message && (
        <div
          role="status"
          aria-live="polite"
          className="animate-overlay-in fixed inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-[#FAFAFA]/88 backdrop-blur-[2px]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <Loader2 className="h-4 w-4 animate-spin text-[#F97316]" />
          </div>
          <p className="text-xs font-medium text-zinc-600">{message}</p>
        </div>
      )}
    </>
  );
}

export default TopProgressBar;
