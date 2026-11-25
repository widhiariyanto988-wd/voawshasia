import { save, state } from '../store';
import { esc, normalizePhone, phoneLabel, rp, wa } from '../lib/format';
import { $, toast } from './shared';

/** Perbarui angka pada badge keranjang di header. */
export const updateBadge = () => {
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = String(state.cart.reduce((s, c) => s + c.qty, 0));
};

/** Tambah alat/paket ke keranjang. Item yang sama menambah qty. */
export function addCart(id: string, name: string, price: number) {
  const found = state.cart.find((c) => c.id === id);
  if (found) found.qty++;
  else state.cart.push({ id, name, price, qty: 1, days: 1 });
  save();
  updateBadge();
  toast(`"${name}" masuk ke Keranjang Sewa`);
}

/** Render isi drawer keranjang beserta form nama & tanggal. */
export function renderDrawer() {
  let total = 0;
  const items = state.cart.length
    ? state.cart
        .map((c, i) => {
          const sub = c.price * c.qty * c.days;
          total += sub;
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
        })
        .join('')
    : `<div class="text-center py-14"><div class="w-14 h-14 rounded-2xl bg-zinc-900 text-zinc-600 flex items-center justify-center mx-auto mb-3 text-xl"><i class="fa-solid fa-cart-shopping"></i></div>
      <p class="text-sm font-bold text-zinc-300">Keranjang Sewa Masih Kosong</p><p class="text-xs text-zinc-500 mt-1">Pilih alat atau paket hemat terlebih dahulu.</p></div>`;

  const keep = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value ?? '';
  const [name, date, phone] = [keep('c-name'), keep('c-date'), keep('c-phone')];
  $('#drawer').innerHTML = `<div class="bg-zinc-950 border-l border-zinc-800 w-full max-w-md h-full flex flex-col justify-between shadow-2xl">
    <div class="p-5 border-b border-zinc-800 flex items-center justify-between"><div><h3 class="font-display font-bold text-lg">Keranjang Sewa</h3><p class="text-xs text-zinc-400">Atur jumlah unit dan lama hari sewa</p></div>
      <button data-act="drawer-close" class="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="flex-1 overflow-y-auto p-5 space-y-4">${items}</div>
    <div class="p-5 border-t border-zinc-800 bg-darkcard space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div><label class="block text-[11px] font-semibold text-zinc-400 mb-1">Nama Penyewa</label><input id="c-name" value="${esc(name)}" placeholder="Contoh: Andi" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-amber-500"></div>
        <div><label class="block text-[11px] font-semibold text-zinc-400 mb-1">Tanggal Acara</label><input id="c-date" type="date" value="${esc(date)}" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-amber-500"></div></div>
      <div><label class="block text-[11px] font-semibold text-zinc-400 mb-1">Nomor WhatsApp <span class="text-rose-400">*</span></label>
        <input id="c-phone" type="tel" inputmode="tel" value="${esc(phone)}" placeholder="Contoh: 0812-3456-7890" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-amber-500">
        <p class="text-[10px] text-zinc-500 mt-1">Nomor ini dicantumkan di pesanan dan dipakai tim untuk konfirmasi.</p></div>
      <div class="flex items-center justify-between pt-2 border-t border-zinc-800/80"><span class="text-xs text-zinc-400">Total Biaya Sewa:</span><span class="font-display text-xl font-extrabold text-amber-400">${rp(total)}</span></div>
      <button data-act="order" class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2"><i class="fa-brands fa-whatsapp text-lg"></i>Kirim Pesanan ke WhatsApp</button></div></div>`;
}

/** Buka drawer setelah me-render isi terbaru. */
export const openDrawer = () => {
  renderDrawer();
  $('#drawer').classList.remove('hidden');
};

/** Catat pesanan ke state lalu buka WhatsApp dengan ringkasan sewa. */
export function order() {
  if (!state.cart.length) return toast('Keranjang masih kosong, pilih alat dulu ya!', true);
  const name = (($('#c-name') as HTMLInputElement).value || '').trim() || 'Penyewa';
  const date = ($('#c-date') as HTMLInputElement).value || 'Belum ditentukan';
  const phone = normalizePhone(($('#c-phone') as HTMLInputElement).value || '');
  if (!/^62\d{8,13}$/.test(phone)) return toast('Nomor WhatsApp wajib diisi dengan benar (contoh: 0812-3456-7890).', true);
  let total = 0;
  const lines = state.cart.map((c, i) => {
    const s = c.price * c.qty * c.days;
    total += s;
    return `${i + 1}. ${c.name} (${c.qty} unit x ${c.days} hari) = ${rp(s)}`;
  });
  state.inquiries.unshift({
    id: 'inq-' + Date.now(),
    code: `ORD-${new Date().getFullYear()}-${String(state.inquiries.length + 1).padStart(3, '0')}`,
    clientName: name,
    phone,
    eventDate: date,
    totalEstimate: total,
    dp: 0,
    status: 'Baru',
    createdAt: new Date().toLocaleString('id-ID'),
    itemsSummary: state.cart.map((c) => `${c.qty}x ${c.name} (${c.days} hari)`).join(', '),
  });
  save();
  toast('Pesanan dicatat & membuka WhatsApp...');
  window.open(
    wa(`Halo *VOAWSHASIA*, saya mau pesan sewa alat event:\n\n*Nama:* ${name}\n*WhatsApp:* ${phoneLabel(phone)}\n*Tanggal Acara:* ${date}\n\n*Daftar Sewa:*\n${lines.join('\n')}\n\n*Total Perkiraan:* ${rp(total)}\n\nApakah alatnya ready di tanggal tersebut?`),
    '_blank',
  );
}
