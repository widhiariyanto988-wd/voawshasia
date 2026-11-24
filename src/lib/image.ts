/** Batas ukuran file asli yang diterima sebelum dikompres (8 MB). */
export const PHOTO_INPUT_MAX_MB = 8;
const MAX_INPUT_BYTES = PHOTO_INPUT_MAX_MB * 1024 * 1024;
/** Target panjang data URL tersimpan (~525 KB binary) agar aman di localStorage. */
const MAX_STORED_CHARS = 700_000;
const MAX_EDGE = 1400;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.'));
    };
    image.src = url;
  });
}

/**
 * Kompres foto di browser menjadi data URL JPEG.
 * File asli maksimal 8 MB, lalu diperkecil sampai hasilnya ±700 KB karakter.
 */
export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Pilih file gambar (JPG/PNG/WebP).');
  if (file.size > MAX_INPUT_BYTES) throw new Error(`Ukuran foto maksimal ${PHOTO_INPUT_MAX_MB} MB.`);

  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Browser tidak mendukung pemrosesan gambar.');

  let edge = MAX_EDGE;
  let quality = 0.78;
  let data = '';

  for (let attempt = 0; attempt < 12; attempt++) {
    const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    data = canvas.toDataURL('image/jpeg', quality);
    if (data.length <= MAX_STORED_CHARS) break;
    if (quality > 0.55) quality = Math.max(0.55, quality - 0.08);
    else edge = Math.round(edge * 0.8);
  }

  return data;
}
