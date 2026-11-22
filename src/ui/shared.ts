import type { Status } from '../types';
import { esc } from '../lib/format';

/** Query selector singkat dengan tipe elemen yang bisa ditentukan. */
export const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector(selector) as T;

/** Notifikasi toast di pojok kanan bawah. */
export function toast(message: string, warn = false) {
  const el = document.createElement('div');
  el.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-zinc-900 shadow-2xl text-sm font-semibold ${warn ? 'border-amber-500/60 text-amber-300' : 'border-emerald-500/60 text-emerald-300'}`;
  el.innerHTML = `<i class="fa-solid ${warn ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i><span>${esc(message)}</span>`;
  $('#toast').appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

/** Tombol filter kategori. */
export const chip = (on: boolean, act: string, value: string, label: string) =>
  `<button data-act="${act}" data-v="${esc(value)}" class="shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm transition ${on ? 'font-bold bg-amber-500 text-zinc-950' : 'font-semibold bg-darkcard text-zinc-300 hover:bg-zinc-800 border border-zinc-800'}">${esc(label)}</button>`;

/** Warna badge status stok. */
export const statusCls = (s: Status) =>
  s === 'Ready'
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : s === 'Stok Terbatas'
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

export const openModal = (html: string) => {
  const modal = $('#modal');
  modal.innerHTML = html;
  modal.classList.remove('hidden');
};

export const closeModal = () => $('#modal').classList.add('hidden');

export const closeDrawer = () => $('#drawer').classList.add('hidden');
