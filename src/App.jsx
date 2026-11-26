import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
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
import { EMPTY_ANALYSIS_CONFIG } from './config/analysisDefaults';
import { observeAuthState, logoutFirebaseUser } from './services/authService';
import { loadApplicationData } from './services/firestoreService';
import { downloadCSVTemplate, parseAspirasiCSV } from './utils/csvHelper';

const MENU_TITLES = {
  overview: 'Overview',
  dataset: 'Explorer Dataset',
  proportion: 'Estimasi Proporsi (CI)',
  chisquare: 'Uji Independensi Chi-Square',
  regression: 'Prediksi Tren (Regresi)',
  poisson: 'Peluang Lonjakan (Poisson)',
};

const PAGE_DEPTH = {
  landing: 0,
  login: 1,
  dashboard: 2,
};

const TAB_ORDER = Object.keys(MENU_TITLES);

function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function App() {
  const [view, setView] = useState('landing');
  const [authUser, setAuthUser] = useState(null);
  const [pendingTab, setPendingTab] = useState('overview');
  const [loginHint, setLoginHint] = useState(null);

  const [dataset, setDataset] = useState([]);
  const [firebaseDataset, setFirebaseDataset] = useState([]);
  const [datasetSource, setDatasetSource] = useState({
    isDefault: true,
    name: '',
  });
  const [firebaseDatasetSource, setFirebaseDatasetSource] = useState({
    isDefault: true,
    name: '',
  });
  const [analysisConfig, setAnalysisConfig] = useState(EMPTY_ANALYSIS_CONFIG);
  const [csvTemplate, setCsvTemplate] = useState(null);
  const [isAppDataLoading, setIsAppDataLoading] = useState(true);
  const [appDataError, setAppDataError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [pageMotion, setPageMotion] = useState({
    direction: 'forward',
    fallback: false,
  });
  const [tabMotion, setTabMotion] = useState({
    direction: 'forward',
    fallback: false,
    sequence: 0,
  });
  const [isImporting, setIsImporting] = useState(false);
  const [routeLoadingMessage, setRouteLoadingMessage] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const viewTransitionRef = useRef(null);
  const viewTransitionTokenRef = useRef(0);

  useEffect(() => {
    const unsubscribeAuth = observeAuthState(setAuthUser);
    let cancelled = false;

    loadApplicationData()
      .then((applicationData) => {
        if (cancelled) return;
        setDataset(applicationData.dataset);
        setFirebaseDataset(applicationData.dataset);
        setDatasetSource(applicationData.datasetSource);
        setFirebaseDatasetSource(applicationData.datasetSource);
        setAnalysisConfig(applicationData.analysisConfig);
        setCsvTemplate(applicationData.csvTemplate);
        setAppDataError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        const message = error?.message || 'Data aplikasi gagal dimuat dari Firebase.';
        setAppDataError(message);
        setNotification({
          type: 'error',
          title: 'Firebase belum siap',
          details: [message],
        });
      })
      .finally(() => {
        if (!cancelled) setIsAppDataLoading(false);
      });

    return () => {
      cancelled = true;
      unsubscribeAuth();
      viewTransitionRef.current?.skipTransition?.();
    };
  }, []);

  const runIOSViewTransition = (scope, direction, update) => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const canUseViewTransition =
      typeof document.startViewTransition === 'function' && !reducedMotion;

    viewTransitionRef.current?.skipTransition?.();
    viewTransitionRef.current = null;

    if (!canUseViewTransition) {
      flushSync(() => update(!reducedMotion));
      delete document.documentElement.dataset.iosTransitionScope;
      delete document.documentElement.dataset.iosTransitionDirection;
      return;
    }

    const transitionToken = viewTransitionTokenRef.current + 1;
    viewTransitionTokenRef.current = transitionToken;
    document.documentElement.dataset.iosTransitionScope = scope;
    document.documentElement.dataset.iosTransitionDirection = direction;

    const transition = document.startViewTransition(() => {
      flushSync(() => update(false));
    });
    viewTransitionRef.current = transition;

    transition.finished
      .catch(() => {})
      .finally(() => {
        if (viewTransitionTokenRef.current !== transitionToken) return;
        delete document.documentElement.dataset.iosTransitionScope;
        delete document.documentElement.dataset.iosTransitionDirection;
        viewTransitionRef.current = null;
      });
  };

  const transitionToView = (nextView, afterSwitch) => {
    if (nextView === view) return;
    const direction = PAGE_DEPTH[nextView] > PAGE_DEPTH[view] ? 'forward' : 'back';

    runIOSViewTransition('page', direction, (useFallback) => {
      if (afterSwitch) afterSwitch();
      setPageMotion({ direction, fallback: useFallback });
      setView(nextView);
      setRouteLoadingMessage(null);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  const handleSelectTab = (tabId) => {
    if (tabId === activeTab || !MENU_TITLES[tabId]) return;
    const direction =
      TAB_ORDER.indexOf(tabId) > TAB_ORDER.indexOf(activeTab) ? 'forward' : 'back';

    runIOSViewTransition('tab', direction, (useFallback) => {
      setTabMotion((motion) => ({
        direction,
        fallback: useFallback,
        sequence: motion.sequence + 1,
      }));
      setActiveTab(tabId);
    });
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
    return `Periode: ${weeks} Minggu · ${prodis} Prodi`;
  }, [dataset]);

  const handleOpenDashboard = (tabId = 'overview') => {
    const targetTab = MENU_TITLES[tabId] ? tabId : 'overview';
    if (isAppDataLoading) {
      setNotification({
        type: 'info',
        title: 'Data Firebase sedang dimuat',
        details: ['Tunggu hingga dataset dan konfigurasi analisis selesai dimuat.'],
      });
      return;
    }
    if (appDataError) {
      setNotification({
        type: 'error',
        title: 'Dashboard belum dapat dibuka',
        details: [appDataError],
      });
      return;
    }
    if (authUser) {
      transitionToView('dashboard', () => setActiveTab(targetTab));
    } else {
      transitionToView('login', () => {
        setPendingTab(targetTab);
        setLoginHint(null);
      });
    }
  };

  const handleLoginSuccess = (user) => {
    const targetTab = MENU_TITLES[pendingTab] ? pendingTab : 'overview';
    transitionToView('dashboard', () => {
      setAuthUser(user);
      setActiveTab(targetTab);
      setLoginHint(null);
    });
  };

  const handleLogout = async () => {
    setRouteLoadingMessage('Mengakhiri sesi...');
    try {
      await logoutFirebaseUser();
      flushSync(() => setRouteLoadingMessage(null));
      transitionToView('landing', () => {
        setAuthUser(null);
        setPendingTab('overview');
        setLoginHint(null);
        setIsDrawerOpen(false);
      });
    } catch (error) {
      setRouteLoadingMessage(null);
      setNotification({
        type: 'error',
        title: 'Gagal keluar dari Firebase',
        details: [error?.message || 'Sesi tidak dapat diakhiri.'],
      });
    }
  };

  const handleImportCSV = async (file, { fromLanding = false } = {}) => {
    setIsImporting(true);
    try {
      const [result] = await Promise.all([
        parseAspirasiCSV(file, {
          domains: analysisConfig.domains,
          requiredColumns: csvTemplate?.requiredColumns,
          pendingStatus: analysisConfig.semantics.pendingStatus,
        }),
        waitMs(480),
      ]);
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
          flushSync(() => setIsImporting(false));
          if (authUser) {
            transitionToView('dashboard', () => setActiveTab('overview'));
          } else {
            transitionToView('login', () =>
              setLoginHint('Dataset siap, silakan masuk untuk melihat hasil.')
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
    try {
      downloadCSVTemplate(csvTemplate);
      setNotification({
        type: 'info',
        title: 'Template CSV diunduh',
        details: [`File "${csvTemplate.filename}" siap diisi dan diunggah kembali.`],
      });
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Template CSV belum tersedia',
        details: [error?.message || 'Konfigurasi template gagal dimuat dari Firebase.'],
      });
    }
  };

  const handleResetDataset = () => {
    setDataset(firebaseDataset);
    setDatasetSource(firebaseDatasetSource);
    setNotification({
      type: 'info',
      title: 'Dataset dikembalikan ke Default',
      details: [`Memuat ulang ${firebaseDataset.length} baris data aspirasi dari Firestore.`],
    });
  };

  const currentMenuTitle = MENU_TITLES[activeTab] ?? MENU_TITLES.overview;
  const activeDatasetLabel = datasetSource.name;

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView dataset={dataset} analysisConfig={analysisConfig} />;
      case 'dataset':
        return (
          <DatasetExplorerView
            dataset={dataset}
            datasetName={activeDatasetLabel}
            analysisConfig={analysisConfig}
          />
        );
      case 'proportion':
        return <ProportionView dataset={dataset} analysisConfig={analysisConfig} />;
      case 'chisquare':
        return <ChiSquareView dataset={dataset} analysisConfig={analysisConfig} />;
      case 'regression':
        return <RegressionView dataset={dataset} analysisConfig={analysisConfig} />;
      case 'poisson':
        return <PoissonView dataset={dataset} analysisConfig={analysisConfig} />;
      default:
        return <OverviewView dataset={dataset} analysisConfig={analysisConfig} />;
    }
  };

  const pageAnimationClass = pageMotion.fallback
    ? `animate-ios-page-${pageMotion.direction}`
    : '';
  const tabAnimationClass = tabMotion.fallback
    ? `animate-ios-tab-${tabMotion.direction}`
    : '';

  return (
    <>
      <TopProgressBar
        active={Boolean(routeLoadingMessage) || isImporting || isAppDataLoading}
        message={
          routeLoadingMessage ||
          (isImporting
            ? 'Memproses file CSV...'
            : isAppDataLoading
              ? 'Memuat data dari Firebase...'
              : null)
        }
      />

      {view === 'landing' && (
        <div
          key="landing"
          className={`ios-page ${pageAnimationClass}`}
        >
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
        </div>
      )}

      {view === 'login' && (
        <div
          key="login"
          className={`ios-page ${pageAnimationClass}`}
        >
          <LoginPage
            loginHint={loginHint}
            onLoginSuccess={handleLoginSuccess}
            onBackToLanding={() =>
              transitionToView('landing', () => setLoginHint(null))
            }
          />
        </div>
      )}

      {view === 'dashboard' && (
        <div
          key="dashboard"
          className={`ios-page ${pageAnimationClass} flex min-h-screen flex-col bg-[#FAFAFA] text-[#09090B] md:flex-row`}
        >
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            onBackToLanding={() =>
              transitionToView('landing')
            }
            onLogout={handleLogout}
            onImportCSV={(file) => handleImportCSV(file)}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            authUser={authUser}
            datasetName={datasetSource.name}
            rowCount={dataset.length}
          />

          <div className="flex flex-1 p-2.5 md:pl-0">
            <main className="flex min-h-full w-full flex-1 flex-col rounded-xl border border-zinc-200 bg-white">
              <TopHeader
                menuTitle={currentMenuTitle}
                contextLabel={contextLabel}
                isDefaultDataset={datasetSource.isDefault}
                isImporting={isImporting}
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

                <div
                  key={`${activeTab}-${tabMotion.sequence}`}
                  className={`ios-dashboard-content ${tabAnimationClass}`}
                >
                  {renderDashboardContent()}
                </div>
              </div>
            </main>
          </div>

          <DatasetDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            dataset={dataset}
            datasetName={datasetSource.name}
          />
        </div>
      )}
    </>
  );
}

export default App;
