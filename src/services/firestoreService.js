import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import {
  normalizeAnalysisConfig,
  validateAnalysisConfig,
} from '../config/analysisDefaults';
import {
  firebaseConfigurationError,
  firestoreDb,
  isFirebaseConfigured,
} from '../lib/firebase';

export const DEFAULT_DATASET_ID = 'default';

function requireFirestore() {
  if (!isFirebaseConfigured || !firestoreDb) {
    throw new Error(firebaseConfigurationError || 'Cloud Firestore belum tersedia.');
  }
  return firestoreDb;
}

function normalizeAspirasi(docSnapshot) {
  const data = docSnapshot.data();
  const normalized = {
    id: String(data.id || docSnapshot.id),
    tanggal: String(data.tanggal || ''),
    minggu_ke: Number(data.minggu_ke),
    prodi: String(data.prodi || ''),
    angkatan: String(data.angkatan || ''),
    kategori: String(data.kategori || ''),
    urgensi: String(data.urgensi || ''),
    status: String(data.status || ''),
    durasi_hari:
      data.durasi_hari === null || data.durasi_hari === undefined
        ? null
        : Number(data.durasi_hari),
  };

  const requiredStrings = [
    'id',
    'tanggal',
    'prodi',
    'angkatan',
    'kategori',
    'urgensi',
    'status',
  ];
  if (requiredStrings.some((field) => !normalized[field])) {
    throw new Error(`Dokumen aspirasi "${docSnapshot.id}" memiliki field wajib yang kosong.`);
  }
  if (!Number.isInteger(normalized.minggu_ke) || normalized.minggu_ke < 1) {
    throw new Error(`Dokumen aspirasi "${docSnapshot.id}" memiliki minggu_ke tidak valid.`);
  }
  if (
    normalized.durasi_hari !== null &&
    (!Number.isInteger(normalized.durasi_hari) || normalized.durasi_hari < 0)
  ) {
    throw new Error(`Dokumen aspirasi "${docSnapshot.id}" memiliki durasi_hari tidak valid.`);
  }

  return normalized;
}

function normalizeCsvTemplate(rawTemplate = {}) {
  const template = {
    filename: String(rawTemplate.filename ?? ''),
    columns: Array.isArray(rawTemplate.columns) ? rawTemplate.columns.map(String) : [],
    requiredColumns: Array.isArray(rawTemplate.requiredColumns)
      ? rawTemplate.requiredColumns.map(String)
      : [],
    sampleRows: Array.isArray(rawTemplate.sampleRows) ? rawTemplate.sampleRows : [],
  };

  if (!template.filename || template.columns.length === 0) {
    throw new Error('filename dan columns wajib tersedia pada app_config/csv_template.');
  }
  if (template.requiredColumns.length === 0 || template.sampleRows.length === 0) {
    throw new Error('requiredColumns dan sampleRows wajib tersedia pada app_config/csv_template.');
  }
  const missingRequiredColumns = template.requiredColumns.filter(
    (column) => !template.columns.includes(column)
  );
  if (missingRequiredColumns.length > 0) {
    throw new Error(
      `Kolom wajib template tidak ditemukan dalam columns: ${missingRequiredColumns.join(', ')}.`
    );
  }

  return template;
}

export async function loadApplicationData() {
  const db = requireFirestore();
  const datasetRef = doc(db, 'datasets', DEFAULT_DATASET_ID);
  const aspirationsRef = collection(datasetRef, 'aspirations');

  const [datasetSnapshot, aspirationsSnapshot, analysisSnapshot, csvSnapshot] =
    await Promise.all([
      getDoc(datasetRef),
      getDocs(query(aspirationsRef, orderBy('tanggal'))),
      getDoc(doc(db, 'app_config', 'analysis')),
      getDoc(doc(db, 'app_config', 'csv_template')),
    ]);

  if (!datasetSnapshot.exists()) {
    throw new Error('Dataset Firestore "datasets/default" belum tersedia. Jalankan npm run seed:firebase.');
  }
  if (aspirationsSnapshot.empty) {
    throw new Error('Koleksi Firestore "datasets/default/aspirations" masih kosong. Jalankan seed script.');
  }
  if (!analysisSnapshot.exists() || !csvSnapshot.exists()) {
    throw new Error('Dokumen app_config belum lengkap. Jalankan npm run seed:firebase.');
  }

  const datasetMeta = datasetSnapshot.data();
  const analysisConfig = validateAnalysisConfig(
    normalizeAnalysisConfig(analysisSnapshot.data())
  );
  const csvTemplate = normalizeCsvTemplate(csvSnapshot.data());
  const datasetName = String(datasetMeta.name ?? '').trim();
  if (!datasetName) {
    throw new Error('Field name wajib tersedia pada datasets/default.');
  }

  return {
    dataset: aspirationsSnapshot.docs
      .map(normalizeAspirasi)
      .sort((a, b) =>
        a.tanggal === b.tanggal
          ? a.id.localeCompare(b.id, 'id')
          : a.tanggal.localeCompare(b.tanggal, 'id')
      ),
    datasetSource: {
      isDefault: true,
      name: datasetName,
    },
    analysisConfig,
    csvTemplate,
  };
}

