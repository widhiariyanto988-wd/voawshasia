import './style.css';
import * as D from './data';
import type { Equipment, Portfolio, Status } from './types';
import { resetData, save, state } from './store';
import { compressImage } from './lib/image';
import { eqForm, inqForm, invoiceModal, loginModal, ptForm, renderAdmin, val } from './ui/admin';
import { addCart, openDrawer, order, renderDrawer, updateBadge } from './ui/cart';
import { igDetail, portDetail, renderCatalog, renderPortfolio, renderPublic, renderShell } from './ui/public';
import { $, closeDrawer, closeModal, toast } from './ui/shared';

/** Ganti antara halaman public dan panel admin. */
function setView(admin: boolean) {
  $('#public').classList.toggle('hidden', admin);
  $('#admin').classList.toggle('hidden', !admin);
  if (admin) renderAdmin();
  else renderPublic();
  window.scrollTo(0, 0);
}

// ---------- event delegation ----------
document.addEventListener('click', (ev) => {
  const target = ev.target as HTMLElement;
  const el = target.closest<HTMLElement>('[data-act]');
  if (!el) return;
  const { act, id = '', v = '' } = el.dataset;

  if (act === 'backdrop') {
    if (target === el) {
      closeModal();
      closeDrawer();
    }
    return;
  }

  switch (act) {
    case 'close':
      closeModal();
      break;
    case 'drawer-close':
      closeDrawer();
      break;
    case 'menu':
      $('#mobile-menu').classList.toggle('hidden');
      break;
    case 'port-filter':
      state.portCat = v;
      renderPortfolio();
      break;
    case 'cat-filter':
      state.eqCat = v;
      renderCatalog();
      break;
    case 'port-detail':
      portDetail(id);
      break;
    case 'ig-detail':
      igDetail(Number(v));
      break;
    case 'noop':
      break;
    case 'reel-play': {
      const card = el.closest<HTMLElement>('[data-reel-card]');
      const video = card?.querySelector<HTMLVideoElement>('.reel-video');
      if (!card || !video) {
        igDetail(Number(v));
        break;
      }
      document.querySelectorAll<HTMLElement>('[data-reel-card]').forEach((otherCard) => {
        const otherVideo = otherCard.querySelector<HTMLVideoElement>('.reel-video');
        if (!otherVideo || otherCard === card || otherVideo.paused) return;
        otherVideo.pause();
        otherVideo.classList.add('hidden');
        otherCard.querySelector('.reel-poster')?.classList.remove('hidden');
        otherCard.querySelector('.reel-play')?.classList.remove('hidden');
      });
      card.querySelector('.reel-poster')?.classList.add('hidden');
      el.classList.add('hidden');
      video.classList.remove('hidden');
      video.currentTime = 0;
      void video.play().catch(() => { video.controls = true; });
      break;
    }
    case 'add': {
      const e = state.equipment.find((x) => x.id === id);
      if (e && e.status !== 'Habis') addCart(e.id, e.name, e.price);
      break;
    }
    case 'add-pkg': {
      const p = D.PACKAGES[Number(v)];
      addCart('pkg-' + p.name.toLowerCase().replace(/\W+/g, '-'), p.name, p.price);
      openDrawer();
      break;
    }
    case 'cart-open':
      openDrawer();
      break;
    case 'step': {
      const item = state.cart[Number(el.dataset.i)];
      const field = el.dataset.f as 'qty' | 'days';
      if (!item) break;
      item[field] += Number(el.dataset.d);
      if (item.qty <= 0) state.cart.splice(state.cart.indexOf(item), 1);
      else if (item.days < 1) item.days = 1;
      save();
      updateBadge();
      renderDrawer();
      break;
    }
    case 'order':
      order();
      break;
    case 'to-public':
      setView(false);
      break;
    case 'admin-tab':
      state.adminTab = v;
      renderAdmin();
      break;
    case 'inq-filter':
      state.inqFilter = v;
      renderAdmin();
      break;
    case 'inq-edit':
      inqForm(id);
      break;
    case 'inq-invoice':
      invoiceModal(id);
      break;
    case 'inq-print':
      window.print();
      break;
    case 'inq-wa': {
      const q = state.inquiries.find((x) => x.id === id);
      if (!q?.phone) return toast('Nomor WhatsApp klien belum diisi.', true);
      const text = `Halo ${q.clientName}, ini konfirmasi pesanan sewa alat VOAWSHASIA.\n\nNo. Pesanan: #${q.code}\nTanggal Acara: ${q.eventDate}\nEstimasi: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(q.totalEstimate)}\n\nMohon ditanggapi ya, terima kasih.`;
      window.open(`https://wa.me/${q.phone}?text=${encodeURIComponent(text)}`, '_blank');
      break;
    }
    case 'inq-del':
      if (confirm('Hapus pesanan ini dari daftar?')) {
        state.inquiries = state.inquiries.filter((x) => x.id !== id);
        save();
        renderAdmin();
        toast('Pesanan dihapus.', true);
      }
      break;
    case 'eq-form':
      eqForm(id || undefined);
      break;
    case 'pt-form':
      ptForm(id || undefined);
      break;
    case 'eq-cycle': {
      const e = state.equipment.find((x) => x.id === id);
      if (e) {
        const statuses: Status[] = ['Ready', 'Stok Terbatas', 'Habis'];
        e.status = statuses[(statuses.indexOf(e.status) + 1) % statuses.length];
        save();
        renderAdmin();
      }
      break;
    }
    case 'eq-del':
      state.equipment = state.equipment.filter((x) => x.id !== id);
      save();
      renderAdmin();
      toast('Alat dihapus.', true);
      break;
    case 'pt-del':
      state.portfolio = state.portfolio.filter((x) => x.id !== id);
      save();
      renderAdmin();
      toast('Portofolio dihapus.', true);
      break;
    case 'photo-clear': {
      const hidden = document.getElementById('f-img') as HTMLInputElement | null;
      const file = document.getElementById('f-file') as HTMLInputElement | null;
      const preview = document.getElementById('f-preview') as HTMLImageElement | null;
      const category = document.getElementById('f-cat') as HTMLSelectElement | null;
      if (hidden) hidden.value = '';
      if (file) file.value = '';
      if (preview) preview.src = category ? (D.FALLBACK[category.value] ?? '') : '';
      toast('Foto dihapus. Klik Simpan untuk menerapkan.');
      break;
    }
    case 'reset':
      resetData();
      renderAdmin();
      toast('Data dikembalikan ke awal.');
      break;
  }
});

document.addEventListener('submit', (ev) => {
  const form = ev.target as HTMLFormElement;
  const kind = form.dataset.form;
  if (!kind) return;
  ev.preventDefault();

  if (kind === 'login') {
    if (val('pass') === D.ADMIN_PASS) {
      closeModal();
      state.adminTab = 'overview';
      setView(true);
      toast('Selamat datang di Panel Admin!');
    } else {
      toast('Sandi salah!', true);
    }
    return;
  }

  const id = form.dataset.id || '';
  if (kind === 'inq') {
    const q = state.inquiries.find((x) => x.id === id);
    if (q) {
      q.clientName = val('f-client');
      q.phone = val('f-phone').replace(/\D/g, '');
      q.eventDate = val('f-date');
      q.dp = Number(val('f-dp')) || 0;
      q.status = val('f-status') as typeof q.status;
      save();
    }
    closeModal();
    renderAdmin();
    toast('Pesanan berhasil diperbarui!');
    return;
  }

  if (kind === 'eq') {
    const category = val('f-cat');
    const equipment: Equipment = {
      id: id || 'eq-' + Date.now(),
      name: val('f-name'),
      category,
      status: val('f-status') as Status,
      price: Number(val('f-price')),
      stock: Number(val('f-stock')),
      specs: val('f-specs'),
      image: val('f-img') || D.FALLBACK[category],
    };
    const index = state.equipment.findIndex((x) => x.id === id);
    if (index >= 0) state.equipment[index] = equipment;
    else state.equipment.unshift(equipment);
  } else {
    const category = val('f-cat');
    const portfolio: Portfolio = {
      id: id || 'port-' + Date.now(),
      title: val('f-title'),
      category,
      location: val('f-loc'),
      gearUsed: val('f-gear').split(',').map((s) => s.trim()).filter(Boolean),
      description: val('f-desc'),
      image: val('f-img') || D.FALLBACK[category],
    };
    const index = state.portfolio.findIndex((x) => x.id === id);
    if (index >= 0) state.portfolio[index] = portfolio;
    else state.portfolio.unshift(portfolio);
  }
  save();
  closeModal();
  renderAdmin();
  toast('Data berhasil disimpan!');
});

document.addEventListener('input', (ev) => {
  const id = (ev.target as HTMLElement).id;
  if (id === 'search') {
    state.search = (ev.target as HTMLInputElement).value;
    renderCatalog();
  }
  if (id === 'inq-search') {
    state.inqSearch = (ev.target as HTMLInputElement).value;
    renderAdmin();
    const input = document.getElementById('inq-search') as HTMLInputElement | null;
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  }
});

document.addEventListener('change', async (ev) => {
  const input = ev.target as HTMLInputElement;
  if (input?.dataset?.act === 'inq-status') {
    const q = state.inquiries.find((x) => x.id === input.dataset.id);
    if (q) {
      q.status = input.value as typeof q.status;
      save();
      renderAdmin();
      toast(`Status pesanan diubah menjadi ${q.status}.`);
    }
    return;
  }
  if (input?.id !== 'f-file' || !input.files?.length) return;
  try {
    const dataUrl = await compressImage(input.files[0]);
    const hidden = document.getElementById('f-img') as HTMLInputElement | null;
    const preview = document.getElementById('f-preview') as HTMLImageElement | null;
    if (hidden) hidden.value = dataUrl;
    if (preview) preview.src = dataUrl;
    toast(`Foto siap (${Math.round(dataUrl.length / 1024)} KB). Klik Simpan untuk menyimpan.`);
  } catch (err) {
    toast(err instanceof Error ? err.message : 'Gagal memproses foto.', true);
    input.value = '';
  }
});

// Akses admin tersembunyi: Ctrl/Cmd+Shift+A, 3x klik hak cipta, atau ?admin=1
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    loginModal();
  }
});
let secretClicks = 0;
let secretTimer: number;
document.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).id !== 'secret') return;
  clearTimeout(secretTimer);
  if (++secretClicks >= 3) {
    secretClicks = 0;
    loginModal();
  } else {
    secretTimer = window.setTimeout(() => (secretClicks = 0), 800);
  }
});

// ---------- init ----------
renderShell();
renderPublic();
if (new URLSearchParams(location.search).get('admin') === '1') loginModal();
