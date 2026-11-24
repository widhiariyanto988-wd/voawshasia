import type { Equipment, Portfolio, Inquiry, Pkg } from './types';

/** WA utama untuk semua tombol chat & pesanan: 0881-2814-855 */
export const WA = '628812814855';
/** WA cadangan yang ditampilkan di footer: 0852-9249-6845 */
export const WA_ALT = '6285292496845';
/** Daftar nomor yang ditampilkan di footer: [tampilan, nomor wa.me] */
export const WA_LIST: [string, string][] = [
  ['+62 881-2814-855', WA],
  ['+62 852-9249-6845', WA_ALT],
];
export const ADMIN_PASS = 'Bismillah2026';
export const EQ_CATS = ['Sound System', 'Lighting', 'Layar LED', 'Panggung', 'Multimedia'];
export const PORT_CATS = ['Konser & Musik', 'Wedding', 'Acara Kantor', 'Pameran'];

const U = (id: string, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
export const FALLBACK: Record<string, string> = {
  'Sound System': U('1520523839897-bd0b52f945a0'), 'Lighting': U('1504509546545-e000b4a62425'),
  'Layar LED': U('1540575467063-178a50c2df87'), 'Panggung': U('1501281668745-f7f57925c3b4'),
  'Multimedia': U('1516035069371-29a1b244cc32'), 'Konser & Musik': U('1459749411175-04bf5292ceea', 1000),
  'Wedding': U('1519167758481-83f550bb49b3', 1000), 'Acara Kantor': U('1505373877841-8d25f7d46678', 1000),
  'Pameran': U('1511578314322-379afb476865', 1000),
};

export const DEFAULT_EQUIPMENT: Equipment[] = [
  { id: 'eq-1', name: 'Speaker Line Array RCF HDL 20-A', category: 'Sound System', specs: 'Speaker gantung 1400W, jernih untuk konser & lapangan', price: 850000, stock: 16, status: 'Ready', image: FALLBACK['Sound System'] },
  { id: 'eq-2', name: 'Mixer Digital Midas M32 Live', category: 'Sound System', specs: '40 channel input, standar konser', price: 1650000, stock: 4, status: 'Ready', image: U('1598488035139-bdbb2231ce04') },
  { id: 'eq-3', name: 'Lampu Moving Head Beam 230W', category: 'Lighting', specs: 'Sorot tajam jarak jauh, 14 warna + prisma', price: 350000, stock: 24, status: 'Ready', image: FALLBACK['Lighting'] },
  { id: 'eq-4', name: 'Layar LED Videotron P3.9 (Per m²)', category: 'Layar LED', specs: 'Tajam anti silau, indoor & outdoor', price: 750000, stock: 40, status: 'Ready', image: FALLBACK['Layar LED'] },
  { id: 'eq-5', name: 'Panggung Rigging Aluminium 8x6m', category: 'Panggung', specs: 'Rangka kokoh tinggi 6m, atap terpal & karpet', price: 6000000, stock: 2, status: 'Stok Terbatas', image: FALLBACK['Panggung'] },
  { id: 'eq-6', name: 'Lampu Par LED 54x3W RGBW', category: 'Lighting', specs: 'Warna-warni & warm white untuk dekorasi', price: 125000, stock: 32, status: 'Ready', image: U('1514525253161-7a46d19cd819') },
  { id: 'eq-7', name: 'Paket Kamera Live Streaming & Switcher', category: 'Multimedia', specs: '2 Kamera Full HD + Video Switcher', price: 2500000, stock: 3, status: 'Ready', image: FALLBACK['Multimedia'] },
  { id: 'eq-8', name: 'Lampu Follow Spot LED 350W', category: 'Lighting', specs: 'Sorot manual mengikuti pengantin / bintang tamu', price: 650000, stock: 0, status: 'Habis', image: U('1492684223066-81342ee5ff30') },
];

export const DEFAULT_PORTFOLIO: Portfolio[] = [
  { id: 'port-1', title: 'Festival Musik Jakarta Soundwave 2026', category: 'Konser & Musik', location: 'Senayan, Jakarta', gearUsed: ['Speaker Line Array 24 Box', 'Layar LED 60 m²', '32 Lampu Beam 230W', 'Panggung Rigging 12x10m'], description: 'Sound system 40.000 Watt dan tata lampu panggung untuk 10.000 penonton.', image: FALLBACK['Konser & Musik'] },
  { id: 'port-2', title: 'Resepsi Pernikahan Arya & Nabila', category: 'Wedding', location: 'Hotel Mulia Ballroom, Jakarta', gearUsed: ['Layar LED 18 m²', '24 Lampu Par LED Warm White', 'Sound System 10.000W', 'Follow Spot'], description: 'Tata cahaya hangat dan layar LED pelaminan untuk 800 tamu.', image: FALLBACK['Wedding'] },
  { id: 'port-3', title: 'Annual Gathering & Awarding TechCorp', category: 'Acara Kantor', location: 'ICE BSD, Tangerang', gearUsed: ['Layar LED 12x3m', 'Sound System Line Array', '8 Mic Wireless', 'Paket Live Streaming'], description: 'Layar presentasi ultra-lebar dan audio jernih untuk acara tahunan perusahaan.', image: FALLBACK['Acara Kantor'] },
  { id: 'port-4', title: 'Pameran Otomotif & Peluncuran Produk', category: 'Pameran', location: 'JIExpo Kemayoran, Jakarta', gearUsed: ['Layar LED 24 m²', '12 Lampu Beam 230W', 'Sound System Booth 6000W'], description: 'Panggung peluncuran mobil baru dengan efek pencahayaan dramatis.', image: FALLBACK['Pameran'] },
];

export const DEFAULT_INQUIRIES: Inquiry[] = [
  { id: 'inq-1', clientName: 'Raka Pratama', eventDate: '2026-12-12', itemsSummary: '1x Paket Wedding Megah (1 hari)', totalEstimate: 12500000, createdAt: 'Hari ini, 14:20' },
];

export const PACKAGES: Pkg[] = [
  { name: 'Paket Akustik & Gathering', tag: 'Acara Kecil & Kantor', price: 3500000, color: 'emerald', items: ['2 Speaker Aktif 15" + 1 Subwoofer', 'Mixer Digital 16 Channel', '4 Mic Wireless + 2 Stand Mic', '6 Lampu Par LED Warm White', '2 Teknisi Soundman Standby'] },
  { name: 'Paket Wedding Megah', tag: 'Pernikahan & Gala Dinner', price: 12500000, color: 'amber', featured: true, items: ['Sound System 10.000 Watt Jernih', 'Layar LED Videotron 4x3 Meter', '8 Moving Head Beam + Mesin Asap', '16 Lampu Par LED Dekorasi', 'Operator Audio, Lampu & Video'] },
  { name: 'Paket Konser & Festival', tag: 'Lapangan & Pensi', price: 28000000, color: 'cyan', items: ['Panggung Rigging 10x8m + Barikade', 'Sound Line Array 30.000 Watt', 'Layar LED Outdoor 6x4 Meter', '16 Lampu Beam, Fresnel & Follow Spot', 'Genset Silent 100 KVA + Full Tim'] },
];

export const STEPS: [string, string][] = [
  ['Pilih Alat / Paket', 'Masukkan alat atau paket yang kamu butuhkan ke Keranjang Sewa.'],
  ['Kirim ke WhatsApp', 'Isi nama dan tanggal acara, lalu kirim daftar pesanan ke WA kami.'],
  ['Kunci Jadwal (DP)', 'Tim kami mengunci jadwal alat agar tidak dipakai acara lain.'],
  ['Pasang di Lokasi', 'Kru datang lebih awal untuk pasang, cek suara/lampu, dan mengawal acara.'],
];
