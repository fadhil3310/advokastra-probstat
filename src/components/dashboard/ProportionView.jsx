import { useMemo, useState } from 'react';
import { calculateDescriptive, calculateProportionCI } from '../../utils/statsEngine';
import MathFormula from '../MathFormula';

const FIELD_OPTIONS = [
  { value: 'kategori', label: 'Kategori Aspirasi' },
  { value: 'prodi', label: 'Program Studi' },
  { value: 'angkatan', label: 'Angkatan' },
  { value: 'urgensi', label: 'Tingkat Urgensi' },
  { value: 'status', label: 'Status Penanganan' },
];

const CONFIDENCE_LEVELS = [
  { value: 0.9, label: '90%' },
  { value: 0.95, label: '95%' },
  { value: 0.99, label: '99%' },
];

function ProportionView({ dataset = [] }) {
  const [selectedField, setSelectedField] = useState('kategori');
  const [targetValue, setTargetValue] = useState('Fasilitas Kampus');
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);

  const descriptive = useMemo(
    () => calculateDescriptive(dataset, selectedField),
    [dataset, selectedField]
  );

  const targetOptions = useMemo(
    () => descriptive.frequencies.map((item) => item.value),
    [descriptive.frequencies]
  );

  const effectiveTarget = targetOptions.includes(targetValue)
    ? targetValue
    : (targetOptions[0] ?? '');

  const ci = useMemo(
    () =>
      calculateProportionCI(
        dataset,
        selectedField,
        effectiveTarget,
        confidenceLevel
      ),
    [dataset, selectedField, effectiveTarget, confidenceLevel]
  );

  const allComparison = useMemo(
    () =>
      targetOptions.map((val) =>
        calculateProportionCI(dataset, selectedField, val, confidenceLevel)
      ),
    [dataset, selectedField, targetOptions, confidenceLevel]
  );

  const lowerPct = ci.lowerBound * 100;
  const upperPct = ci.upperBound * 100;
  const pHatPct = ci.pHat * 100;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Panel Parameter Kiri */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-4">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-950">
              Parameter
            </h2>

            <div>
              <label
                htmlFor="ci-field"
                className="mb-1.5 block text-xs font-medium text-zinc-700"
              >
                Variabel Analisis
              </label>
              <select
                id="ci-field"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
              >
                {FIELD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="ci-target"
                className="mb-1.5 block text-xs font-medium text-zinc-700"
              >
                Nilai Target Proporsi
              </label>
              <select
                id="ci-target"
                value={effectiveTarget}
                onChange={(e) => setTargetValue(e.target.value)}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
              >
                {targetOptions.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-medium text-zinc-700">
                Tingkat Kepercayaan (1 − α)
              </span>
              <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                {CONFIDENCE_LEVELS.map((cl) => {
                  const isActive = confidenceLevel === cl.value;
                  return (
                    <button
                      key={cl.value}
                      type="button"
                      onClick={() => setConfidenceLevel(cl.value)}
                      className={`cursor-pointer rounded-md py-1.5 font-mono text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-white text-zinc-950 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      {cl.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-zinc-200/80 bg-zinc-50 px-3 py-2.5 text-zinc-800">
            <MathFormula
              latex={String.raw`\hat{p} \pm z_{\alpha/2}\sqrt{\frac{\hat{p}(1-\hat{p})}{n}}`}
              displayMode
            />
          </div>
        </div>

        {/* Output Metrik & Visualisasi Interval Kanan */}
        <div className="space-y-4 lg:col-span-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-[11px] font-medium text-zinc-500">
                Proporsi Sampel (p̂)
              </p>
              <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-zinc-950">
                {pHatPct.toFixed(2)}%
              </p>
              <p className="mt-1 font-mono text-[11px] tabular-nums text-zinc-500">
                x = {ci.x} / n = {ci.n}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-[11px] font-medium text-zinc-500">
                Standard Error (SE)
              </p>
              <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-zinc-950">
                {(ci.SE * 100).toFixed(2)}%
              </p>
              <p className="mt-1 font-mono text-[11px] tabular-nums text-zinc-500">
                SE = {ci.SE.toFixed(4)}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-[11px] font-medium text-zinc-500">
                Margin of Error (ME)
              </p>
              <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-zinc-950">
                ±{(ci.ME * 100).toFixed(2)}%
              </p>
              <p className="mt-1 font-mono text-[11px] tabular-nums text-zinc-500">
                z = {ci.zCritical.toFixed(3)}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-zinc-500">
                  Selang Kepercayaan
                </p>
                <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
              </div>
              <p className="mt-1.5 font-mono text-sm font-semibold tabular-nums text-zinc-950">
                [{lowerPct.toFixed(1)}%, {upperPct.toFixed(1)}%]
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">
                Target: {effectiveTarget || '-'}
              </p>
            </div>
          </div>

          {/* Visualisasi Rentang Interval */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-950">
                Rentang Estimasi Populasi ({(ci.confidenceLevel * 100).toFixed(0)}% CI)
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                  ci.normalConditionMet
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-700'
                    : 'border-amber-200 bg-amber-50/70 text-amber-700'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    ci.normalConditionMet ? 'bg-emerald-600' : 'bg-[#F97316]'
                  }`}
                />
                {ci.normalConditionMet
                  ? `Syarat Normal Terpenuhi (np̂=${ci.np.toFixed(1)}, nq̂=${ci.nq.toFixed(1)})`
                  : `Syarat Normal Belum Terpenuhi (np̂=${ci.np.toFixed(1)}, nq̂=${ci.nq.toFixed(1)})`}
              </span>
            </div>

            <div className="mt-6 px-2">
              <div className="relative h-2.5 w-full rounded-full bg-zinc-100">
                <div
                  className="absolute top-0 h-full rounded-full bg-zinc-900"
                  style={{
                    left: `${lowerPct}%`,
                    width: `${Math.max(1, upperPct - lowerPct)}%`,
                  }}
                />
                <div
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#F97316]"
                  style={{ left: `${pHatPct}%` }}
                  title={`p̂ = ${pHatPct.toFixed(2)}%`}
                />
              </div>

              <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-zinc-400">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-zinc-200/80 bg-[#FAFAFA] p-3.5 text-xs leading-relaxed text-zinc-700">
              {ci.interpretation}
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Perbandingan Seluruh Kategori */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-zinc-950">
            Perbandingan Selang Kepercayaan Seluruh Kelas
          </h3>
          <span className="font-mono text-xs tabular-nums text-zinc-500">
            CL = {(confidenceLevel * 100).toFixed(0)}%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-medium text-zinc-500">
              <tr>
                <th className="px-5 py-2.5">Nilai Target</th>
                <th className="px-4 py-2.5 text-right">x / n</th>
                <th className="px-4 py-2.5 text-right">p̂ (%)</th>
                <th className="px-4 py-2.5 text-right">Margin of Error</th>
                <th className="px-4 py-2.5 text-right">Batas Bawah</th>
                <th className="px-4 py-2.5 text-right">Batas Atas</th>
                <th className="px-5 py-2.5 text-right">Syarat Normal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {allComparison.map((row) => {
                const isSelected = row.targetValue === effectiveTarget;
                return (
                  <tr
                    key={row.targetValue}
                    onClick={() => setTargetValue(row.targetValue)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-orange-50/40' : 'hover:bg-zinc-50/70'
                    }`}
                  >
                    <td className="px-5 py-2.5 font-medium text-zinc-900">
                      <span className="inline-flex items-center gap-2">
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
                        )}
                        <span>{row.targetValue}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-600">
                      {row.x} / {row.n}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-900">
                      {(row.pHat * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-600">
                      ±{(row.ME * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-600">
                      {(row.lowerBound * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-600">
                      {(row.upperBound * 100).toFixed(2)}%
                    </td>
                    <td className="px-5 py-2.5 text-right text-[11px]">
                      <span
                        className={
                          row.normalConditionMet ? 'text-emerald-700' : 'text-zinc-400'
                        }
                      >
                        {row.normalConditionMet ? 'Terpenuhi' : 'Belum (< 5)'}
                      </span>
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

export default ProportionView;
