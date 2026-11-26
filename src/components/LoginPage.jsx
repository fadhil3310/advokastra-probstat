import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  getAuthErrorMessage,
  loginAsGuest,
  loginWithEmail,
} from '../services/authService';
import BrandMark from './BrandMark';

/**
 * Halaman autentikasi Firebase sebelum memasuki Workspace Dashboard.
 */
function LoginPage({
  onLoginSuccess,
  onBackToLanding,
  loginHint = null,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingMode, setLoadingMode] = useState(null);
  const [authError, setAuthError] = useState(null);

  const isLoading = loadingMode !== null;

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    setAuthError(null);
    setLoadingMode('form');
    try {
      const user = await loginWithEmail(email, password);
      onLoginSuccess(user);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
      setLoadingMode(null);
    }
  };

  const handleGuestLogin = async () => {
    if (isLoading) return;

    setAuthError(null);
    setLoadingMode('guest');
    try {
      const user = await loginAsGuest();
      onLoginSuccess(user);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
      setLoadingMode(null);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#FAFAFA] text-zinc-950">
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

          {authError && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-xs text-red-700"
            >
              {authError}
            </div>
          )}

          {/* Header Kartu */}
          <div className="text-center">
            <BrandMark className="mx-auto h-9 w-9" />

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
          {/* <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-[11px] uppercase text-zinc-400">atau</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div> */}

          {/* <button
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
          </button> */}
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
