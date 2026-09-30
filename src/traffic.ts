// Synthetic customer journeys, weighted roughly like real traffic (web, iOS app, returning and new customers).

type Scenario = { name: string; weight: number; method: "GET" | "POST"; path: string; body?: unknown };

const cart = (items: [string, number][], extra: Record<string, unknown> = {}) => ({ items: items.map(([productId, qty]) => ({ productId, qty })), ...extra });

export const SCENARIOS: Scenario[] = [
  { name: "Browse first page", weight: 10, method: "GET", path: "/api/products?page=1" },
  { name: "Browse page 2", weight: 5, method: "GET", path: "/api/products?page=2" },
  { name: "Browse to the end", weight: 2, method: "GET", path: "/api/products?page=3" },
  { name: "Search (web)", weight: 6, method: "GET", path: `/api/search?q=beans&filter=${encodeURIComponent('{"category":"coffee"}')}` },
  { name: "Search (iOS app 3.x)", weight: 2, method: "GET", path: "/api/search?q=mug&filter=category:gear" },
  { name: "Checkout coffee in USD", weight: 10, method: "POST", path: "/api/checkout", body: cart([["p01", 1], ["p03", 2]]) },
  { name: "Checkout in EUR", weight: 4, method: "POST", path: "/api/checkout", body: cart([["p07", 2]], { currency: "EUR" }) },
  { name: "Checkout in NOK", weight: 1, method: "POST", path: "/api/checkout", body: cart([["p02", 1]], { currency: "NOK" }) },
  { name: "Checkout kettle and filters", weight: 2, method: "POST", path: "/api/checkout", body: cart([["s01", 1], ["p03", 1]]) },
  { name: "Checkout with WELCOME10", weight: 3, method: "POST", path: "/api/checkout", body: cart([["p04", 1]], { coupon: "WELCOME10" }) },
  { name: "Checkout with coupon typed by hand", weight: 2, method: "POST", path: "/api/checkout", body: cart([["p01", 2]], { coupon: "welcome10" }) },
  { name: "Shipping to Sweden", weight: 5, method: "GET", path: "/api/shipping/estimate?country=SE" },
  { name: "Shipping to Norway", weight: 2, method: "GET", path: "/api/shipping/estimate?country=NO" },
  { name: "Recommendations, returning customer", weight: 5, method: "GET", path: "/api/recommendations?user=u1" },
  { name: "Recommendations, new customer", weight: 2, method: "GET", path: "/api/recommendations?user=u2" },
];

const pick = () => {
  const total = SCENARIOS.reduce((sum, s) => sum + s.weight, 0);
  let r = Math.random() * total;
  for (const s of SCENARIOS) if ((r -= s.weight) < 0) return s;
  return SCENARIOS[0];
};

export const scenarioRequest = (origin: string, s: Scenario) =>
  new Request(`${origin}${s.path}`, {
    method: s.method,
    headers: { "Content-Type": "application/json", "x-synthetic": "1" },
    body: s.body === undefined ? undefined : JSON.stringify(s.body),
  });

// Runs `count` random requests through the shop's own handler; returns status codes per scenario.
export async function runTraffic(handle: (request: Request) => Promise<Response>, origin: string, count: number) {
  const results = await Promise.all(
    Array.from({ length: count }, async () => {
      const s = pick();
      const response = await handle(scenarioRequest(origin, s));
      return { scenario: s.name, status: response.status };
    }),
  );
  const errors = results.filter(r => r.status >= 500).length;
  return { requests: results.length, errors, results };
}
