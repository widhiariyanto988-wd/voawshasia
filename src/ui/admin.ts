import type { Equipment, Portfolio } from '../types';
import * as D from '../data';
import { save, state } from '../store';
import { esc, img, rp } from '../lib/format';
import { PHOTO_INPUT_MAX_MB } from '../lib/image';
import { $, openModal, statusCls } from './shared';

/** Modal kata sandi untuk membuka panel admin. */
export const loginModal = () => {
  openModal(`<form data-form="login" class="bg-darkcard border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
    <div class="flex items-center justify-between"><h3 class="font-display font-bold text-lg"><i class="fa-solid fa-key text-amber-400 mr-2"></i>Login Admin</h3><button type="button" data-act="close" class="text-zinc-500 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
    <div><label class="block text-xs font-semibold text-zinc-400 mb-1.5">Kata Sandi Admin</label><input type="password" id="pass" required placeholder="Masukkan sandi..." class="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500"></div>
    <button class="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm">Masuk Dashboard</button></form>`);
  setTimeout(() => $('#pass')?.focus(), 50);
};

/** Render seluruh dashboard admin sesuai tab aktif. */
export function renderAdmin() {
  const tabs: [string, string, string][] = [
    ['overview', 'fa-chart-pie', 'Ringkasan'],
    ['equipment', 'fa-sliders', 'Kelola Alat'],
    ['portfolio', 'fa-images', 'Kelola Portofolio'],
    ['inquiries', 'fa-inbox', 'Pesanan Masuk'],
  ];
  const units = state.equipment.reduce((s, e) => s + Number(e.stock || 0), 0);
  const stat = (title: string, value: string, sub: string, color: string) => `<div class="p-5 rounded-2xl bg-darkcard border border-zinc-800"><div class="text-zinc-400 text-xs font-semibold">${title}</div><div class="font-display text-3xl font-extrabold ${color} mt-3">${value}</div><div class="text-xs text-zinc-400 mt-1">${sub}</div></div>`;

  let body = '';
  if (state.adminTab === 'overview')
    body = `<div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      ${stat('TOTAL ALAT', state.equipment.length + ' Jenis', units + ' unit terdaftar', 'text-white')}
      ${stat('ALAT READY', state.equipment.filter((e) => e.status === 'Ready').length + ' Jenis', 'Siap disewa hari ini', 'text-emerald-400')}
      ${stat('PORTOFOLIO', state.portfolio.length + ' Acara', 'Ditampilkan ke pengunjung', 'text-white')}
      ${stat('PESANAN MASUK', state.inquiries.length + ' Pesanan', 'Dari keranjang sewa web', 'text-amber-400')}</div>`;

  if (state.adminTab === 'equipment')
    body = `<div class="flex justify-end"><button data-act="eq-form" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm"><i class="fa-solid fa-plus mr-2"></i>Tambah Alat Baru</button></div>
    <div class="rounded-2xl bg-darkcard border border-zinc-800 overflow-x-auto"><table class="w-full text-left text-sm"><thead><tr class="border-b border-zinc-800 text-xs uppercase text-zinc-400 bg-zinc-900/50"><th class="p-4">Alat</th><th class="p-4">Kategori</th><th class="p-4">Harga/Hari</th><th class="p-4">Status</th><th class="p-4 text-right">Aksi</th></tr></thead>
    <tbody class="divide-y divide-zinc-800/80">${state.equipment.map((e) => `<tr class="hover:bg-zinc-900/40">
      <td class="p-4"><div class="flex items-center gap-3">${img(e.image, e.category, 'w-11 h-11 rounded-xl object-cover')}<div><div class="font-bold">${esc(e.name)}</div><div class="text-xs text-zinc-400 line-clamp-1 max-w-xs">${esc(e.specs)}</div></div></div></td>
      <td class="p-4"><span class="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs">${esc(e.category)}</span></td>
      <td class="p-4 font-bold text-amber-400 whitespace-nowrap">${rp(e.price)}</td>
      <td class="p-4"><button data-act="eq-cycle" data-id="${e.id}" title="Klik untuk ubah" class="px-3 py-1.5 rounded-full text-xs font-extrabold border ${statusCls(e.status)}">${e.status}</button></td>
      <td class="p-4 text-right whitespace-nowrap space-x-1"><button data-act="eq-form" data-id="${e.id}" class="p-2 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950"><i class="fa-solid fa-pen"></i></button>
        <button data-act="eq-del" data-id="${e.id}" class="p-2 rounded-lg bg-zinc-800 hover:bg-rose-500"><i class="fa-solid fa-trash"></i></button></td></tr>`).join('')}</tbody></table></div>`;

  if (state.adminTab === 'portfolio')
    body = `<div class="flex justify-end"><button data-act="pt-form" class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold text-sm"><i class="fa-solid fa-plus mr-2"></i>Tambah Portofolio</button></div>
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">${state.portfolio.map((p) => `<div class="rounded-2xl bg-darkcard border border-zinc-800 overflow-hidden">
      <div class="relative h-44">${img(p.image, p.category, 'w-full h-full object-cover')}<span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-zinc-950/85 text-amber-400 text-xs font-bold">${esc(p.category)}</span></div>
      <div class="p-5"><div class="text-xs text-zinc-400 mb-1">${esc(p.location)}</div><h4 class="font-display font-bold">${esc(p.title)}</h4><p class="text-xs text-zinc-400 mt-1.5 line-clamp-2">${esc(p.description)}</p></div>
      <div class="px-5 py-3 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-900/30"><button data-act="pt-form" data-id="${p.id}" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950 text-xs font-bold">Edit</button>
        <button data-act="pt-del" data-id="${p.id}" class="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold">Hapus</button></div></div>`).join('')}</div>`;

  if (state.adminTab === 'inquiries')
    body = state.inquiries.length
      ? state.inquiries
          .map((q) => `<div class="p-5 rounded-2xl bg-darkcard border border-zinc-800 flex flex-col sm:flex-row justify-between gap-4">
      <div class="space-y-1"><div><span class="font-display font-bold">${esc(q.clientName)}</span> <span class="text-xs text-zinc-500">• ${esc(q.createdAt)}</span></div>
        <div class="text-xs text-zinc-400">Tanggal Acara: <strong class="text-zinc-200">${esc(q.eventDate)}</strong></div>
        <div class="text-xs text-zinc-300 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 mt-1">${esc(q.itemsSummary)}</div></div>
      <div class="sm:text-right shrink-0"><span class="text-[11px] text-zinc-400 block">Perkiraan Total</span><span class="font-display font-extrabold text-lg text-amber-400">${rp(q.totalEstimate)}</span></div></div>`)
          .join('')
      : '<div class="p-8 text-center text-zinc-500 bg-darkcard rounded-2xl border border-zinc-800">Belum ada pesanan masuk.</div>';

  $('#admin').innerHTML = `<aside class="w-full lg:w-64 bg-darkcard border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col shrink-0">
    <div class="p-5 border-b border-zinc-800 flex items-center gap-2.5"><div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950"><i class="fa-solid fa-bolt"></i></div>
      <div><span class="font-display font-bold text-sm block">VOAWSH<span class="text-amber-400">ASIA</span></span><span class="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Panel Admin</span></div></div>
    <nav class="p-3 flex lg:flex-col gap-1.5 overflow-x-auto">${tabs.map(([k, ic, l]) => `<button data-act="admin-tab" data-v="${k}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm whitespace-nowrap transition ${k === state.adminTab ? 'font-bold bg-amber-500 text-zinc-950' : 'font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white'}"><i class="fa-solid ${ic} w-4"></i>${l}${k === 'inquiries' ? `<span class="ml-auto px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-300">${state.inquiries.length}</span>` : ''}</button>`).join('')}</nav>
    <div class="mt-auto p-4 border-t border-zinc-800 flex lg:flex-col gap-2">
      <button data-act="to-public" class="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold"><i class="fa-solid fa-eye text-amber-400 mr-2"></i>Kembali ke Web Utama</button>
      <button data-act="to-public" class="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-400"><i class="fa-solid fa-right-from-bracket mr-2"></i>Keluar</button></div></aside>
  <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
    <div class="flex items-center justify-between gap-4 pb-6 border-b border-zinc-800"><div><h1 class="font-display text-2xl font-extrabold">${tabs.find((t) => t[0] === state.adminTab)![2]}</h1><p class="text-xs sm:text-sm text-zinc-400 mt-0.5">Setiap perubahan langsung tampil di halaman depan.</p></div>
      <button data-act="reset" class="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 hover:text-white"><i class="fa-solid fa-rotate-left mr-1"></i>Reset Data Awal</button></div>
    ${body}</main>`;
}

/** Pembangun input, select, dan kerangka form di modal admin. */
const field = (id: string, label: string, val: string | number, type = 'text', ph = '', extra = '') =>
  `<div><label class="block text-xs font-semibold text-zinc-400 mb-1">${label}</label><input id="${id}" type="${type}" value="${esc(String(val))}" placeholder="${ph}" ${extra} class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500"></div>`;

const select = (id: string, label: string, opts: string[], val: string) =>
  `<div><label class="block text-xs font-semibold text-zinc-400 mb-1">${label}</label><select id="${id}" class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm">${opts.map((o) => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;

/** Input upload foto dengan pratinjau. Hasil kompresi disimpan di input hidden f-img. */
const photoField = (current: string, category: string) => {
  const src = current || D.FALLBACK[category] || '';
  return `<div>
    <label class="block text-xs font-semibold text-zinc-400 mb-1.5">Foto ${current ? '(klik ganti)' : '(opsional)'}</label>
    <img id="f-preview" src="${esc(src)}" alt="Pratinjau foto" class="w-full h-40 object-cover rounded-xl border border-zinc-800 bg-zinc-900 mb-2">
    <div class="flex flex-wrap items-center gap-2">
      <label for="f-file" class="cursor-pointer px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-xs font-bold"><i class="fa-solid fa-upload mr-1.5"></i>Pilih Foto</label>
      <input id="f-file" type="file" accept="image/*" class="hidden">
      <button type="button" data-act="photo-clear" class="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold"><i class="fa-solid fa-trash mr-1"></i>Hapus</button>
    </div>
    <input id="f-img" type="hidden" value="${esc(current)}">
    <p class="text-[11px] text-zinc-500 mt-2">Maks. ${PHOTO_INPUT_MAX_MB} MB saat dipilih · otomatis dikompres ke ±700 KB.</p>
  </div>`;
};

const formShell = (title: string, kind: string, id: string, inner: string) =>
  `<form data-form="${kind}" data-id="${id}" class="bg-darkcard border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
    <div class="flex items-center justify-between pb-4 border-b border-zinc-800"><h3 class="font-display font-bold text-lg">${title}</h3><button type="button" data-act="close" class="text-zinc-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
    ${inner}<div class="flex justify-end gap-3 pt-4 border-t border-zinc-800"><button type="button" data-act="close" class="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 text-sm font-semibold">Batal</button><button class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm">Simpan</button></div></form>`;

/** Form tambah/edit peralatan. */
export function eqForm(id?: string) {
  const e: Equipment = state.equipment.find((x) => x.id === id) ?? {
    id: '',
    name: '',
    category: D.EQ_CATS[0],
    specs: '',
    price: 0,
    stock: 4,
    status: 'Ready',
    image: '',
  };
  openModal(
    formShell(
      id ? 'Edit Data Alat' : 'Tambah Alat Baru',
      'eq',
      e.id,
      field('f-name', 'Nama Alat *', e.name, 'text', 'Speaker Aktif RCF 15 Inch', 'required') +
        `<div class="grid sm:grid-cols-2 gap-4">${select('f-cat', 'Kategori *', D.EQ_CATS, e.category)}${select('f-status', 'Status Stok *', ['Ready', 'Stok Terbatas', 'Habis'], e.status)}</div>` +
        `<div class="grid sm:grid-cols-2 gap-4">${field('f-price', 'Harga Sewa / Hari (Rp) *', e.price || '', 'number', '500000', 'required min="0" step="25000"')}${field('f-stock', 'Jumlah Unit *', e.stock, 'number', '8', 'required min="0"')}</div>` +
        field('f-specs', 'Spesifikasi Singkat *', e.specs, 'text', 'Daya 1400W, suara jernih', 'required') +
        photoField(e.image, e.category),
    ),
  );
}

/** Form tambah/edit portofolio acara. */
export function ptForm(id?: string) {
  const p: Portfolio = state.portfolio.find((x) => x.id === id) ?? {
    id: '',
    title: '',
    category: D.PORT_CATS[0],
    location: '',
    gearUsed: [],
    description: '',
    image: '',
  };
  openModal(
    formShell(
      id ? 'Edit Portofolio Acara' : 'Tambah Portofolio Acara',
      'pt',
      p.id,
      field('f-title', 'Nama Acara *', p.title, 'text', 'Konser Musik Kampus 2026', 'required') +
        `<div class="grid sm:grid-cols-2 gap-4">${select('f-cat', 'Kategori *', D.PORT_CATS, p.category)}${field('f-loc', 'Lokasi *', p.location, 'text', 'Balai Sarbini, Jakarta', 'required')}</div>` +
        field('f-gear', 'Alat yang Dipakai (pisahkan koma) *', p.gearUsed.join(', '), 'text', 'Sound 20.000W, Layar LED 6x4m', 'required') +
        `<div><label class="block text-xs font-semibold text-zinc-400 mb-1">Ringkasan Acara *</label><textarea id="f-desc" rows="3" required class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500">${esc(p.description)}</textarea></div>` +
        photoField(p.image, p.category),
    ),
  );
}

/** Ambil nilai input form berdasarkan id. */
export const val = (id: string) => (document.getElementById(id) as HTMLInputElement).value.trim();
