export type Status = 'Ready' | 'Stok Terbatas' | 'Habis';
export interface Equipment { id: string; name: string; category: string; specs: string; price: number; stock: number; status: Status; image: string; }
export interface Portfolio { id: string; title: string; category: string; location: string; gearUsed: string[]; description: string; image: string; }
export interface Inquiry { id: string; clientName: string; eventDate: string; itemsSummary: string; totalEstimate: number; createdAt: string; }
export interface CartItem { id: string; name: string; price: number; qty: number; days: number; }
export interface Pkg { name: string; tag: string; price: number; items: string[]; featured?: boolean; color: string; }
export interface IGPost { file: string; url: string; caption: string; date: string; type: 'Reel' | 'Carousel' | 'Foto'; }
