// The web shop: catalogue, search, cart and checkout, all on top of the public API.
export const storefront = () => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Brewline Coffee</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #f7f3ee; --surface: #fffdfa; --fg: #2a211b; --muted: #7a6d62; --line: #e7ddd2;
    --brand: #6b3a1e; --brand-fg: #fffaf4; --accent: #c8792f; --sale: #a8321e; --ok: #2f7a45;
    --tile-coffee: #e9d6c3; --tile-gear: #dfe3e2; --tile-milk: #eef0e6; --tile-care: #e3e6ef; --tile-gift: #f1dfe2;
    --shadow: 0 1px 2px rgba(42,33,27,.06), 0 8px 24px rgba(42,33,27,.06);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #17120f; --surface: #211a15; --fg: #f3ebe3; --muted: #a8998c; --line: #3a2f27;
      --brand: #e2a36b; --brand-fg: #1d140e; --accent: #e2a36b; --sale: #f08a73; --ok: #6fcf8e;
      --tile-coffee: #3a2a1e; --tile-gear: #2a2f2e; --tile-milk: #2f3127; --tile-care: #282c38; --tile-gift: #3a2a2d;
      --shadow: 0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.25);
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.5 Inter, system-ui, sans-serif; }
  button, input, select { font: inherit; color: inherit; }
  a { color: inherit; }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 16px; }

  header { position: sticky; top: 0; z-index: 10; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
  .bar { display: flex; align-items: center; gap: 12px; height: 64px; }
  .logo { font-family: Fraunces, Georgia, serif; font-size: 22px; color: var(--brand); text-decoration: none; white-space: nowrap; }
  .search { flex: 1; display: flex; max-width: 420px; margin-left: auto; }
  .search input { width: 100%; padding: 9px 12px; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); }
  .account { border: 1px solid var(--line); background: var(--surface); border-radius: 999px; padding: 8px 10px; }
  .cart-btn { position: relative; border: 0; background: var(--brand); color: var(--brand-fg); border-radius: 999px; padding: 9px 16px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .cart-btn b { display: inline-grid; place-items: center; min-width: 20px; height: 20px; margin-left: 6px; border-radius: 999px; background: var(--brand-fg); color: var(--brand); font-size: 12px; }

  .hero { padding: 40px 0 24px; display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: center; }
  .promo { background: var(--brand); color: var(--brand-fg); border-radius: 18px; padding: 24px; box-shadow: var(--shadow); }
  .promo small { text-transform: uppercase; letter-spacing: .08em; font-size: 12px; opacity: .8; }
  .promo strong { display: block; font-family: Fraunces, Georgia, serif; font-size: 26px; line-height: 1.15; margin: 6px 0 10px; }
  .promo code { background: var(--brand-fg); color: var(--brand); padding: 3px 8px; border-radius: 6px; font-weight: 600; }
  .hero h1 { font-family: Fraunces, Georgia, serif; font-size: clamp(28px, 5vw, 44px); line-height: 1.1; margin: 0 0 8px; max-width: 16ch; }
  .hero p { color: var(--muted); margin: 0; max-width: 52ch; }

  .chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 24px 0 16px; }
  .chip { border: 1px solid var(--line); background: var(--surface); border-radius: 999px; padding: 6px 14px; cursor: pointer; }
  .chip[aria-pressed="true"] { background: var(--fg); color: var(--bg); border-color: var(--fg); }

  h2 { font-family: Fraunces, Georgia, serif; font-size: 22px; margin: 32px 0 12px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
  .card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--shadow); }
  .tile { aspect-ratio: 4 / 3; display: grid; place-items: center; font-size: 56px; position: relative; }
  .badge { position: absolute; top: 10px; left: 10px; background: var(--sale); color: #fff; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
  .card .body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .card h3 { font-size: 15px; font-weight: 600; margin: 0; }
  .meta { color: var(--muted); font-size: 13px; text-transform: capitalize; }
  .price { margin-top: auto; display: flex; align-items: baseline; gap: 8px; }
  .price strong { font-size: 17px; }
  .price s { color: var(--muted); font-size: 13px; }
  .add { margin-top: 8px; border: 1px solid var(--brand); background: transparent; color: var(--brand); border-radius: 10px; padding: 8px; font-weight: 600; cursor: pointer; }
  .add:hover { background: var(--brand); color: var(--brand-fg); }
  .more { display: block; margin: 24px auto 0; border: 1px solid var(--line); background: var(--surface); border-radius: 999px; padding: 10px 22px; cursor: pointer; }
  .notice { color: var(--muted); padding: 16px 0; }
  .notice.err { color: var(--sale); }

  .drawer-bg { position: fixed; inset: 0; background: rgba(0,0,0,.35); opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 20; }
  .drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(420px, 100%); background: var(--surface); z-index: 21; transform: translateX(100%); transition: transform .25s; display: flex; flex-direction: column; box-shadow: var(--shadow); }
  .open .drawer-bg { opacity: 1; pointer-events: auto; }
  .open .drawer { transform: none; }
  .drawer header { position: static; display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: none; backdrop-filter: none; }
  .drawer header h2 { margin: 0; }
  .x { border: 0; background: none; font-size: 22px; cursor: pointer; color: var(--muted); }
  .lines { flex: 1; overflow: auto; padding: 8px 20px; }
  .line { display: grid; grid-template-columns: 44px 1fr auto; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line); }
  .line .mini { width: 44px; height: 44px; border-radius: 10px; display: grid; place-items: center; font-size: 22px; }
  .qty { display: inline-flex; align-items: center; gap: 6px; margin-top: 4px; }
  .qty button { width: 26px; height: 26px; border: 1px solid var(--line); background: var(--bg); border-radius: 8px; cursor: pointer; }
  .checkout { border-top: 1px solid var(--line); padding: 16px 20px 20px; display: grid; gap: 10px; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  label { display: grid; gap: 4px; font-size: 13px; color: var(--muted); }
  .checkout input, .checkout select { padding: 9px 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--bg); color: var(--fg); }
  .ship { font-size: 13px; color: var(--muted); min-height: 20px; }
  .total { display: flex; justify-content: space-between; font-weight: 600; font-size: 16px; }
  .pay { border: 0; background: var(--brand); color: var(--brand-fg); border-radius: 12px; padding: 13px; font-weight: 600; font-size: 16px; cursor: pointer; }
  .pay:disabled { opacity: .5; cursor: default; }
  .msg { font-size: 14px; border-radius: 10px; padding: 10px 12px; }
  .msg.err { background: color-mix(in srgb, var(--sale) 12%, transparent); color: var(--sale); }
  .msg.ok { background: color-mix(in srgb, var(--ok) 12%, transparent); color: var(--ok); }

  .toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); background: var(--fg); color: var(--bg); padding: 10px 16px; border-radius: 10px; font-size: 14px; opacity: 0; transition: opacity .2s; pointer-events: none; z-index: 30; max-width: calc(100% - 32px); }
  .toast.show { opacity: 1; }
  footer { color: var(--muted); font-size: 13px; padding: 48px 0 32px; }

  @media (max-width: 640px) {
    .hero { grid-template-columns: 1fr; }
    .bar { flex-wrap: wrap; height: auto; padding: 10px 0; }
    .search { order: 3; max-width: none; flex-basis: 100%; }
    .account { margin-left: auto; }
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .tile { font-size: 40px; }
  }
</style>
</head>
<body>
<header>
  <div class="wrap bar">
    <a class="logo" href="/">Brewline</a>
    <form class="search" id="search" role="search"><input id="q" type="search" placeholder="Search coffee, gear…" aria-label="Search"></form>
    <select class="account" id="user" aria-label="Signed in as">
      <option value="u1">Demo customer 1</option>
      <option value="u2">Demo customer 2</option>
      <option value="u3">Demo customer 3</option>
    </select>
    <button class="cart-btn" id="open-cart">Cart <b id="count">0</b></button>
  </div>
</header>

<main class="wrap">
  <section class="hero">
    <div><h1>Freshly roasted, delivered across the Nordics.</h1>
    <p>Single origins, everyday espresso and the gear to brew it. Free shipping on orders over $40.</p></div>
    <div class="promo"><small>Autumn sale</small><strong>25% off everything this week</strong>Use code <code>AUTUMN25</code> at checkout. New here? <code>WELCOME10</code> gives 10% off your first order.</div>
  </section>

  <section id="recs-section" hidden>
    <h2>Picked for you</h2>
    <div class="grid" id="recs"></div>
  </section>

  <h2 id="list-title">All products</h2>
  <div class="chips" id="chips">
    <button class="chip" aria-pressed="true" data-cat="">All</button>
    <button class="chip" aria-pressed="false" data-cat="coffee">Coffee</button>
    <button class="chip" aria-pressed="false" data-cat="gear">Gear</button>
    <button class="chip" aria-pressed="false" data-cat="milk">Milk</button>
    <button class="chip" aria-pressed="false" data-cat="care">Care</button>
    <button class="chip" aria-pressed="false" data-cat="gift">Gift cards</button>
  </div>
  <div class="grid" id="products"></div>
  <div id="list-notice" class="notice" hidden></div>
  <button class="more" id="more" hidden>Load more</button>

  <footer>© Brewline Coffee · Prices in USD unless you choose another currency at checkout.</footer>
</main>

<div id="cart-root">
  <div class="drawer-bg" id="close-bg"></div>
  <aside class="drawer" aria-label="Cart">
    <header><h2>Your cart</h2><button class="x" id="close-cart" aria-label="Close">×</button></header>
    <div class="lines" id="lines"></div>
    <div class="checkout">
      <div class="row">
        <label>Country
          <select id="country"><option value="SE">Sweden</option><option value="NO">Norway</option><option value="DK">Denmark</option><option value="DE">Germany</option><option value="US">United States</option></select>
        </label>
        <label>Currency
          <select id="currency"><option>USD</option><option>EUR</option><option>GBP</option><option>SEK</option><option>NOK</option></select>
        </label>
      </div>
      <div class="ship" id="ship"></div>
      <label>Discount code <input id="coupon" placeholder="e.g. WELCOME10" autocomplete="off"></label>
      <div class="total"><span>Subtotal (USD)</span><span id="subtotal">$0.00</span></div>
      <button class="pay" id="pay" disabled>Pay now</button>
      <div id="result"></div>
    </div>
  </aside>
</div>
<div class="toast" id="toast"></div>

<script>
  const ICON = [[/beans|origin/i, "🫘"], [/mug/i, "☕"], [/kettle/i, "🫖"], [/grinder/i, "⚙️"], [/filter/i, "📃"], [/milk/i, "🥛"], [/bottle/i, "🧊"], [/descaler/i, "🧴"], [/gift/i, "🎁"]];
  const icon = p => (ICON.find(([re]) => re.test(p.name)) || [, "☕"])[1];
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const money = n => "$" + n.toFixed(2);
  const pct = p => (p.discount && p.discount.percent) || 0;
  const salePrice = p => p.price * (1 - pct(p) / 100);

  const state = { page: 1, pages: 1, category: "", query: "", products: [], cart: new Map() };

  async function api(path, options) {
    const res = await fetch(path, options);
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
  }
  const oops = r => r.status >= 500 ? "Something went wrong on our side. Reference: " + (r.body.ref || "unknown") : (r.body.error || "Request failed");
  let toastTimer;
  function toast(text) {
    $("toast").textContent = text;
    $("toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), 3500);
  }

  function card(p) {
    const off = pct(p);
    return '<article class="card"><div class="tile" style="background:var(--tile-' + esc(p.category) + ')">' + icon(p) +
      (off ? '<span class="badge">-' + off + '%</span>' : "") + '</div><div class="body"><h3>' + esc(p.name) + '</h3><div class="meta">' + esc(p.category) +
      (p.stock < 10 ? " · only " + p.stock + " left" : "") + '</div><div class="price"><strong>' + money(salePrice(p)) + "</strong>" +
      (off ? "<s>" + money(p.price) + "</s>" : "") + '</div><button class="add" data-id="' + esc(p.id) + '">Add to cart</button></div></article>';
  }
  const known = new Map();
  function remember(items) { for (const p of items) known.set(p.id, p); }

  function renderProducts() {
    $("products").innerHTML = state.products.map(card).join("");
    $("more").hidden = !!(state.query || state.category) || state.page >= state.pages;
  }
  function notice(text, err) {
    $("list-notice").hidden = !text;
    $("list-notice").textContent = text || "";
    $("list-notice").classList.toggle("err", !!err);
  }

  async function loadProducts(reset) {
    notice("");
    if (state.query || state.category) {
      const filter = state.category ? "&filter=" + encodeURIComponent(JSON.stringify({ category: state.category })) : "";
      const r = await api("/api/search?q=" + encodeURIComponent(state.query) + filter);
      if (!r.ok) { state.products = []; renderProducts(); return notice(oops(r), true); }
      state.products = r.body.items;
      remember(r.body.items);
      renderProducts();
      if (!r.body.items.length) notice("Nothing matches that. Try another search.");
      return;
    }
    const page = reset ? 1 : state.page + 1;
    const r = await api("/api/products?page=" + page);
    if (!r.ok) { $("more").hidden = true; return notice(reset ? oops(r) : "Couldn't load more products. " + oops(r), true); }
    state.page = r.body.page;
    state.pages = r.body.pages;
    state.products = reset ? r.body.items : state.products.concat(r.body.items);
    remember(r.body.items);
    renderProducts();
  }

  async function loadRecs() {
    const r = await api("/api/recommendations?user=" + $("user").value);
    $("recs-section").hidden = !r.ok || !r.body.items.length;
    if (r.ok) { remember(r.body.items); $("recs").innerHTML = r.body.items.map(card).join(""); }
  }

  function renderCart() {
    let count = 0, subtotal = 0;
    const rows = [];
    for (const [id, qty] of state.cart) {
      const p = known.get(id);
      count += qty;
      subtotal += salePrice(p) * qty;
      rows.push('<div class="line"><div class="mini" style="background:var(--tile-' + esc(p.category) + ')">' + icon(p) + '</div><div><div>' + esc(p.name) +
        '</div><div class="qty"><button data-dec="' + esc(id) + '" aria-label="Fewer">−</button>' + qty + '<button data-inc="' + esc(id) + '" aria-label="More">+</button></div></div><div>' + money(salePrice(p) * qty) + "</div></div>");
    }
    $("lines").innerHTML = rows.join("") || '<p class="notice">Your cart is empty.</p>';
    $("count").textContent = count;
    $("subtotal").textContent = money(subtotal);
    $("pay").disabled = count === 0;
  }
  function add(id) {
    state.cart.set(id, (state.cart.get(id) || 0) + 1);
    renderCart();
    toast("Added " + known.get(id).name + " to your cart");
  }

  async function estimateShipping() {
    $("ship").textContent = "Checking delivery…";
    const r = await api("/api/shipping/estimate?country=" + $("country").value);
    $("ship").textContent = r.ok ? "Ships " + r.body.shipsOn + " · arrives " + r.body.arrives : "Delivery estimate unavailable. " + oops(r);
  }

  async function pay() {
    $("pay").disabled = true;
    $("pay").textContent = "Paying…";
    const items = [...state.cart].map(([productId, qty]) => ({ productId, qty }));
    const coupon = $("coupon").value.trim();
    const r = await api("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, currency: $("currency").value, ...(coupon ? { coupon } : {}) }) });
    $("pay").textContent = "Pay now";
    if (r.ok) {
      $("result").innerHTML = '<div class="msg ok">Thanks! Order <b>' + esc(r.body.orderId) + "</b> is confirmed: " + esc(r.body.total.toFixed(2)) + " " + esc(r.body.currency) + ".</div>";
      state.cart.clear();
      $("coupon").value = "";
      renderCart();
    } else {
      $("result").innerHTML = '<div class="msg err">Payment failed. ' + esc(oops(r)) + "</div>";
      $("pay").disabled = false;
    }
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.id) add(t.dataset.id);
    if (t.dataset.inc) { state.cart.set(t.dataset.inc, state.cart.get(t.dataset.inc) + 1); renderCart(); }
    if (t.dataset.dec) { const q = state.cart.get(t.dataset.dec) - 1; q > 0 ? state.cart.set(t.dataset.dec, q) : state.cart.delete(t.dataset.dec); renderCart(); }
    if (t.dataset.cat !== undefined) {
      state.category = t.dataset.cat;
      document.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", String(c === t)));
      $("list-title").textContent = state.category ? t.textContent : "All products";
      loadProducts(true);
    }
  });
  $("more").addEventListener("click", () => loadProducts(false));
  $("search").addEventListener("submit", e => { e.preventDefault(); state.query = $("q").value.trim(); loadProducts(true); });
  $("user").addEventListener("change", loadRecs);
  $("open-cart").addEventListener("click", () => { $("cart-root").classList.add("open"); $("result").innerHTML = ""; estimateShipping(); });
  $("close-cart").addEventListener("click", () => $("cart-root").classList.remove("open"));
  $("close-bg").addEventListener("click", () => $("cart-root").classList.remove("open"));
  $("country").addEventListener("change", estimateShipping);
  $("pay").addEventListener("click", pay);

  renderCart();
  loadProducts(true);
  loadRecs();
</script>
</body>
</html>`;
