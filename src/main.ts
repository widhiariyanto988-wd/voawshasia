import './style.css';
import type { Equipment, Portfolio, Inquiry, CartItem, Status } from './types';
import * as D from './data';

// ---------- util ----------
const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
const rp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID');
const esc = (s: string) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : structuredClone(d); } catch { return structuredClone(d); } };
const wa = (text: string) => `https://wa.me/${D.WA}?text=${encodeURIComponent(text)}`;
const img = (src: string, cat: string, cls: string) =>
  `<img src="${esc(src)}" alt="" class="${cls}" onerror="this.onerror=null;this.src='${D.FALLBACK[cat] ?? ''}'">`;

// ---------- state ----------
let equipment = load<Equipment[]>('vs_ts_equipment', D.DEFAULT_EQUIPMENT);
let portfolio = load<Portfolio[]>('vs_ts_portfolio', D.DEFAULT_PORTFOLIO);
let inquiries = load<Inquiry[]>('vs_ts_inquiries', D.DEFAULT_INQUIRIES);
let cart = load<CartItem[]>('vs_ts_cart', []);
let portCat = 'Semua', eqCat = 'Semua', adminTab = 'overview', search = '';

const save = () => {
  localStorage.setItem('vs_ts_equipment', JSON.stringify(equipment));
  localStorage.setItem('vs_ts_portfolio', JSON.stringify(portfolio));
  localStorage.setItem('vs_ts_inquiries', JSON.stringify(inquiries));
  localStorage.setItem('vs_ts_cart', JSON.stringify(cart));
};

function toast(msg: string, warn = false) {
  const el = document.createElement('div');
  el.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-zinc-900 shadow-2xl text-sm font-semibold ${warn ? 'border-amber-500/60 text-amber-300' : 'border-emerald-500/60 text-emerald-300'}`;
  el.innerHTML = `<i class="fa-solid ${warn ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i><span>${esc(msg)}</span>`;
  $('#toast').appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

const chip = (on: boolean, act: string, v: string, label: string) =>
  `<button data-act="${act}" data-v="${esc(v)}" class="shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm transition ${on ? 'font-bold bg-amber-500 text-zinc-950' : 'font-semibold bg-darkcard text-zinc-300 hover:bg-zinc-800 border border-zinc-800'}">${esc(label)}</button>`;

const statusCls = (s: Status) => s === 'Ready' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  : s === 'Stok Terbatas' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

// ---------- public page ----------
const NAV: [string, string][] = [['hasil-kerja', 'Hasil Kerja'], ['daftar-alat', 'Daftar Alat'], ['paket-hemat', 'Paket Hemat'], ['cara-sewa', 'Cara Sewa']];

function renderShell() {
  const pk = D.PACKAGES.map((p, i) => `
    <div class="rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative ${p.featured ? 'bg-gradient-to-b from-zinc-900 to-darkcard border-2 border-amber-500 shadow-xl shadow-amber-500/10' : 'bg-darkcard border border-zinc-800'}">
      ${p.featured ? '<div class="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-amber-500 text-zinc-950 text-xs font-extrabold uppercase">Paling Laris</div>' : ''}
      <div>
        <span class="px-3 py-1 rounded-full bg-zinc-800 text-${p.color}-400 text-xs font-semibold">${esc(p.tag)}</span>
        <h3 class="font-display text-xl font-bold text-white mt-4">${esc(p.name)}</h3>
        <div class="mt-3"><span class="text-2xl sm:text-3xl font-extrabold text-amber-400">${rp(p.price)}</span> <span class="text-xs text-zinc-400">/ hari</span></div>
        <ul class="mt-6 space-y-3 text-sm text-zinc-300">${p.items.map(t => `<li class="flex items-center gap-2.5"><i class="fa-solid fa-check text-${p.color}-400"></i>${esc(t)}</li>`).join('')}</ul>
      </div>
      <button data-act="add-pkg" data-v="${i}" class="mt-8 w-full py-3.5 rounded-xl font-bold text-sm transition ${p.featured ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold' : 'bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-white'}">Pilih Paket Ini</button>
    </div>`).join('');

  $('#public').innerHTML = `
  <header class="sticky top-0 z-40 glass-nav border-b border-zinc-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
      <a href="#top" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 text-xl"><i class="fa-solid fa-bolt"></i></div>
        <div><span class="font-display font-extrabold text-xl text-white">Vibe<span class="text-amber-400">Stage</span></span>
        <span class="block text-[10px] uppercase tracking-widest text-zinc-400 -mt-1">Production & Rental</span></div>
      </a>
      <nav class="hidden md:flex gap-8 text-sm font-medium text-zinc-300">${NAV.map(([h, l]) => `<a href="#${h}" class="hover:text-amber-400 transition">${l}</a>`).join('')}</nav>
      <div class="flex items-center gap-2.5">
        <button data-act="cart-open" class="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center gap-2">
          <i class="fa-solid fa-cart-shopping text-amber-400"></i><span class="hidden sm:inline text-sm font-semibold">Keranjang Sewa</span>
          <span id="cart-badge" class="px-2 py-0.5 text-xs font-extrabold text-zinc-950 bg-amber-400 rounded-full">0</span></button>
        <a href="${wa('Halo VibeStage, saya mau tanya sewa alat event.')}" target="_blank" class="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold flex items-center gap-2"><i class="fa-brands fa-whatsapp"></i>Chat WA</a>
        <button data-act="menu" class="md:hidden p-2.5 rounded-xl bg-zinc-900 border border-zinc-800"><i class="fa-solid fa-bars"></i></button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden md:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-2">${NAV.map(([h, l]) => `<a href="#${h}" data-act="menu" class="block px-3 py-2.5 text-sm text-zinc-300 hover:text-amber-400">${l}</a>`).join('')}</div>
  </header>

  <section id="top" class="relative overflow-hidden hero-radial pt-16 pb-20 md:pt-24 md:pb-28 border-b border-zinc-800/70">
    <div class="absolute inset-0 -z-10 opacity-20"><img src="${D.FALLBACK['Konser & Musik']}" alt="" class="w-full h-full object-cover"><div class="absolute inset-0 bg-gradient-to-t from-darkbg via-darkbg/80 to-transparent"></div></div>
    <div class="max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-semibold mb-6"><span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>Sewa Alat Event &amp; Produksi Panggung</div>
      <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] mb-6">Bikin Acaramu Meriah dengan <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-cyan-400">Alat Standar Konser</span></h1>
      <p class="text-lg text-zinc-300 mb-9 max-w-2xl">Sewa sound system, lighting, layar LED, dan panggung lengkap dengan tim teknis berpengalaman. Siap pasang di lokasi.</p>
      <div class="flex flex-col sm:flex-row gap-4 mb-14">
        <a href="#daftar-alat" class="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/25"><i class="fa-solid fa-sliders"></i>Pilih Alat Sewa</a>
        <a href="${wa('Halo VibeStage, saya mau tanya harga sewa alat event.')}" target="_blank" class="px-8 py-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 font-bold flex items-center justify-center gap-2.5"><i class="fa-brands fa-whatsapp text-emerald-400 text-lg"></i>Tanya Harga via WA</a>
      </div>
      <div class="grid grid-cols-3 gap-4 sm:gap-10 pt-8 border-t border-zinc-800/80 w-full max-w-2xl">
        <div><div class="font-display text-3xl font-extrabold">500+</div><div class="text-sm text-zinc-400 mt-1">Acara Sukses</div></div>
        <div><div id="hero-units" class="font-display text-3xl font-extrabold text-amber-400">0+</div><div class="text-sm text-zinc-400 mt-1">Unit Alat Ready</div></div>
        <div><div class="font-display text-3xl font-extrabold text-cyan-400">24 Jam</div><div class="text-sm text-zinc-400 mt-1">Tim Standby</div></div>
      </div>
    </div>
  </section>

  <section id="hasil-kerja" class="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div><span class="text-amber-400 font-bold text-xs uppercase tracking-widest">Portofolio</span>
        <h2 class="font-display text-3xl sm:text-4xl font-extrabold mt-1.5">Hasil Kerja Kami</h2>
        <p class="text-zinc-400 mt-2 max-w-xl">Klik foto acara untuk melihat daftar alat yang dipakai dan pesan paket serupa.</p></div>
      <div id="port-filters" class="flex flex-wrap gap-2"></div>
    </div>
    <div id="port-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
  </section>

  <section id="daftar-alat" class="py-16 md:py-24 bg-zinc-950/60 border-y border-zinc-800/80 w-full">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div><span class="text-cyan-400 font-bold text-xs uppercase tracking-widest">Katalog Sewa</span>
          <h2 class="font-display text-3xl sm:text-4xl font-extrabold mt-1.5">Daftar Alat Rental</h2>
          <p class="text-zinc-400 mt-2 max-w-xl">Cek stok dan harga sewa per hari. Klik tombol sewa untuk menghitung total biaya.</p></div>
        <div class="relative w-full lg:w-80"><i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm"></i>
          <input id="search" placeholder="Cari speaker, lampu, LED..." class="w-full pl-11 pr-4 py-3 rounded-xl bg-darkcard border border-zinc-800 text-sm focus:outline-none focus:border-amber-500"></div>
      </div>
      <div id="cat-filters" class="flex overflow-x-auto pb-2 mb-8 gap-2"></div>
      <div id="cat-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"></div>
    </div>
  </section>

  <section id="paket-hemat" class="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
    <div class="text-center max-w-2xl mx-auto mb-12"><span class="text-amber-400 font-bold text-xs uppercase tracking-widest">Lebih Praktis &amp; Terjangkau</span>
      <h2 class="font-display text-3xl sm:text-4xl font-extrabold mt-1.5">Paket Hemat Siap Pakai</h2>
      <p class="text-zinc-400 mt-2">Harga sudah termasuk antar-jemput dalam kota, pasang bongkar, dan operator selama acara.</p></div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${pk}</div>
  </section>

  <section id="cara-sewa" class="py-16 bg-zinc-950/60 border-t border-zinc-800/80 w-full">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12"><span class="text-cyan-400 font-bold text-xs uppercase tracking-widest">Mudah &amp; Cepat</span><h2 class="font-display text-3xl font-extrabold mt-1.5">Cara Sewa Alat di VibeStage</h2></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">${D.STEPS.map(([t, d], i) => `
        <div class="p-6 rounded-2xl bg-darkcard border border-zinc-800 text-center">
          <div class="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 font-display font-extrabold text-lg flex items-center justify-center mx-auto mb-4">${i + 1}</div>
          <h3 class="font-bold">${esc(t)}</h3><p class="text-xs text-zinc-400 mt-2 leading-relaxed">${esc(d)}</p></div>`).join('')}</div>
    </div>
  </section>

  <footer class="bg-zinc-950 border-t border-zinc-800/80 py-12 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div><div class="flex items-center gap-3 mb-4"><div class="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950"><i class="fa-solid fa-bolt"></i></div><span class="font-display font-extrabold text-lg">Vibe<span class="text-amber-400">Stage</span></span></div>
        <p class="text-zinc-400 text-sm leading-relaxed">Penyedia sewa sound system, lighting, layar LED, dan panggung konser terpercaya dengan kru teknis siap siaga.</p></div>
      <div><h4 class="font-bold text-sm uppercase tracking-wider mb-4">Alamat Gudang</h4>
        <ul class="space-y-2.5 text-sm text-zinc-400">
          <li><i class="fa-solid fa-location-dot text-amber-400 mr-2"></i>Jl. Industri Raya No. 88, Jakarta Selatan</li>
          <li><i class="fa-solid fa-clock text-amber-400 mr-2"></i>Buka Setiap Hari: 08.00 – 22.00 WIB</li>
          <li><i class="fa-brands fa-whatsapp text-emerald-400 mr-2"></i>+62 812-3456-7890</li></ul></div>
      <div><h4 class="font-bold text-sm uppercase tracking-wider mb-4">Navigasi Cepat</h4><div class="flex flex-wrap gap-2">
        ${NAV.slice(0, 3).map(([h, l]) => `<a href="#${h}" class="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 text-xs hover:text-amber-400">${l}</a>`).join('')}
        <button data-act="cart-open" class="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 text-xs hover:text-amber-400">Keranjang Sewa</button></div></div>
    </div>
    <div class="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-zinc-900 text-center text-xs text-zinc-500">
      <span id="secret" class="select-none cursor-default">&copy; 2026 VibeStage Production &amp; Rental. Hak Cipta Dilindungi.</span></div>
  </footer>`;
}

function renderPortfolio() {
  $('#port-filters').innerHTML = ['Semua', ...D.PORT_CATS].map(c => chip(c === portCat, 'port-filter', c, c)).join('');
  const list = portCat === 'Semua' ? portfolio : portfolio.filter(p => p.category === portCat);
  $('#port-grid').innerHTML = list.length ? list.map((p, i) => `
    <div data-act="port-detail" data-id="${p.id}" class="${i === 0 && list.length >= 3 ? 'md:col-span-2' : ''} group relative rounded-2xl overflow-hidden bg-darkcard border border-zinc-800 hover:border-amber-500/70 cursor-pointer h-72 sm:h-80">
      ${img(p.image, p.category, 'w-full h-full object-cover group-hover:scale-105 transition duration-500')}
      <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"></div>
      <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-zinc-950/85 border border-zinc-700 text-amber-400 text-xs font-bold">${esc(p.category)}</span>
      <div class="absolute bottom-0 inset-x-0 p-6">
        <div class="text-xs text-zinc-300 mb-1"><i class="fa-solid fa-location-dot text-amber-400 mr-1"></i>${esc(p.location)}</div>
        <h3 class="font-display text-xl font-extrabold group-hover:text-amber-400 transition">${esc(p.title)}</h3>
        <div class="mt-2 text-xs font-bold text-cyan-400">Lihat Detail &amp; Alat yang Dipakai <i class="fa-solid fa-arrow-right"></i></div>
      </div></div>`).join('')
    : '<div class="col-span-full text-center py-12 text-zinc-500 bg-darkcard rounded-2xl border border-zinc-800">Belum ada foto acara di kategori ini.</div>';
}

function renderCatalog() {
  $('#cat-filters').innerHTML = ['Semua', ...D.EQ_CATS].map(c => chip(c === eqCat, 'cat-filter', c, c)).join('');
  const hu = equipment.filter(e => e.status !== 'Habis').reduce((a, e) => a + Number(e.stock || 0), 0);
  $('#hero-units').textContent = hu + '+';
  const q = search.toLowerCase();
  const list = equipment.filter(e => (eqCat === 'Semua' || e.category === eqCat) && (e.name + e.specs).toLowerCase().includes(q));
  $('#cat-grid').innerHTML = list.length ? list.map(e => {
    const ok = e.status !== 'Habis';
    return `<div class="rounded-2xl bg-darkcard border border-zinc-800 hover:border-zinc-700 overflow-hidden flex flex-col justify-between group">
      <div><div class="relative h-48 overflow-hidden bg-zinc-900">
        ${img(e.image, e.category, `w-full h-full object-cover group-hover:scale-105 transition duration-500 ${ok ? '' : 'opacity-45 grayscale'}`)}
        <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-zinc-950/85 text-[11px] font-semibold text-zinc-300 border border-zinc-800">${esc(e.category)}</span>
        <span class="absolute top-3 right-3 px-2.5 py-1 rounded-lg border text-[11px] font-extrabold ${statusCls(e.status)}">${e.status}</span></div>
      <div class="p-5"><h3 class="font-display font-bold text-base line-clamp-1" title="${esc(e.name)}">${esc(e.name)}</h3><p class="text-xs text-zinc-400 mt-1.5 line-clamp-1">${esc(e.specs)}</p></div></div>
      <div class="px-5 pb-5 pt-3 border-t border-zinc-800/70">
        <div class="flex items-baseline justify-between mb-3"><span class="text-[11px] text-zinc-500">Harga Sewa</span><div><span class="font-display font-extrabold text-amber-400">${rp(e.price)}</span><span class="text-[11px] text-zinc-400">/hari</span></div></div>
        <button data-act="add" data-id="${e.id}" ${ok ? '' : 'disabled'} class="w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${ok ? 'bg-zinc-900 hover:bg-amber-500 hover:text-zinc-950 border border-zinc-700 hover:border-amber-500' : 'bg-zinc-900/50 text-zinc-600 border border-zinc-800 cursor-not-allowed'}">
          <i class="fa-solid ${ok ? 'fa-plus' : 'fa-ban'}"></i>${ok ? 'Sewa Alat Ini' : 'Stok Habis'}</button></div></div>`;
  }).join('') : '<div class="col-span-full text-center py-12 text-zinc-500 bg-darkcard rounded-2xl border border-zinc-800">Alat yang kamu cari tidak ditemukan.</div>';
}

function renderPublic() { renderPortfolio(); renderCatalog(); updateBadge(); }

// ---------- modal / drawer ----------
const openModal = (html: string) => { const m = $('#modal'); m.innerHTML = html; m.classList.remove('hidden'); };
const closeModal = () => $('#modal').classList.add('hidden');
const closeDrawer = () => $('#drawer').classList.add('hidden');

function portDetail(id: string) {
  const p = portfolio.find(x => x.id === id); if (!p) return;
  openModal(`<div class="bg-darkcard border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
    <div class="relative h-64">${img(p.image, p.category, 'w-full h-full object-cover')}
      <div class="absolute inset-0 bg-gradient-to-t from-darkcard via-transparent to-black/40"></div>
      <button data-act="close" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-950/85 hover:bg-amber-500 hover:text-zinc-950"><i class="fa-solid fa-xmark"></i></button>
      <span class="absolute bottom-4 left-6 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 text-xs font-extrabold">${esc(p.category)}</span></div>
    <div class="p-6 space-y-5">
      <div><h3 class="font-display text-2xl font-extrabold">${esc(p.title)}</h3><div class="text-xs text-zinc-400 mt-1.5"><i class="fa-solid fa-location-dot text-amber-400 mr-1.5"></i>${esc(p.location)}</div></div>
      <p class="text-sm text-zinc-300 leading-relaxed">${esc(p.description)}</p>
      <div class="pt-4 border-t border-zinc-800"><h4 class="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Alat yang Dipakai di Acara Ini:</h4>
        <div class="flex flex-wrap gap-2">${p.gearUsed.map(g => `<span class="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs"><i class="fa-solid fa-check text-amber-400 text-[10px] mr-1.5"></i>${esc(g)}</span>`).join('')}</div></div>
      <div class="pt-4 flex gap-3">
        <a href="${wa('Halo VibeStage, saya mau sewa paket alat serupa acara: ' + p.title)}" target="_blank" class="flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm text-center"><i class="fa-brands fa-whatsapp mr-1.5"></i>Sewa Paket Serupa</a>
        <button data-act="close" class="py-3.5 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-bold">Tutup</button></div>
    </div></div>`);
}

// ---------- cart ----------
const updateBadge = () => { const b = document.getElementById('cart-badge'); if (b) b.textContent = String(cart.reduce((s, c) => s + c.qty, 0)); };

function addCart(id: string, name: string, price: number) {
  const f = cart.find(c => c.id === id);
  if (f) f.qty++; else cart.push({ id, name, price, qty: 1, days: 1 });
  save(); updateBadge(); toast(`"${name}" masuk ke Keranjang Sewa`);
}

function renderDrawer() {
  let total = 0;
  const items = cart.length ? cart.map((c, i) => {
    const sub = c.price * c.qty * c.days; total += sub;
    const stepper = (field: 'qty' | 'days', label: string) => `<div class="flex items-center gap-2"><span class="text-zinc-400">${label}:</span>
      <div class="flex items-center bg-zinc-900 rounded-lg border border-zinc-700">
        <button data-act="step" data-i="${i}" data-f="${field}" data-d="-1" class="px-2.5 py-1 hover:text-amber-400 font-bold">-</button>
        <span class="px-2 font-bold">${c[field]}</span>
        <button data-act="step" data-i="${i}" data-f="${field}" data-d="1" class="px-2.5 py-1 hover:text-amber-400 font-bold">+</button></div></div>`;
    return `<div class="p-4 rounded-xl bg-darkcard border border-zinc-800 space-y-3">
      <div class="flex justify-between gap-2"><div><h4 class="text-sm font-bold">${esc(c.name)}</h4><span class="text-[11px] text-zinc-400">${rp(c.price)} / hari</span></div>
        <button data-act="step" data-i="${i}" data-f="qty" data-d="-999" class="text-zinc-500 hover:text-rose-400 p-1"><i class="fa-solid fa-trash"></i></button></div>
      <div class="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">${stepper('qty', 'Unit')}${stepper('days', 'Hari')}</div>
      <div class="text-right text-xs font-extrabold text-amber-400">Subtotal: ${rp(sub)}</div></div>`;
  }).join('') : `<div class="text-center py-14"><div class="w-14 h-14 rounded-2xl bg-zinc-900 text-zinc-600 flex items-center justify-center mx-auto mb-3 text-xl"><i class="fa-solid fa-cart-shopping"></i></div>
      <p class="text-sm font-bold text-zinc-300">Keranjang Sewa Masih Kosong</p><p class="text-xs text-zinc-500 mt-1">Pilih alat atau paket hemat terlebih dahulu.</p></div>`;
  const keep = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value ?? '';
  const [n, d] = [keep('c-name'), keep('c-date')];
  $('#drawer').innerHTML = `<div class="bg-zinc-950 border-l border-zinc-800 w-full max-w-md h-full flex flex-col justify-between shadow-2xl">
    <div class="p-5 border-b border-zinc-800 flex items-center justify-between"><div><h3 class="font-display font-bold text-lg">Keranjang Sewa</h3><p class="text-xs text-zinc-400">Atur jumlah unit dan lama hari sewa</p></div>
      <button data-act="drawer-close" class="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="flex-1 overflow-y-auto p-5 space-y-4">${items}</div>
    <div class="p-5 border-t border-zinc-800 bg-darkcard space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div><label class="block text-[11px] font-semibold text-zinc-400 mb-1">Nama Penyewa</label><input id="c-name" value="${esc(n)}" placeholder="Contoh: Andi" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-amber-500"></div>
        <div><label class="block text-[11px] font-semibold text-zinc-400 mb-1">Tanggal Acara</label><input id="c-date" type="date" value="${esc(d)}" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-amber-500"></div></div>
      <div class="flex items-center justify-between pt-2 border-t border-zinc-800/80"><span class="text-xs text-zinc-400">Total Biaya Sewa:</span><span class="font-display text-xl font-extrabold text-amber-400">${rp(total)}</span></div>
      <button data-act="order" class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2"><i class="fa-brands fa-whatsapp text-lg"></i>Kirim Pesanan ke WhatsApp</button></div></div>`;
}
const openDrawer = () => { renderDrawer(); $('#drawer').classList.remove('hidden'); };

function order() {
  if (!cart.length) return toast('Keranjang masih kosong, pilih alat dulu ya!', true);
  const name = (($('#c-name') as HTMLInputElement).value || '').trim() || 'Penyewa';
  const date = ($('#c-date') as HTMLInputElement).value || 'Belum ditentukan';
  let total = 0;
  const lines = cart.map((c, i) => { const s = c.price * c.qty * c.days; total += s; return `${i + 1}. ${c.name} (${c.qty} unit x ${c.days} hari) = ${rp(s)}`; });
  inquiries.unshift({ id: 'inq-' + Date.now(), clientName: name, eventDate: date, totalEstimate: total, createdAt: new Date().toLocaleString('id-ID'),
    itemsSummary: cart.map(c => `${c.qty}x ${c.name} (${c.days} hari)`).join(', ') });
  save();
  toast('Pesanan dicatat & membuka WhatsApp...');
  window.open(wa(`Halo *VibeStage*, saya mau pesan sewa alat event:\n\n*Nama:* ${name}\n*Tanggal Acara:* ${date}\n\n*Daftar Sewa:*\n${lines.join('\n')}\n\n*Total Perkiraan:* ${rp(total)}\n\nApakah alatnya ready di tanggal tersebut?`), '_blank');
}

// ---------- admin ----------
const loginModal = () => {
  openModal(`<form data-form="login" class="bg-darkcard border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
    <div class="flex items-center justify-between"><h3 class="font-display font-bold text-lg"><i class="fa-solid fa-key text-amber-400 mr-2"></i>Login Admin</h3><button type="button" data-act="close" class="text-zinc-500 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
    <div><label class="block text-xs font-semibold text-zinc-400 mb-1.5">Kata Sandi Admin</label><input type="password" id="pass" required placeholder="Masukkan sandi..." class="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500"></div>
    <button class="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm">Masuk Dashboard</button></form>`);
  setTimeout(() => $('#pass')?.focus(), 50);
};

function setView(admin: boolean) {
  $('#public').classList.toggle('hidden', admin);
  $('#admin').classList.toggle('hidden', !admin);
  if (admin) renderAdmin(); else renderPublic();
  window.scrollTo(0, 0);
}

function renderAdmin() {
  const tabs: [string, string, string][] = [['overview', 'fa-chart-pie', 'Ringkasan'], ['equipment', 'fa-sliders', 'Kelola Alat'], ['portfolio', 'fa-images', 'Kelola Portofolio'], ['inquiries', 'fa-inbox', 'Pesanan Masuk']];
  const units = equipment.reduce((s, e) => s + Number(e.stock || 0), 0);
  const stat = (t: string, v: string, sub: string, c: string) => `<div class="p-5 rounded-2xl bg-darkcard border border-zinc-800"><div class="text-zinc-400 text-xs font-semibold">${t}</div><div class="font-display text-3xl font-extrabold ${c} mt-3">${v}</div><div class="text-xs text-zinc-400 mt-1">${sub}</div></div>`;
  let body = '';
  if (adminTab === 'overview') body = `<div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      ${stat('TOTAL ALAT', equipment.length + ' Jenis', units + ' unit terdaftar', 'text-white')}
      ${stat('ALAT READY', equipment.filter(e => e.status === 'Ready').length + ' Jenis', 'Siap disewa hari ini', 'text-emerald-400')}
      ${stat('PORTOFOLIO', portfolio.length + ' Acara', 'Ditampilkan ke pengunjung', 'text-white')}
      ${stat('PESANAN MASUK', inquiries.length + ' Pesanan', 'Dari keranjang sewa web', 'text-amber-400')}</div>`;
  if (adminTab === 'equipment') body = `<div class="flex justify-end"><button data-act="eq-form" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm"><i class="fa-solid fa-plus mr-2"></i>Tambah Alat Baru</button></div>
    <div class="rounded-2xl bg-darkcard border border-zinc-800 overflow-x-auto"><table class="w-full text-left text-sm"><thead><tr class="border-b border-zinc-800 text-xs uppercase text-zinc-400 bg-zinc-900/50"><th class="p-4">Alat</th><th class="p-4">Kategori</th><th class="p-4">Harga/Hari</th><th class="p-4">Status</th><th class="p-4 text-right">Aksi</th></tr></thead>
    <tbody class="divide-y divide-zinc-800/80">${equipment.map(e => `<tr class="hover:bg-zinc-900/40">
      <td class="p-4"><div class="flex items-center gap-3">${img(e.image, e.category, 'w-11 h-11 rounded-xl object-cover')}<div><div class="font-bold">${esc(e.name)}</div><div class="text-xs text-zinc-400 line-clamp-1 max-w-xs">${esc(e.specs)}</div></div></div></td>
      <td class="p-4"><span class="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs">${esc(e.category)}</span></td>
      <td class="p-4 font-bold text-amber-400 whitespace-nowrap">${rp(e.price)}</td>
      <td class="p-4"><button data-act="eq-cycle" data-id="${e.id}" title="Klik untuk ubah" class="px-3 py-1.5 rounded-full text-xs font-extrabold border ${statusCls(e.status)}">${e.status}</button></td>
      <td class="p-4 text-right whitespace-nowrap space-x-1"><button data-act="eq-form" data-id="${e.id}" class="p-2 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950"><i class="fa-solid fa-pen"></i></button>
        <button data-act="eq-del" data-id="${e.id}" class="p-2 rounded-lg bg-zinc-800 hover:bg-rose-500"><i class="fa-solid fa-trash"></i></button></td></tr>`).join('')}</tbody></table></div>`;
  if (adminTab === 'portfolio') body = `<div class="flex justify-end"><button data-act="pt-form" class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold text-sm"><i class="fa-solid fa-plus mr-2"></i>Tambah Portofolio</button></div>
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">${portfolio.map(p => `<div class="rounded-2xl bg-darkcard border border-zinc-800 overflow-hidden">
      <div class="relative h-44">${img(p.image, p.category, 'w-full h-full object-cover')}<span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-zinc-950/85 text-amber-400 text-xs font-bold">${esc(p.category)}</span></div>
      <div class="p-5"><div class="text-xs text-zinc-400 mb-1">${esc(p.location)}</div><h4 class="font-display font-bold">${esc(p.title)}</h4><p class="text-xs text-zinc-400 mt-1.5 line-clamp-2">${esc(p.description)}</p></div>
      <div class="px-5 py-3 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-900/30"><button data-act="pt-form" data-id="${p.id}" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950 text-xs font-bold">Edit</button>
        <button data-act="pt-del" data-id="${p.id}" class="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold">Hapus</button></div></div>`).join('')}</div>`;
  if (adminTab === 'inquiries') body = inquiries.length ? inquiries.map(q => `<div class="p-5 rounded-2xl bg-darkcard border border-zinc-800 flex flex-col sm:flex-row justify-between gap-4">
      <div class="space-y-1"><div><span class="font-display font-bold">${esc(q.clientName)}</span> <span class="text-xs text-zinc-500">• ${esc(q.createdAt)}</span></div>
        <div class="text-xs text-zinc-400">Tanggal Acara: <strong class="text-zinc-200">${esc(q.eventDate)}</strong></div>
        <div class="text-xs text-zinc-300 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 mt-1">${esc(q.itemsSummary)}</div></div>
      <div class="sm:text-right shrink-0"><span class="text-[11px] text-zinc-400 block">Perkiraan Total</span><span class="font-display font-extrabold text-lg text-amber-400">${rp(q.totalEstimate)}</span></div></div>`).join('')
    : '<div class="p-8 text-center text-zinc-500 bg-darkcard rounded-2xl border border-zinc-800">Belum ada pesanan masuk.</div>';

  $('#admin').innerHTML = `<aside class="w-full lg:w-64 bg-darkcard border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col shrink-0">
    <div class="p-5 border-b border-zinc-800 flex items-center gap-2.5"><div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950"><i class="fa-solid fa-bolt"></i></div>
      <div><span class="font-display font-bold text-sm block">VibeStage</span><span class="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Panel Admin</span></div></div>
    <nav class="p-3 flex lg:flex-col gap-1.5 overflow-x-auto">${tabs.map(([k, ic, l]) => `<button data-act="admin-tab" data-v="${k}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm whitespace-nowrap transition ${k === adminTab ? 'font-bold bg-amber-500 text-zinc-950' : 'font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white'}"><i class="fa-solid ${ic} w-4"></i>${l}${k === 'inquiries' ? `<span class="ml-auto px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-300">${inquiries.length}</span>` : ''}</button>`).join('')}</nav>
    <div class="mt-auto p-4 border-t border-zinc-800 flex lg:flex-col gap-2">
      <button data-act="to-public" class="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold"><i class="fa-solid fa-eye text-amber-400 mr-2"></i>Kembali ke Web Utama</button>
      <button data-act="to-public" class="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-400"><i class="fa-solid fa-right-from-bracket mr-2"></i>Keluar</button></div></aside>
  <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
    <div class="flex items-center justify-between gap-4 pb-6 border-b border-zinc-800"><div><h1 class="font-display text-2xl font-extrabold">${tabs.find(t => t[0] === adminTab)![2]}</h1><p class="text-xs sm:text-sm text-zinc-400 mt-0.5">Setiap perubahan langsung tampil di halaman depan.</p></div>
      <button data-act="reset" class="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 hover:text-white"><i class="fa-solid fa-rotate-left mr-1"></i>Reset Data Awal</button></div>
    ${body}</main>`;
}

const field = (id: string, label: string, val: string | number, type = 'text', ph = '', extra = '') =>
  `<div><label class="block text-xs font-semibold text-zinc-400 mb-1">${label}</label><input id="${id}" type="${type}" value="${esc(String(val))}" placeholder="${ph}" ${extra} class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500"></div>`;
const select = (id: string, label: string, opts: string[], val: string) =>
  `<div><label class="block text-xs font-semibold text-zinc-400 mb-1">${label}</label><select id="${id}" class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm">${opts.map(o => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;
const formShell = (title: string, kind: string, id: string, inner: string) =>
  `<form data-form="${kind}" data-id="${id}" class="bg-darkcard border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
    <div class="flex items-center justify-between pb-4 border-b border-zinc-800"><h3 class="font-display font-bold text-lg">${title}</h3><button type="button" data-act="close" class="text-zinc-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
    ${inner}<div class="flex justify-end gap-3 pt-4 border-t border-zinc-800"><button type="button" data-act="close" class="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 text-sm font-semibold">Batal</button><button class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm">Simpan</button></div></form>`;

function eqForm(id?: string) {
  const e: Equipment = equipment.find(x => x.id === id) ?? { id: '', name: '', category: D.EQ_CATS[0], specs: '', price: 0, stock: 4, status: 'Ready', image: '' };
  openModal(formShell(id ? 'Edit Data Alat' : 'Tambah Alat Baru', 'eq', e.id,
    field('f-name', 'Nama Alat *', e.name, 'text', 'Speaker Aktif RCF 15 Inch', 'required') +
    `<div class="grid sm:grid-cols-2 gap-4">${select('f-cat', 'Kategori *', D.EQ_CATS, e.category)}${select('f-status', 'Status Stok *', ['Ready', 'Stok Terbatas', 'Habis'], e.status)}</div>` +
    `<div class="grid sm:grid-cols-2 gap-4">${field('f-price', 'Harga Sewa / Hari (Rp) *', e.price || '', 'number', '500000', 'required min="0" step="25000"')}${field('f-stock', 'Jumlah Unit *', e.stock, 'number', '8', 'required min="0"')}</div>` +
    field('f-specs', 'Spesifikasi Singkat *', e.specs, 'text', 'Daya 1400W, suara jernih', 'required') +
    field('f-img', 'Link Foto (Opsional)', e.image, 'url', 'https://...')));
}
function ptForm(id?: string) {
  const p: Portfolio = portfolio.find(x => x.id === id) ?? { id: '', title: '', category: D.PORT_CATS[0], location: '', gearUsed: [], description: '', image: '' };
  openModal(formShell(id ? 'Edit Portofolio Acara' : 'Tambah Portofolio Acara', 'pt', p.id,
    field('f-title', 'Nama Acara *', p.title, 'text', 'Konser Musik Kampus 2026', 'required') +
    `<div class="grid sm:grid-cols-2 gap-4">${select('f-cat', 'Kategori *', D.PORT_CATS, p.category)}${field('f-loc', 'Lokasi *', p.location, 'text', 'Balai Sarbini, Jakarta', 'required')}</div>` +
    field('f-gear', 'Alat yang Dipakai (pisahkan koma) *', p.gearUsed.join(', '), 'text', 'Sound 20.000W, Layar LED 6x4m', 'required') +
    `<div><label class="block text-xs font-semibold text-zinc-400 mb-1">Ringkasan Acara *</label><textarea id="f-desc" rows="3" required class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500">${esc(p.description)}</textarea></div>` +
    field('f-img', 'Link Foto (Opsional)', p.image, 'url', 'https://...')));
}
const val = (id: string) => (document.getElementById(id) as HTMLInputElement).value.trim();

// ---------- events ----------
document.addEventListener('click', ev => {
  const t = (ev.target as HTMLElement);
  const el = t.closest<HTMLElement>('[data-act]'); if (!el) return;
  const { act, id = '', v = '' } = el.dataset;
  if (act === 'backdrop') { if (t === el) { closeModal(); closeDrawer(); } return; }
  switch (act) {
    case 'close': closeModal(); break;
    case 'drawer-close': closeDrawer(); break;
    case 'menu': $('#mobile-menu').classList.toggle('hidden'); break;
    case 'port-filter': portCat = v; renderPortfolio(); break;
    case 'cat-filter': eqCat = v; renderCatalog(); break;
    case 'port-detail': portDetail(id); break;
    case 'add': { const e = equipment.find(x => x.id === id); if (e && e.status !== 'Habis') addCart(e.id, e.name, e.price); break; }
    case 'add-pkg': { const p = D.PACKAGES[Number(v)]; addCart('pkg-' + p.name.toLowerCase().replace(/\W+/g, '-'), p.name, p.price); openDrawer(); break; }
    case 'cart-open': openDrawer(); break;
    case 'step': {
      const c = cart[Number(el.dataset.i)]; const f = el.dataset.f as 'qty' | 'days'; if (!c) break;
      c[f] += Number(el.dataset.d); if (c.qty <= 0) cart.splice(cart.indexOf(c), 1); else if (c.days < 1) c.days = 1;
      save(); updateBadge(); renderDrawer(); break;
    }
    case 'order': order(); break;
    case 'to-public': setView(false); break;
    case 'admin-tab': adminTab = v; renderAdmin(); break;
    case 'eq-form': eqForm(id || undefined); break;
    case 'pt-form': ptForm(id || undefined); break;
    case 'eq-cycle': { const e = equipment.find(x => x.id === id); if (e) { const s: Status[] = ['Ready', 'Stok Terbatas', 'Habis']; e.status = s[(s.indexOf(e.status) + 1) % 3]; save(); renderAdmin(); } break; }
    case 'eq-del': equipment = equipment.filter(x => x.id !== id); save(); renderAdmin(); toast('Alat dihapus.', true); break;
    case 'pt-del': portfolio = portfolio.filter(x => x.id !== id); save(); renderAdmin(); toast('Portofolio dihapus.', true); break;
    case 'reset':
      equipment = structuredClone(D.DEFAULT_EQUIPMENT); portfolio = structuredClone(D.DEFAULT_PORTFOLIO);
      inquiries = structuredClone(D.DEFAULT_INQUIRIES); cart = []; save(); renderAdmin(); toast('Data dikembalikan ke awal.'); break;
  }
});

document.addEventListener('submit', ev => {
  const form = ev.target as HTMLFormElement; const kind = form.dataset.form; if (!kind) return;
  ev.preventDefault();
  if (kind === 'login') {
    if (val('pass') === D.ADMIN_PASS) { closeModal(); adminTab = 'overview'; setView(true); toast('Selamat datang di Panel Admin!'); }
    else toast('Sandi salah!', true);
    return;
  }
  const id = form.dataset.id || '';
  if (kind === 'eq') {
    const cat = val('f-cat');
    const d: Equipment = { id: id || 'eq-' + Date.now(), name: val('f-name'), category: cat, status: val('f-status') as Status, price: Number(val('f-price')), stock: Number(val('f-stock')), specs: val('f-specs'), image: val('f-img') || D.FALLBACK[cat] };
    const i = equipment.findIndex(x => x.id === id); if (i >= 0) equipment[i] = d; else equipment.unshift(d);
  } else {
    const cat = val('f-cat');
    const d: Portfolio = { id: id || 'port-' + Date.now(), title: val('f-title'), category: cat, location: val('f-loc'), gearUsed: val('f-gear').split(',').map(s => s.trim()).filter(Boolean), description: val('f-desc'), image: val('f-img') || D.FALLBACK[cat] };
    const i = portfolio.findIndex(x => x.id === id); if (i >= 0) portfolio[i] = d; else portfolio.unshift(d);
  }
  save(); closeModal(); renderAdmin(); toast('Data berhasil disimpan!');
});

document.addEventListener('input', ev => { if ((ev.target as HTMLElement).id === 'search') { search = (ev.target as HTMLInputElement).value; renderCatalog(); } });

// secret admin access: Ctrl/Cmd+Shift+A, 3 clicks on copyright, ?admin=1
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') { e.preventDefault(); loginModal(); } });
let clicks = 0, timer: number;
document.addEventListener('click', e => {
  if ((e.target as HTMLElement).id !== 'secret') return;
  clearTimeout(timer);
  if (++clicks >= 3) { clicks = 0; loginModal(); } else timer = window.setTimeout(() => (clicks = 0), 800);
});

renderShell();
renderPublic();
if (new URLSearchParams(location.search).get('admin') === '1') loginModal();
