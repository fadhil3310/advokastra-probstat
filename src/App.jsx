import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, X } from 'lucide-react';
import DatasetDrawer from './components/DatasetDrawer';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import TopProgressBar from './components/TopProgressBar';
import ChiSquareView from './components/dashboard/ChiSquareView';
import DatasetExplorerView from './components/dashboard/DatasetExplorerView';
import OverviewView from './components/dashboard/OverviewView';
import PoissonView from './components/dashboard/PoissonView';
import ProportionView from './components/dashboard/ProportionView';
import RegressionView from './components/dashboard/RegressionView';
import defaultDataset from './data/defaultDataset';
import { downloadCSVTemplate, parseAspirasiCSV } from './utils/csvHelper';

const SESSION_STORAGE_KEY = 'advokastra_probstat_session';

const MENU_TITLES = {
  overview: 'Ikhtisar & Pola',
  dataset: 'Explorer Dataset',
  proportion: 'Estimasi Proporsi (CI)',
  chisquare: 'Uji Independensi Chi-Square',
  regression: 'Prediksi Tren (Regresi)',
  poisson: 'Peluang Lonjakan (Poisson)',
};

function loadSavedSession() {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(user) {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    if (user) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Abaikan error penyimpanan jika sessionStorage tidak tersedia
  }
}

function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function App() {
  const [view, setView] = useState('landing');
  const [authUser, setAuthUser] = useState(() => loadSavedSession());
  const [pendingTab, setPendingTab] = useState('overview');
  const [loginHint, setLoginHint] = useState(null);

  const [dataset, setDataset] = useState(defaultDataset);
  const [datasetSource, setDatasetSource] = useState({
    isDefault: true,
    name: 'Default',
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingTabLabel, setLoadingTabLabel] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [routeLoadingMessage, setRouteLoadingMessage] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const routeTimerRef = useRef(null);
  const tabTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (routeTimerRef.current) clearTimeout(routeTimerRef.current);
      if (tabTimerRef.current) clearTimeout(tabTimerRef.current);
    };
  }, []);

  const transitionToView = (nextView, message, afterSwitch, delayMs = 380) => {
    if (routeTimerRef.current) clearTimeout(routeTimerRef.current);
    setRouteLoadingMessage(message);
    routeTimerRef.current = setTimeout(() => {
      if (afterSwitch) afterSwitch();
      setView(nextView);
      setRouteLoadingMessage(null);
      window.scrollTo({ top: 0 });
    }, delayMs);
  };

  const handleSelectTab = (tabId) => {
    if (tabId === activeTab && !loadingTabLabel) return;
    if (tabTimerRef.current) clearTimeout(tabTimerRef.current);
    setLoadingTabLabel(MENU_TITLES[tabId] ?? 'modul');
    tabTimerRef.current = setTimeout(() => {
      setActiveTab(tabId);
      setLoadingTabLabel(null);
    }, 280);
  };

  const contextLabel = useMemo(() => {
    const weeks = new Set(
      dataset
        .map((row) => Number(row?.minggu_ke))
        .filter((w) => Number.isInteger(w) && w >= 1)
    ).size;
    const prodis = new Set(
      dataset
        .map((row) => String(row?.prodi ?? '').trim())
        .filter(Boolean)
    ).size;
    return `Periode: ${weeks || 12} Minggu · ${prodis || 5} Prodi`;
  }, [dataset]);

  const handleOpenDashboard = (tabId = 'overview') => {
    const targetTab = MENU_TITLES[tabId] ? tabId : 'overview';
    if (authUser) {
      transitionToView(
        'dashboard',
        `Membuka ${MENU_TITLES[targetTab]}...`,
        () => setActiveTab(targetTab),
        380
      );
    } else {
      transitionToView(
        'login',
        'Menuju halaman autentikasi...',
        () => {
          setPendingTab(targetTab);
          setLoginHint(null);
        },
        320
      );
    }
  };

  const handleLoginSuccess = (user) => {
    const targetTab = MENU_TITLES[pendingTab] ? pendingTab : 'overview';
    transitionToView(
      'dashboard',
      'Menyiapkan ruang kerja analisis...',
      () => {
        setAuthUser(user);
        persistSession(user);
        setActiveTab(targetTab);
        setLoginHint(null);
      },
      360
    );
  };

  const handleLogout = () => {
    transitionToView(
      'landing',
      'Mengakhiri sesi...',
      () => {
        setAuthUser(null);
        persistSession(null);
        setPendingTab('overview');
        setLoginHint(null);
        setIsDrawerOpen(false);
      },
      340
    );
  };

  const handleImportCSV = async (file, { fromLanding = false } = {}) => {
    setIsImporting(true);
    try {
      const [result] = await Promise.all([parseAspirasiCSV(file), waitMs(480)]);
      if (result.success) {
        setDataset(result.data);
        setDatasetSource({
          isDefault: false,
          name: file.name,
        });
        setNotification({
          type: 'success',
          title: `Berhasil mengimpor "${file.name}"`,
          details: [
            `${result.meta.validRows} baris valid dimuat (delimiter "${result.meta.delimiter}").`,
            ...result.warnings,
          ],
        });
        if (fromLanding) {
          setPendingTab('overview');
          if (authUser) {
            transitionToView(
              'dashboard',
              'Memuat data ke ruang kerja...',
              () => setActiveTab('overview'),
              340
            );
          } else {
            transitionToView(
              'login',
              'Menyiapkan dataset...',
              () => setLoginHint('Dataset siap, silakan masuk untuk melihat hasil.'),
              320
            );
          }
        }
      } else {
        setNotification({
          type: 'error',
          title: `Gagal memvalidasi CSV "${file.name}"`,
          details: result.errors,
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        title: `Terjadi kesalahan saat membaca "${file.name}"`,
        details: [error?.message || 'File CSV tidak dapat diproses.'],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadCSVTemplate();
    setNotification({
      type: 'info',
      title: 'Template CSV diunduh',
      details: ['File "template_aspirasi_advokastra.csv" siap diisi dan diunggah kembali.'],
    });
  };

  const handleResetDataset = () => {
    if (tabTimerRef.current) clearTimeout(tabTimerRef.current);
    setLoadingTabLabel('Dataset Default');
    tabTimerRef.current = setTimeout(() => {
      setDataset(defaultDataset);
      setDatasetSource({
        isDefault: true,
        name: 'Default',
      });
      setNotification({
        type: 'info',
        title: 'Dataset dikembalikan ke Default',
        details: [`Memuat ulang ${defaultDataset.length} baris data aspirasi standar.`],
      });
      setLoadingTabLabel(null);
    }, 320);
  };

  const isTabTransitioning = loadingTabLabel !== null;
  const currentMenuTitle = MENU_TITLES[activeTab] ?? MENU_TITLES.overview;
  const activeDatasetLabel = datasetSource.isDefault ? 'Default' : datasetSource.name;

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView dataset={dataset} />;
      case 'dataset':
        return (
          <DatasetExplorerView
            dataset={dataset}
            datasetName={activeDatasetLabel}
          />
        );
      case 'proportion':
        return <ProportionView dataset={dataset} />;
      case 'chisquare':
        return <ChiSquareView dataset={dataset} />;
      case 'regression':
        return <RegressionView dataset={dataset} />;
      case 'poisson':
        return <PoissonView dataset={dataset} />;
      default:
        return <OverviewView dataset={dataset} />;
    }
  };

  return (
    <>
      <TopProgressBar
        active={Boolean(routeLoadingMessage) || isImporting}
        message={
          routeLoadingMessage || (isImporting ? 'Memproses file CSV...' : null)
        }
      />

      {view === 'landing' && (
        <LandingPage
          dataset={dataset}
          datasetSource={datasetSource}
          isImporting={isImporting}
          notification={notification}
          onDismissNotification={() => setNotification(null)}
          onOpenDashboard={handleOpenDashboard}
          onImportCSV={(file) => handleImportCSV(file, { fromLanding: true })}
          onDownloadTemplate={handleDownloadTemplate}
        />
      )}

      {view === 'login' && (
        <LoginPage
          loginHint={loginHint}
          onLoginSuccess={handleLoginSuccess}
          onBackToLanding={() => {
            transitionToView(
              'landing',
              'Kembali ke beranda...',
              () => setLoginHint(null),
              280
            );
          }}
        />
      )}

      {view === 'dashboard' && (
        <div className="animate-page-enter flex min-h-screen flex-col bg-[#FAFAFA] text-[#09090B] md:flex-row">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            onBackToLanding={() =>
              transitionToView('landing', 'Kembali ke beranda...', null, 280)
            }
            onLogout={handleLogout}
            onImportCSV={(file) => handleImportCSV(file)}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            authUser={authUser}
            datasetName={datasetSource.name}
            isDefaultDataset={datasetSource.isDefault}
            rowCount={dataset.length}
          />

          <div className="flex flex-1 p-2.5 md:pl-0">
            <main className="flex min-h-full w-full flex-1 flex-col rounded-xl border border-zinc-200 bg-white">
              <TopHeader
                menuTitle={currentMenuTitle}
                contextLabel={contextLabel}
                isDefaultDataset={datasetSource.isDefault}
                isImporting={isImporting}
                isLoading={isTabTransitioning}
                onImportCSV={(file) => handleImportCSV(file)}
                onDownloadTemplate={handleDownloadTemplate}
                onResetDataset={handleResetDataset}
              />

              <div className="flex-1 p-6">
                {notification && (
                  <div
                    role="status"
                    className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-zinc-200 bg-[#FAFAFA] px-4 py-3"
                  >
                    <div className="flex items-start gap-2.5">
                      {notification.type === 'success' && (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      )}
                      {notification.type === 'error' && (
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      )}
                      {notification.type === 'info' && (
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#F97316]" />
                      )}

                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-zinc-900">
                          {notification.title}
                        </p>
                        {notification.details?.length > 0 && (
                          <ul className="space-y-0.5 text-xs text-zinc-500">
                            {notification.details.map((msg, idx) => (
                              <li key={idx}>{msg}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNotification(null)}
                      className="cursor-pointer rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-700"
                      aria-label="Tutup notifikasi"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {isTabTransitioning ? (
                  <div className="animate-overlay-in flex min-h-[380px] flex-col items-center justify-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-[#FAFAFA]">
                      <Loader2 className="h-4 w-4 animate-spin text-[#F97316]" />
                    </div>
                    <p className="text-xs font-medium text-zinc-500">
                      Memuat {loadingTabLabel}...
                    </p>
                  </div>
                ) : (
                  <div key={activeTab} className="animate-page-enter">
                    {renderDashboardContent()}
                  </div>
                )}
              </div>
            </main>
          </div>

          <DatasetDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            dataset={dataset}
            datasetName={datasetSource.name}
            isDefaultDataset={datasetSource.isDefault}
          />
        </div>
      )}
    </>
  );
}

export default App;
