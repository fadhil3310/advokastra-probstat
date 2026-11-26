import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { calculateDescriptive } from '../../utils/statsEngine';
import MathFormula from '../MathFormula';
import {
  BASE_CHART_FONT,
  BASE_TOOLTIP_STYLE,
  ensureChartsRegistered,
} from './chartSetup';

ensureChartsRegistered();

function OverviewView({ dataset = [], analysisConfig }) {
  const [selectedField, setSelectedField] = useState(
    analysisConfig.defaults.overviewField
  );
  const dimensionOptions = analysisConfig.variableOptions;
  const highUrgency = analysisConfig.semantics.highUrgency;
  const completedStatus = analysisConfig.semantics.completedStatus;

  const descriptive = useMemo(
    () => calculateDescriptive(dataset, selectedField),
    [dataset, selectedField]
  );

  const urgencySummary = useMemo(() => {
    const urgensiStats = calculateDescriptive(dataset, 'urgensi');
    const highEntry = urgensiStats.frequencies.find((f) => f.value === highUrgency);
    return {
      highCount: highEntry?.count ?? 0,
      highPct: highEntry?.relativeFreq ?? 0,
    };
  }, [dataset, highUrgency]);

  const statusSummary = useMemo(() => {
    const statusStats = calculateDescriptive(dataset, 'status');
    const doneEntry = statusStats.frequencies.find((f) => f.value === completedStatus);
    return {
      doneCount: doneEntry?.count ?? 0,
      donePct: doneEntry?.relativeFreq ?? 0,
    };
  }, [dataset, completedStatus]);

  const activeDimLabel =
    dimensionOptions.find((opt) => opt.value === selectedField)?.label ?? selectedField;

  const chartData = useMemo(() => {
    const modeSet = new Set(descriptive.mode.values);
    return {
      labels: descriptive.frequencies.map((item) => item.value),
      datasets: [
        {
          label: 'Jumlah Aspirasi',
          data: descriptive.frequencies.map((item) => item.count),
          backgroundColor: descriptive.frequencies.map((item) =>
            modeSet.has(item.value) ? '#F97316' : '#18181B'
          ),
          borderRadius: 6,
          maxBarThickness: 44,
        },
      ],
    };
  }, [descriptive]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...BASE_TOOLTIP_STYLE,
          callbacks: {
            label: (ctx) => {
              const row = descriptive.frequencies[ctx.dataIndex];
              if (!row) return ` ${ctx.parsed.y} aspirasi`;
              return ` ${row.count} aspirasi (${row.relativeFreq.toFixed(1)}%)`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: '#71717A',
            font: BASE_CHART_FONT,
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#F4F4F5' },
          border: { display: false },
          ticks: {
            precision: 0,
            color: '#71717A',
            font: BASE_CHART_FONT,
          },
        },
      },
    }),
    [descriptive.frequencies]
  );

  const { durasiStats } = descriptive;
  const topMode = descriptive.frequencies[0] ?? null;

  return (
    <div className="space-y-5">
      {/* Bar Pemilih Dimensi */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {dimensionOptions.map((option) => {
            const isActive = option.value === selectedField;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedField(option.value)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-950 text-white'
                    : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* <span className="font-mono text-[11px] tabular-nums text-zinc-500">
          {descriptive.frequencies.length} kelas unik · n = {descriptive.totalCount}
        </span> */}
      </div>

      {/* KPI Strip Utama */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">Total Aspirasi</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-zinc-950">
            {descriptive.totalCount}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            <span className="font-mono tabular-nums text-zinc-700">
              {statusSummary.doneCount}
            </span>{' '}
            selesai ({statusSummary.donePct.toFixed(1)}%)
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">
              Modus ({activeDimLabel})
            </p>
            <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" aria-hidden="true" />
          </div>
          <p className="mt-2 truncate text-base font-semibold text-zinc-950" title={descriptive.mode.label}>
            {descriptive.mode.label}
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-zinc-500">
            {topMode
              ? `${descriptive.mode.count} kasus (${topMode.relativeFreq.toFixed(1)}%)`
              : '0 kasus'}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">
            Rata-rata Durasi Tindak Lanjut
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-zinc-950">
            {durasiStats.mean !== null ? `${durasiStats.mean.toFixed(1)} hr` : '—'}
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-zinc-500">
            Median: {durasiStats.median !== null ? `${durasiStats.median} hr` : '—'} · n={durasiStats.count}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">
            Urgensi {highUrgency}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-zinc-950">
            {urgencySummary.highCount}
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-zinc-500">
            {urgencySummary.highPct.toFixed(1)}% dari total laporan
          </p>
        </div>
      </div>

      {/* Grafik Batang + Statistik Numerik Durasi */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-950">
              Distribusi {activeDimLabel}
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
              <span className="h-2 w-2 rounded-xs bg-[#F97316]" />
              Modus
            </span>
          </div>

          <div className="h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-950">
                Durasi Penanganan
              </h2>
              <span className="font-mono text-[11px] tabular-nums text-zinc-400">
                n = {durasiStats.count}
              </span>
            </div>

            <div className="mt-4 divide-y divide-zinc-100 text-xs">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500">Rata-rata (Mean)</span>
                <span className="font-mono font-medium tabular-nums text-zinc-950">
                  {durasiStats.mean !== null ? `${durasiStats.mean.toFixed(2)} hari` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500">Median (Q₂)</span>
                <span className="font-mono font-medium tabular-nums text-zinc-950">
                  {durasiStats.median !== null ? `${durasiStats.median} hari` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500">Simpangan Baku Sampel (s)</span>
                <span className="font-mono font-medium tabular-nums text-zinc-950">
                  {durasiStats.stdDev !== null ? `${durasiStats.stdDev.toFixed(2)} hari` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500">Rentang (Min – Maks)</span>
                <span className="font-mono font-medium tabular-nums text-zinc-950">
                  {durasiStats.min !== null
                    ? `${durasiStats.min} – ${durasiStats.max} hari`
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* <div className="mt-4 rounded-lg border border-zinc-200/80 bg-zinc-50 px-3 py-2 text-zinc-800">
            <MathFormula
              latex={String.raw`\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i, \quad s = \sqrt{\frac{\sum (x_i - \bar{x})^2}{n - 1}}`}
              displayMode
            />
          </div> */}
        </div>
      </div>

      {/* Tabel Distribusi Frekuensi */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-zinc-950">
            Tabel Distribusi Frekuensi ({activeDimLabel})
          </h2>
          <span className="font-mono text-xs tabular-nums text-zinc-500">
            Total N = {descriptive.totalCount}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-medium text-zinc-500">
              <tr>
                <th className="px-5 py-2.5">Nilai {activeDimLabel}</th>
                <th className="px-4 py-2.5">Proporsi Visual</th>
                <th className="px-4 py-2.5 text-right">Frekuensi (fᵢ)</th>
                <th className="px-4 py-2.5 text-right">Relatif (%)</th>
                <th className="px-4 py-2.5 text-right">Kumulatif (Fᵢ)</th>
                <th className="px-5 py-2.5 text-right">Kumulatif (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {descriptive.frequencies.map((row) => {
                const isMode = descriptive.mode.values.includes(row.value);
                return (
                  <tr key={row.value} className="hover:bg-zinc-50/70">
                    <td className="px-5 py-3 font-medium text-zinc-900">
                      <span className="inline-flex items-center gap-2">
                        <span>{row.value}</span>
                        {isMode && (
                          <span className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-700">
                            <span className="h-1 w-1 rounded-full bg-[#F97316]" />
                            Modus
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="w-44 px-4 py-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className={`h-full rounded-full ${
                            isMode ? 'bg-[#F97316]' : 'bg-zinc-900'
                          }`}
                          style={{ width: `${Math.min(100, row.relativeFreq)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-900">
                      {row.count}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-600">
                      {row.relativeFreq.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-600">
                      {row.cumulativeCount}
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-zinc-600">
                      {row.cumulativeFreq.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OverviewView;
