import test from 'node:test';
import assert from 'node:assert/strict';
import defaultDataset, {
  VALID_ANGKATAN,
  VALID_KATEGORI,
  VALID_PRODI,
  VALID_STATUS,
  VALID_URGENSI,
} from '../scripts/seed-data/defaultDataset.js';
import { analysisConfig, csvTemplateConfig } from '../scripts/seed-data/appConfig.js';
import {
  normalizeAnalysisConfig,
  validateAnalysisConfig,
} from '../src/config/analysisDefaults.js';
import {
  generateCSVTemplate,
  parseAspirasiCSV,
} from '../src/utils/csvHelper.js';

test('defaultDataset berisi tepat 90 entri realistis 12 minggu (Sep–Nov 2026)', () => {
  assert.equal(defaultDataset.length, 90);

  const weeklyCounts = new Map();
  for (const row of defaultDataset) {
    assert.ok(row.id);
    assert.match(row.tanggal, /^2026-(09|10|11)-\d{2}$/);
    assert.ok(Number.isInteger(row.minggu_ke) && row.minggu_ke >= 1 && row.minggu_ke <= 12);
    assert.ok(VALID_PRODI.includes(row.prodi), `Prodi tidak valid: ${row.prodi}`);
    assert.ok(VALID_ANGKATAN.includes(row.angkatan), `Angkatan tidak valid: ${row.angkatan}`);
    assert.ok(VALID_KATEGORI.includes(row.kategori), `Kategori tidak valid: ${row.kategori}`);
    assert.ok(VALID_URGENSI.includes(row.urgensi), `Urgensi tidak valid: ${row.urgensi}`);
    assert.ok(VALID_STATUS.includes(row.status), `Status tidak valid: ${row.status}`);

    if (row.status === 'Belum Diproses') {
      assert.equal(row.durasi_hari, null);
    } else {
      assert.ok(
        Number.isInteger(row.durasi_hari) && row.durasi_hari >= 1 && row.durasi_hari <= 20,
        `durasi_hari harus 1..20, ditemukan: ${row.durasi_hari}`
      );
    }

    weeklyCounts.set(row.minggu_ke, (weeklyCounts.get(row.minggu_ke) ?? 0) + 1);
  }

  assert.equal(weeklyCounts.size, 12);
  // Cek lonjakan KRS (minggu 2) dan UTS (minggu 8-9)
  assert.ok(weeklyCounts.get(2) > weeklyCounts.get(3));
  assert.ok(weeklyCounts.get(8) >= 10);
  assert.ok(weeklyCounts.get(9) >= 10);
});

test('seed app_config memenuhi kontrak runtime Firestore', () => {
  const normalized = normalizeAnalysisConfig(analysisConfig);
  assert.doesNotThrow(() => validateAnalysisConfig(normalized));
  assert.equal(normalized.defaults.proportionTarget, 'Fasilitas Kampus');
  assert.equal(normalized.semantics.pendingStatus, 'Belum Diproses');
  assert.ok(
    csvTemplateConfig.requiredColumns.every((column) =>
      csvTemplateConfig.columns.includes(column)
    )
  );
});

test('parseAspirasiCSV mendukung delimiter koma dan otomatis menghitung minggu_ke', async () => {
  const csv = [
    'tanggal,prodi,angkatan,kategori,urgensi,status,durasi_hari',
    '2026-09-01,RPL,2024,Akademik & Perkuliahan,Tinggi,Selesai,3',
    '2026-09-08,PGSD,2023,Fasilitas Kampus,Sedang,Dalam Proses,7',
    '2026-09-22,Tekkom,2025,UKT & Keuangan,Tinggi,Belum Diproses,',
  ].join('\n');

  const result = await parseAspirasiCSV(csv, {
    domains: analysisConfig.domains,
    requiredColumns: csvTemplateConfig.requiredColumns,
    pendingStatus: analysisConfig.semantics.pendingStatus,
  });
  assert.equal(result.success, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.meta.delimiter, ',');
  assert.equal(result.meta.autoCalculatedWeeks, true);
  assert.equal(result.data.length, 3);
  assert.equal(result.data[0].minggu_ke, 1);
  assert.equal(result.data[1].minggu_ke, 2);
  assert.equal(result.data[2].minggu_ke, 4);
  assert.equal(result.data[2].durasi_hari, null);
});

test('parseAspirasiCSV mendukung delimiter titik koma (;), BOM UTF-8, dan File/Blob', async () => {
  const csvWithBom =
    '\uFEFFTanggal;Prodi;Angkatan;Kategori;Urgensi;Status;Durasi Hari\r\n' +
    '2026-09-03;multimedia;2024;fasilitas kampus;tinggi;selesai;5\r\n' +
    '2026-09-10;pgpaud;2025;kemahasiswaan;rendah;belum diproses;9\r\n';

  const fakeFile = {
    text: async () => csvWithBom,
  };

  const result = await parseAspirasiCSV(fakeFile, {
    domains: analysisConfig.domains,
    requiredColumns: csvTemplateConfig.requiredColumns,
    pendingStatus: analysisConfig.semantics.pendingStatus,
  });
  assert.equal(result.success, true);
  assert.equal(result.meta.delimiter, ';');
  assert.equal(result.data[0].prodi, 'Multimedia');
  assert.equal(result.data[0].kategori, 'Fasilitas Kampus');
  assert.equal(result.data[0].urgensi, 'Tinggi');
  assert.equal(result.data[0].status, 'Selesai');
  assert.equal(result.data[0].durasi_hari, 5);
  assert.equal(result.data[1].status, 'Belum Diproses');
  assert.equal(result.data[1].durasi_hari, null);
});

test('parseAspirasiCSV menolak CSV yang kehilangan kolom wajib atau memiliki tanggal tidak valid', async () => {
  const missingColCsv = 'tanggal,prodi,kategori\n2026-09-01,RPL,Fasilitas Kampus';
  const resMissing = await parseAspirasiCSV(missingColCsv, {
    requiredColumns: csvTemplateConfig.requiredColumns,
  });
  assert.equal(resMissing.success, false);
  assert.deepEqual(resMissing.meta.missingColumns, ['angkatan', 'urgensi', 'status']);

  const badDateCsv =
    'tanggal,prodi,angkatan,kategori,urgensi,status\n' +
    '2026-02-30,RPL,2024,Fasilitas Kampus,Tinggi,Selesai';
  const resBadDate = await parseAspirasiCSV(badDateCsv, {
    requiredColumns: csvTemplateConfig.requiredColumns,
  });
  assert.equal(resBadDate.success, false);
  assert.ok(resBadDate.errors[0].includes('Format tanggal'));
});

test('generateCSVTemplate menghasilkan template valid yang dapat di-parse kembali', async () => {
  const templateCsv = generateCSVTemplate(csvTemplateConfig, ',');
  const parsed = await parseAspirasiCSV(templateCsv, {
    domains: analysisConfig.domains,
    requiredColumns: csvTemplateConfig.requiredColumns,
    pendingStatus: analysisConfig.semantics.pendingStatus,
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.length, 5);
});
