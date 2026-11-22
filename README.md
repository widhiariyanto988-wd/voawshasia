# VOAWSHASIA — Production & Rental

Landing page sewa alat event dan produksi panggung berbasis **Vite + TypeScript** (tanpa framework UI). Antarmuka memakai Tailwind CSS, Font Awesome, dan Google Fonts yang dimuat lewat CDN.

## Fitur

- Katalog alat dengan filter kategori dan pencarian
- Portofolio acara + modal detail alat yang dipakai
- Paket hemat siap pakai
- Keranjang sewa dengan jumlah unit & lama hari, lalu kirim ringkasan ke WhatsApp
- Panel admin tersembunyi untuk kelola alat, portofolio, dan pesanan masuk
- Semua perubahan data tersimpan di `localStorage` (tanpa backend)

## Tech stack

| Bagian | Teknologi |
| --- | --- |
| Build tool | Vite 5 |
| Bahasa | TypeScript 5 (`strict`) |
| Styling | Tailwind CSS (CDN) + CSS kustom |
| Ikon | Font Awesome 6 (CDN) |
| Font | Inter & Plus Jakarta Sans (Google Fonts) |
| Penyimpanan | `localStorage` browser |

## Struktur proyek

```text
.
├── index.html            # Entry HTML + konfigurasi Tailwind CDN
├── package.json          # Script & dependency
├── tsconfig.json         # Konfigurasi TypeScript
├── .gitignore            # Abaikan node_modules/, dist/, dll.
├── .editorconfig         # Aturan indentasi & encoding
└── src/
    ├── main.ts           # Bootstrap, event delegation, perpindahan view
    ├── store.ts          # State global + persistensi localStorage
    ├── types.ts          # Definisi tipe data
    ├── data.ts           # Data awal, kategori, konfigurasi WA & sandi admin
    ├── style.css         # CSS kustom (scrollbar, nav, gradasi hero)
    ├── lib/
    │   └── format.ts     # Util murni: format rupiah, escape HTML, WA, gambar
    └── ui/
        ├── shared.ts     # DOM helper, toast, chip, badge status, modal
        ├── public.ts     # Render halaman public (shell, portofolio, katalog)
        ├── cart.ts       # Keranjang sewa & pengiriman pesanan
        └── admin.ts      # Dashboard, form alat & portofolio
```

Alur data: `data.ts` → `store.ts` → modul `ui/*` → `main.ts` (event). Satu-satunya tempat membaca/menulis state adalah `store.ts`.

## Menjalankan proyek

Butuh Node.js 18+ (disarankan 20+).

```bash
npm install
npm run dev        # server development, biasanya http://localhost:5173
npm run build      # cek tipe + build produksi ke dist/
npm run preview    # preview hasil build (http://localhost:4173)
```

Hasil build statis ada di folder `dist/` dan bisa di-deploy ke hosting statis apa pun (Netlify, Vercel, GitHub Pages, Nginx, dll.).

## Akses admin

Panel admin bisa dibuka dengan salah satu cara:

- Tekan `Ctrl/Cmd + Shift + A`
- Klik **3 kali** teks hak cipta di footer
- Tambahkan query `?admin=1` pada URL

Sandi default: **`admin123`**

Ubah sandi dan nomor WhatsApp di `src/data.ts`:

```ts
export const WA = '6281234567890';   // nomor WA tanpa tanda +
export const ADMIN_PASS = 'admin123';
```

> Catatan: sandi admin ini tersimpan di sisi klien, jadi hanya cocok untuk demo/internal. Untuk produksi yang membutuhkan keamanan nyata, gunakan autentikasi backend.

## Penyimpanan data

Kunci `localStorage` yang dipakai:

| Kunci | Isi |
| --- | --- |
| `vs_ts_equipment` | Daftar alat |
| `vs_ts_portfolio` | Daftar portofolio |
| `vs_ts_inquiries` | Pesanan masuk |
| `vs_ts_cart` | Keranjang sewa |

Tombol **Reset Data Awal** di dashboard admin mengembalikan data ke nilai default dari `src/data.ts`.
