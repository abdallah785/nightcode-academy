const CART_KEY = 'gm_cart_v1';

const api = {
  async get(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error((await r.json()).error || r.statusText);
    return r.json();
  },
  async post(url, body, headers = {}) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || r.statusText);
    return data;
  }
};

const cart = {
  read() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  },
  write(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartChip();
    document.dispatchEvent(new CustomEvent('cart:change'));
  },
  count() { return this.read().reduce((s, it) => s + it.quantity, 0); },
  add(product, qty = 1) {
    const items = this.read();
    const existing = items.find((it) => it.id === product.id);
    if (existing) existing.quantity = Math.min(99, existing.quantity + qty);
    else items.push({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image, quantity: qty });
    this.write(items);
  },
  setQty(id, qty) {
    const items = this.read().map((it) => it.id === id ? { ...it, quantity: Math.max(1, Math.min(99, qty)) } : it);
    this.write(items);
  },
  remove(id) { this.write(this.read().filter((it) => it.id !== id)); },
  clear() { this.write([]); },
  total() { return this.read().reduce((s, it) => s + it.price * it.quantity, 0); }
};

function updateCartChip() {
  const el = document.querySelector('[data-cart-count]');
  if (el) el.textContent = cart.count();
}

function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2200);
}

function money(n) { return `${Number(n).toFixed(2).replace('.', ',')} €`; }

function markNav() {
  const p = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === p) a.classList.add('active');
  });
}

function hookBurger() {
  const b = document.querySelector('.burger');
  const links = document.querySelector('.nav-links');
  if (b && links) b.addEventListener('click', () => links.classList.toggle('open'));
}

function hookNewsletter() {
  const form = document.querySelector('#newsletter-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[name=email]').value.trim();
    try {
      await api.post('/api/newsletter', { email });
      form.reset();
      toast(email ? 'Merci, vous êtes inscrit(e) ✨' : 'Email enregistré');
    } catch (err) { toast(err.message); }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartChip();
  markNav();
  hookBurger();
  hookNewsletter();
});
