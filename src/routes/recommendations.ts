import { HttpError } from "../errors.js";
import { findProduct, PRODUCTS, USERS } from "../data.js";

export function recommend(url: URL) {
  const user = USERS[url.searchParams.get("user") ?? ""];
  if (!user) throw new HttpError(404, "unknown user");

  const counts = new Map<string, number>();
  for (const id of user.orders) {
    const category = findProduct(id)?.category;
    if (category) counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  const entries = [...counts.entries()];
  if (entries.length === 0) return { favorite: null, items: [] };
  const [favorite] = entries.sort((a, b) => b[1] - a[1])[0];
  const items = PRODUCTS.filter(p => p.category === favorite && !user.orders.includes(p.id)).slice(0, 3);
  return { favorite, items };
}
