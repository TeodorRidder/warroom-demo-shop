import { findProduct, PRODUCTS, USERS } from "../data.ts";
import { HttpError } from "../http.ts";

// "More from your favourite category": the category the customer has ordered from most.
export function recommend(url: URL) {
  const user = USERS[url.searchParams.get("user") ?? ""];
  if (!user) throw new HttpError(404, "unknown user");

  const counts = new Map<string, number>();
  for (const id of user.orders) {
    const category = findProduct(id)?.category;
    if (category) counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const favorite = sorted[0]?.[0];
  const items = favorite 
    ? PRODUCTS.filter(p => p.category === favorite && !user.orders.includes(p.id)).slice(0, 3)
    : [];
  return { favorite, items };
}
