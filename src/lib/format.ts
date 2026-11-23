import * as D from '../data';

/** Format angka ke rupiah, contoh: 850000 -> "Rp 850.000". */
export const rp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID');

/** Escape karakter HTML agar aman disisipkan ke template string. */
export const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Buat URL WhatsApp dengan pesan yang sudah di-encode. Nomor bisa ditimpa untuk WA cadangan. */
export const wa = (text: string, number = D.WA) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

/** Tag img dengan fallback otomatis saat gambar gagal dimuat. */
export const img = (src: string, cat: string, cls: string) =>
  `<img src="${esc(src)}" alt="" class="${cls}" onerror="this.onerror=null;this.src='${D.FALLBACK[cat] ?? ''}'">`;
