import { HttpError, json } from "./http.ts";
import { listProducts, searchProducts } from "./routes/catalog.ts";
import { checkout } from "./routes/checkout.ts";

type Route = { method: "GET" | "POST"; path: string; handle: (request: Request, url: URL) => unknown };

const ROUTES: Route[] = [
  { method: "GET", path: "/api/products", handle: (_, url) => listProducts(url) },
  { method: "GET", path: "/api/search", handle: (_, url) => searchProducts(url) },
  { method: "POST", path: "/api/checkout", handle: request => checkout(request) },
];

export default {
  fetch: async request => {
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true });

    const route = ROUTES.find(r => r.path === url.pathname);
    if (!route) return json({ error: "not found" }, 404);
    if (route.method !== request.method) return json({ error: `use ${route.method}` }, 405);

    try {
      return json(await route.handle(request, url));
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      const ref = crypto.randomUUID().slice(0, 8);
      console.error(JSON.stringify({ level: "error", ref, path: url.pathname, error: String(error), stack: error instanceof Error ? error.stack : undefined }));
      return json({ error: "internal error", ref }, 500);
    }
  },
} satisfies ExportedHandler;
