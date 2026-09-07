// Catalogue, prices and shop config. Kept in code until the catalogue moves to D1.

export type Product = { id: string; name: string; price: number; stock: number; category: string; discount: { percent: number } };

export const PRODUCTS: Product[] = [
  { id: "p01", name: "Espresso beans 1 kg", price: 24.9, stock: 40, category: "coffee", discount: { percent: 10 } },
  { id: "p02", name: "Decaf beans 500 g", price: 14, stock: 22, category: "coffee", discount: { percent: 15 } },
  { id: "p03", name: "Filter papers (100)", price: 6.5, stock: 120, category: "gear", discount: { percent: 0 } },
  { id: "p04", name: "Hand grinder", price: 89, stock: 5, category: "gear", discount: { percent: 5 } },
  { id: "p05", name: "Oat milk 1 L", price: 3.2, stock: 60, category: "milk", discount: { percent: 0 } },
  { id: "p06", name: "Ceramic mug", price: 12, stock: 35, category: "gear", discount: { percent: 0 } },
  { id: "p07", name: "Single origin Ethiopia 250 g", price: 16.5, stock: 18, category: "coffee", discount: { percent: 0 } },
  { id: "p08", name: "Barista milk 1 L", price: 3.9, stock: 48, category: "milk", discount: { percent: 0 } },
  { id: "p09", name: "Descaler", price: 9.5, stock: 30, category: "care", discount: { percent: 20 } },
];

export const findProduct = (id: string) => PRODUCTS.find(p => p.id === id);

// USD → other currency.
export const RATES: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, SEK: 10.6 };
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "SEK"];
