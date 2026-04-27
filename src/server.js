const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// DB setup
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    site TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    client TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    slug TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    room TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT DEFAULT '',
    img TEXT DEFAULT '',
    size TEXT DEFAULT '',
    price REAL DEFAULT 0,
    qty INTEGER DEFAULT 1,
    cmt TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );
`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'ezhome-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// ── AUTH ──
app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Все поля обязательны' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'Email уже зарегистрирован' });
  const hash = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)').run(id, email.toLowerCase(), hash, name);
  req.session.userId = id;
  res.json({ ok: true });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email?.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Неверный email или пароль' });
  req.session.userId = user.id;
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, email, name, phone, site FROM users WHERE id = ?').get(req.session.userId);
  res.json(user);
});

app.put('/api/me', auth, (req, res) => {
  const { name, phone, site } = req.body;
  db.prepare('UPDATE users SET name=?, phone=?, site=? WHERE id=?').run(name, phone, site, req.session.userId);
  res.json({ ok: true });
});

// ── PROJECTS ──
app.get('/api/projects', auth, (req, res) => {
  const projects = db.prepare(`
    SELECT p.*, COUNT(i.id) as item_count, COALESCE(SUM(i.price * i.qty), 0) as total
    FROM projects p LEFT JOIN items i ON i.project_id = p.id
    WHERE p.user_id = ?
    GROUP BY p.id ORDER BY p.updated_at DESC
  `).all(req.session.userId);
  res.json(projects);
});

app.post('/api/projects', auth, (req, res) => {
  const { name, client } = req.body;
  if (!name) return res.status(400).json({ error: 'Название обязательно' });
  const id = uuidv4();
  const slug = uuidv4().slice(0, 8);
  db.prepare('INSERT INTO projects (id, user_id, name, client, slug) VALUES (?, ?, ?, ?, ?)').run(id, req.session.userId, name, client || '', slug);
  res.json({ id, slug });
});

app.put('/api/projects/:id', auth, (req, res) => {
  const { name, client, status } = req.body;
  const project = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!project) return res.status(404).json({ error: 'Не найдено' });
  db.prepare('UPDATE projects SET name=?, client=?, status=?, updated_at=datetime(\'now\') WHERE id=?').run(name, client, status, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/projects/:id', auth, (req, res) => {
  const project = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!project) return res.status(404).json({ error: 'Не найдено' });
  db.prepare('DELETE FROM items WHERE project_id = ?').run(req.params.id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.post('/api/projects/:id/duplicate', auth, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!project) return res.status(404).json({ error: 'Не найдено' });
  const newId = uuidv4();
  const newSlug = uuidv4().slice(0, 8);
  db.prepare('INSERT INTO projects (id, user_id, name, client, slug, status) VALUES (?, ?, ?, ?, ?, ?)').run(newId, req.session.userId, 'Копия — ' + project.name, project.client, newSlug, 'active');
  const items = db.prepare('SELECT * FROM items WHERE project_id = ?').all(project.id);
  const insertItem = db.prepare('INSERT INTO items (id, project_id, room, name, url, img, size, price, qty, cmt, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  items.forEach(it => insertItem.run(uuidv4(), newId, it.room, it.name, it.url, it.img, it.size, it.price, it.qty, it.cmt, it.sort_order));
  res.json({ id: newId, slug: newSlug });
});

// ── ITEMS ──
app.get('/api/projects/:id/items', auth, (req, res) => {
  const project = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!project) return res.status(404).json({ error: 'Не найдено' });
  const items = db.prepare('SELECT * FROM items WHERE project_id = ? ORDER BY sort_order, room, rowid').all(req.params.id);
  res.json(items);
});

app.post('/api/projects/:id/items', auth, (req, res) => {
  const project = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!project) return res.status(404).json({ error: 'Не найдено' });
  const { room, name, url, img, size, price, qty, cmt } = req.body;
  if (!name) return res.status(400).json({ error: 'Название обязательно' });
  const id = uuidv4();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM items WHERE project_id = ?').get(req.params.id).m || 0;
  db.prepare('INSERT INTO items (id, project_id, room, name, url, img, size, price, qty, cmt, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, req.params.id, room, name, url || '', img || '', size || '', price || 0, qty || 1, cmt || '', maxOrder + 1);
  db.prepare("UPDATE projects SET updated_at=datetime('now') WHERE id=?").run(req.params.id);
  res.json({ id });
});

app.put('/api/items/:id', auth, (req, res) => {
  const item = db.prepare('SELECT i.id, p.user_id FROM items i JOIN projects p ON p.id = i.project_id WHERE i.id = ?').get(req.params.id);
  if (!item || item.user_id !== req.session.userId) return res.status(404).json({ error: 'Не найдено' });
  const { room, name, url, img, size, price, qty, cmt } = req.body;
  db.prepare('UPDATE items SET room=?, name=?, url=?, img=?, size=?, price=?, qty=?, cmt=? WHERE id=?').run(room, name, url || '', img || '', size || '', price || 0, qty || 1, cmt || '', req.params.id);
  res.json({ ok: true });
});

app.delete('/api/items/:id', auth, (req, res) => {
  const item = db.prepare('SELECT i.id, p.user_id FROM items i JOIN projects p ON p.id = i.project_id WHERE i.id = ?').get(req.params.id);
  if (!item || item.user_id !== req.session.userId) return res.status(404).json({ error: 'Не найдено' });
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── PUBLIC CLIENT PAGE ──
app.get('/p/:slug', (req, res) => {
  const project = db.prepare('SELECT p.*, u.name as designer_name, u.phone as designer_phone, u.email as designer_email, u.site as designer_site FROM projects p JOIN users u ON u.id = p.user_id WHERE p.slug = ?').get(req.params.slug);
  if (!project) return res.status(404).send('<h1>Страница не найдена</h1>');
  const items = db.prepare('SELECT * FROM items WHERE project_id = ? ORDER BY sort_order, room, rowid').all(project.id);
  res.send(buildClientPage(project, items));
});

function buildClientPage(project, items) {
  const ROOM_ORDER = ["Гостиная","Кухня","Спальня","Прихожая","Детская","Ванная","Кабинет","Свет"];
  const grp = {};
  items.forEach(i => { (grp[i.room] = grp[i.room] || []).push(i); });
  const rooms = [...ROOM_ORDER, ...Object.keys(grp).filter(r => !ROOM_ORDER.includes(r))].filter(r => grp[r]);
  const grand = items.reduce((s, i) => s + i.price * i.qty, 0);
  const roomTot = {};
  rooms.forEach(r => { roomTot[r] = grp[r].reduce((s, i) => s + i.price * i.qty, 0); });
  const date = new Date().toLocaleDateString('ru-RU');
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const fmt = n => Number(n).toLocaleString('ru-RU') + '\u202f₽';

  const summaryCards = rooms.map(r => roomTot[r] ? `
    <div style="background:#fff;border:1px solid #ddd5d0;border-top:3px solid #778D7F;border-radius:4px;padding:14px 20px;flex:1;min-width:110px">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#8e8e93;font-weight:400">${esc(r)}</div>
      <div style="font-size:18px;font-weight:400;color:#000;margin-top:4px;font-variant-numeric:tabular-nums;font-family:'Cormorant Garamond',serif">${fmt(roomTot[r])}</div>
    </div>` : '').join('');

  const sections = rooms.map(room => {
    const cards = grp[room].map(it => {
      const sum = it.price * it.qty;
      const imgBlock = it.img
        ? `<div style="height:180px;background:#f5f3ee;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:4px 4px 0 0"><img src="${esc(it.img)}" style="width:100%;height:100%;object-fit:contain" onerror="this.parentNode.innerHTML='<div style=height:180px;display:flex;align-items:center;justify-content:center;font-size:32px;color:#C8C1BE>&#9633;</div>'"></div>`
        : `<div style="height:180px;background:#f5f3ee;border-radius:4px 4px 0 0;display:flex;align-items:center;justify-content:center;font-size:32px;color:#C8C1BE">&#9633;</div>`;
      const nameEl = it.url
        ? `<a href="${esc(it.url)}" target="_blank" style="color:#000;font-size:14px;font-weight:400;text-decoration:none;line-height:1.4">${esc(it.name)}</a>`
        : `<div style="color:#000;font-size:14px;font-weight:400;line-height:1.4">${esc(it.name)}</div>`;
      return `<div style="background:#fff;border:1px solid #ddd5d0;border-radius:4px;overflow:hidden;display:flex;flex-direction:column">
        ${it.url ? `<a href="${esc(it.url)}" target="_blank" style="display:block;text-decoration:none">${imgBlock}</a>` : imgBlock}
        <div style="padding:14px 16px;flex:1;display:flex;flex-direction:column;gap:5px">
          ${nameEl}
          ${it.size ? `<div style="color:#8e8e93;font-size:12px">${esc(it.size)}</div>` : ''}
          ${it.cmt ? `<div style="color:#778D7F;font-size:12px;font-style:italic">${esc(it.cmt)}</div>` : ''}
          <div style="margin-top:auto;padding-top:10px;border-top:1px solid #f0ede6;display:flex;justify-content:space-between;align-items:baseline">
            <div style="font-size:12px;color:#8e8e93;font-weight:300">${it.qty} шт × ${it.price ? it.price.toLocaleString('ru-RU') + ' ₽' : '—'}</div>
            <div style="font-size:16px;font-weight:500;color:#000;font-variant-numeric:tabular-nums;font-family:'Cormorant Garamond',serif">${it.price ? fmt(sum) : '—'}</div>
          </div>
        </div>
      </div>`;
    }).join('');
    return `<section style="margin-bottom:48px">
      <div style="display:flex;align-items:baseline;justify-content:space-between;padding-bottom:12px;border-bottom:2px solid #7B2237;margin-bottom:18px">
        <h2 style="font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:500;color:#7B2237">${esc(room)}</h2>
        ${roomTot[room] ? `<div style="font-size:13px;color:#8e8e93;font-weight:300">${fmt(roomTot[room])}</div>` : ''}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">${cards}</div>
    </section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(project.name)}${project.client ? ' · ' + esc(project.client) : ''}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Jost',sans-serif;background:#fdfcfb;color:#000;font-weight:300;font-size:14px;line-height:1.6}
@media print{.no-print{display:none!important}@page{margin:12mm}}</style>
</head><body>
<header style="background:#7B2237;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap" class="no-print">
  <div style="display:flex;align-items:center;gap:16px">
    <div style="width:44px;height:44px;border:1px solid rgba(255,255,255,0.2);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:16px;color:rgba(255,255,255,0.7);font-family:'Cormorant Garamond',serif;font-weight:500">ez</div>
    <div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:500;color:#fff">${esc(project.designer_name)}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1.5px;margin-top:2px">Дизайнер интерьеров</div>
    </div>
  </div>
  <div style="display:flex;gap:12px;align-items:center">
    <button onclick="window.print()" style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:4px;padding:7px 16px;font-size:12px;cursor:pointer;font-family:'Jost',sans-serif">↓ PDF</button>
    <div style="text-align:right">
      <div style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:500;color:#fff">${esc(project.client || project.name)}</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:2px">${date}</div>
    </div>
  </div>
</header>
<div style="max-width:1100px;margin:0 auto;padding:36px 40px 72px">
  <div style="display:flex;gap:1px;background:#ddd5d0;border:1px solid #ddd5d0;border-radius:4px;overflow:hidden;margin-bottom:44px;flex-wrap:wrap">
    ${summaryCards}
    <div style="background:#7B2237;padding:14px 20px;min-width:110px;flex:0 0 auto">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.45);font-weight:400">Итого</div>
      <div style="font-size:20px;font-weight:400;color:#fff;margin-top:4px;font-variant-numeric:tabular-nums;font-family:'Cormorant Garamond',serif">${fmt(grand)}</div>
    </div>
  </div>
  ${sections}
  <footer style="padding-top:28px;border-top:1px solid #ddd5d0;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px">
    <div style="font-size:12px;color:#8e8e93">Цены производителя без скидок, доставки и выбора тканей</div>
    <div style="font-size:12px;color:#8e8e93">${esc(project.designer_phone || '')}${project.designer_phone && project.designer_email ? ' · ' : ''}${esc(project.designer_email || '')}</div>
  </footer>
</div>
</body></html>`;
}

app.listen(PORT, () => console.log(`ezhome-spec running on port ${PORT}`));
