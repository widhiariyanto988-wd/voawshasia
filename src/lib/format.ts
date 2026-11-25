import * as D from '../data';
import type { ImageFit } from '../types';

/** Format angka ke rupiah, contoh: 850000 -> "Rp 850.000". */
export const rp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID');

/** Escape karakter HTML agar aman disisipkan ke template string. */
export const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Buat URL WhatsApp dengan pesan yang sudah di-encode. Nomor bisa ditimpa untuk WA cadangan. */
export const wa = (text: string, number = D.WA) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

/** Ubah nomor WP ke format 62... untuk wa.me. */
export const normalizePhone = (raw: string) => {
  const d = raw.replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('0')) return '62' + d.slice(1);
  if (d.startsWith('62')) return d;
  if (d.startsWith('8')) return '62' + d;
  return d;
};

/** Tampilkan nomor 62... sebagai +62 812-xxxx-xxxx. */
export const phoneLabel = (raw: string) => {
  const d = normalizePhone(raw);
  if (!d) return '-';
  if (!d.startsWith('62')) return '+' + d;
  const rest = d.slice(2);
  return ['+62', [rest.slice(0, 4), rest.slice(4, 8), rest.slice(8)].filter(Boolean).join('-')].join(' ');
};

/** Kelas object-fit yang dipakai foto alat (default: cover). */
export const fitCls = (fit: ImageFit = 'cover') =>
  ({ cover: 'object-cover', contain: 'object-contain', fill: 'object-fill' })[fit];

/** Tag img dengan fallback otomatis saat gambar gagal dimuat. */
export const img = (src: string, cat: string, cls: string, fit?: ImageFit) => {
  const withFit = fit
    ? /\bobject-(cover|contain|fill)\b/.test(cls)
      ? cls.replace(/\bobject-(cover|contain|fill)\b/g, fitCls(fit))
      : `${cls} ${fitCls(fit)}`
    : cls;
  const style = fit ? ` style="object-fit:${fit}"` : '';
  return `<img src="${esc(src)}" alt="" class="${withFit}"${style} onerror="this.onerror=null;this.src='${D.FALLBACK[cat] ?? ''}'">`;
};
