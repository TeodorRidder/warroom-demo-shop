// Catalogue, prices and shop config. Kept in code until the catalogue moves to D1.

export type Product = { id: string; name: string; price: number; stock: number; category: string; discount: { percent: number } };

const OWN_PRODUCTS: Product[] = [
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

// Gear from our supplier, imported from their JSON product feed.
const SUPPLIER_FEED = `[
  { "id": "s01", "name": "Pour-over kettle", "price": 59, "stock": 8, "category": "gear", "discount": null },
  { "id": "s02", "name": "Cold brew bottle", "price": 21, "stock": 14, "category": "gear", "discount": null },
  { "id": "s03", "name": "Gift card 50", "price": 50, "stock": 999, "category": "gift", "discount": { "percent": 0 } }
]`;

export const PRODUCTS: Product[] = [...OWN_PRODUCTS, ...(JSON.parse(SUPPLIER_FEED) as Product[])];

export const findProduct = (id: string) => PRODUCTS.find(p => p.id === id);

// USD → other currency.
export const RATES: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, SEK: 10.6 };
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "SEK", "NOK"];

export const COUPONS: Record<string, number> = { WELCOME10: 10, AUTUMN25: 25 };

export const USERS: Record<string, { name: string; orders: string[] }> = {
  u1: { name: "Demo customer 1", orders: ["p01", "p04", "p07", "p03"] },
  u2: { name: "Demo customer 2", orders: [] },
  u3: { name: "Demo customer 3", orders: ["p05", "p08"] },
};

// Delivery days and today's dispatch cutoff (UTC) per country.
export const SHIPPING_ZONES: Record<string, { days: number; cutoff: string }> = {
  SE: { days: 2, cutoff: "16:00" },
  DK: { days: 2, cutoff: "16:00" },
  DE: { days: 4, cutoff: "15:00" },
  US: { days: 7, cutoff: "14:00" },
  NO: { days: 3, cutoff: "5pm" },
};
