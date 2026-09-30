// Ops console: run customer journeys by hand, send a burst of synthetic customers, and see crash reports sent to War Room.
type Scenario = { name: string; method: string; path: string; body?: unknown };

const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const page = (scenarios: Scenario[]) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Brewline ops console</title>
<style>
  :root { --bg: #faf8f5; --fg: #1f1b16; --muted: #6b6259; --card: #fff; --line: #e6e0d8; --accent: #8a4b14; --bad: #b42318; --ok: #217a3c; }
  @media (prefers-color-scheme: dark) { :root { --bg: #171410; --fg: #f1ece6; --muted: #a39a90; --card: #221e19; --line: #3a332b; --accent: #e09a55; --bad: #f97066; --ok: #4ade80; } }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.5 system-ui, sans-serif; }
  main { max-width: 960px; margin: 0 auto; padding: 24px 16px 64px; }
  h1 { margin: 0 0 4px; font-size: 24px; } h2 { font-size: 16px; margin: 32px 0 8px; }
  p { color: var(--muted); margin: 0 0 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 8px; }
  button { font: inherit; text-align: left; padding: 10px 12px; border: 1px solid var(--line); background: var(--card); color: var(--fg); border-radius: 8px; cursor: pointer; }
  button:hover { border-color: var(--accent); }
  button small { display: block; color: var(--muted); font-size: 12px; overflow-wrap: anywhere; }
  .primary { background: var(--accent); color: var(--bg); border-color: var(--accent); font-weight: 600; }
  pre { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 12px; overflow: auto; max-height: 220px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; background: var(--card); border: 1px solid var(--line); border-radius: 8px; font-size: 14px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { color: var(--muted); font-weight: 500; }
  .wrap { overflow-x: auto; }
  .s5 { color: var(--bad); font-weight: 600; } .s2 { color: var(--ok); font-weight: 600; }
  a { color: var(--accent); }
</style>
</head>
<body>
<main>
  <h1>Brewline ops console</h1>
  <p>Internal tools for the shop API. Run a customer journey, send a burst of synthetic customers, and see the crash reports sent to War Room. Synthetic customers also run every minute.</p>

  <button class="primary" id="burst">Send 20 random customers</button>

  <h2>Customer journeys</h2>
  <div class="grid">
    ${scenarios.map((s, i) => `<button data-i="${i}">${escape(s.name)}<small>${s.method} ${escape(s.path)}</small></button>`).join("\n    ")}
  </div>

  <h2>Last response</h2>
  <pre id="out">Nothing sent yet.</pre>

  <h2>Issues</h2>
  <p id="target"></p>
  <div class="wrap"><table>
    <thead><tr><th>Issue</th><th>Count</th><th>Last seen</th><th>War Room</th></tr></thead>
    <tbody id="issues"><tr><td colspan="4">Loading…</td></tr></tbody>
  </table></div>
</main>
<script>
  const scenarios = ${JSON.stringify(scenarios).replace(/</g, "\\u003c")};
  const out = document.getElementById("out");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const show = (label, status, body) => {
    out.innerHTML = '<span class="' + (status >= 500 ? "s5" : "s2") + '">' + status + "</span> " + esc(label) + "\\n" + esc(JSON.stringify(body, null, 2));
  };
  document.querySelectorAll("button[data-i]").forEach(b => b.addEventListener("click", async () => {
    const s = scenarios[b.dataset.i];
    const res = await fetch(s.path, { method: s.method, headers: { "Content-Type": "application/json" }, body: s.body === undefined ? undefined : JSON.stringify(s.body) });
    show(s.name, res.status, await res.json().catch(() => null));
    setTimeout(loadIssues, 800);
  }));
  document.getElementById("burst").addEventListener("click", async () => {
    const res = await fetch("/api/traffic?n=20", { method: "POST" });
    const body = await res.json();
    show(body.requests + " requests, " + body.errors + " crashed", res.status, body.results);
    setTimeout(loadIssues, 800);
  });
  const ago = t => { const s = Math.round((Date.now() - t) / 1000); return s < 60 ? s + " s ago" : Math.round(s / 60) + " min ago"; };
  async function loadIssues() {
    const { warroom, issues } = await (await fetch("/api/errors")).json();
    document.getElementById("target").textContent = warroom ? "Reporting to " + warroom : "Not connected to War Room: issues are only logged.";
    document.getElementById("issues").innerHTML = issues.length ? issues.map(i =>
      "<tr><td><strong>" + esc(i.severity) + "</strong> " + esc(i.title) + "</td><td>" + i.total + "</td><td>" + ago(i.lastSeen) + "</td><td>" +
      (i.incidentUrl ? '<a href="' + esc(i.incidentUrl) + '" target="_blank" rel="noopener">' + esc(i.state === "closed" ? "resolved" : "open room") + "</a>" : esc(i.lastError ? "failed: " + i.lastError : "not sent")) +
      "</td></tr>").join("") : '<tr><td colspan="4">No crashes reported.</td></tr>';
  }
  loadIssues();
  setInterval(loadIssues, 5000);
</script>
</body>
</html>`;
