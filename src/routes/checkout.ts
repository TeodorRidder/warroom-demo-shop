import { findProduct, RATES, SUPPORTED_CURRENCIES } from "../data.ts";
import { HttpError } from "../http.ts";
import { charge } from "./payments.ts";

export type OrderLine = { productId: string; qty: number };
export type Order = { items: OrderLine[]; currency?: string };

// Order total in the customer's currency, after product discounts.
export function priceOrder(order: Order | null) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) throw new HttpError(400, "cart is empty");
  const currency = order.currency ?? "USD";
  if (!SUPPORTED_CURRENCIES.includes(currency)) throw new HttpError(400, `unsupported currency ${currency}`);

  let subtotal = 0;
  for (const line of order.items) {
    const product = findProduct(line.productId);
    if (!product) throw new HttpError(404, `no product ${line.productId}`);
    if (!Number.isInteger(line.qty) || line.qty < 1) throw new HttpError(400, "qty must be a positive integer");
    const unitPrice = product.price * (1 - product.discount.percent / 100);
    subtotal += unitPrice * line.qty;
  }

  const total = toCurrency(subtotal, currency);
  if (!Number.isFinite(total)) throw new Error(`Invalid order total: ${total}`);
  return { currency, total: Math.round(total * 100) / 100 };
}

export async function checkout(request: Request) {
  const order = (await request.json().catch(() => null)) as Order | null;
  const { currency, total } = priceOrder(order);
  const payment = await charge(total, currency);
  return { orderId: `ord_${crypto.randomUUID().slice(0, 8)}`, total, currency, payment };
}

const toCurrency = (usd: number, currency: string) => usd * RATES[currency];
