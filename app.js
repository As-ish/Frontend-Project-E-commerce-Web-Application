const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const st = {
  get(k, d) {
    try {
      const v = JSON.parse(localStorage.getItem(k));
      return v ?? d;
    } catch (e) {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  },
};
const qs = new URLSearchParams(location.search);
const byId = (id) => PRODUCTS.find((p) => p.id === id);
const off = (p) => Math.round((1 - p.price / p.mrp) * 100);
const eta = (d) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
};
function toast(m) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = m;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}
function badge() {
  const b = $("#cb");
  if (b) b.textContent = cart.totals().n;
}
const cart = {
  get: () => st.get("cart", []),
  save(c) {
    st.set("cart", c);
    badge();
  },
  add(id, qty = 1, size = "") {
    const c = this.get(),
      i = c.find((x) => x.id === id && x.size === size);
    i ? (i.qty = Math.min(10, i.qty + qty)) : c.push({ id, qty, size });
    this.save(c);
  },
  qty(id, size, d) {
    const c = this.get(),
      i = c.find((x) => x.id === id && x.size === size);
    if (i) {
      i.qty = Math.min(10, Math.max(1, i.qty + d));
      this.save(c);
    }
  },
  del(id, size) {
    this.save(this.get().filter((x) => !(x.id === id && x.size === size)));
  },
  clear() {
    this.save([]);
  },
  totals() {
    let mrp = 0,
      sub = 0,
      n = 0;
    this.get().forEach((i) => {
      const p = byId(i.id);
      if (p) {
        mrp += p.mrp * i.qty;
        sub += p.price * i.qty;
        n += i.qty;
      }
    });
    const ship = sub && sub < 499 ? 40 : 0;
    return { n, mrp, sub, disc: mrp - sub, ship, total: sub + ship };
  },
};
const card = (p) =>
  `<a class="card" href="product.html?id=${p.id}"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"><h3>${esc(p.name)}</h3><div><span class="star">${p.rating} ★</span> <span class="g">(${p.reviews.toLocaleString("en-IN")})</span></div><div class="pr"><b>${inr(p.price)}</b> <s>${inr(p.mrp)}</s> <span class="ok">${off(p)}% off</span></div><div class="g">Free delivery</div></a>`;
function chrome() {
  const u = st.get("user");
  $("#hdr").innerHTML =
    `<header class="top"><div class="wrap"><a class="logo" href="index.html">OnlineShop<small>Explore <b>Plus</b></small></a><form class="search" action="index.html"><input name="q" placeholder="Search for products, brands and more" value="${esc(qs.get("q"))}"><button>Search</button></form><nav><a href="${u ? "#" : "login.html"}" id="lg">${u ? "Hi, " + esc(u.name.split(" ")[0]) : "Login"}</a><a href="cart.html">🛒 Cart<span class="badge" id="cb">0</span></a></nav></div></header><div class="cats"><div class="wrap">${Object.entries(
      CATS,
    )
      .map(
        ([k, v]) =>
          `<a href="index.html?cat=${k}" class="${qs.get("cat") === k ? "on" : ""}">${v}</a>`,
      )
      .join("")}</div></div>`;
  if (u)
    $("#lg").onclick = (e) => {
      e.preventDefault();
      if (confirm("Logout karna hai?")) {
        localStorage.removeItem("user");
        location.href = "index.html";
      }
    };
  $("#ftr").innerHTML =
    `<footer><div class="wrap"><div><b>OnlineShop</b><br>Free delivery above ₹499 · 7-10 days returns<br>100% secure transactions</div><div>© ${new Date().getFullYear()} OnlineShop (demo project)</div></div></footer>`;
  badge();
}
