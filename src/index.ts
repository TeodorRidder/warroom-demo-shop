import { HttpError, json } from "./http.ts";
import { page } from "./page.ts";
import { listProducts, searchProducts } from "./routes/catalog.ts";
import { checkout } from "./routes/checkout.ts";
import { recommend } from "./routes/recommendations.ts";
import { estimateDelivery } from "./routes/shipping.ts";
import { ErrorTracker, type CapturedError, type Severity, type TrackerEnv } from "./tracker.ts";
import { runTraffic, SCENARIOS } from "./traffic.ts";

export { ErrorTracker };

type Env = TrackerEnv & { TRACKER: DurableObjectNamespace<ErrorTracker>; TRAFFIC_PER_MINUTE?: string };

type Route = {
  method: "GET" | "POST";
  path: string;
  handler: string;
  file: string;
  severity: Severity;
  handle: (request: Request, url: URL) => unknown;
};

const ROUTES: Route[] = [
  { method: "GET", path: "/api/products", handler: "listProducts", file: "src/routes/catalog.ts", severity: "SEV3", handle: (_, url) => listProducts(url) },
  { method: "GET", path: "/api/search", handler: "searchProducts", file: "src/routes/catalog.ts", severity: "SEV3", handle: (_, url) => searchProducts(url) },
  { method: "POST", path: "/api/checkout", handler: "checkout", file: "src/routes/checkout.ts", severity: "SEV1", handle: request => checkout(request) },
  { method: "GET", path: "/api/shipping/estimate", handler: "estimateDelivery", file: "src/routes/shipping.ts", severity: "SEV2", handle: (_, url) => estimateDelivery(url) },
  { method: "GET", path: "/api/recommendations", handler: "recommend", file: "src/routes/recommendations.ts", severity: "SEV3", handle: (_, url) => recommend(url) },
];

const tracker = (env: Env) => env.TRACKER.get(env.TRACKER.idFromName("main"));

// Same crash, same issue: numbers, ids and quoted values don't make a new one.
const normalize = (message: string) => message.replace(/"[^"]*"|'[^']*'/g, '"?"').replace(/\b[0-9a-f]{8,}\b/gi, "#").replace(/\d+(\.\d+)?/g, "#");

async function handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === "/" && request.method === "GET") return new Response(page(SCENARIOS), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  if (url.pathname === "/api/errors" && request.method === "GET") return json({ warroom: env.WARROOM_URL ?? null, issues: await tracker(env).list() });
  if (url.pathname === "/api/traffic" && request.method === "POST") {
    const count = Math.min(100, Math.max(1, Number(url.searchParams.get("n") ?? "20") || 20));
    return json(await runTraffic(r => handle(r, env, ctx), url.origin, count));
  }
  if (url.pathname === "/health") return json({ ok: true });

  const route = ROUTES.find(r => r.path === url.pathname);
  if (!route) return json({ error: "not found" }, 404);
  if (route.method !== request.method) return json({ error: `use ${route.method}` }, 405);

  const started = Date.now();
  try {
    return json(await route.handle(request, url));
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    const err = error instanceof Error ? error : new Error(String(error));
    const ref = crypto.randomUUID().slice(0, 8);
    const captured: CapturedError = {
      fingerprint: `${route.handler}|${err.name}|${normalize(err.message)}`,
      title: `${err.name} in ${route.method} ${route.path}: ${err.message}`,
      errorName: err.name,
      message: err.message,
      stack: err.stack,
      route: `${route.method} ${route.path}`,
      handler: route.handler,
      file: route.file,
      severity: route.severity,
      region: request.headers.get("x-synthetic") ? "synthetic" : String((request.cf as { colo?: string } | undefined)?.colo ?? "local"),
      at: started,
    };
    console.error(JSON.stringify({ level: "error", ref, route: captured.route, error: `${err.name}: ${err.message}`, stack: err.stack }));
    ctx.waitUntil(tracker(env).capture(captured).catch(e => console.error(JSON.stringify({ level: "error", msg: "error tracker failed", error: String(e) }))));
    return json({ error: "internal error", ref }, 500);
  }
}

export default {
  fetch: (request, env, ctx) => handle(request, env, ctx),
  // Every minute: a burst of synthetic customers, so problems show up even when real traffic is low.
  scheduled: async (_controller, env, ctx) => {
    const count = Number(env.TRAFFIC_PER_MINUTE ?? "20");
    if (!(count > 0)) return;
    const result = await runTraffic(r => handle(r, env, ctx), "https://synthetic.local", Math.min(100, count));
    console.log(JSON.stringify({ level: "info", msg: "synthetic traffic", requests: result.requests, errors: result.errors }));
  },
} satisfies ExportedHandler<Env>;
