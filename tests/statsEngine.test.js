import test from 'node:test';
import assert from 'node:assert/strict';
import defaultDataset from '../scripts/seed-data/defaultDataset.js';
import {
  calculateChiSquare,
  calculateDescriptive,
  calculateLinearRegression,
  calculatePoisson,
  calculateProportionCI,
} from '../src/utils/statsEngine.js';

function assertClose(actual, expected, tolerance = 1e-4, label = '') {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected} ± ${tolerance}, got ${actual}`
  );
}

test('calculateDescriptive menghitung frekuensi, modus, dan statistik durasi_hari secara akurat', () => {
  const sample = [
    { kategori: 'A', durasi_hari: 2 },
    { kategori: 'A', durasi_hari: 4 },
    { kategori: 'B', durasi_hari: 6 },
    { kategori: 'C', durasi_hari: null },
    { kategori: 'A', durasi_hari: 8 },
  ];

  const res = calculateDescriptive(sample, 'kategori');
  assert.equal(res.totalCount, 5);
  assert.equal(res.frequencies[0].value, 'A');
  assert.equal(res.frequencies[0].count, 3);
  assertClose(res.frequencies[0].relativeFreq, 60, 1e-6);
  assert.equal(res.frequencies[0].cumulativeCount, 3);
  assertClose(res.frequencies[2].cumulativeFreq, 100, 1e-6);
  assert.deepEqual(res.mode.values, ['A']);

  assert.equal(res.durasiStats.count, 4);
  assertClose(res.durasiStats.mean, 5, 1e-6);
  assertClose(res.durasiStats.median, 5, 1e-6);
  assertClose(res.durasiStats.stdDev, Math.sqrt(20 / 3), 1e-6);
  assert.equal(res.durasiStats.min, 2);
  assert.equal(res.durasiStats.max, 8);

  const fullDesc = calculateDescriptive(defaultDataset, 'kategori');
  assert.equal(fullDesc.totalCount, 90);
  assert.ok(fullDesc.durasiStats.count > 0 && fullDesc.durasiStats.count < 90);
});

test('calculateProportionCI menghitung pHat, SE, ME, batas kepercayaan, dan kondisi normalitas', () => {
  const sample = [
    ...Array.from({ length: 40 }, () => ({ kategori: 'Fasilitas Kampus' })),
    ...Array.from({ length: 60 }, () => ({ kategori: 'Lainnya' })),
  ];

  const ci = calculateProportionCI(sample, 'kategori', 'Fasilitas Kampus', 0.95);
  assert.equal(ci.n, 100);
  assert.equal(ci.x, 40);
  assertClose(ci.pHat, 0.4, 1e-6);
  assertClose(ci.SE, Math.sqrt(0.24 / 100), 1e-6);
  assertClose(ci.zCritical, 1.959964, 1e-5);
  assertClose(ci.ME, ci.zCritical * ci.SE, 1e-6);
  assertClose(ci.lowerBound, 0.4 - ci.ME, 1e-6);
  assertClose(ci.upperBound, 0.4 + ci.ME, 1e-6);
  assert.equal(ci.normalConditionMet, true);
  assert.ok(ci.interpretation.includes('95%'));

  // Uji syarat normalitas tidak terpenuhi (x = 3 < 5)
  const smallSample = [
    ...Array.from({ length: 3 }, () => ({ kategori: 'Target' })),
    ...Array.from({ length: 27 }, () => ({ kategori: 'Lain' })),
  ];
  const ciSmall = calculateProportionCI(smallSample, 'kategori', 'Target', 0.95);
  assert.equal(ciSmall.normalConditionMet, false);
});

test('calculateChiSquare menghitung matriks O_ij, E_ij, chiSquareStat, df, criticalValue, dan pValue', () => {
  const dependentData = [
    ...Array.from({ length: 30 }, () => ({ a: 'X1', b: 'Y1' })),
    ...Array.from({ length: 10 }, () => ({ a: 'X1', b: 'Y2' })),
    ...Array.from({ length: 10 }, () => ({ a: 'X2', b: 'Y1' })),
    ...Array.from({ length: 30 }, () => ({ a: 'X2', b: 'Y2' })),
  ];

  const res = calculateChiSquare(dependentData, 'a', 'b', 0.05);
  assert.equal(res.isValid, true);
  assert.deepEqual(res.observedMatrix, [
    [30, 10],
    [10, 30],
  ]);
  assert.deepEqual(res.expectedMatrix, [
    [20, 20],
    [20, 20],
  ]);
  assertClose(res.chiSquareStat, 20, 1e-6);
  assert.equal(res.df, 1);
  assertClose(res.criticalValue, 3.841459, 1e-4);
  assert.ok(res.pValue < 0.0001);
  assert.equal(res.isSignificant, true);

  const fullChi = calculateChiSquare(defaultDataset, 'kategori', 'urgensi', 0.05);
  assert.equal(fullChi.isValid, true);
  assert.equal(fullChi.grandTotal, 90);
  assert.equal(fullChi.df, 8);
});

test('calculateLinearRegression menghitung slope, intercept, r, rSquared, dan prediksi ke depan', () => {
  const exactLineData = [
    ...Array.from({ length: 5 }, () => ({ minggu_ke: 1, kategori: 'A' })),
    ...Array.from({ length: 8 }, () => ({ minggu_ke: 2, kategori: 'A' })),
    ...Array.from({ length: 11 }, () => ({ minggu_ke: 3, kategori: 'A' })),
  ];

  const resExact = calculateLinearRegression(exactLineData, 'ALL', 3);
  assertClose(resExact.slope, 3, 1e-6);
  assertClose(resExact.intercept, 2, 1e-6);
  assertClose(resExact.r, 1, 1e-6);
  assertClose(resExact.rSquared, 1, 1e-6);
  assert.equal(resExact.predictions.length, 3);
  assert.equal(resExact.predictions[0].minggu_ke, 4);
  assertClose(resExact.predictions[0].predicted, 14, 1e-6);
  assertClose(resExact.predictions[2].predicted, 20, 1e-6);

  // Pastikan minggu bernilai 0 tetap terhitung saat difilter per kategori
  const sparseData = [
    { minggu_ke: 1, kategori: 'A' },
    { minggu_ke: 2, kategori: 'B' },
    { minggu_ke: 3, kategori: 'A' },
  ];
  const resSparse = calculateLinearRegression(sparseData, 'A', 2);
  assert.equal(resSparse.weeklyData.length, 3);
  assert.equal(resSparse.weeklyData[1].actual, 0);

  // Dataset utama (12 minggu, slope ~ +0.2937, r ~ +0.5774)
  const fullReg = calculateLinearRegression(defaultDataset, 'ALL', 3);
  assert.equal(fullReg.weeklyData.length, 12);
  assert.ok(fullReg.slope > 0.25);
  assert.ok(fullReg.r > 0.5);
  assert.deepEqual(
    fullReg.predictions.map((p) => p.minggu_ke),
    [13, 14, 15]
  );
});

test('calculatePoisson menghitung lambda, P(X=x), P(X>=x), P(X<=x), dan distribusi PMF', () => {
  // 3 minggu dengan total 9 kejadian -> lambda = 3.0
  const data = [
    { minggu_ke: 1, kategori: 'A' },
    { minggu_ke: 1, kategori: 'A' },
    { minggu_ke: 1, kategori: 'A' },
    { minggu_ke: 2, kategori: 'A' },
    { minggu_ke: 2, kategori: 'A' },
    { minggu_ke: 2, kategori: 'A' },
    { minggu_ke: 3, kategori: 'A' },
    { minggu_ke: 3, kategori: 'A' },
    { minggu_ke: 3, kategori: 'A' },
  ];

  const res = calculatePoisson(data, 2, 'ALL');
  assertClose(res.lambda, 3, 1e-6);
  // P(X=2 | lambda=3) = e^-3 * 9 / 2 = 0.2240418
  assertClose(res.pExact, 0.2240418, 1e-5);
  // P(X<=2 | lambda=3) = e^-3 * (1 + 3 + 4.5) = 0.4231901
  assertClose(res.pAtMost, 0.4231901, 1e-5);
  // P(X>=2 | lambda=3) = 1 - P(X<=1) = 1 - 4*e^-3 = 0.8008517
  assertClose(res.pAtLeast, 0.8008517, 1e-5);
  assert.equal(res.pmfDistribution[0].k, 0);
  assert.equal(res.pmfDistribution[2].isTarget, true);

  const fullPoisson = calculatePoisson(defaultDataset, 8, 'ALL');
  assertClose(fullPoisson.lambda, 7.5, 1e-6);
  assert.equal(fullPoisson.totalWeeks, 12);
});
