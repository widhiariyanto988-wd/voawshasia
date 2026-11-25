export type Status = 'Ready' | 'Stok Terbatas' | 'Habis';
export type InquiryStatus = 'Baru' | 'Terjadwal' | 'Selesai' | 'Dibatalkan';
export type ImageFit = 'cover' | 'contain' | 'fill';
export interface Equipment { id: string; name: string; category: string; specs: string; price: number; stock: number; status: Status; image: string; fit?: ImageFit; }
export interface Portfolio { id: string; title: string; category: string; location: string; gearUsed: string[]; description: string; image: string; }
export interface Inquiry { id: string; code: string; clientName: string; phone: string; eventDate: string; itemsSummary: string; totalEstimate: number; dp: number; status: InquiryStatus; createdAt: string; }
export interface CartItem { id: string; name: string; price: number; qty: number; days: number; }
export interface Pkg { name: string; tag: string; price: number; items: string[]; featured?: boolean; color: string; }
export interface IGPost { file: string; url: string; caption: string; date: string; type: 'Reel' | 'Carousel' | 'Foto'; video?: string; likes?: string; comments?: string; }
