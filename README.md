# Advokastra Probstat

Dashboard probabilitas dan statistika untuk menganalisis aspirasi mahasiswa UPI Kampus Cibiru. Aplikasi memakai React + Vite, Firebase Authentication, dan Cloud Firestore.

## Setup Firebase

1. Buat Firebase Web App dan Cloud Firestore.
2. Aktifkan Authentication provider **Email/Password** dan **Anonymous**, lalu buat minimal satu akun Email/Password di Firebase Console.
3. Salin `.env.example` menjadi `.env.local`, lalu isi konfigurasi Web SDK.
4. Sediakan kredensial server Firestore melalui `GOOGLE_APPLICATION_CREDENTIALS` atau variabel `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, dan `FIREBASE_PRIVATE_KEY`.
5. Seed data awal:

```sh
npm run seed:firebase
```

6. Deploy `firestore.rules` menggunakan Firebase CLI:

```sh
firebase deploy --only firestore:rules
```

7. Jalankan aplikasi:

```sh
npm run dev
```

Seed command bersifat idempotent dan menyinkronkan koleksi default: dokumen dengan ID sama ditimpa, sedangkan dokumen default lama yang tidak lagi ada pada fixture dihapus. Detail struktur Firestore dan aturan bagi coding agents tersedia di [AGENTS.md](./AGENTS.md).

## Verifikasi

```sh
npm test
npm run lint
npm run build
```
