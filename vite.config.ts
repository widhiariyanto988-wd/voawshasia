import { defineConfig } from 'vite';

// Saat build di GitHub Actions, aset dibuat untuk alamat /voawshasia/.
// Saat dijalankan lokal, tetap pakai root "/" supaya localhost tidak berubah.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/voawshasia/' : '/',
});
