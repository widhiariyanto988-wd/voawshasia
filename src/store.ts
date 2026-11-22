import type { CartItem, Equipment, Inquiry, Portfolio } from './types';
import * as D from './data';

const STORAGE = {
  equipment: 'vs_ts_equipment',
  portfolio: 'vs_ts_portfolio',
  inquiries: 'vs_ts_inquiries',
  cart: 'vs_ts_cart',
} as const;

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
};

/** Satu-satunya sumber state aplikasi. Semua perubahan lewat modul ini. */
export const state = {
  equipment: load<Equipment[]>(STORAGE.equipment, D.DEFAULT_EQUIPMENT),
  portfolio: load<Portfolio[]>(STORAGE.portfolio, D.DEFAULT_PORTFOLIO),
  inquiries: load<Inquiry[]>(STORAGE.inquiries, D.DEFAULT_INQUIRIES),
  cart: load<CartItem[]>(STORAGE.cart, []),
  portCat: 'Semua',
  eqCat: 'Semua',
  adminTab: 'overview',
  search: '',
};

/** Simpan seluruh state ke localStorage. */
export const save = () => {
  localStorage.setItem(STORAGE.equipment, JSON.stringify(state.equipment));
  localStorage.setItem(STORAGE.portfolio, JSON.stringify(state.portfolio));
  localStorage.setItem(STORAGE.inquiries, JSON.stringify(state.inquiries));
  localStorage.setItem(STORAGE.cart, JSON.stringify(state.cart));
};

/** Kembalikan peralatan, portofolio, pesanan, dan keranjang ke data awal. */
export const resetData = () => {
  state.equipment = structuredClone(D.DEFAULT_EQUIPMENT);
  state.portfolio = structuredClone(D.DEFAULT_PORTFOLIO);
  state.inquiries = structuredClone(D.DEFAULT_INQUIRIES);
  state.cart = [];
  save();
};
