import { useMemo, useState } from 'react';
import { calculateChiSquare } from '../../utils/statsEngine';
import MathFormula from '../MathFormula';

function ChiSquareView({ dataset = [], analysisConfig }) {
  const defaults = analysisConfig.defaults;
  const [rowField, setRowField] = useState(defaults.chiSquareRowField);
  const [colField, setColField] = useState(defaults.chiSquareColField);
  const [alpha, setAlpha] = useState(defaults.alpha);
  const [matrixMode, setMatrixMode] = useState('combined');
  const variableOptions = analysisConfig.variableOptions;
  const alphaOptions = analysisConfig.alphaOptions;

  const handleRowChange = (nextRow) => {
    if (nextRow === colField) {
      setColField(rowField);
    }
    setRowField(nextRow);
  };

  const handleColChange = (nextCol) => {
    if (nextCol === rowField) {
      setRowField(colField);
    }
    setColField(nextCol);
  };

  const chi = useMemo(
    () =>
      calculateChiSquare(
        dataset,
        rowField,
        colField,
        alpha,
        analysisConfig.domains
      ),
    [dataset, rowField, colField, alpha, analysisConfig.domains]
  );

  const rowLabelTitle =
    variableOptions.find((v) => v.value === rowField)?.label ?? rowField;
  const colLabelTitle =
    variableOptions.find((v) => v.value === colField)?.label ?? colField;

  return (
    <div className="space-y-5">
      {/* Bar Konfigurasi Variabel & Alpha */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-12">
        <div className="md:col-span-4">
          <label
            htmlFor="chi-row"
            className="mb-1.5 block text-xs font-medium text-zinc-700"
          >
            Variabel Baris (Row)
          </label>
          <select
            id="chi-row"
            value={rowField}
            onChange={(e) => handleRowChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
          >
            {variableOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <label
            htmlFor="chi-col"
            className="mb-1.5 block text-xs font-medium text-zinc-700"
          >
            Variabel Kolom (Column)
          </label>
          <select
            id="chi-col"
            value={colField}
            onChange={(e) => handleColChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
          >
            {variableOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <span className="mb-1.5 block text-xs font-medium text-zinc-700">
            Taraf Signifikansi (α)
          </span>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
            {alphaOptions.map((option) => {
              const val = option.value;
              const isActive = alpha === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAlpha(val)}
                  className={`cursor-pointer rounded-md py-1 font-mono text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {val.toFixed(2)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ringkasan Statistik Uji */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">χ² Hitung</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-zinc-950">
            {chi.chiSquareStat.toFixed(3)}
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-zinc-500">
            N = {chi.grandTotal} observasi
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">
            χ² Tabel (Kritis)
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-zinc-950">
            {chi.criticalValue !== null ? chi.criticalValue.toFixed(3) : '—'}
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-zinc-500">
            df = {chi.df} · α = {chi.alpha}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">p-Value</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-zinc-950">
            {chi.pValue.toFixed(4)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {chi.pValue < chi.alpha ? `p < ${chi.alpha}` : `p ≥ ${chi.alpha}`}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Keputusan Uji</p>
            <span
              className={`h-2 w-2 rounded-full ${
                chi.isSignificant ? 'bg-[#F97316]' : 'bg-zinc-400'
              }`}
            />
          </div>
          <p className="mt-2 text-base font-semibold text-zinc-950">
            {chi.isSignificant ? 'Tolak H₀ (Signifikan)' : 'Gagal Tolak H₀'}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {chi.isSignificant
              ? 'Ada asosiasi signifikan'
              : 'Tidak ada asosiasi cukup'}
          </p>
        </div>
      </div>

      {/* Kesimpulan & Rumus */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-8">
          <h2 className="text-sm font-semibold text-zinc-950">
            Kesimpulan Uji Hipotesis ({rowLabelTitle} vs {colLabelTitle})
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-zinc-700">
            {chi.conclusion}
          </p>
          {chi.assumptionWarning && (
            <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2 text-xs text-amber-800">
              {chi.assumptionWarning}
            </p>
          )}
        </div>

        <div className="flex flex-col justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-900 lg:col-span-4">
          <MathFormula
            latex={String.raw`\chi^2 = \sum_{i=1}^{r}\sum_{j=1}^{c} \frac{(O_{ij} - E_{ij})^2}{E_{ij}}`}
            displayMode
          />
          <p className="mt-2 text-center font-mono text-[11px] tabular-nums text-zinc-500">
            E_ij = (R_i × C_j) / N · df = (r−1)(c−1) = {chi.df}
          </p>
        </div>
      </div>

      {/* Tabel Kontingensi O_ij dan E_ij */}
      {chi.isValid && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-zinc-950">
              Tabel Kontingensi ({rowLabelTitle} × {colLabelTitle})
            </h3>

            <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-xs">
              {[
                { id: 'combined', label: 'O / E' },
                { id: 'observed', label: 'Observasi (O)' },
                { id: 'expected', label: 'Harapan (E)' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setMatrixMode(mode.id)}
                  className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    matrixMode === mode.id
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-medium text-zinc-500">
                <tr>
                  <th className="px-5 py-2.5">{rowLabelTitle}</th>
                  {chi.colLabels.map((col) => (
                    <th key={col} className="px-4 py-2.5 text-right">
                      {col}
                    </th>
                  ))}
                  <th className="bg-zinc-100/70 px-5 py-2.5 text-right font-semibold text-zinc-700">
                    Total Baris
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {chi.rowLabels.map((rLabel, i) => (
                  <tr key={rLabel} className="hover:bg-zinc-50/60">
                    <td className="px-5 py-3 font-medium text-zinc-900">
                      {rLabel}
                    </td>
                    {chi.colLabels.map((cLabel, j) => {
                      const obs = chi.observedMatrix[i][j];
                      const exp = chi.expectedMatrix[i][j];
                      return (
                        <td
                          key={cLabel}
                          className="px-4 py-3 text-right font-mono tabular-nums"
                        >
                          {matrixMode === 'observed' && (
                            <span className="font-medium text-zinc-900">{obs}</span>
                          )}
                          {matrixMode === 'expected' && (
                            <span className="text-zinc-600">{exp.toFixed(2)}</span>
                          )}
                          {matrixMode === 'combined' && (
                            <div className="leading-tight">
                              <span className="block font-medium text-zinc-900">
                                {obs}
                              </span>
                              <span className="block text-[10px] text-zinc-400">
                                E: {exp.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="bg-zinc-50/80 px-5 py-3 text-right font-mono font-medium tabular-nums text-zinc-900">
                      {chi.rowTotals[i]}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-zinc-200 bg-zinc-50 font-mono text-xs font-medium tabular-nums text-zinc-800">
                <tr>
                  <td className="px-5 py-2.5 font-sans text-zinc-700">Total Kolom</td>
                  {chi.colTotals.map((total, idx) => (
                    <td key={idx} className="px-4 py-2.5 text-right">
                      {total}
                    </td>
                  ))}
                  <td className="bg-zinc-100 px-5 py-2.5 text-right font-semibold text-zinc-950">
                    {chi.grandTotal}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChiSquareView;
