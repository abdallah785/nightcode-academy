const path = require('path');
const express = require('express');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'goldenmoon-dev';

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max);

function requireAdmin(req, res, next) {
  const token = req.get('x-admin-token') || req.query.token;
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Accès refusé' });
  next();
}

// ── Produits ───────────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const { category, featured, q } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (featured === '1') sql += ' AND featured = 1';
  if (q) { sql += ' AND (name LIKE ? OR short_desc LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  sql += ' ORDER BY featured DESC, id ASC';
  res.json(db.prepare(sql).all(...params));
});

app.get('/api/products/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Produit introuvable' });
  res.json(row);
});

app.get('/api/categories', (_req, res) => {
  const rows = db.prepare(
    'SELECT category, COUNT(*) AS n FROM products GROUP BY category ORDER BY category'
  ).all();
  res.json(rows);
});

// ── Contact ────────────────────────────────────────────────────────────
app.post('/api/contact', (req, res) => {
  const name = clean(req.body.name, 80);
  const email = clean(req.body.email, 120);
  const subject = clean(req.body.subject, 120);
  const message = clean(req.body.message, 2000);
  if (!name || !isEmail(email) || !subject || message.length < 5) {
    return res.status(400).json({ error: 'Champs invalides' });
  }
  const info = db.prepare(
    'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)'
  ).run(name, email, subject, message);
  res.status(201).json({ id: info.lastInsertRowid });
});

// ── Newsletter ─────────────────────────────────────────────────────────
app.post('/api/newsletter', (req, res) => {
  const email = clean(req.body.email, 120).toLowerCase();
  if (!isEmail(email)) return res.status(400).json({ error: 'Email invalide' });
  try {
    db.prepare('INSERT INTO subscribers (email) VALUES (?)').run(email);
    res.status(201).json({ ok: true });
  } catch (e) {
    if (String(e).includes('UNIQUE')) return res.status(200).json({ ok: true, already: true });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── Commandes ──────────────────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const customer = clean(req.body.customer, 120);
  const email = clean(req.body.email, 120);
  const address = clean(req.body.address, 300);
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!customer || !isEmail(email) || !address || items.length === 0) {
    return res.status(400).json({ error: 'Commande invalide' });
  }

  const getProduct = db.prepare('SELECT * FROM products WHERE id = ?');
  const normalized = [];
  let total = 0;
  for (const it of items) {
    const p = getProduct.get(Number(it.product_id));
    const qty = Math.max(1, Math.min(99, Number(it.quantity) || 1));
    if (!p) return res.status(400).json({ error: `Produit ${it.product_id} inconnu` });
    if (p.stock < qty) return res.status(409).json({ error: `Stock insuffisant pour ${p.name}` });
    normalized.push({ p, qty });
    total += p.price * qty;
  }

  const insertOrder = db.prepare(
    'INSERT INTO orders (customer, email, address, total) VALUES (?, ?, ?, ?)'
  );
  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
  );
  const decStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

  const tx = db.transaction(() => {
    const info = insertOrder.run(customer, email, address, Number(total.toFixed(2)));
    const orderId = info.lastInsertRowid;
    for (const { p, qty } of normalized) {
      insertItem.run(orderId, p.id, qty, p.price);
      decStock.run(qty, p.id);
    }
    return orderId;
  });

  const orderId = tx();
  res.status(201).json({ id: orderId, total: Number(total.toFixed(2)) });
});

// ── Admin ──────────────────────────────────────────────────────────────
app.get('/api/admin/overview', requireAdmin, (_req, res) => {
  const stats = {
    products: db.prepare('SELECT COUNT(*) AS c FROM products').get().c,
    orders: db.prepare('SELECT COUNT(*) AS c FROM orders').get().c,
    contacts: db.prepare('SELECT COUNT(*) AS c FROM contacts').get().c,
    subscribers: db.prepare('SELECT COUNT(*) AS c FROM subscribers').get().c,
    revenue: db.prepare('SELECT COALESCE(SUM(total),0) AS s FROM orders').get().s
  };
  const recentOrders = db.prepare(
    'SELECT id, customer, email, total, status, created_at FROM orders ORDER BY id DESC LIMIT 10'
  ).all();
  const recentContacts = db.prepare(
    'SELECT id, name, email, subject, created_at FROM contacts ORDER BY id DESC LIMIT 10'
  ).all();
  res.json({ stats, recentOrders, recentContacts });
});

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

app.listen(PORT, () => {
  console.log(`Golden Moon lève sur http://localhost:${PORT}`);
});
