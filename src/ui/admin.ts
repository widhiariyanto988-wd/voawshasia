import type { Equipment, ImageFit, Inquiry, InquiryStatus, Portfolio } from '../types';
import * as D from '../data';
import { save, state } from '../store';
import { esc, fitCls, img, phoneLabel, rp } from '../lib/format';
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

const INQ_STATUSES: InquiryStatus[] = ['Baru', 'Terjadwal', 'Selesai', 'Dibatalkan'];

const inqBadge = (status: InquiryStatus) => {
  const cls =
    status === 'Baru'
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      : status === 'Terjadwal'
        ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
        : status === 'Selesai'
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          : 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  return `<span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${cls}">${esc(status)}</span>`;
};

/** Cari satu pesanan berdasarkan id. */
const findInquiry = (id: string) => state.inquiries.find((q) => q.id === id);

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

  if (state.adminTab === 'equipment') {
    const groups = D.EQUIPMENT_CATEGORIES.map((cat) => ({
      name: cat.name,
      icon: cat.icon,
      items: state.equipment.filter((e) => e.category === cat.name),
    }));
    const others = state.equipment.filter((e) => !D.EQ_CATS.includes(e.category));
    if (others.length) groups.push({ name: 'Lainnya', icon: 'fa-box', items: others });

    body = `<div class="flex justify-end"><button data-act="eq-form" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm"><i class="fa-solid fa-plus mr-2"></i>Tambah Alat Baru</button></div>
    <div class="space-y-6">${groups
      .map(
        (g) => `<section class="rounded-2xl bg-darkcard border border-zinc-800 overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div class="flex items-center gap-3"><span class="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center"><i class="fa-solid ${g.icon}"></i></span>
            <div><h3 class="font-display font-bold">${esc(g.name)}</h3><p class="text-[11px] text-zinc-500">${g.items.length} alat terdaftar</p></div></div>
          <button data-act="eq-form" data-cat="${esc(g.name)}" class="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-xs font-bold"><i class="fa-solid fa-plus mr-1.5"></i>Tambah di ${esc(g.name)}</button></div>
        ${
          g.items.length
            ? `<div class="overflow-x-auto"><table class="w-full text-left text-sm"><thead><tr class="border-b border-zinc-800 text-xs uppercase text-zinc-400 bg-zinc-900/30"><th class="p-4">Alat</th><th class="p-4">Harga/Hari</th><th class="p-4">Stok</th><th class="p-4">Status</th><th class="p-4 text-right">Aksi</th></tr></thead>
              <tbody class="divide-y divide-zinc-800/80">${g.items
                .map(
                  (e) => `<tr class="hover:bg-zinc-900/40">
                <td class="p-4"><div class="flex items-center gap-3">${img(e.image, e.category, 'w-11 h-11 rounded-xl object-cover', e.fit)}<div><div class="font-bold">${esc(e.name)}</div><div class="text-xs text-zinc-400 line-clamp-1 max-w-xs">${esc(e.specs)}</div></div></div></td>
                <td class="p-4 font-bold text-amber-400 whitespace-nowrap">${rp(e.price)}</td>
                <td class="p-4 text-zinc-300 whitespace-nowrap">${Number(e.stock || 0)} unit</td>
                <td class="p-4"><button data-act="eq-cycle" data-id="${e.id}" title="Klik untuk ubah" class="px-3 py-1.5 rounded-full text-xs font-extrabold border ${statusCls(e.status)}">${e.status}</button></td>
                <td class="p-4 text-right whitespace-nowrap space-x-1"><button data-act="eq-form" data-id="${e.id}" class="p-2 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950"><i class="fa-solid fa-pen"></i></button>
                  <button data-act="eq-del" data-id="${e.id}" class="p-2 rounded-lg bg-zinc-800 hover:bg-rose-500"><i class="fa-solid fa-trash"></i></button></td></tr>`,
                )
                .join('')}</tbody></table></div>`
            : '<div class="p-6 text-center text-xs text-zinc-500">Belum ada alat di kategori ini.</div>'}</section>`,
      )
      .join('')}</div>`;
  }

  if (state.adminTab === 'portfolio')
    body = `<div class="flex justify-end"><button data-act="pt-form" class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold text-sm"><i class="fa-solid fa-plus mr-2"></i>Tambah Portofolio</button></div>
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">${state.portfolio.map((p) => `<div class="rounded-2xl bg-darkcard border border-zinc-800 overflow-hidden">
      <div class="relative h-44">${img(p.image, p.category, 'w-full h-full object-cover')}<span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-zinc-950/85 text-amber-400 text-xs font-bold">${esc(p.category)}</span></div>
      <div class="p-5"><div class="text-xs text-zinc-400 mb-1">${esc(p.location)}</div><h4 class="font-display font-bold">${esc(p.title)}</h4><p class="text-xs text-zinc-400 mt-1.5 line-clamp-2">${esc(p.description)}</p></div>
      <div class="px-5 py-3 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-900/30"><button data-act="pt-form" data-id="${p.id}" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950 text-xs font-bold">Edit</button>
        <button data-act="pt-del" data-id="${p.id}" class="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold">Hapus</button></div></div>`).join('')}</div>`;

  if (state.adminTab === 'inquiries') {
    const query = state.inqSearch.trim().toLowerCase();
    const filtered = state.inquiries.filter(
      (q) =>
        (state.inqFilter === 'Semua' || q.status === state.inqFilter) &&
        (!query ||
          q.clientName.toLowerCase().includes(query) ||
          q.itemsSummary.toLowerCase().includes(query) ||
          q.code.toLowerCase().includes(query) ||
          q.phone.includes(query)),
    );
    const totalEstimate = filtered.reduce((s, q) => s + q.totalEstimate, 0);
    const totalDp = filtered.reduce((s, q) => s + (q.dp || 0), 0);
    body = `<div class="grid sm:grid-cols-3 gap-4">
      ${stat('TOTAL PESANAN (FILTER AKTIF)', `${filtered.length} Pesanan`, `dari ${state.inquiries.length} pesanan masuk`, 'text-amber-400')}
      ${stat('TOTAL ESTIMASI SEWA', rp(totalEstimate), 'Nilai pesanan sesuai filter', 'text-white')}
      ${stat('TOTAL DP MASUK', rp(totalDp), 'DP yang sudah tercatat', 'text-emerald-400')}</div>
    <div class="rounded-2xl bg-darkcard border border-zinc-800 p-4 space-y-4">
      <div class="flex flex-wrap items-center gap-2">${['Semua', ...INQ_STATUSES]
        .map(
          (s) => `<button data-act="inq-filter" data-v="${s}" class="px-3.5 py-2 rounded-xl text-xs font-bold transition ${s === state.inqFilter ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'}">${s}</button>`,
        )
        .join('')}</div>
      <div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"></i>
        <input id="inq-search" value="${esc(state.inqSearch)}" placeholder="Cari klien atau paket..." class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500"></div></div>
    <div class="space-y-4">${filtered.length
      ? filtered
          .map((q) => `<div class="rounded-2xl bg-darkcard border border-zinc-800 p-5 hover:border-amber-500/40 transition">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="flex items-start gap-3"><div class="w-10 h-10 shrink-0 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-extrabold">${esc(q.clientName.charAt(0).toUpperCase() || '?')}</div>
            <div><div class="flex flex-wrap items-center gap-2"><h3 class="font-display font-bold">${esc(q.clientName)}</h3>${inqBadge(q.status)}</div>
              <div class="text-[11px] text-zinc-500 mt-0.5">${esc(q.createdAt)} · <span class="text-zinc-400">#${esc(q.code)}</span></div></div></div>
          <div class="sm:text-right shrink-0"><div class="text-[11px] text-zinc-400">Perkiraan Total</div><div class="font-display font-extrabold text-xl text-amber-400">${rp(q.totalEstimate)}</div></div></div>
        <div class="grid sm:grid-cols-2 gap-2 mt-4 text-xs">
          <div class="text-zinc-400"><i class="fa-brands fa-whatsapp text-emerald-400 mr-1.5"></i>${q.phone ? `<a href="https://wa.me/${esc(q.phone)}" target="_blank" rel="noopener noreferrer" class="text-zinc-200 hover:text-emerald-400">${esc(phoneLabel(q.phone))}</a>` : '<span class="text-zinc-500">Nomor WhatsApp belum diisi</span>'}</div>
          <div class="text-zinc-400"><i class="fa-regular fa-calendar text-cyan-400 mr-1.5"></i>Tanggal Acara: <strong class="text-zinc-200">${esc(q.eventDate)}</strong></div></div>
        <div class="mt-3 text-xs text-zinc-300 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">${esc(q.itemsSummary)}</div>
        <div class="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-xs"><div>DP: <strong class="text-emerald-400">${rp(q.dp || 0)}</strong></div><div>Sisa: <strong class="text-zinc-200">${rp(Math.max(q.totalEstimate - (q.dp || 0), 0))}</strong></div></div>
        <div class="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-zinc-800">
          <label class="flex items-center gap-2 text-xs text-zinc-400">Status
            <select data-act="inq-status" data-id="${q.id}" class="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-amber-500">${INQ_STATUSES.map((s) => `<option ${s === q.status ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
          <div class="flex flex-wrap gap-2">
            <button data-act="inq-wa" data-id="${q.id}" class="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 border border-emerald-500/30 text-xs font-bold"><i class="fa-brands fa-whatsapp mr-1"></i>WhatsApp</button>
            <button data-act="inq-invoice" data-id="${q.id}" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950 text-xs font-bold"><i class="fa-solid fa-file-invoice mr-1"></i>Invoice</button>
            <button data-act="inq-edit" data-id="${q.id}" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-xs font-bold"><i class="fa-solid fa-pen mr-1"></i>Edit</button>
            <button data-act="inq-del" data-id="${q.id}" class="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold"><i class="fa-solid fa-trash"></i></button></div></div></div>`)
          .join('')
      : '<div class="p-8 text-center text-zinc-500 bg-darkcard rounded-2xl border border-zinc-800">Belum ada pesanan yang cocok dengan filter ini.</div>'}</div>`;
  }

  $('#admin').innerHTML = `<aside class="w-full lg:w-64 bg-darkcard border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col shrink-0">
    <div class="p-5 border-b border-zinc-800 flex items-center gap-2.5"><div class="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-fuchsia-600 via-pink-500 to-orange-400 p-[2px]"><img src="${import.meta.env.BASE_URL}logo.jpg" alt="Logo VOAWSHASIA" class="w-full h-full rounded-full object-cover bg-zinc-950 ring-2 ring-zinc-950"></div>
      <div><span class="font-display font-bold text-sm block">VOAWSH<span class="text-amber-400">ASIA</span></span><span class="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Panel Admin</span></div></div>
    <nav class="p-3 flex lg:flex-col gap-1.5 overflow-x-auto">${tabs.map(([k, ic, l]) => `<button data-act="admin-tab" data-v="${k}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm whitespace-nowrap transition ${k === state.adminTab ? 'font-bold bg-amber-500 text-zinc-950' : 'font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white'}"><i class="fa-solid ${ic} w-4"></i>${l}${k === 'inquiries' ? `<span class="ml-auto px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-300">${state.inquiries.length}</span>` : ''}</button>`).join('')}</nav>
    <div class="mt-auto p-4 border-t border-zinc-800 flex lg:flex-col gap-2">
      <button data-act="to-public" class="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold"><i class="fa-solid fa-eye text-amber-400 mr-2"></i>Kembali ke Web Utama</button>
      <button data-act="to-public" class="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-400"><i class="fa-solid fa-right-from-bracket mr-2"></i>Keluar</button></div></aside>
  <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
    <div class="flex items-center justify-between gap-4 pb-6 border-b border-zinc-800"><div><h1 class="font-display text-2xl font-extrabold">${tabs.find((t) => t[0] === state.adminTab)![2]}</h1><p class="text-xs sm:text-sm text-zinc-400 mt-0.5">${state.adminTab === 'inquiries' ? 'Pantau dan kelola pesanan masuk dari website.' : 'Setiap perubahan langsung tampil di halaman depan.'}</p></div>
      <button data-act="reset" class="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 hover:text-white"><i class="fa-solid fa-rotate-left mr-1"></i>Reset Data Awal</button></div>
    ${body}</main>`;
}

/** Pembangun input, select, dan kerangka form di modal admin. */
const field = (id: string, label: string, val: string | number, type = 'text', ph = '', extra = '') =>
  `<div><label class="block text-xs font-semibold text-zinc-400 mb-1">${label}</label><input id="${id}" type="${type}" value="${esc(String(val))}" placeholder="${ph}" ${extra} class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500"></div>`;

const select = (id: string, label: string, opts: string[], val: string) =>
  `<div><label class="block text-xs font-semibold text-zinc-400 mb-1">${label}</label><select id="${id}" class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm">${opts.map((o) => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;

/** Opsi tampilan foto alat: cover memotong, contain/fit memperlihatkan seluruh foto. */
const PHOTO_FITS: { value: ImageFit; label: string }[] = [
  { value: 'cover', label: 'Cover — isi kotak (bisa terpotong)' },
  { value: 'contain', label: 'Fit — seluruh foto terlihat' },
  { value: 'fill', label: 'Fill — penuh kotak (diregangkan)' },
];

/** Input upload foto dengan pratinjau. Hasil kompresi disimpan di input hidden f-img. */
const photoField = (current: string, category: string, fit?: ImageFit) => {
  const src = current || D.FALLBACK[category] || '';
  const active = fit || 'cover';
  const fitOption = fit
    ? `<div><label for="f-fit" class="block text-xs font-semibold text-zinc-400 mb-1">Ukuran Tampilan Foto</label>
        <select id="f-fit" class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500">
          ${PHOTO_FITS.map((o) => `<option value="${o.value}" ${o.value === active ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>
        <p class="text-[11px] text-zinc-500 mt-1">Pratinjau langsung berubah. Pilih <b class="text-zinc-300">Fit</b> agar foto tidak terpotong.</p></div>`
    : '';
  return `<div>
    <label class="block text-xs font-semibold text-zinc-400 mb-1.5">Foto ${current ? '(klik ganti)' : '(opsional)'}</label>
    <div class="relative h-40 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 mb-2">
      <img id="f-preview" src="${esc(src)}" alt="Pratinjau foto" class="w-full h-full ${fitCls(active)}" style="object-fit:${active}">
      <span class="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-zinc-950/85 text-[10px] font-bold text-amber-400 border border-zinc-700">PRATINJAU</span>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <label for="f-file" class="cursor-pointer px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-xs font-bold"><i class="fa-solid fa-upload mr-1.5"></i>Pilih Foto</label>
      <input id="f-file" type="file" accept="image/*" class="hidden">
      <button type="button" data-act="photo-clear" class="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold"><i class="fa-solid fa-trash mr-1"></i>Hapus</button>
    </div>
    ${fitOption}
    <input id="f-img" type="hidden" value="${esc(current)}">
    <p class="text-[11px] text-zinc-500 mt-2">Maks. ${PHOTO_INPUT_MAX_MB} MB saat dipilih · otomatis dikompres ke ±700 KB.</p>
  </div>`;
};

const formShell = (title: string, kind: string, id: string, inner: string) =>
  `<form data-form="${kind}" data-id="${id}" class="bg-darkcard border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
    <div class="flex items-center justify-between pb-4 border-b border-zinc-800"><h3 class="font-display font-bold text-lg">${title}</h3><button type="button" data-act="close" class="text-zinc-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
    ${inner}<div class="flex justify-end gap-3 pt-4 border-t border-zinc-800"><button type="button" data-act="close" class="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 text-sm font-semibold">Batal</button><button class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm">Simpan</button></div></form>`;

/** Form tambah/edit peralatan. */
export function eqForm(id?: string, presetCat?: string) {
  const e: Equipment = state.equipment.find((x) => x.id === id) ?? {
    id: '',
    name: '',
    category: presetCat && D.EQ_CATS.includes(presetCat) ? presetCat : D.EQ_CATS[0],
    specs: '',
    price: 0,
    stock: 4,
    status: 'Ready',
    image: '',
    fit: 'cover',
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
        photoField(e.image, e.category, e.fit),
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

/** Form edit data pesanan masuk. */
export function inqForm(id: string) {
  const q: Inquiry | undefined = findInquiry(id);
  if (!q) return;
  openModal(
    formShell(
      'Edit Pesanan Masuk',
      'inq',
      q.id,
      `<div class="grid sm:grid-cols-2 gap-4">${field('f-client', 'Nama Klien *', q.clientName, 'text', 'Nama klien', 'required')}${field('f-phone', 'Nomor WhatsApp', q.phone, 'tel', '62812...', 'inputmode="tel"')}</div>` +
        `<div class="grid sm:grid-cols-2 gap-4">${field('f-date', 'Tanggal Acara', q.eventDate, 'date', '', '')}${field('f-dp', 'DP Diterima (Rp)', q.dp || 0, 'number', '0', 'min="0" step="500000"')}</div>` +
        select('f-status', 'Status Pesanan', INQ_STATUSES, q.status),
    ),
  );
}

/** Invoice pesanan yang bisa dicetak dari panel admin. */
export function invoiceModal(id: string) {
  const q: Inquiry | undefined = findInquiry(id);
  if (!q) return;
  openModal(`<div id="invoice-print" class="bg-white text-zinc-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
    <div class="flex items-start justify-between gap-4 border-b border-zinc-200 pb-5"><div><div class="font-display text-xl font-extrabold">VOAWSH<span class="text-amber-600">ASIA</span></div><div class="text-[11px] text-zinc-500">Production &amp; Rental · Sewa Alat Event</div></div>
      <div class="text-right"><div class="font-extrabold tracking-wider">INVOICE</div><div class="text-xs text-zinc-500">#${esc(q.code)}</div></div></div>
    <div class="grid grid-cols-2 gap-4 text-xs"><div><div class="text-zinc-500 mb-1">DITAGIHKAN KEPADA</div><div class="font-bold">${esc(q.clientName)}</div><div class="text-zinc-600">${esc(phoneLabel(q.phone))}</div></div>
      <div class="text-right"><div class="text-zinc-500 mb-1">TANGGAL ACARA</div><div class="font-bold">${esc(q.eventDate)}</div><div class="text-zinc-600">Status: ${esc(q.status)}</div></div></div>
    <div><div class="text-[11px] font-bold text-zinc-500 mb-2">RINCIAN PESANAN</div><div class="rounded-xl bg-zinc-100 p-3 text-xs">${esc(q.itemsSummary)}</div></div>
    <div class="space-y-2 text-sm border-t border-zinc-200 pt-4"><div class="flex justify-between"><span class="text-zinc-500">Estimasi Sewa</span><span class="font-bold">${rp(q.totalEstimate)}</span></div>
      <div class="flex justify-between"><span class="text-zinc-500">DP Diterima</span><span class="font-bold text-emerald-600">${rp(q.dp || 0)}</span></div>
      <div class="flex justify-between text-lg font-extrabold border-t border-zinc-200 pt-2"><span>Sisa Pembayaran</span><span class="text-amber-600">${rp(Math.max(q.totalEstimate - (q.dp || 0), 0))}</span></div></div>
    <div class="flex gap-2 pt-2 no-print"><button data-act="inq-print" class="flex-1 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-extrabold text-sm"><i class="fa-solid fa-print mr-2"></i>Cetak Invoice</button>
      <button data-act="close" class="px-5 py-2.5 rounded-xl bg-zinc-200 text-zinc-800 font-bold text-sm">Tutup</button></div></div>`);
}

/** Ambil nilai input form berdasarkan id. */
export const val = (id: string) => (document.getElementById(id) as HTMLInputElement).value.trim();
