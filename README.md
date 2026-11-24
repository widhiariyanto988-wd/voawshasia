# VOAWSHASIA — Production & Rental

Landing page sewa alat event dan produksi panggung berbasis **Vite + TypeScript** (tanpa framework UI). Antarmuka memakai Tailwind CSS, Font Awesome, dan Google Fonts yang dimuat lewat CDN.

## Fitur

- Katalog alat dengan filter kategori dan pencarian
- Portofolio acara + modal detail alat yang dipakai
- Paket hemat siap pakai
- Keranjang sewa dengan jumlah unit & lama hari, lalu kirim ringkasan ke WhatsApp
- Panel admin tersembunyi untuk kelola alat, portofolio, dan pesanan masuk
- Upload foto langsung dari perangkat di form admin (tanpa link, otomatis dikompres)
- Galeri 6 postingan asli `@voawsh_asia` (thumbnail, caption, tanggal, dan tautan ke post) + tautan Instagram & YouTube difooter
- Logo utama memakai foto profil Instagram `@voawsh_asia` (`public/logo.jpg`), dipakai juga sebagai favicon
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
    │   ├── format.ts     # Util murni: format rupiah, escape HTML, WA, gambar
    │   └── image.ts      # Kompresi foto upload jadi data URL JPEG
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

Hasil build statis ada di folder `dist/`.

## Deploy ke Vercel

1. Buka https://vercel.com/new dan import repo GitHub `widhiariyanto988-wd/voawshasia`.
2. Vercel akan mendeteksi Vite. Pastikan:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Klik **Deploy**. Setiap push ke `main` akan otomatis di-deploy ulang.

Konfigurasi juga sudah tersimpan di `vercel.json`.

## Akses admin

Panel admin bisa dibuka dengan salah satu cara:

- Tekan `Ctrl/Cmd + Shift + A`
- Klik **3 kali** teks hak cipta di footer
- Tambahkan query `?admin=1` pada URL

Sandi default: **`Bismillah2026`**

Ubah sandi dan nomor WhatsApp di `src/data.ts`:

```ts
export const WA = '628812814855';    // WA utama: 0881-2814-855
export const WA_ALT = '6285292496845'; // WA cadangan: 0852-9249-6845
export const ADMIN_PASS = 'Bismillah2026';
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

### Batas upload (versi localStorage)

| Jenis | Batas saat ini |
| --- | --- |
| Foto dipilih | Maks. **8 MB** per file (JPG/PNG/WebP) |
| Foto tersimpan | Otomatis dikompres ke **±700 KB** per foto |
| Total penyimpanan | ~**5 MB** per browser (localStorage) |
| Video | **Belum didukung** di localStorage |

Karena kuota browser kecil, foto tetap dikompres otomatis. Untuk penyimpanan bersama & video, gunakan **Supabase Storage** (maks. 50 MB/file, total 1 GB di free tier) atau **Cloudflare R2** untuk video besar.

### Media sosial

Tautan diatur di `src/data.ts` pada `SOCIALS`:

```ts
export const SOCIALS = [
  { label: 'Instagram @voawsh_asia', url: 'https://www.instagram.com/voawsh_asia/', icon: 'fa-brands fa-instagram' },
  { label: 'YouTube @VoawshNetwork', url: 'https://www.youtube.com/@VoawshNetwork', icon: 'fa-brands fa-youtube' },
];
```

Galeri Instagram memakai salinan thumbnail 6 postingan terbaru di `public/instagram/` beserta caption aslinya di `IG_POSTS` (`src/data.ts`). Karena Instagram tidak menyediakan feed publik gratis tanpa token, galeri ini **tidak update otomatis** — sesuaikan lagi saat ada postingan baru.
