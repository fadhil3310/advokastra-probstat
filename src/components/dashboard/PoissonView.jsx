import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { calculatePoisson } from '../../utils/statsEngine';
import MathFormula from '../MathFormula';
import {
  BASE_CHART_FONT,
  BASE_TOOLTIP_STYLE,
  ensureChartsRegistered,
} from './chartSetup';

ensureChartsRegistered();

function PoissonView({ dataset = [] }) {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [targetX, setTargetX] = useState(8);

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

  const poisson = useMemo(
    () => calculatePoisson(dataset, targetX, effectiveFilter),
    [dataset, targetX, effectiveFilter]
  );

  const chartData = useMemo(
    () => ({
      labels: poisson.pmfDistribution.map((item) => `${item.k}`),
      datasets: [
        {
          label: 'Probabilitas P(X = k)',
          data: poisson.pmfDistribution.map((item) =>
            Number((item.probability * 100).toFixed(2))
          ),
          backgroundColor: poisson.pmfDistribution.map((item) =>
            item.isTarget ? '#F97316' : '#27272A'
          ),
          borderRadius: 4,
        },
      ],
    }),
    [poisson.pmfDistribution]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...BASE_TOOLTIP_STYLE,
          callbacks: {
            title: (items) => `X = ${items[0]?.label ?? ''} aspirasi/minggu`,
            label: (ctx) => ` P(X = ${ctx.label}) = ${ctx.parsed.y}%`,
          },
        },
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
          ticks: {
            color: '#71717A',
            font: BASE_CHART_FONT,
            callback: (val) => `${val}%`,
          },
        },
      },
    }),
    []
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Simulator & Metrik Poisson */}
        <div className="space-y-4 lg:col-span-4">
          <div className="space-y-3.5 rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-zinc-950">
              Simulator Kedatangan Mingguan
            </h2>

            <div>
              <label
                htmlFor="poi-cat"
                className="mb-1.5 block text-xs font-medium text-zinc-700"
              >
                Filter Kategori
              </label>
              <select
                id="poi-cat"
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
                <label htmlFor="poi-x" className="font-medium text-zinc-700">
                  Target Jumlah Laporan (x)
                </label>
                <span className="font-mono font-semibold tabular-nums text-[#F97316]">
                  x = {poisson.targetX}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="poi-x"
                  type="range"
                  min={0}
                  max={25}
                  value={Math.min(25, poisson.targetX)}
                  onChange={(e) => setTargetX(Number(e.target.value))}
                  className="flex-1 accent-[#F97316]"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={poisson.targetX}
                  onChange={(e) =>
                    setTargetX(Math.max(0, Math.floor(Number(e.target.value) || 0)))
                  }
                  aria-label="Nilai numerik target x"
                  className="h-8 w-16 rounded-lg border border-zinc-200 bg-white px-2 text-center font-mono text-xs tabular-nums text-zinc-950 focus:border-zinc-950 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-3">
                <p className="text-[11px] text-zinc-500">Laju Rata-rata (λ)</p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-950">
                  {poisson.lambda.toFixed(2)}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {poisson.totalCount} / {poisson.totalWeeks} mg
                </p>
              </div>

              <div className="rounded-lg border border-orange-200 bg-orange-50/40 p-3">
                <p className="text-[11px] text-zinc-600">
                  Tepat P(X = {poisson.targetX})
                </p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-950">
                  {(poisson.pExact * 100).toFixed(2)}%
                </p>
                <p className="text-[10px] text-orange-600">Target aktif</p>
              </div>

              <div className="rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-3">
                <p className="text-[11px] text-zinc-500">
                  Minimal P(X ≥ {poisson.targetX})
                </p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-950">
                  {(poisson.pAtLeast * 100).toFixed(2)}%
                </p>
                <p className="text-[10px] text-zinc-400">Risiko lonjakan</p>
              </div>

              <div className="rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-3">
                <p className="text-[11px] text-zinc-500">
                  Maksimal P(X ≤ {poisson.targetX})
                </p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-950">
                  {(poisson.pAtMost * 100).toFixed(2)}%
                </p>
                <p className="text-[10px] text-zinc-400">Batas aman</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-zinc-200/80 bg-zinc-50 px-3 py-2 text-zinc-800">
              <MathFormula
                latex={String.raw`P(X = x) = \frac{\lambda^x e^{-\lambda}}{x!}`}
                displayMode
              />
            </div>
          </div>
        </div>

        {/* Grafik PMF Poisson */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-8">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-950">
              Distribusi Massa Probabilitas (PMF)
            </h2>
            <span className="font-mono text-[11px] tabular-nums text-zinc-500">
              Target: X = {poisson.targetX}
            </span>
          </div>

          <div className="mt-4 h-72">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="mt-4 rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-3.5 text-xs leading-relaxed text-zinc-700">
            {poisson.interpretation}
          </div>
        </div>
      </div>

      {/* Tabel Nilai PMF */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-zinc-950">
            Tabel Distribusi Probabilitas Poisson (k = 0 s.d. {poisson.kMax})
          </h3>
          <span className="font-mono text-xs tabular-nums text-zinc-500">
            λ = {poisson.lambda.toFixed(2)}
          </span>
        </div>

        <div className="max-h-60 overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 border-b border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
              <tr>
                <th className="px-5 py-2">Jumlah Kedatangan (k)</th>
                <th className="px-4 py-2 text-right">P(X = k)</th>
                <th className="px-5 py-2 text-right">Kumulatif P(X ≤ k)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-mono text-[11px] tabular-nums">
              {poisson.pmfDistribution.map((row) => (
                <tr
                  key={row.k}
                  onClick={() => setTargetX(row.k)}
                  className={`cursor-pointer ${
                    row.isTarget ? 'bg-orange-50/50 font-semibold' : 'hover:bg-zinc-50/70'
                  }`}
                >
                  <td className="px-5 py-2 text-zinc-900">
                    <span className="inline-flex items-center gap-2">
                      {row.isTarget && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
                      )}
                      <span>k = {row.k}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-800">
                    {(row.probability * 100).toFixed(2)}%
                  </td>
                  <td className="px-5 py-2 text-right text-zinc-600">
                    {(row.cumulativeProbability * 100).toFixed(2)}%
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

export default PoissonView;
