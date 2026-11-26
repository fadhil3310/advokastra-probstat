# Advokastra Probstat — Agent Guide

## Scope and architecture

- React 19 + Vite client. Statistical calculations remain client-side in `src/utils/statsEngine.js`.
- Firebase Authentication is the only session source. Do not add simulated users or browser-storage sessions.
- Cloud Firestore is the runtime source for analytical data, domain values, selector options, and CSV template rows.
- Landing-page marketing copy, formulas, visual labels, and component layout intentionally remain in source code.

## Firebase data contract

| Path | Purpose |
| --- | --- |
| `datasets/default` | Metadata for the seeded default dataset (`name`, `rowCount`, `schemaVersion`). |
| `datasets/default/aspirations/{id}` | One aspiration record per document. Document ID and `id` should match. |
| `app_config/analysis` | `domains`, selector options, domain semantics, and default analysis parameters. |
| `app_config/csv_template` | Template filename, columns, required columns, and sample rows. |

Aspiration fields are `id`, `tanggal`, `minggu_ke`, `prodi`, `angkatan`, `kategori`, `urgensi`, `status`, and nullable `durasi_hari`.

## Data rules for agents

- Never import files under `scripts/seed-data/` from runtime code in `src/`. They are migration fixtures only.
- When adding/changing analytical domain values or default rows, update the seed fixtures, rerun `npm run seed:firebase`, and keep the Firestore contract documented. The seed synchronizes and may delete stale documents inside `datasets/default/aspirations` only.
- Runtime data access belongs in `src/services/firestoreService.js`; Firebase initialization belongs in `src/lib/firebase.js`.
- Pass Firestore-loaded configuration into helpers/components. Do not reintroduce duplicate arrays for prodi, category, urgency, status, confidence levels, or alpha levels.
- CSV imports are temporary in-memory analysis datasets. They are not persisted to Firestore unless the user explicitly requests persistence semantics.
- Do not place service-account JSON or private keys in the repository. `.env.local`, `.env`, and service-account files are ignored.

## Authentication rules

- Email/password login uses Firebase Auth.
- Guest access uses Firebase anonymous authentication.
- Enable both providers and create at least one Email/Password user in Firebase Console before testing.
- Firestore reads are public under the checked-in rules so the landing preview loads before authentication. Writes are denied to the client.

## Local setup

1. Copy `.env.example` to `.env.local` and fill the Firebase Web SDK values.
2. Provide server credentials through `GOOGLE_APPLICATION_CREDENTIALS` or the documented `FIREBASE_*` variables.
3. Create Firestore and run `npm run seed:firebase`.
4. Deploy rules with `firebase deploy --only firestore:rules` (Firebase CLI required).
5. Run `npm run dev`.

## Verification

Run all three before handing off a code change:

```sh
npm test
npm run lint
npm run build
```

When Firebase credentials are available, also verify email/password login, anonymous login, Firestore loading, CSV import, template download, and reset-to-Firestore behavior.

