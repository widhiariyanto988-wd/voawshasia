import * as D from '../data';
import { state } from '../store';
import { esc, img, rp, wa } from '../lib/format';
import { $, chip, openModal, statusCls } from './shared';
import { updateBadge } from './cart';

const NAV: [string, string][] = [
  ['hasil-kerja', 'Hasil Kerja'],
  ['daftar-alat', 'Daftar Alat'],
  ['paket-hemat', 'Paket Hemat'],
  ['cara-sewa', 'Cara Sewa'],
];

/** Kerangka halaman public: header, hero, section, dan footer. Dipanggil sekali saat init. */
export function renderShell() {
  const packages = D.PACKAGES.map((p, i) => `
    <div class="rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative ${p.featured ? 'bg-gradient-to-b from-zinc-900 to-darkcard border-2 border-amber-500 shadow-xl shadow-amber-500/10' : 'bg-darkcard border border-zinc-800'}">
      ${p.featured ? '<div class="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-amber-500 text-zinc-950 text-xs font-extrabold uppercase">Paling Laris</div>' : ''}
      <div>
        <span class="px-3 py-1 rounded-full bg-zinc-800 text-${p.color}-400 text-xs font-semibold">${esc(p.tag)}</span>
        <h3 class="font-display text-xl font-bold text-white mt-4">${esc(p.name)}</h3>
        <div class="mt-3"><span class="text-2xl sm:text-3xl font-extrabold text-amber-400">${rp(p.price)}</span> <span class="text-xs text-zinc-400">/ hari</span></div>
        <ul class="mt-6 space-y-3 text-sm text-zinc-300">${p.items.map((t) => `<li class="flex items-center gap-2.5"><i class="fa-solid fa-check text-${p.color}-400"></i>${esc(t)}</li>`).join('')}</ul>
      </div>
      <button data-act="add-pkg" data-v="${i}" class="mt-8 w-full py-3.5 rounded-xl font-bold text-sm transition ${p.featured ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold' : 'bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-white'}">Pilih Paket Ini</button>
    </div>`).join('');

  $('#public').innerHTML = `
  <header class="sticky top-0 z-40 glass-nav border-b border-zinc-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
      <a href="#top" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 text-xl"><i class="fa-solid fa-bolt"></i></div>
        <div><span class="font-display font-extrabold text-xl text-white">VOAWSH<span class="text-amber-400">ASIA</span></span>
        <span class="block text-[10px] uppercase tracking-widest text-zinc-400 -mt-1">Production & Rental</span></div>
      </a>
      <nav class="hidden md:flex gap-8 text-sm font-medium text-zinc-300">${NAV.map(([h, l]) => `<a href="#${h}" class="hover:text-amber-400 transition">${l}</a>`).join('')}</nav>
      <div class="flex items-center gap-2.5">
        <button data-act="cart-open" class="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center gap-2">
          <i class="fa-solid fa-cart-shopping text-amber-400"></i><span class="hidden sm:inline text-sm font-semibold">Keranjang Sewa</span>
          <span id="cart-badge" class="px-2 py-0.5 text-xs font-extrabold text-zinc-950 bg-amber-400 rounded-full">0</span></button>
        <a href="${wa('Halo VOAWSHASIA, saya mau tanya sewa alat event.')}" target="_blank" class="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold flex items-center gap-2"><i class="fa-brands fa-whatsapp"></i>Chat WA</a>
        <button data-act="menu" class="md:hidden p-2.5 rounded-xl bg-zinc-900 border border-zinc-800"><i class="fa-solid fa-bars"></i></button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden md:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-2">${NAV.map(([h, l]) => `<a href="#${h}" data-act="menu" class="block px-3 py-2.5 text-sm text-zinc-300 hover:text-amber-400">${l}</a>`).join('')}</div>
  </header>

  <section id="top" class="relative overflow-hidden hero-radial pt-16 pb-20 md:pt-24 md:pb-28 border-b border-zinc-800/70">
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <img src="/hero.jpg" alt="" aria-hidden="true" class="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-30">
      <img src="/hero.jpg" alt="" class="absolute inset-0 w-full h-full object-contain opacity-60" fetchpriority="high">
      <div class="absolute inset-0 bg-gradient-to-t from-darkbg via-darkbg/75 to-transparent"></div>
    </div>
    <div class="max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-semibold mb-6"><span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>Sewa Alat Event &amp; Produksi Panggung</div>
      <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] mb-6">Bikin Acaramu Meriah dengan <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-cyan-400">Alat Standar Konser</span></h1>
      <p class="text-lg text-zinc-300 mb-9 max-w-2xl">Sewa sound system, lighting, layar LED, dan panggung lengkap dengan tim teknis berpengalaman. Siap pasang di lokasi.</p>
      <div class="flex flex-col sm:flex-row gap-4 mb-14">
        <a href="#daftar-alat" class="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/25"><i class="fa-solid fa-sliders"></i>Pilih Alat Sewa</a>
        <a href="${wa('Halo VOAWSHASIA, saya mau tanya harga sewa alat event.')}" target="_blank" class="px-8 py-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 font-bold flex items-center justify-center gap-2.5"><i class="fa-brands fa-whatsapp text-emerald-400 text-lg"></i>Tanya Harga via WA</a>
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
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${packages}</div>
  </section>

  <section id="cara-sewa" class="py-16 bg-zinc-950/60 border-t border-zinc-800/80 w-full">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12"><span class="text-cyan-400 font-bold text-xs uppercase tracking-widest">Mudah &amp; Cepat</span><h2 class="font-display text-3xl font-extrabold mt-1.5">Cara Sewa Alat di VOAWSHASIA</h2></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">${D.STEPS.map(([t, d], i) => `
        <div class="p-6 rounded-2xl bg-darkcard border border-zinc-800 text-center">
          <div class="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 font-display font-extrabold text-lg flex items-center justify-center mx-auto mb-4">${i + 1}</div>
          <h3 class="font-bold">${esc(t)}</h3><p class="text-xs text-zinc-400 mt-2 leading-relaxed">${esc(d)}</p></div>`).join('')}</div>
    </div>
  </section>

  <footer class="bg-zinc-950 border-t border-zinc-800/80 py-12 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div><div class="flex items-center gap-3 mb-4"><div class="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950"><i class="fa-solid fa-bolt"></i></div><span class="font-display font-extrabold text-lg">VOAWSH<span class="text-amber-400">ASIA</span></span></div>
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
      <span id="secret" class="select-none cursor-default">&copy; 2026 VOAWSHASIA Production &amp; Rental. Hak Cipta Dilindungi.</span></div>
  </footer>`;
}

/** Render grid portofolio beserta filter kategorinya. */
export function renderPortfolio() {
  $('#port-filters').innerHTML = ['Semua', ...D.PORT_CATS].map((c) => chip(c === state.portCat, 'port-filter', c, c)).join('');
  const list = state.portCat === 'Semua' ? state.portfolio : state.portfolio.filter((p) => p.category === state.portCat);
  $('#port-grid').innerHTML = list.length
    ? list
        .map((p, i) => `
    <div data-act="port-detail" data-id="${p.id}" class="${i === 0 && list.length >= 3 ? 'md:col-span-2' : ''} group relative rounded-2xl overflow-hidden bg-darkcard border border-zinc-800 hover:border-amber-500/70 cursor-pointer h-72 sm:h-80">
      ${img(p.image, p.category, 'w-full h-full object-cover group-hover:scale-105 transition duration-500')}
      <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"></div>
      <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-zinc-950/85 border border-zinc-700 text-amber-400 text-xs font-bold">${esc(p.category)}</span>
      <div class="absolute bottom-0 inset-x-0 p-6">
        <div class="text-xs text-zinc-300 mb-1"><i class="fa-solid fa-location-dot text-amber-400 mr-1"></i>${esc(p.location)}</div>
        <h3 class="font-display text-xl font-extrabold group-hover:text-amber-400 transition">${esc(p.title)}</h3>
        <div class="mt-2 text-xs font-bold text-cyan-400">Lihat Detail &amp; Alat yang Dipakai <i class="fa-solid fa-arrow-right"></i></div>
      </div></div>`)
        .join('')
    : '<div class="col-span-full text-center py-12 text-zinc-500 bg-darkcard rounded-2xl border border-zinc-800">Belum ada foto acara di kategori ini.</div>';
}

/** Render katalog alat, filter kategori, dan pencarian. */
export function renderCatalog() {
  $('#cat-filters').innerHTML = ['Semua', ...D.EQ_CATS].map((c) => chip(c === state.eqCat, 'cat-filter', c, c)).join('');
  const units = state.equipment.filter((e) => e.status !== 'Habis').reduce((a, e) => a + Number(e.stock || 0), 0);
  $('#hero-units').textContent = units + '+';
  const q = state.search.toLowerCase();
  const list = state.equipment.filter((e) => (state.eqCat === 'Semua' || e.category === state.eqCat) && (e.name + e.specs).toLowerCase().includes(q));
  $('#cat-grid').innerHTML = list.length
    ? list
        .map((e) => {
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
        })
        .join('')
    : '<div class="col-span-full text-center py-12 text-zinc-500 bg-darkcard rounded-2xl border border-zinc-800">Alat yang kamu cari tidak ditemukan.</div>';
}

/** Render ulang bagian public yang bergantung pada state. */
export const renderPublic = () => {
  renderPortfolio();
  renderCatalog();
  updateBadge();
};

/** Modal detail portofolio + alat yang dipakai. */
export function portDetail(id: string) {
  const p = state.portfolio.find((x) => x.id === id);
  if (!p) return;
  openModal(`<div class="bg-darkcard border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
    <div class="relative h-64">${img(p.image, p.category, 'w-full h-full object-cover')}
      <div class="absolute inset-0 bg-gradient-to-t from-darkcard via-transparent to-black/40"></div>
      <button data-act="close" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-950/85 hover:bg-amber-500 hover:text-zinc-950"><i class="fa-solid fa-xmark"></i></button>
      <span class="absolute bottom-4 left-6 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 text-xs font-extrabold">${esc(p.category)}</span></div>
    <div class="p-6 space-y-5">
      <div><h3 class="font-display text-2xl font-extrabold">${esc(p.title)}</h3><div class="text-xs text-zinc-400 mt-1.5"><i class="fa-solid fa-location-dot text-amber-400 mr-1.5"></i>${esc(p.location)}</div></div>
      <p class="text-sm text-zinc-300 leading-relaxed">${esc(p.description)}</p>
      <div class="pt-4 border-t border-zinc-800"><h4 class="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Alat yang Dipakai di Acara Ini:</h4>
        <div class="flex flex-wrap gap-2">${p.gearUsed.map((g) => `<span class="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs"><i class="fa-solid fa-check text-amber-400 text-[10px] mr-1.5"></i>${esc(g)}</span>`).join('')}</div></div>
      <div class="pt-4 flex gap-3">
        <a href="${wa('Halo VOAWSHASIA, saya mau sewa paket alat serupa acara: ' + p.title)}" target="_blank" class="flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm text-center"><i class="fa-brands fa-whatsapp mr-1.5"></i>Sewa Paket Serupa</a>
        <button data-act="close" class="py-3.5 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-bold">Tutup</button></div>
    </div></div>`);
}
