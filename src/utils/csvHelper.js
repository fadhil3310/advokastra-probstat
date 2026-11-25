import PapaModule from 'papaparse';
import {
  VALID_KATEGORI,
  VALID_PRODI,
  VALID_STATUS,
  VALID_URGENSI,
} from '../data/defaultDataset.js';

const Papa = PapaModule?.default ?? PapaModule;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const REQUIRED_COLUMNS = [
  'tanggal',
  'prodi',
  'angkatan',
  'kategori',
  'urgensi',
  'status',
];

export const TEMPLATE_COLUMNS = [
  'id',
  'tanggal',
  'minggu_ke',
  'prodi',
  'angkatan',
  'kategori',
  'urgensi',
  'status',
  'durasi_hari',
];

export const TEMPLATE_FILENAME = 'template_aspirasi_advokastra.csv';

const TEMPLATE_SAMPLE_ROWS = [
  {
    id: 'ASP-001',
    tanggal: '2026-09-01',
    minggu_ke: 1,
    prodi: 'RPL',
    angkatan: '2024',
    kategori: 'Akademik & Perkuliahan',
    urgensi: 'Tinggi',
    status: 'Selesai',
    durasi_hari: 3,
  },
  {
    id: 'ASP-002',
    tanggal: '2026-09-04',
    minggu_ke: 1,
    prodi: 'PGSD',
    angkatan: '2023',
    kategori: 'Fasilitas Kampus',
    urgensi: 'Sedang',
    status: 'Selesai',
    durasi_hari: 8,
  },
  {
    id: 'ASP-003',
    tanggal: '2026-09-08',
    minggu_ke: 2,
    prodi: 'Tekkom',
    angkatan: '2025',
    kategori: 'UKT & Keuangan',
    urgensi: 'Tinggi',
    status: 'Dalam Proses',
    durasi_hari: 10,
  },
  {
    id: 'ASP-004',
    tanggal: '2026-09-12',
    minggu_ke: 2,
    prodi: 'Multimedia',
    angkatan: '2024',
    kategori: 'Layanan Administrasi',
    urgensi: 'Rendah',
    status: 'Selesai',
    durasi_hari: 4,
  },
  {
    id: 'ASP-005',
    tanggal: '2026-09-16',
    minggu_ke: 3,
    prodi: 'PGPAUD',
    angkatan: '2025',
    kategori: 'Kemahasiswaan',
    urgensi: 'Rendah',
    status: 'Belum Diproses',
    durasi_hari: '',
  },
];

// Peta normalisasi huruf besar/kecil agar nilai konsisten dengan skema aplikasi
const PRODI_LOOKUP = new Map(VALID_PRODI.map((v) => [v.toLowerCase(), v]));
const KATEGORI_LOOKUP = new Map(VALID_KATEGORI.map((v) => [v.toLowerCase(), v]));
const URGENSI_LOOKUP = new Map(VALID_URGENSI.map((v) => [v.toLowerCase(), v]));
const STATUS_LOOKUP = new Map(VALID_STATUS.map((v) => [v.toLowerCase(), v]));

/**
 * Mendeteksi delimiter CSV (`,` atau `;`) dari baris header pertama di luar tanda kutip.
 * @param {string} csvText
 * @returns {string}
 */
export function detectCsvDelimiter(csvText) {
  if (typeof csvText !== 'string' || !csvText.trim()) return ',';

  const firstLine = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .find((line) => line.trim().length > 0);

  if (!firstLine) return ',';

  let commaCount = 0;
  let semicolonCount = 0;
  let inQuotes = false;

  for (let i = 0; i < firstLine.length; i += 1) {
    const ch = firstLine[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes) {
      if (ch === ',') commaCount += 1;
      if (ch === ';') semicolonCount += 1;
    }
  }

  if (semicolonCount > commaCount) return ';';
  if (commaCount > 0) return ',';
  return '';
}

/**
 * Memvalidasi dan menormalkan string tanggal ke format `YYYY-MM-DD` serta mengembalikan timestamp UTC.
 * Mendukung `YYYY-MM-DD`, `YYYY/MM/DD`, `DD/MM/YYYY`, dan `DD-MM-YYYY`.
 * @param {string} rawDate
 * @returns {{ iso: string, timestamp: number } | null}
 */
function parseNormalizedDate(rawDate) {
  const value = String(rawDate ?? '').trim();
  if (!value) return null;

  let year;
  let month;
  let day;

  const isoMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(value);
  const idMatch = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(value);

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else if (idMatch) {
    day = Number(idMatch[1]);
    month = Number(idMatch[2]);
    year = Number(idMatch[3]);
  } else {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
    return null;
  }

  const utcTime = Date.UTC(year, month - 1, day);
  const check = new Date(utcTime);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return {
    iso: `${year}-${mm}-${dd}`,
    timestamp: utcTime,
  };
}

/**
 * Membaca teks dari File/Blob atau string langsung.
 * @param {File | Blob | string} input
 * @returns {Promise<string>}
 */
async function readCsvInput(input) {
  if (typeof input === 'string') {
    return input;
  }
  if (input && typeof input.text === 'function') {
    return input.text();
  }
  if (typeof FileReader !== 'undefined' && input instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Gagal membaca file CSV.'));
      reader.readAsText(input, 'UTF-8');
    });
  }
  throw new Error('Input CSV tidak valid. Harap unggah file .csv atau teks CSV.');
}

function canonicalizeValue(raw, lookupMap) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return '';
  return lookupMap.get(trimmed.toLowerCase()) ?? trimmed;
}

/**
 * Mem-parse file atau teks CSV aspirasi mahasiswa menggunakan PapaParse.
 * - Mendukung delimiter `,` dan `;`
 * - Memvalidasi kolom wajib: `tanggal`, `prodi`, `angkatan`, `kategori`, `urgensi`, `status`
 * - Otomatis menghitung `minggu_ke` berdasarkan selisih 7 hari dari tanggal paling awal jika tidak tersedia di CSV
 *
 * @param {File | Blob | string} input File CSV atau string CSV
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array<Object>,
 *   errors: Array<string>,
 *   warnings: Array<string>,
 *   meta: {
 *     totalRows: number,
 *     validRows: number,
 *     delimiter: string,
 *     missingColumns: Array<string>,
 *     autoCalculatedWeeks: boolean,
 *   }
 * }>}
 */
export async function parseAspirasiCSV(input) {
  let rawText;
  try {
    rawText = await readCsvInput(input);
  } catch (err) {
    return {
      success: false,
      data: [],
      errors: [err.message || 'Gagal membaca file CSV.'],
      warnings: [],
      meta: {
        totalRows: 0,
        validRows: 0,
        delimiter: ',',
        missingColumns: [],
        autoCalculatedWeeks: false,
      },
    };
  }

  const cleanedText = rawText.replace(/^\uFEFF/, '');
  if (!cleanedText.trim()) {
    return {
      success: false,
      data: [],
      errors: ['File CSV kosong.'],
      warnings: [],
      meta: {
        totalRows: 0,
        validRows: 0,
        delimiter: ',',
        missingColumns: [...REQUIRED_COLUMNS],
        autoCalculatedWeeks: false,
      },
    };
  }

  const detectedDelimiter = detectCsvDelimiter(cleanedText);

  const parsed = Papa.parse(cleanedText, {
    header: true,
    delimiter: detectedDelimiter,
    delimitersToGuess: [',', ';', '\t', '|'],
    skipEmptyLines: 'greedy',
    transformHeader: (header) =>
      header.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\s+/g, '_'),
  });

  const actualDelimiter = parsed.meta?.delimiter || detectedDelimiter || ',';
  const headers = parsed.meta?.fields || [];
  const missingColumns = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

  if (missingColumns.length > 0) {
    return {
      success: false,
      data: [],
      errors: [
        `Kolom wajib tidak ditemukan pada CSV: ${missingColumns.join(', ')}. Kolom wajib adalah: ${REQUIRED_COLUMNS.join(', ')}.`,
      ],
      warnings: [],
      meta: {
        totalRows: parsed.data?.length ?? 0,
        validRows: 0,
        delimiter: actualDelimiter,
        missingColumns,
        autoCalculatedWeeks: false,
      },
    };
  }

  const errors = [];
  const warnings = [];

  if (Array.isArray(parsed.errors) && parsed.errors.length > 0) {
    for (const parseErr of parsed.errors) {
      // Abaikan peringatan delimiter fallback jika PapaParse sudah berhasil membaca baris
      if (parseErr.code === 'UndetectableDelimiter') continue;
      const lineNum = typeof parseErr.row === 'number' ? parseErr.row + 2 : '?';
      errors.push(`Baris ${lineNum}: ${parseErr.message}`);
    }
  }

  const rows = Array.isArray(parsed.data) ? parsed.data : [];
  if (rows.length === 0) {
    return {
      success: false,
      data: [],
      errors: ['File CSV hanya berisi header dan tidak memiliki baris data.'],
      warnings: [],
      meta: {
        totalRows: 0,
        validRows: 0,
        delimiter: actualDelimiter,
        missingColumns: [],
        autoCalculatedWeeks: false,
      },
    };
  }

  const stagedRows = [];
  let minTimestamp = Infinity;
  let hasMissingWeek = !headers.includes('minggu_ke');

  rows.forEach((rawRow, index) => {
    const csvLine = index + 2; // +1 header, +1 1-based index
    const rowMissing = REQUIRED_COLUMNS.filter(
      (col) => String(rawRow[col] ?? '').trim() === ''
    );

    if (rowMissing.length > 0) {
      errors.push(`Baris ${csvLine}: Kolom wajib kosong (${rowMissing.join(', ')}).`);
      return;
    }

    const parsedDate = parseNormalizedDate(rawRow.tanggal);
    if (!parsedDate) {
      errors.push(
        `Baris ${csvLine}: Format tanggal "${rawRow.tanggal}" tidak valid (gunakan YYYY-MM-DD).`
      );
      return;
    }

    if (parsedDate.timestamp < minTimestamp) {
      minTimestamp = parsedDate.timestamp;
    }

    const prodi = canonicalizeValue(rawRow.prodi, PRODI_LOOKUP);
    const angkatan = String(rawRow.angkatan).trim();
    const kategori = canonicalizeValue(rawRow.kategori, KATEGORI_LOOKUP);
    const urgensi = canonicalizeValue(rawRow.urgensi, URGENSI_LOOKUP);
    const status = canonicalizeValue(rawRow.status, STATUS_LOOKUP);

    let mingguKe = null;
    if (headers.includes('minggu_ke') && String(rawRow.minggu_ke ?? '').trim() !== '') {
      const parsedWeek = Number(String(rawRow.minggu_ke).trim());
      if (!Number.isInteger(parsedWeek) || parsedWeek < 1) {
        errors.push(
          `Baris ${csvLine}: Nilai minggu_ke "${rawRow.minggu_ke}" harus berupa bilangan bulat >= 1.`
        );
        return;
      }
      mingguKe = parsedWeek;
    } else {
      hasMissingWeek = true;
    }

    let durasiHari = null;
    const rawDuration = String(rawRow.durasi_hari ?? '').trim();
    if (status === 'Belum Diproses') {
      if (rawDuration !== '' && rawDuration.toLowerCase() !== 'null' && rawDuration !== '-') {
        warnings.push(
          `Baris ${csvLine}: durasi_hari diatur ke null karena status adalah "Belum Diproses".`
        );
      }
      durasiHari = null;
    } else if (rawDuration !== '' && rawDuration.toLowerCase() !== 'null' && rawDuration !== '-') {
      const parsedDur = Number(rawDuration);
      if (!Number.isInteger(parsedDur) || parsedDur < 0) {
        errors.push(
          `Baris ${csvLine}: Nilai durasi_hari "${rawRow.durasi_hari}" harus berupa bilangan bulat non-negatif atau kosong.`
        );
        return;
      }
      durasiHari = parsedDur;
    }

    const rawId = String(rawRow.id ?? '').trim();
    const id = rawId || `CSV-${String(index + 1).padStart(3, '0')}`;

    stagedRows.push({
      id,
      tanggal: parsedDate.iso,
      minggu_ke: mingguKe,
      prodi,
      angkatan,
      kategori,
      urgensi,
      status,
      durasi_hari: durasiHari,
      _timestamp: parsedDate.timestamp,
    });
  });

  if (errors.length > 0 || stagedRows.length === 0) {
    return {
      success: false,
      data: [],
      errors:
        errors.length > 0
          ? errors
          : ['Tidak ada baris valid yang dapat diproses dari file CSV.'],
      warnings,
      meta: {
        totalRows: rows.length,
        validRows: 0,
        delimiter: actualDelimiter,
        missingColumns: [],
        autoCalculatedWeeks: false,
      },
    };
  }

  let autoCalculatedWeeks = false;
  const normalizedData = stagedRows.map(({ _timestamp, ...record }) => {
    if (record.minggu_ke === null) {
      autoCalculatedWeeks = true;
      const diffDays = Math.floor((_timestamp - minTimestamp) / MS_PER_DAY);
      return {
        ...record,
        minggu_ke: Math.floor(diffDays / 7) + 1,
      };
    }
    return record;
  });

  if (hasMissingWeek && autoCalculatedWeeks) {
    warnings.push(
      'Kolom minggu_ke dihitung otomatis berdasarkan jarak minggu (7 hari) dari tanggal paling awal.'
    );
  }

  return {
    success: true,
    data: normalizedData,
    errors: [],
    warnings,
    meta: {
      totalRows: rows.length,
      validRows: normalizedData.length,
      delimiter: actualDelimiter,
      missingColumns: [],
      autoCalculatedWeeks,
    },
  };
}

/**
 * Menghasilkan konten string CSV template dengan contoh data yang valid.
 * @param {',' | ';'} delimiter
 * @returns {string}
 */
export function generateCSVTemplate(delimiter = ',') {
  return Papa.unparse(
    {
      fields: TEMPLATE_COLUMNS,
      data: TEMPLATE_SAMPLE_ROWS.map((row) => TEMPLATE_COLUMNS.map((col) => row[col])),
    },
    { delimiter }
  );
}

/**
 * Mengunduh file template CSV (`template_aspirasi_advokastra.csv`) di browser.
 * @param {string} filename
 * @param {',' | ';'} delimiter
 * @returns {string} Konten CSV yang dihasilkan
 */
export function downloadCSVTemplate(filename = TEMPLATE_FILENAME, delimiter = ',') {
  const csvContent = generateCSVTemplate(delimiter);

  if (typeof document !== 'undefined' && typeof Blob !== 'undefined') {
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return csvContent;
}
