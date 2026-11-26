import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { calculateLinearRegression } from '../../utils/statsEngine';
import MathFormula from '../MathFormula';
import {
  BASE_CHART_FONT,
  BASE_TOOLTIP_STYLE,
  ensureChartsRegistered,
} from './chartSetup';

ensureChartsRegistered();

function RegressionView({ dataset = [], analysisConfig }) {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [predictAhead, setPredictAhead] = useState(
    analysisConfig.defaults.regressionPredictAhead
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(dataset.map((row) => String(row?.kategori ?? '')).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, 'id')),
    [dataset]
  );

  const effectiveFilter =
    categoryFilter === 'ALL' || categoryOptions.includes(categoryFilter)
      ? categoryFilter
      : 'ALL';

  const regression = useMemo(
    () => calculateLinearRegression(dataset, effectiveFilter, predictAhead),
    [dataset, effectiveFilter, predictAhead]
  );

  const chartData = useMemo(() => {
    const actualPoints = regression.weeklyData;
    const futurePoints = regression.predictions;

    const labels = [
      ...actualPoints.map((d) => `M${d.minggu_ke}`),
      ...futurePoints.map((p) => `M${p.minggu_ke}`),
    ];

    const actualSeries = [
      ...actualPoints.map((d) => d.actual),
      ...futurePoints.map(() => null),
    ];

    const fittedSeries = [
      ...actualPoints.map((d) => Number(d.fitted.toFixed(2))),
      ...futurePoints.map(() => null),
    ];

    const lastActualFitted =
      actualPoints.length > 0
        ? Number(actualPoints[actualPoints.length - 1].fitted.toFixed(2))
        : null;

    const forecastSeries = [
      ...actualPoints.map((_, idx) =>
        idx === actualPoints.length - 1 ? lastActualFitted : null
      ),
      ...futurePoints.map((p) => Number(p.predicted.toFixed(2))),
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Aktual Mingguan',
          data: actualSeries,
          borderColor: '#09090B',
          backgroundColor: '#09090B',
          borderWidth: 2,
          pointRadius: 3.5,
          pointHoverRadius: 5,
          tension: 0.2,
        },
        {
          label: 'Garis Regresi (ŷ = a + bx)',
          data: fittedSeries,
          borderColor: '#4F46E5',
          backgroundColor: '#4F46E5',
          borderWidth: 2,
          borderDash: [5, 4],
          pointRadius: 0,
          tension: 0,
        },
        {
          label: `Proyeksi (${predictAhead} Minggu)`,
          data: forecastSeries,
          borderColor: '#F97316',
          backgroundColor: '#F97316',
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: 4,
          pointHoverRadius: 5,
          tension: 0,
        },
      ],
    };
  }, [regression, predictAhead]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            color: '#52525B',
            font: BASE_CHART_FONT,
          },
        },
        tooltip: BASE_TOOLTIP_STYLE,
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: '#71717A', font: BASE_CHART_FONT },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#F4F4F5' },
          border: { display: false },
          ticks: { precision: 0, color: '#71717A', font: BASE_CHART_FONT },
        },
      },
    }),
    []
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Kontrol & Ringkasan Model */}
        <div className="space-y-4 lg:col-span-4">
          <div className="space-y-3.5 rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-zinc-950">
              Parameter Regresi Mingguan
            </h2>

            <div>
              <label
                htmlFor="reg-cat"
                className="mb-1.5 block text-xs font-medium text-zinc-700"
              >
                Filter Kategori
              </label>
              <select
                id="reg-cat"
                value={effectiveFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
              >
                <option value="ALL">Semua Kategori (ALL)</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <label htmlFor="reg-ahead" className="font-medium text-zinc-700">
                  Horizon Prediksi Ke Depan
                </label>
                <span className="font-mono font-medium tabular-nums text-zinc-950">
                  {predictAhead} minggu
                </span>
              </div>
              <input
                id="reg-ahead"
                type="range"
                min={1}
                max={6}
                value={predictAhead}
                onChange={(e) => setPredictAhead(Number(e.target.value))}
                className="w-full accent-zinc-950"
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-400">
                <span>1 mg</span>
                <span>3 mg</span>
                <span>6 mg</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">
                Persamaan Regresi Linear
              </p>
              <span className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium capitalize text-zinc-700">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    regression.trendDirection === 'naik'
                      ? 'bg-[#F97316]'
                      : 'bg-zinc-400'
                  }`}
                />
                Tren {regression.trendDirection}
              </span>
            </div>

            <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-zinc-950">
              {regression.equation}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-2.5">
                <p className="text-[11px] text-zinc-500">Slope (b)</p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-zinc-950">
                  {regression.slope >= 0 ? '+' : ''}
                  {regression.slope.toFixed(4)}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-2.5">
                <p className="text-[11px] text-zinc-500">Intercept (a)</p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-zinc-950">
                  {regression.intercept.toFixed(4)}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-2.5">
                <p className="text-[11px] text-zinc-500">Korelasi (r)</p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-zinc-950">
                  {regression.r.toFixed(4)}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-2.5">
                <p className="text-[11px] text-zinc-500">Determinasi (R²)</p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-zinc-950">
                  {(regression.rSquared * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-zinc-200/80 bg-zinc-50 px-3 py-2 text-zinc-800">
              <MathFormula
                latex={String.raw`b = \frac{\sum (x_i-\bar{x})(y_i-\bar{y})}{\sum (x_i-\bar{x})^2}, \quad \hat{y} = a + bx`}
                displayMode
              />
            </div>
          </div>
        </div>

        {/* Grafik Regresi & Proyeksi */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-8">
          <h2 className="text-sm font-semibold text-zinc-950">
            Tren Mingguan &amp; Proyeksi
          </h2>

          <div className="mt-4 h-72">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="mt-4 rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-3.5 text-xs leading-relaxed text-zinc-700">
            {regression.interpretation}
          </div>
        </div>
      </div>

      {/* Kartu Prediksi Minggu Ke Depan & Tabel Mingguan */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-950">
              Proyeksi {predictAhead} Minggu Ke Depan
            </h3>
            <span className="font-mono text-[11px] text-zinc-400">
              {regression.equation}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {regression.predictions.map((pred) => (
              <div
                key={pred.minggu_ke}
                className="flex items-center justify-between rounded-lg border border-zinc-200/80 bg-[#FAFAFA] px-3.5 py-2.5 text-xs"
              >
                <span className="inline-flex items-center gap-2 font-medium text-zinc-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
                  Minggu ke-{pred.minggu_ke}
                </span>
                <span className="font-mono font-semibold tabular-nums text-zinc-950">
                  ≈ {pred.predicted.toFixed(2)} aspirasi
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white lg:col-span-7">
          <div className="border-b border-zinc-200/80 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-zinc-950">
              Data Agregasi Mingguan (Aktual vs Fitted)
            </h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 border-b border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
                <tr>
                  <th className="px-5 py-2">Minggu Ke</th>
                  <th className="px-4 py-2 text-right">Aktual (y)</th>
                  <th className="px-4 py-2 text-right">Estimasi (ŷ)</th>
                  <th className="px-5 py-2 text-right">Residual (y − ŷ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono text-[11px] tabular-nums">
                {regression.weeklyData.map((row) => {
                  const residual = row.actual - row.fitted;
                  return (
                    <tr key={row.minggu_ke} className="hover:bg-zinc-50/70">
                      <td className="px-5 py-2 font-sans font-medium text-zinc-800">
                        Minggu {row.minggu_ke}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-zinc-950">
                        {row.actual}
                      </td>
                      <td className="px-4 py-2 text-right text-zinc-600">
                        {row.fitted.toFixed(2)}
                      </td>
                      <td className="px-5 py-2 text-right text-zinc-500">
                        {residual >= 0 ? '+' : ''}
                        {residual.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegressionView;
