import { PRODUCTS } from "../data.ts";
import { HttpError } from "../http.ts";

const PAGE_SIZE = 5;

export function listProducts(url: URL) {
  const page = Number(url.searchParams.get("page") ?? "1");
  if (!Number.isInteger(page) || page < 1) throw new HttpError(400, "page must be a positive integer");
  const pages = Math.ceil(PRODUCTS.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const items = PRODUCTS.slice(start, start + PAGE_SIZE);
  return { page, pages, items, cursor: items[items.length - 1].id };
}

type SearchFilter = { category?: string; maxPrice?: number };

export function searchProducts(url: URL) {
  const query = (url.searchParams.get("q") ?? "").toLowerCase();
  let filter: SearchFilter;
  try {
    filter = JSON.parse(url.searchParams.get("filter") ?? "{}");
  } catch {
    throw new HttpError(400, "filter must be valid JSON");
  }
  const items = PRODUCTS.filter(
    p =>
      p.name.toLowerCase().includes(query) &&
      (!filter.category || p.category === filter.category) &&
      (filter.maxPrice === undefined || p.price <= filter.maxPrice),
  );
  return { query, filter, items };
}
