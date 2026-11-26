import {
  linearRegression,
  linearRegressionLine,
  max,
  mean,
  median,
  min,
  poissonDistribution,
  rSquared as computeRSquared,
  sampleCorrelation,
  sampleStandardDeviation,
} from 'simple-statistics';
import jstatPkg from 'jstat';

const jStat = jstatPkg?.jStat ?? jstatPkg;

function clamp(value, minVal, maxVal) {
  return Math.min(maxVal, Math.max(minVal, value));
}

function getWeekBounds(data) {
  const weeks = data
    .map((row) => Number(row?.minggu_ke))
    .filter((w) => Number.isInteger(w) && w >= 1);

  if (weeks.length === 0) {
    return { minWeek: 1, maxWeek: 0, totalWeeks: 0 };
  }

  const minWeek = min(weeks);
  const maxWeek = max(weeks);
  return {
    minWeek,
    maxWeek,
    totalWeeks: maxWeek - minWeek + 1,
  };
}

function sortDomainValues(values, field, domainOrder = {}) {
  const order = domainOrder[field];
  if (order) {
    const indexMap = new Map(order.map((item, idx) => [item, idx]));
    return [...values].sort((a, b) => {
      const idxA = indexMap.has(a) ? indexMap.get(a) : Number.MAX_SAFE_INTEGER;
      const idxB = indexMap.has(b) ? indexMap.get(b) : Number.MAX_SAFE_INTEGER;
      if (idxA !== idxB) return idxA - idxB;
      return String(a).localeCompare(String(b), 'id');
    });
  }

  if (field === 'minggu_ke' || field === 'angkatan') {
    return [...values].sort((a, b) => Number(a) - Number(b));
  }

  return [...values].sort((a, b) => String(a).localeCompare(String(b), 'id'));
}

function buildWeeklySeries(data, categoryFilter = 'ALL') {
  const { minWeek, maxWeek, totalWeeks } = getWeekBounds(data);
  if (totalWeeks === 0) {
    return { weeklyCounts: [], minWeek: 1, maxWeek: 0, totalWeeks: 0, filteredRows: [] };
  }

  const normalizedFilter = categoryFilter && categoryFilter !== 'ALL' ? categoryFilter : 'ALL';
  const filteredRows =
    normalizedFilter === 'ALL'
      ? data
      : data.filter((row) => String(row?.kategori ?? '') === normalizedFilter);

  const countByWeek = new Map();
  for (let w = minWeek; w <= maxWeek; w += 1) {
    countByWeek.set(w, 0);
  }

  for (const row of filteredRows) {
    const week = Number(row?.minggu_ke);
    if (Number.isInteger(week) && countByWeek.has(week)) {
      countByWeek.set(week, countByWeek.get(week) + 1);
    }
  }

  const weeklyCounts = Array.from(countByWeek.entries()).map(([minggu_ke, count]) => ({
    minggu_ke,
    count,
  }));

  return { weeklyCounts, minWeek, maxWeek, totalWeeks, filteredRows };
}

/**
 * Menghitung statistik deskriptif untuk variabel kategorikal (`field`) dan variabel numerik `durasi_hari`.
 *
 * Rumus Statistika Deskriptif:
 * 1. Frekuensi Absolut: f_i = jumlah kemunculan kategori ke-i
 * 2. Frekuensi Relatif (%): f_{r,i} = (f_i / N) * 100%, dengan N = total data valid
 * 3. Frekuensi Kumulatif: F_i = sum_{j=1..i} f_j (dan kumulatif relatif = sum_{j=1..i} f_{r,j})
 * 4. Modus: nilai/kategori dengan frekuensi absolut f_i terbesar
 * 5. Statistik Numerik `durasi_hari` (untuk entri yang memiliki durasi non-null):
 *    - Rata-rata (Mean): x_bar = (1 / n) * sum(x_i)
 *    - Median: nilai tengah setelah data diurutkan
 *    - Simpangan Baku Sampel (StdDev): s = sqrt( sum((x_i - x_bar)^2) / (n - 1) )
 *    - Minimum & Maksimum: min(x_i), max(x_i)
 *
 * @param {Array<Object>} data Dataset aspirasi mahasiswa
 * @param {string} field Nama field kategorikal (mis. 'kategori', 'prodi', 'urgensi', 'status', 'angkatan')
 * @returns {Object} Tabel distribusi frekuensi, modus, dan statistik numerik durasi_hari
 */
export function calculateDescriptive(data, field) {
  if (!Array.isArray(data)) {
    throw new TypeError('Parameter "data" harus berupa array.');
  }
  if (!field || typeof field !== 'string') {
    throw new TypeError('Parameter "field" harus berupa string nama kolom yang valid.');
  }

  const counts = new Map();
  let totalCount = 0;

  for (const row of data) {
    const rawVal = row?.[field];
    if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
      continue;
    }
    const key = String(rawVal);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    totalCount += 1;
  }

  const sortedEntries = Array.from(counts.entries()).sort((a, b) => {
    if (field === 'minggu_ke' || field === 'angkatan') {
      return Number(a[0]) - Number(b[0]);
    }
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0], 'id');
  });

  let runningCount = 0;
  const frequencies = sortedEntries.map(([value, count]) => {
    runningCount += count;
    const relativeFreq = totalCount > 0 ? (count / totalCount) * 100 : 0;
    const cumulativeFreq = totalCount > 0 ? (runningCount / totalCount) * 100 : 0;
    return {
      value,
      count,
      relativeFreq,
      cumulativeCount: runningCount,
      cumulativeFreq,
    };
  });

  let maxFreq = 0;
  for (const [, count] of sortedEntries) {
    if (count > maxFreq) maxFreq = count;
  }
  const modeValues = sortedEntries
    .filter(([, count]) => count === maxFreq && maxFreq > 0)
    .map(([val]) => val);

  const durations = data
    .map((row) => row?.durasi_hari)
    .filter((val) => typeof val === 'number' && Number.isFinite(val));

  let durasiStats;
  if (durations.length === 0) {
    durasiStats = {
      count: 0,
      mean: null,
      median: null,
      stdDev: null,
      min: null,
      max: null,
    };
  } else {
    durasiStats = {
      count: durations.length,
      mean: mean(durations),
      median: median(durations),
      stdDev: durations.length >= 2 ? sampleStandardDeviation(durations) : 0,
      min: min(durations),
      max: max(durations),
    };
  }

  return {
    field,
    totalCount,
    frequencies,
    mode: {
      values: modeValues,
      count: maxFreq,
      isMultimodal: modeValues.length > 1,
      label: modeValues.length > 0 ? modeValues.join(', ') : '-',
    },
    durasiStats,
  };
}

/**
 * Menghitung Selang Kepercayaan (Confidence Interval) untuk Proporsi Populasi menggunakan pendekatan Normal (Wald).
 *
 * Rumus Selang Kepercayaan Proporsi:
 * - Proporsi sampel: p_hat = x / n
 * - Tingkat signifikansi: alpha = 1 - confidenceLevel
 * - Nilai kritis Z: z_{alpha/2} = Phi^{-1}(1 - alpha / 2)
 * - Standard Error: SE = sqrt( p_hat * (1 - p_hat) / n )
 * - Margin of Error: ME = z_{alpha/2} * SE
 * - Selang Kepercayaan: [ max(0, p_hat - ME),  min(1, p_hat + ME) ]
 * - Syarat kecukupan pendekatan Normal: n * p_hat >= 5 dan n * (1 - p_hat) >= 5
 *
 * @param {Array<Object>} data Dataset aspirasi mahasiswa
 * @param {string} field Nama kolom yang dianalisis
 * @param {string | number} targetValue Nilai target proporsi yang diestimasi
 * @param {number} [confidenceLevel=0.95] Tingkat kepercayaan (mis. 0.90, 0.95, 0.99 atau 90, 95, 99)
 * @returns {Object} Hasil estimasi proporsi, SE, ME, batas bawah/atas, syarat normalitas, dan interpretasi
 */
export function calculateProportionCI(data, field, targetValue, confidenceLevel = 0.95) {
  if (!Array.isArray(data)) {
    throw new TypeError('Parameter "data" harus berupa array.');
  }

  let cl = Number(confidenceLevel);
  if (cl > 1 && cl < 100) {
    cl /= 100;
  }
  if (!Number.isFinite(cl) || cl <= 0 || cl >= 1) {
    throw new RangeError('Parameter "confidenceLevel" harus berada di antara 0 dan 1 (mis. 0.90, 0.95, 0.99).');
  }

  const validRows = data.filter(
    (row) => row?.[field] !== undefined && row?.[field] !== null && String(row[field]).trim() !== ''
  );

  const n = validRows.length;
  const targetStr = String(targetValue);
  const x = validRows.filter((row) => String(row[field]) === targetStr).length;

  const alpha = 1 - cl;
  const zCritical = jStat.normal.inv(1 - alpha / 2, 0, 1);

  if (n === 0) {
    return {
      field,
      targetValue: targetStr,
      confidenceLevel: cl,
      n: 0,
      x: 0,
      pHat: 0,
      zCritical,
      SE: 0,
      ME: 0,
      lowerBound: 0,
      upperBound: 0,
      np: 0,
      nq: 0,
      normalConditionMet: false,
      interpretation: 'Data tidak mencukupi (n = 0) untuk menghitung selang kepercayaan proporsi.',
    };
  }

  const pHat = x / n;
  const SE = Math.sqrt((pHat * (1 - pHat)) / n);
  const ME = zCritical * SE;
  const lowerBound = Math.max(0, pHat - ME);
  const upperBound = Math.min(1, pHat + ME);

  const np = n * pHat;
  const nq = n * (1 - pHat);
  const normalConditionMet = np >= 5 && nq >= 5;

  const clPct = (cl * 100).toFixed(0);
  const pHatPct = (pHat * 100).toFixed(2);
  const mePct = (ME * 100).toFixed(2);
  const lowerPct = (lowerBound * 100).toFixed(2);
  const upperPct = (upperBound * 100).toFixed(2);

  let interpretation = `Dengan tingkat kepercayaan ${clPct}%, proporsi sebenarnya untuk ${field} = "${targetStr}" pada populasi mahasiswa UPI Cibiru diperkirakan berada di antara ${lowerPct}% hingga ${upperPct}% (proporsi sampel p̂ = ${pHatPct}%, Margin of Error = ±${mePct}%).`;

  if (!normalConditionMet) {
    interpretation += ` Catatan: syarat aproksimasi normal belum terpenuhi sepenuhnya (np̂ = ${np.toFixed(1)}, n(1-p̂) = ${nq.toFixed(1)}; minimal keduanya ≥ 5).`;
  }

  return {
    field,
    targetValue: targetStr,
    confidenceLevel: cl,
    n,
    x,
    pHat,
    zCritical,
    SE,
    ME,
    lowerBound,
    upperBound,
    np,
    nq,
    normalConditionMet,
    interpretation,
  };
}

/**
 * Melakukan Uji Independensi Chi-Square (χ²) antara dua variabel kategorikal.
 *
 * Rumus Uji Chi-Square Independensi:
 * - Hipotesis:
 *   H0: Tidak terdapat hubungan/asosiasi antara variabel `rowField` dan `colField` (independen).
 *   H1: Terdapat hubungan/asosiasi yang signifikan antara variabel `rowField` dan `colField`.
 * - Frekuensi harapan: E_{ij} = (R_i * C_j) / N, dengan R_i total baris i, C_j total kolom j, N grand total.
 * - Statistik uji: χ²_hitung = sum_i sum_j [ (O_{ij} - E_{ij})² / E_{ij} ]
 * - Derajat bebas: df = (r - 1) * (c - 1)
 * - Nilai kritis: χ²_tabel = χ²_{alpha, df} (invers CDF distribusi Chi-Square pada 1 - alpha)
 * - p-value = P(χ²_df >= χ²_hitung) = 1 - CDF(χ²_hitung, df)
 * - Keputusan: Tolak H0 (signifikan) apabila p-value < alpha (ekuivalen χ²_hitung > χ²_tabel).
 *
 * @param {Array<Object>} data Dataset aspirasi mahasiswa
 * @param {string} rowField Nama variabel baris
 * @param {string} colField Nama variabel kolom
 * @param {number} [alpha=0.05] Taraf signifikansi (mis. 0.01, 0.05, 0.10)
 * @returns {Object} Matriks O_ij, matriks E_ij, statistik uji, df, nilai kritis, p-value, dan kesimpulan
 */
export function calculateChiSquare(
  data,
  rowField,
  colField,
  alpha = 0.05,
  domainOrder = {}
) {
  if (!Array.isArray(data)) {
    throw new TypeError('Parameter "data" harus berupa array.');
  }

  const alphaNum = Number(alpha);
  if (!Number.isFinite(alphaNum) || alphaNum <= 0 || alphaNum >= 1) {
    throw new RangeError('Parameter "alpha" harus berada di antara 0 dan 1 (mis. 0.05).');
  }

  if (!rowField || !colField || rowField === colField) {
    return {
      rowField,
      colField,
      alpha: alphaNum,
      rowLabels: [],
      colLabels: [],
      observedMatrix: [],
      expectedMatrix: [],
      rowTotals: [],
      colTotals: [],
      grandTotal: 0,
      chiSquareStat: 0,
      df: 0,
      criticalValue: null,
      pValue: 1,
      isSignificant: false,
      isValid: false,
      assumptionWarning: 'Pilih dua variabel kategorikal yang berbeda untuk uji Chi-Square.',
      conclusion: 'Uji Chi-Square memerlukan dua variabel kategorikal yang berbeda.',
    };
  }

  const validRows = data.filter((row) => {
    const rVal = row?.[rowField];
    const cVal = row?.[colField];
    return (
      rVal !== undefined &&
      rVal !== null &&
      String(rVal).trim() !== '' &&
      cVal !== undefined &&
      cVal !== null &&
      String(cVal).trim() !== ''
    );
  });

  const rowSet = new Set();
  const colSet = new Set();
  const cellCounts = new Map();

  for (const row of validRows) {
    const rKey = String(row[rowField]);
    const cKey = String(row[colField]);
    rowSet.add(rKey);
    colSet.add(cKey);
    const pairKey = `${rKey}\u0000${cKey}`;
    cellCounts.set(pairKey, (cellCounts.get(pairKey) ?? 0) + 1);
  }

  const rowLabels = sortDomainValues(rowSet, rowField, domainOrder);
  const colLabels = sortDomainValues(colSet, colField, domainOrder);

  const r = rowLabels.length;
  const c = colLabels.length;
  const grandTotal = validRows.length;

  if (grandTotal === 0 || r < 2 || c < 2) {
    return {
      rowField,
      colField,
      alpha: alphaNum,
      rowLabels,
      colLabels,
      observedMatrix: [],
      expectedMatrix: [],
      rowTotals: [],
      colTotals: [],
      grandTotal,
      chiSquareStat: 0,
      df: 0,
      criticalValue: null,
      pValue: 1,
      isSignificant: false,
      isValid: false,
      assumptionWarning: 'Tabel kontingensi membutuhkan minimal 2 kategori baris dan 2 kategori kolom.',
      conclusion: 'Data tidak memenuhi dimensi minimum tabel kontingensi (minimal 2x2).',
    };
  }

  const observedMatrix = rowLabels.map((rLabel) =>
    colLabels.map((cLabel) => cellCounts.get(`${rLabel}\u0000${cLabel}`) ?? 0)
  );

  const rowTotals = observedMatrix.map((rowArr) =>
    rowArr.reduce((acc, val) => acc + val, 0)
  );
  const colTotals = colLabels.map((_, j) =>
    observedMatrix.reduce((acc, rowArr) => acc + rowArr[j], 0)
  );

  const expectedMatrix = rowTotals.map((rTotal) =>
    colTotals.map((cTotal) => (rTotal * cTotal) / grandTotal)
  );

  let chiSquareStat = 0;
  let cellsBelow5Count = 0;
  let hasCellBelow1 = false;

  for (let i = 0; i < r; i += 1) {
    for (let j = 0; j < c; j += 1) {
      const o = observedMatrix[i][j];
      const e = expectedMatrix[i][j];
      if (e < 5) cellsBelow5Count += 1;
      if (e < 1) hasCellBelow1 = true;
      if (e > 0) {
        chiSquareStat += ((o - e) ** 2) / e;
      }
    }
  }

  const df = (r - 1) * (c - 1);
  const criticalValue = jStat.chisquare.inv(1 - alphaNum, df);
  const pValue = clamp(1 - jStat.chisquare.cdf(chiSquareStat, df), 0, 1);
  const isSignificant = pValue < alphaNum;

  const totalCells = r * c;
  const cellsBelow5Percent = (cellsBelow5Count / totalCells) * 100;
  let assumptionWarning = null;
  if (hasCellBelow1 || cellsBelow5Percent > 20) {
    assumptionWarning = `Peringatan syarat Cochran: ${cellsBelow5Count} dari ${totalCells} sel (${cellsBelow5Percent.toFixed(1)}%) memiliki frekuensi harapan E_ij < 5${hasCellBelow1 ? ' dan terdapat sel dengan E_ij < 1' : ''}. Hasil uji perlu diinterpretasikan secara hati-hati.`;
  }

  const conclusion = isSignificant
    ? `Tolak H₀ pada α = ${alphaNum} (χ² = ${chiSquareStat.toFixed(3)} > χ²_tabel = ${criticalValue.toFixed(3)}, df = ${df}, p-value = ${pValue.toFixed(4)} < ${alphaNum}). Terdapat hubungan yang signifikan secara statistik antara "${rowField}" dan "${colField}".`
    : `Gagal menolak H₀ pada α = ${alphaNum} (χ² = ${chiSquareStat.toFixed(3)} ≤ χ²_tabel = ${criticalValue.toFixed(3)}, df = ${df}, p-value = ${pValue.toFixed(4)} ≥ ${alphaNum}). Belum cukup bukti statistik untuk menyatakan adanya hubungan signifikan antara "${rowField}" dan "${colField}".`;

  return {
    rowField,
    colField,
    alpha: alphaNum,
    rowLabels,
    colLabels,
    observedMatrix,
    expectedMatrix,
    rowTotals,
    colTotals,
    grandTotal,
    chiSquareStat,
    df,
    criticalValue,
    pValue,
    isSignificant,
    isValid: true,
    cellsBelow5Count,
    cellsBelow5Percent,
    assumptionWarning,
    conclusion,
  };
}

/**
 * Menghitung Regresi Linear Sederhana pada jumlah aspirasi per minggu (`minggu_ke`)
 * dan memprediksi tren untuk `predictAhead` minggu ke depan.
 *
 * Rumus Regresi Linear Sederhana (Ordinary Least Squares):
 * - Model: y = a + b*x, dengan x = minggu_ke dan y = jumlah aspirasi mingguan
 * - Kemiringan (slope): b = sum((x_i - x_bar)(y_i - y_bar)) / sum((x_i - x_bar)²)
 * - Intersep (intercept): a = y_bar - b * x_bar
 *   (Catatan: pada `simple-statistics`, `linearRegression()` mengembalikan `{ m: slope, b: intercept }`)
 * - Koefisien Korelasi Pearson (r): r = Cov(x, y) / (s_x * s_y)
 * - Koefisien Determinasi (R²): R² = 1 - SSE / SST
 *
 * @param {Array<Object>} data Dataset aspirasi mahasiswa
 * @param {string} [categoryFilter='ALL'] Filter kategori ('ALL' atau nama kategori spesifik)
 * @param {number} [predictAhead=3] Jumlah minggu ke depan yang diprediksi
 * @returns {Object} Persamaan regresi, slope (b), intercept (a), r, rSquared, data mingguan, dan titik prediksi
 */
export function calculateLinearRegression(data, categoryFilter = 'ALL', predictAhead = 3) {
  if (!Array.isArray(data)) {
    throw new TypeError('Parameter "data" harus berupa array.');
  }

  const aheadCount = Math.max(0, Math.floor(Number(predictAhead) || 0));
  const { weeklyCounts, maxWeek } = buildWeeklySeries(data, categoryFilter);

  if (weeklyCounts.length === 0) {
    return {
      categoryFilter,
      equation: 'y = 0.00 + 0.00x',
      slope: 0,
      intercept: 0,
      r: 0,
      rSquared: 0,
      weeklyData: [],
      predictions: [],
      trendDirection: 'stabil',
      interpretation: 'Belum ada data mingguan untuk menghitung regresi linear.',
    };
  }

  const points = weeklyCounts.map((item) => [item.minggu_ke, item.count]);
  const xValues = weeklyCounts.map((item) => item.minggu_ke);
  const yValues = weeklyCounts.map((item) => item.count);

  // `simple-statistics` menamai kemiringan sebagai `m` dan titik potong sumbu Y sebagai `b`.
  const { m: slope, b: intercept } = linearRegression(points);
  const lineFn = linearRegressionLine({ m: slope, b: intercept });

  const hasXVariance = new Set(xValues).size > 1;
  const hasYVariance = new Set(yValues).size > 1;

  let r = 0;
  let rSquared = 0;
  if (points.length >= 2 && hasXVariance && hasYVariance) {
    r = clamp(sampleCorrelation(xValues, yValues), -1, 1);
    rSquared = clamp(computeRSquared(points, lineFn), 0, 1);
  }

  const weeklyData = weeklyCounts.map((item) => ({
    minggu_ke: item.minggu_ke,
    actual: item.count,
    fitted: lineFn(item.minggu_ke),
  }));

  const predictions = [];
  for (let i = 1; i <= aheadCount; i += 1) {
    const targetWeek = maxWeek + i;
    const rawPredicted = lineFn(targetWeek);
    predictions.push({
      minggu_ke: targetWeek,
      predicted: Math.max(0, rawPredicted),
      rawPredicted,
    });
  }

  const sign = slope >= 0 ? '+' : '-';
  const equation = `y = ${intercept.toFixed(2)} ${sign} ${Math.abs(slope).toFixed(2)}x`;

  let trendDirection = 'stabil';
  if (slope > 0.05) trendDirection = 'naik';
  else if (slope < -0.05) trendDirection = 'turun';

  const labelScope =
    categoryFilter === 'ALL' ? 'seluruh kategori' : `kategori "${categoryFilter}"`;
  const interpretation = `Tren jumlah aspirasi mingguan untuk ${labelScope} mengikuti persamaan ${equation} dengan korelasi r = ${r.toFixed(3)} dan koefisien determinasi R² = ${(rSquared * 100).toFixed(1)}%. Secara rata-rata, volume aspirasi ${trendDirection === 'naik' ? `meningkat sebesar ${slope.toFixed(2)}` : trendDirection === 'turun' ? `menurun sebesar ${Math.abs(slope).toFixed(2)}` : 'relatif stabil sekitar 0'} aspirasi per minggu.`;

  return {
    categoryFilter,
    equation,
    slope,
    intercept,
    r,
    rSquared,
    weeklyData,
    predictions,
    trendDirection,
    interpretation,
  };
}

/**
 * Menghitung probabilitas kedatangan aspirasi mingguan menggunakan Distribusi Poisson.
 *
 * Rumus Distribusi Poisson:
 * - Laju kedatangan rata-rata mingguan: lambda = Total Aspirasi / Jumlah Minggu Pengamatan
 * - Fungsi Massa Probabilitas (PMF): P(X = k) = (e^{-lambda} * lambda^k) / k!
 * - Probabilitas Kumulatif:
 *   P(X <= x) = sum_{k=0..x} P(X = k)
 *   P(X >= x) = 1 - P(X <= x - 1), dengan P(X >= 0) = 1
 *
 * @param {Array<Object>} data Dataset aspirasi mahasiswa
 * @param {number} targetX Jumlah target kedatangan aspirasi dalam satu minggu (x >= 0)
 * @param {string} [categoryFilter='ALL'] Filter kategori ('ALL' atau nama kategori spesifik)
 * @returns {Object} Parameter lambda, P(X=x), P(X>=x), P(X<=x), dan distribusi PMF untuk k=0..k_max
 */
export function calculatePoisson(data, targetX, categoryFilter = 'ALL') {
  if (!Array.isArray(data)) {
    throw new TypeError('Parameter "data" harus berupa array.');
  }

  const x = Math.max(0, Math.floor(Number(targetX) || 0));
  const { totalWeeks, filteredRows } = buildWeeklySeries(data, categoryFilter);
  const totalCount = filteredRows.length;
  const lambda = totalWeeks > 0 ? totalCount / totalWeeks : 0;

  if (totalWeeks === 0) {
    return {
      categoryFilter,
      targetX: x,
      totalCount: 0,
      totalWeeks: 0,
      lambda: 0,
      pExact: 0,
      pAtLeast: 0,
      pAtMost: 0,
      kMax: 0,
      pmfDistribution: [],
      interpretation: 'Belum ada data mingguan untuk memodelkan distribusi Poisson.',
    };
  }

  if (lambda === 0) {
    const kMax = Math.max(x + 2, 10);
    const pmfDistribution = [];
    for (let k = 0; k <= kMax; k += 1) {
      pmfDistribution.push({
        k,
        probability: k === 0 ? 1 : 0,
        cumulativeProbability: 1,
        isTarget: k === x,
      });
    }
    return {
      categoryFilter,
      targetX: x,
      totalCount: 0,
      totalWeeks,
      lambda: 0,
      pExact: x === 0 ? 1 : 0,
      pAtLeast: x === 0 ? 1 : 0,
      pAtMost: 1,
      kMax,
      pmfDistribution,
      interpretation: `Rata-rata kedatangan mingguan λ = 0.00 pada kategori "${categoryFilter}", sehingga peluang terjadinya tepat ${x} aspirasi adalah ${x === 0 ? '100.00%' : '0.00%'}.`,
    };
  }

  const pExact = clamp(jStat.poisson.pdf(x, lambda), 0, 1);
  const pAtMost = clamp(jStat.poisson.cdf(x, lambda), 0, 1);
  const pAtLeast = x === 0 ? 1 : clamp(1 - jStat.poisson.cdf(x - 1, lambda), 0, 1);

  const ssTable = poissonDistribution(lambda);
  const naturalKMax = Array.isArray(ssTable)
    ? ssTable.length - 1
    : Math.ceil(lambda + 4 * Math.sqrt(lambda));
  const kMax = Math.min(200, Math.max(naturalKMax, x + 2, 12));

  const pmfDistribution = [];
  for (let k = 0; k <= kMax; k += 1) {
    const probability =
      Array.isArray(ssTable) && k < ssTable.length
        ? ssTable[k]
        : clamp(jStat.poisson.pdf(k, lambda), 0, 1);
    const cumulativeProbability = clamp(jStat.poisson.cdf(k, lambda), 0, 1);
    pmfDistribution.push({
      k,
      probability,
      cumulativeProbability,
      isTarget: k === x,
    });
  }

  const labelScope =
    categoryFilter === 'ALL' ? 'seluruh kategori' : `kategori "${categoryFilter}"`;
  const interpretation = `Dengan laju kedatangan rata-rata λ = ${lambda.toFixed(2)} aspirasi/minggu (${labelScope}), peluang munculnya tepat ${x} aspirasi dalam seminggu adalah ${(pExact * 100).toFixed(2)}%, peluang minimal ${x} aspirasi P(X ≥ ${x}) adalah ${(pAtLeast * 100).toFixed(2)}%, dan peluang maksimal ${x} aspirasi P(X ≤ ${x}) adalah ${(pAtMost * 100).toFixed(2)}%.`;

  return {
    categoryFilter,
    targetX: x,
    totalCount,
    totalWeeks,
    lambda,
    pExact,
    pAtLeast,
    pAtMost,
    kMax,
    pmfDistribution,
    interpretation,
  };
}
