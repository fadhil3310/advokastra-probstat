import { Firestore, FieldValue } from '@google-cloud/firestore';
import defaultDataset from './seed-data/defaultDataset.js';
import { analysisConfig, csvTemplateConfig } from './seed-data/appConfig.js';

const projectId =
  process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId) {
  throw new Error(
    'Project ID belum tersedia. Isi FIREBASE_PROJECT_ID atau VITE_FIREBASE_PROJECT_ID di .env.'
  );
}

const db = new Firestore({
  projectId,
  ...(clientEmail && privateKey
    ? { credentials: { client_email: clientEmail, private_key: privateKey } }
    : {}),
});

const datasetRef = db.collection('datasets').doc('default');
const aspirationsRef = datasetRef.collection('aspirations');

async function commitInChunks(operations, chunkSize = 400) {
  for (let start = 0; start < operations.length; start += chunkSize) {
    const batch = db.batch();
    for (const operation of operations.slice(start, start + chunkSize)) {
      batch.set(operation.ref, operation.data, { merge: false });
    }
    await batch.commit();
  }
}

async function seed() {
  const existingAspirations = await aspirationsRef.get();
  const seededIds = new Set(defaultDataset.map((row) => row.id));
  const staleAspirations = existingAspirations.docs.filter(
    (snapshot) => !seededIds.has(snapshot.id)
  );

  for (let start = 0; start < staleAspirations.length; start += 400) {
    const batch = db.batch();
    for (const snapshot of staleAspirations.slice(start, start + 400)) {
      batch.delete(snapshot.ref);
    }
    await batch.commit();
  }

  const operations = defaultDataset.map((row) => ({
    ref: aspirationsRef.doc(row.id),
    data: row,
  }));

  operations.push(
    {
      ref: datasetRef,
      data: {
        name: 'Default',
        description: 'Dataset simulasi aspirasi mahasiswa Advokastra UPI Kampus Cibiru',
        rowCount: defaultDataset.length,
        schemaVersion: 1,
        updatedAt: FieldValue.serverTimestamp(),
      },
    },
    {
      ref: db.collection('app_config').doc('analysis'),
      data: {
        ...analysisConfig,
        schemaVersion: 1,
        updatedAt: FieldValue.serverTimestamp(),
      },
    },
    {
      ref: db.collection('app_config').doc('csv_template'),
      data: {
        ...csvTemplateConfig,
        schemaVersion: 1,
        updatedAt: FieldValue.serverTimestamp(),
      },
    }
  );

  await commitInChunks(operations);
  process.stdout.write(
    `Seed selesai: ${defaultDataset.length} aspirasi ditulis, ${staleAspirations.length} dokumen lama dihapus, dan 2 dokumen app_config diperbarui pada proyek ${projectId}.\n`
  );
}

seed().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});

