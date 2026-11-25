import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Halaman autentikasi simulasi bergaya dub.co sebelum memasuki Workspace Dashboard.
 */
function LoginPage({
  onLoginSuccess,
  onBackToLanding,
  loginHint = null,
}) {
  const [email, setEmail] = useState('advokastra@upi.edu');
  const [password, setPassword] = useState('advokastra2026');
  const [loadingMode, setLoadingMode] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const isLoading = loadingMode !== null;

  const triggerLogin = (mode, userPayload) => {
    if (isLoading) return;
    setLoadingMode(mode);
    timerRef.current = setTimeout(() => {
      onLoginSuccess(userPayload);
    }, 520);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const resolvedEmail = email.trim() || 'advokastra@upi.edu';
    triggerLogin('form', {
      name: 'Pengurus Advokastra',
      displayLabel: 'Advokastra · UPI Cibiru',
      email: resolvedEmail,
      isGuest: false,
    });
  };

  const handleGuestLogin = () => {
    triggerLogin('guest', {
      name: 'Dosen / Tamu Penguji',
      displayLabel: 'Tamu Penguji',
      email: 'tamu@upi.edu',
      isGuest: true,
    });
  };

  return (
    <div className="animate-page-enter relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#FAFAFA] text-zinc-950">
      {/* Pola Grid Tipis yang Memudar Halus ke Bawah */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_45%,transparent_100%)]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #f4f4f5 1px, transparent 1px), linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Top Bar Ringkas */}
      <header className="relative z-10 mx-auto flex h-16 w-full max-w-5xl items-center px-6">
        <button
          type="button"
          disabled={isLoading}
          onClick={onBackToLanding}
          className="cursor-pointer text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Kembali ke Beranda
        </button>
      </header>

      {/* Kartu Login Utama di Tengah */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-[380px] rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          {/* Banner Ringkas Jika Baru Mengimpor CSV */}
          {loginHint && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-zinc-200 bg-[#FAFAFA] px-3 py-2 text-xs text-zinc-700">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600"
                aria-hidden="true"
              />
              <span>{loginHint}</span>
            </div>
          )}

          {/* Header Kartu */}
          <div className="text-center">
            <div
              className="relative mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950"
              aria-hidden="true"
            >
              <span className="absolute top-1.5 right-1.5 h-1 w-1 rounded-[1px] bg-[#F97316]" />
              <span className="h-2.5 w-2.5 rounded-[2px] border border-zinc-400/70" />
            </div>

            <h1 className="mt-4 text-center text-lg font-medium tracking-tight text-zinc-950">
              Masuk ke Advokastra
            </h1>
            <p className="mt-1 text-center text-xs text-zinc-500">
              Akses ruang kerja analisis aspirasi BEM UPI Cibiru
            </p>
          </div>

          {/* Form Input Minimalis */}
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-3.5" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-medium text-zinc-700"
              >
                Email Kampus / Akun Pengurus
              </label>
              <input
                id="login-email"
                type="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advokastra@upi.edu"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-medium text-zinc-700"
              >
                Kata Sandi
              </label>
              <input
                id="login-password"
                type="password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-zinc-950 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingMode === 'form' && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>
                {loadingMode === 'form'
                  ? 'Memverifikasi sesi...'
                  : 'Masuk ke Dashboard'}
              </span>
            </button>
          </form>

          {/* Pemisah & Tombol Akses Cepat Demo */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-[11px] uppercase text-zinc-400">atau</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleGuestLogin}
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loadingMode === 'guest' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F97316]" />
            ) : (
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#F97316]"
                aria-hidden="true"
              />
            )}
            <span>
              {loadingMode === 'guest'
                ? 'Membuka workspace...'
                : 'Masuk sebagai Tamu / Dosen Penguji'}
            </span>
          </button>
        </div>
      </main>

      {/* Footer Ringkas Halaman Login */}
      <footer className="relative z-10 py-5 text-center text-[11px] text-zinc-400">
        Advokastra Analytics · BEM UPI Kampus Cibiru
      </footer>
    </div>
  );
}

export default LoginPage;
