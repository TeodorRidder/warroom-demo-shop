// Sends bursts of synthetic customers to a running shop.
//   node scripts/traffic.mjs [url] [requests per burst] [seconds between bursts]
// Default: http://localhost:8798, 20 requests, one burst (pass seconds to repeat; Ctrl-C to stop).
const [base = "http://localhost:8798", n = "20", every] = process.argv.slice(2);

for (;;) {
  const res = await fetch(`${base.replace(/\/+$/, "")}/api/traffic?n=${n}`, { method: "POST" });
  const body = await res.json();
  console.log(`${new Date().toLocaleTimeString()} ${body.requests} requests, ${body.errors} crashed`);
  if (!every) break;
  await new Promise(resolve => setTimeout(resolve, Number(every) * 1000));
}
