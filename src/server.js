const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const path = require('path');

const app = express();

const loginAttempts = {};
function checkRateLimit(ip) {
  const now = Date.now();
  const entry = loginAttempts[ip];
  if (entry && entry.lockedUntil && now < entry.lockedUntil) {
    const mins = Math.ceil((entry.lockedUntil - now) / 60000);
    return `Слишком много попыток. Попробуйте через ${mins} мин.`;
  }
  return null;
}
function recordFailedLogin(ip) {
  const now = Date.now();
  if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0 };
  const entry = loginAttempts[ip];
  if (entry.lockedUntil && now > entry.lockedUntil) entry.count = 0;
  entry.count++;
  entry.lastAttempt = now;
  if (entry.count >= 5) entry.lockedUntil = now + 30 * 60 * 1000;
}
function clearLoginAttempts(ip) {
  delete loginAttempts[ip];
}

const ALLOWED_ORIGINS = ['https://useseta.com', 'https://www.useseta.com', 'https://app.useseta.com', 'http://localhost:5173'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const PORT = process.env.PORT || 8080;
const ADMIN_EMAIL = 'oralkin@gmail.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET is not set in production. Refusing to start.');
  process.exit(1);
}

// ── Валидация ─────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email обязателен';
  if (!EMAIL_RE.test(email.trim())) return 'Некорректный email';
  if (email.length > 254) return 'Email слишком длинный';
  return null;
}
function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Пароль обязателен';
  if (password.length < 6) return 'Пароль должен быть не короче 6 символов';
  if (password.length > 128) return 'Пароль слишком длинный';
  return null;
}
function validateLength(value, field, min, max) {
  if (!value || typeof value !== 'string' || !value.trim()) return `${field} обязательно`;
  if (value.trim().length < min) return `${field} должно быть не короче ${min} символов`;
  if (value.trim().length > max) return `${field} не должно превышать ${max} символов`;
  return null;
}
function validateOptionalLength(value, field, max) {
  if (!value) return null;
  if (typeof value !== 'string') return `${field}: неверный тип`;
  if (value.length > max) return `${field} не должно превышать ${max} символов`;
  return null;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function sendEmailTo(to, subject, html, attachments = []) {
  if (!RESEND_API_KEY) return;
  try {
    const body = { from: 'SETA <onboarding@resend.dev>', to, subject, html };
    if (attachments.length) body.attachments = attachments;
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    console.log('Resend response:', resp.status, JSON.stringify(data));
  } catch (e) {
    console.error('Email error:', e.message);
  }
}

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      site TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      client TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      slug TEXT UNIQUE NOT NULL,
      comment TEXT DEFAULT '',
      cover_hue INTEGER DEFAULT 28,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id),
      room TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT DEFAULT '',
      img TEXT DEFAULT '',
      size TEXT DEFAULT '',
      price NUMERIC DEFAULT 0,
      qty INTEGER DEFAULT 1,
      cmt TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `);
  await pool.query(`INSERT INTO settings (key, value) VALUES ('banner_active', 'false') ON CONFLICT DO NOTHING`);
  await pool.query(`INSERT INTO settings (key, value) VALUES ('banner_text', '') ON CONFLICT DO NOTHING`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS magic_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE
    );
  `);
  await pool.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS note TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id)`);
  await pool.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS color TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS comment TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_hue INTEGER DEFAULT 28`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS logo TEXT DEFAULT ''`);
  console.log('DB initialized');
}

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.set('trust proxy', 1);
app.use(session({
  store: new pgSession({ pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET || 'seta-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' }
}));

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

const adminAuth = async (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  // Проверяем email из базы — не из сессии, чтобы старые сессии тоже работали
  try {
    const r = await pool.query('SELECT email FROM users WHERE id=$1', [req.session.userId]);
    if (!r.rows.length || r.rows[0].email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch(e) {
    res.status(500).json({ error: 'Server error' });
  }
};

// AUTH
const INVITE_TOKEN = process.env.INVITE_TOKEN || 'seta-beta-2026';
const MAX_USERS = 15;

// Проверка инвайт-токена
app.get('/invite/:token', (req, res) => {
  if (req.params.token !== INVITE_TOKEN) return res.status(404).send('<h1>Ссылка недействительна</h1>');
  res.sendFile(require('path').join(__dirname, '../public/index.html'));
});

app.post('/api/register', async (req, res) => {
  const { email, password, name, invite } = req.body;
  if (invite !== INVITE_TOKEN) return res.status(403).json({ error: 'Неверная ссылка для регистрации' });
  const emailErr = validateEmail(email);
  if (emailErr) return res.status(400).json({ error: emailErr });
  const passErr = validatePassword(password);
  if (passErr) return res.status(400).json({ error: passErr });
  const nameErr = validateLength(name, 'Имя', 2, 100);
  if (nameErr) return res.status(400).json({ error: nameErr });
  const count = await pool.query('SELECT COUNT(*) FROM users');
  if (parseInt(count.rows[0].count) >= MAX_USERS) return res.status(403).json({ error: 'Достигнут лимит участников' });
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length) return res.status(400).json({ error: 'Email уже зарегистрирован' });
  const hash = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  await pool.query('INSERT INTO users (id, email, password, name) VALUES ($1, $2, $3, $4)', [id, email.toLowerCase(), hash, name]);
  req.session.userId = id;
  req.session.userEmail = email.toLowerCase();

  // Создаём демо-проект для онбординга
  try {
    const projectId = uuidv4();
    const slug = 'demo-' + Math.random().toString(36).slice(2, 9);
    await pool.query(
      'INSERT INTO projects (id, user_id, name, client, slug, cover_hue, status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [projectId, id, 'ЖК Тестовое', 'Иванова Мария', slug, 28, 'active']
    );
    const items = [
      { name: 'Диван Lennox 3-местный', brand: 'Creatica', size: '220×95×85 см', color: 'Серый велюр', price: 89900, qty: 1, url: 'https://creatica.shop', img: 'https://creatica.shop/upload/iblock/bbd/dmy6qygnc32uld8ddsqe5w2sr93zth33.jpg', note: 'Уточнить сроки поставки' },
      { name: 'Кофейный стол Olden', brand: 'ПМЦ', size: '95×95×42 см', color: 'Дуб натуральный', price: 31300, qty: 1, url: '', img: '', note: '' },
      { name: 'Стулья Turin Soft', brand: 'ПМЦ', size: '58×57×79 см', color: 'Рогожка бежевая', price: 30800, qty: 4, url: '', img: '', note: 'Массив, срок исполнения 70 дней' },
      { name: 'Ковёр Tkano Over Horizon', brand: 'Tkano', size: '120×180 см', color: 'Марсала', price: 23740, qty: 1, url: '', img: '', note: '' },
      { name: 'Торшер Arco', brand: 'Flos', size: 'В 210 см', color: 'Белый мрамор', price: 145000, qty: 1, url: '', img: '', note: 'Требует согласования' },
    ];
    for (let i = 0; i < items.length; i++) {
      const p = items[i];
      await pool.query(
        'INSERT INTO items (id, project_id, user_id, room, name, cmt, size, color, price, qty, url, img, note, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',
        [uuidv4(), projectId, id, 'Гостиная', p.name, p.brand, p.size, p.color, p.price, p.qty, p.url, p.img, p.note, i]
      );
    }
  } catch(e) {
    console.error('Demo project creation failed:', e.message);
  }

  res.json({ ok: true });
});

app.post('/api/login', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const limited = checkRateLimit(ip);
  if (limited) return res.status(429).json({ error: limited });
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email?.toLowerCase()]);
  const user = result.rows[0];
  if (!user || !bcrypt.compareSync(password, user.password)) {
    recordFailedLogin(ip);
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }
  clearLoginAttempts(ip);
  req.session.userId = user.id;
  req.session.userEmail = user.email;
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => { req.session.destroy(); res.json({ ok: true }); });

app.get('/api/me', auth, async (req, res) => {
  const r = await pool.query('SELECT id, email, name, phone, site, logo FROM users WHERE id = $1', [req.session.userId]);
  const user = r.rows[0];
  user.isAdmin = user.email === ADMIN_EMAIL;
  res.json(user);
});

app.put('/api/me', auth, async (req, res) => {
  const { name, phone, site, logo } = req.body;
  const nameErr = validateLength(name, 'Имя', 2, 100);
  if (nameErr) return res.status(400).json({ error: nameErr });
  const phoneErr = validateOptionalLength(phone, 'Телефон', 30);
  if (phoneErr) return res.status(400).json({ error: phoneErr });
  const siteErr = validateOptionalLength(site, 'Сайт', 100);
  if (siteErr) return res.status(400).json({ error: siteErr });
  const logoErr = validateOptionalLength(logo, 'Логотип', 500000); // base64 ~375KB файл
  if (logoErr) return res.status(400).json({ error: logoErr });
  await pool.query('UPDATE users SET name=$1, phone=$2, site=$3, logo=$4 WHERE id=$5', [name.trim(), (phone||'').trim(), (site||'').trim(), logo||'', req.session.userId]);
  res.json({ ok: true });
});

// FEEDBACK
app.post('/api/feedback', auth, async (req, res) => {
  const { text, image, topic } = req.body;
  console.log('feedback image:', image ? image.slice(0, 50) : 'none', 'topic:', topic);
  const textErr = validateLength(text, 'Текст', 1, 5000);
  if (textErr) return res.status(400).json({ error: textErr });
  const topicErr = validateOptionalLength(topic, 'Тема', 200);
  if (topicErr) return res.status(400).json({ error: topicErr });
  const id = uuidv4();
  await pool.query('INSERT INTO feedback (id, user_id, text) VALUES ($1, $2, $3)', [id, req.session.userId, text.trim()]);
  const userR = await pool.query('SELECT name, email FROM users WHERE id=$1', [req.session.userId]);
  const user = userR.rows[0];
  const date = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  const attachments = [];
  if (image && image.startsWith('data:')) {
    const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (matches) {
      attachments.push({ filename: 'screenshot.png', content: matches[2] });
    }
  }
  await sendEmailTo(
    ADMIN_EMAIL,
    `Новый отзыв от ${user.name}${topic ? ' — ' + topic : ''}`,
    `<p><b>${user.name}</b> (${user.email})</p><p><b>Тема:</b> ${topic || '—'}</p><p>${date}</p><hr><p style="font-size:16px">${text.trim().replace(/\n/g, '<br>')}</p>${attachments.length ? '<p><i>Скриншот прикреплён во вложении</i></p>' : ''}`,
    attachments
  );
  res.json({ ok: true });
});


app.get('/api/feedback/mine', auth, async (req, res) => {
  const r = await pool.query(
    'SELECT id, text, created_at FROM feedback WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20',
    [req.session.userId]
  );
  res.json(r.rows);
});

app.delete('/api/feedback/:id', adminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM feedback WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/feedback', adminAuth, async (req, res) => {
  const r = await pool.query(`
    SELECT f.*, u.name as user_name, u.email as user_email
    FROM feedback f JOIN users u ON u.id = f.user_id
    ORDER BY f.created_at DESC
  `);
  res.json(r.rows);
});



// ADMIN PAGE
app.get('/admin', adminAuth, (req, res) => {
  res.sendFile(require('path').join(__dirname, '../public/admin.html'));
});

app.get('/api/admin/invite-url', adminAuth, (req, res) => {
  const base = process.env.APP_URL || 'https://useseta.com';
  res.json({ url: base + '/invite/' + INVITE_TOKEN });
});

// ADMIN — список пользователей и сброс пароля
app.get('/api/admin/users', adminAuth, async (req, res) => {
  const r = await pool.query(`
    SELECT u.id, u.email, u.name, u.created_at,
           COUNT(f.id)::int as feedback_count
    FROM users u
    LEFT JOIN feedback f ON f.user_id = u.id
    WHERE u.email != $1
    GROUP BY u.id
    ORDER BY u.created_at ASC
  `, [ADMIN_EMAIL]);
  res.json(r.rows);
});

app.post('/api/admin/reset-password', adminAuth, async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId обязателен' });
  const r = await pool.query('SELECT email, name FROM users WHERE id=$1', [userId]);
  if (!r.rows.length) return res.status(404).json({ error: 'Пользователь не найден' });
  const user = r.rows[0];
  // Генерируем временный пароль
  const tmpPass = Math.random().toString(36).slice(2, 10);
  const hash = bcrypt.hashSync(tmpPass, 10);
  await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hash, userId]);
  // Отправляем пользователю
  await sendEmailTo(user.email, 'Новый пароль — useseta.com',
    `<p>Привет, ${user.name}!</p><p>Твой временный пароль: <b style="font-size:18px">${tmpPass}</b></p><p>Войди на <a href="https://useseta.com">useseta.com</a> и смени пароль в настройках.</p>`
  );
  res.json({ ok: true, tmpPass });
});




app.delete('/api/admin/users/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  // Не даём удалить самого себя
  const r = await pool.query('SELECT email FROM users WHERE id=$1', [id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Не найдено' });
  if (r.rows[0].email === ADMIN_EMAIL) return res.status(403).json({ error: 'Нельзя удалить администратора' });
  await pool.query('DELETE FROM feedback WHERE user_id=$1', [id]);
  await pool.query('DELETE FROM items WHERE project_id IN (SELECT id FROM projects WHERE user_id=$1)', [id]);
  await pool.query('DELETE FROM projects WHERE user_id=$1', [id]);
  await pool.query('DELETE FROM users WHERE id=$1', [id]);
  res.json({ ok: true });
});

// PROJECTS
// BANNER
app.get('/api/banner', async (req, res) => {
  try {
    const r = await pool.query("SELECT key, value FROM settings WHERE key IN ('banner_active','banner_text')");
    const s = Object.fromEntries(r.rows.map(row => [row.key, row.value]));
    res.json({ active: s.banner_active === 'true', text: s.banner_text || '' });
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/admin/banner', adminAuth, async (req, res) => {
  try {
    const { active, text } = req.body;
    await pool.query("UPDATE settings SET value=$1 WHERE key='banner_active'", [active ? 'true' : 'false']);
    await pool.query("UPDATE settings SET value=$1 WHERE key='banner_text'", [text || '']);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/projects', auth, async (req, res) => {
  const r = await pool.query(`
    SELECT p.*, COUNT(i.id) as item_count, COALESCE(SUM(i.price * i.qty), 0) as total
    FROM projects p LEFT JOIN items i ON i.project_id = p.id
    WHERE p.user_id = $1
    GROUP BY p.id ORDER BY p.updated_at DESC
  `, [req.session.userId]);
  res.json(r.rows);
});

app.post('/api/projects', auth, async (req, res) => {
  const { name, client } = req.body;
  const nameErr = validateLength(name, 'Название', 1, 200);
  if (nameErr) return res.status(400).json({ error: nameErr });
  const clientErr = validateOptionalLength(client, 'Клиент', 200);
  if (clientErr) return res.status(400).json({ error: clientErr });
  const id = uuidv4(), slug = uuidv4().slice(0, 8);
  await pool.query('INSERT INTO projects (id, user_id, name, client, slug) VALUES ($1, $2, $3, $4, $5)', [id, req.session.userId, name, client || '', slug]);
  res.json({ id, slug });
});

app.put('/api/projects/:id', auth, async (req, res) => {
  const { name, client, status, comment, cover_hue } = req.body;
  const r = await pool.query('SELECT id, name, client, status, comment, cover_hue FROM projects WHERE id=$1 AND user_id=$2', [req.params.id, req.session.userId]);
  if (!r.rows.length) return res.status(404).json({ error: 'Не найдено' });
  const cur = r.rows[0];
  await pool.query(
    'UPDATE projects SET name=$1, client=$2, status=$3, comment=$4, cover_hue=$5, updated_at=NOW() WHERE id=$6',
    [
      name      !== undefined ? name      : cur.name,
      client    !== undefined ? client    : cur.client,
      status    !== undefined ? status    : cur.status,
      comment   !== undefined ? comment   : cur.comment,
      cover_hue !== undefined ? cover_hue : cur.cover_hue,
      req.params.id
    ]
  );
  res.json({ ok: true });
});

app.put('/api/projects/:id/comment', auth, async (req, res) => {
  const { comment } = req.body;
  const r = await pool.query('SELECT id FROM projects WHERE id=$1 AND user_id=$2', [req.params.id, req.session.userId]);
  if (!r.rows.length) return res.status(404).json({ error: 'Не найдено' });
  await pool.query('UPDATE projects SET comment=$1, updated_at=NOW() WHERE id=$2', [comment || '', req.params.id]);
  res.json({ ok: true });
});

app.delete('/api/projects/:id', auth, async (req, res) => {
  const r = await pool.query('SELECT id FROM projects WHERE id=$1 AND user_id=$2', [req.params.id, req.session.userId]);
  if (!r.rows.length) return res.status(404).json({ error: 'Не найдено' });
  await pool.query('DELETE FROM items WHERE project_id=$1', [req.params.id]);
  await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

app.post('/api/projects/:id/duplicate', auth, async (req, res) => {
  const r = await pool.query('SELECT * FROM projects WHERE id=$1 AND user_id=$2', [req.params.id, req.session.userId]);
  if (!r.rows.length) return res.status(404).json({ error: 'Не найдено' });
  const p = r.rows[0];
  const newId = uuidv4(), newSlug = uuidv4().slice(0, 8);
  await pool.query('INSERT INTO projects (id, user_id, name, client, slug, status, comment) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [newId, req.session.userId, 'Копия — ' + p.name, p.client, newSlug, 'active', p.comment || '']);
  const items = await pool.query('SELECT * FROM items WHERE project_id=$1', [p.id]);
  for (const it of items.rows) {
    await pool.query('INSERT INTO items (id, project_id, room, name, url, img, size, price, qty, cmt, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [uuidv4(), newId, it.room, it.name, it.url, it.img, it.size, it.price, it.qty, it.cmt, it.sort_order]);
  }
  res.json({ id: newId, slug: newSlug });
});

// ITEMS
app.get('/api/projects/:id/items', auth, async (req, res) => {
  const r = await pool.query('SELECT id FROM projects WHERE id=$1 AND user_id=$2', [req.params.id, req.session.userId]);
  if (!r.rows.length) return res.status(404).json({ error: 'Не найдено' });
  const items = await pool.query('SELECT * FROM items WHERE project_id=$1 ORDER BY sort_order, room, id', [req.params.id]);
  res.json(items.rows);
});

app.post('/api/projects/:id/items', auth, async (req, res) => {
  const r = await pool.query('SELECT id FROM projects WHERE id=$1 AND user_id=$2', [req.params.id, req.session.userId]);
  if (!r.rows.length) return res.status(404).json({ error: 'Не найдено' });
  const { room, name, url, img, size, color, price, qty, cmt, note } = req.body;
  const nameErr = validateLength(name, 'Название', 1, 200);
  if (nameErr) return res.status(400).json({ error: nameErr });
  const roomErr = validateOptionalLength(room, 'Комната', 100);
  if (roomErr) return res.status(400).json({ error: roomErr });
  const sizeErr = validateOptionalLength(size, 'Размер', 200);
  if (sizeErr) return res.status(400).json({ error: sizeErr });
  const colorErr = validateOptionalLength(color, 'Цвет', 200);
  if (colorErr) return res.status(400).json({ error: colorErr });
  const cmtErr = validateOptionalLength(cmt, 'Бренд/комментарий', 500);
  if (cmtErr) return res.status(400).json({ error: cmtErr });
  const noteErr = validateOptionalLength(note, 'Заметка', 500);
  if (noteErr) return res.status(400).json({ error: noteErr });
  if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) return res.status(400).json({ error: 'Некорректная цена' });
  if (qty !== undefined && (!Number.isInteger(Number(qty)) || Number(qty) < 1)) return res.status(400).json({ error: 'Количество должно быть целым числом ≥ 1' });
  const id = uuidv4();
  const maxOrder = await pool.query('SELECT MAX(sort_order) as m FROM items WHERE project_id=$1', [req.params.id]);
  const order = (maxOrder.rows[0].m || 0) + 1;
  await pool.query('INSERT INTO items (id, project_id, room, name, url, img, size, color, price, qty, cmt, sort_order, note) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
    [id, req.params.id, room, name, url||'', img||'', size||'', color||'', price||0, qty||1, cmt||'', order, note||'']);
  await pool.query('UPDATE projects SET updated_at=NOW() WHERE id=$1', [req.params.id]);
  res.json({ id });
});

app.put('/api/items/:id', auth, async (req, res) => {
  const r = await pool.query('SELECT i.id, p.user_id FROM items i JOIN projects p ON p.id=i.project_id WHERE i.id=$1', [req.params.id]);
  if (!r.rows.length || r.rows[0].user_id !== req.session.userId) return res.status(404).json({ error: 'Не найдено' });
  const { room, name, url, img, size, color, price, qty, cmt, note } = req.body;
  const nameErr2 = validateLength(name, 'Название', 1, 200);
  if (nameErr2) return res.status(400).json({ error: nameErr2 });
  const roomErr2 = validateOptionalLength(room, 'Комната', 100);
  if (roomErr2) return res.status(400).json({ error: roomErr2 });
  const sizeErr2 = validateOptionalLength(size, 'Размер', 200);
  if (sizeErr2) return res.status(400).json({ error: sizeErr2 });
  const colorErr2 = validateOptionalLength(color, 'Цвет', 200);
  if (colorErr2) return res.status(400).json({ error: colorErr2 });
  const cmtErr2 = validateOptionalLength(cmt, 'Бренд/комментарий', 500);
  if (cmtErr2) return res.status(400).json({ error: cmtErr2 });
  const noteErr2 = validateOptionalLength(note, 'Заметка', 500);
  if (noteErr2) return res.status(400).json({ error: noteErr2 });
  if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) return res.status(400).json({ error: 'Некорректная цена' });
  if (qty !== undefined && (!Number.isInteger(Number(qty)) || Number(qty) < 1)) return res.status(400).json({ error: 'Количество должно быть целым числом ≥ 1' });
  await pool.query('UPDATE items SET room=$1, name=$2, url=$3, img=$4, size=$5, color=$6, price=$7, qty=$8, cmt=$9, note=$10 WHERE id=$11',
    [room, name, url||'', img||'', size||'', color||'', price||0, qty||1, cmt||'', note||'', req.params.id]);
  res.json({ ok: true });
});

app.put('/api/projects/:id/items', auth, async (req, res) => {
  const r = await pool.query('SELECT id FROM projects WHERE id=$1 AND user_id=$2', [req.params.id, req.session.userId]);
  if (!r.rows.length) return res.status(404).json({ error: 'Не найдено' });
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items должен быть массивом' });

  // Удаляем старые, вставляем новые одной транзакцией
  await pool.query('BEGIN');
  try {
    await pool.query('DELETE FROM items WHERE project_id=$1', [req.params.id]);
    for (const it of items) {
      const id = it.id && it.id.startsWith('i') ? it.id : require('uuid').v4();
      await pool.query(
        'INSERT INTO items (id, project_id, room, name, url, img, size, color, price, qty, cmt, sort_order, note) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
        [id, req.params.id, it.room||'', it.name||'', it.url||'', it.img||'', it.size||'', it.color||'', it.price||0, it.qty||1, it.cmt||'', it.sort_order||0, it.note||'']
      );
    }
    await pool.query('UPDATE projects SET updated_at=NOW() WHERE id=$1', [req.params.id]);
    await pool.query('COMMIT');
    res.json({ ok: true });
  } catch(e) {
    await pool.query('ROLLBACK');
    console.error('syncItems error:', e.message);
    res.status(500).json({ error: 'Ошибка сохранения' });
  }
});

app.delete('/api/items/:id', auth, async (req, res) => {
  const r = await pool.query('SELECT i.id, p.user_id FROM items i JOIN projects p ON p.id=i.project_id WHERE i.id=$1', [req.params.id]);
  if (!r.rows.length || r.rows[0].user_id !== req.session.userId) return res.status(404).json({ error: 'Не найдено' });
  await pool.query('DELETE FROM items WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// PUBLIC CLIENT PAGE (React — отдаёт данные для фронта)
app.get('/api/public/projects/:id', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT p.*, u.name as designer_name, u.logo as designer_logo,
             u.phone as designer_phone, u.email as designer_email, u.site as designer_site
      FROM projects p JOIN users u ON u.id=p.user_id WHERE p.id=$1
    `, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/public/projects/:id/items', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM items WHERE project_id=$1 ORDER BY sort_order, room, id', [req.params.id]);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// PUBLIC CLIENT PAGE (старый HTML-рендер по slug)
app.get('/p/:slug', async (req, res) => {
  const r = await pool.query(`
    SELECT p.*, u.name as designer_name, u.phone as designer_phone, u.email as designer_email, u.site as designer_site, u.logo as designer_logo
    FROM projects p JOIN users u ON u.id=p.user_id WHERE p.slug=$1
  `, [req.params.slug]);
  if (!r.rows.length) return res.status(404).send('<h1>Страница не найдена</h1>');
  const project = r.rows[0];
  const items = await pool.query('SELECT * FROM items WHERE project_id=$1 ORDER BY sort_order, room, id', [project.id]);
  res.send(buildClientPage(project, items.rows));
});

function buildClientPage(project, items) {
  const ROOM_ORDER = ["Гостиная","Кухня","Спальня","Прихожая","Детская","Ванная","Кабинет","Свет"];
  const grp = {};
  items.forEach(i => { (grp[i.room] = grp[i.room] || []).push(i); });
  const rooms = [...ROOM_ORDER, ...Object.keys(grp).filter(r => !ROOM_ORDER.includes(r))].filter(r => grp[r]);
  const grand = items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const roomTot = {};
  rooms.forEach(r => { roomTot[r] = grp[r].reduce((s, i) => s + Number(i.price) * i.qty, 0); });
  const date = new Date().toLocaleDateString('ru-RU');
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const fmt = n => Number(n).toLocaleString('ru-RU') + '\u202f₽';
  const projectTitle = project.client || project.name;
  const comment = project.comment || '';

  const summaryCards = rooms.map(r => roomTot[r] ? `
    <div style="flex:1;background:#fff;padding:12px 16px;min-width:90px">
      <div style="font-size:9px;color:#8e8e93">${esc(r)}</div>
      <div style="font-size:15px;font-weight:400;color:#000;margin-top:3px;font-variant-numeric:tabular-nums">${fmt(roomTot[r])}</div>
    </div>` : '').join('');

  const sections = rooms.map(room => {
    const cards = grp[room].map(it => {
      const sum = Number(it.price) * it.qty;
      const imgBlock = it.img
        ? `<div style="height:160px;background:#f0ede9;overflow:hidden;border-radius:4px 4px 0 0;display:flex;align-items:center;justify-content:center"><img src="${esc(it.img)}" style="width:100%;height:100%;object-fit:contain" onerror="this.parentNode.innerHTML='<div style=height:160px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#C8C1BE>&#9633;</div>'"></div>`
        : `<div style="height:160px;background:#f0ede9;border-radius:4px 4px 0 0;display:flex;align-items:center;justify-content:center;font-size:28px;color:#C8C1BE">&#9633;</div>`;
      const nameEl = it.url
        ? `<a href="${esc(it.url)}" target="_blank" style="color:#000;font-size:13px;font-weight:400;text-decoration:none;line-height:1.4">${esc(it.name)}</a>`
        : `<div style="color:#000;font-size:13px;font-weight:400;line-height:1.4">${esc(it.name)}</div>`;
      return `<div style="background:#fff;border:1px solid #ddd5d0;border-radius:4px;overflow:hidden;display:flex;flex-direction:column">
        ${it.url ? `<a href="${esc(it.url)}" target="_blank" style="display:block;text-decoration:none">${imgBlock}</a>` : imgBlock}
        <div style="padding:12px 14px;flex:1;display:flex;flex-direction:column;gap:4px">
          ${nameEl}
          ${it.size ? `<div style="color:#8e8e93;font-size:11px">${esc(it.size)}</div>` : ''}
          ${it.cmt ? `<div style="color:#8e8e93;font-size:11px;font-style:italic">${esc(it.cmt)}</div>` : ''}
          <div style="margin-top:auto;padding-top:10px;border-top:1px solid #f0ede9;display:flex;justify-content:space-between;align-items:baseline">
            <div style="font-size:11px;color:#8e8e93;font-weight:300">${it.qty} шт × ${it.price ? Number(it.price).toLocaleString('ru-RU') + ' ₽' : '—'}</div>
            <div style="font-size:14px;font-weight:500;color:#000;font-variant-numeric:tabular-nums">${it.price ? fmt(sum) : '—'}</div>
          </div>
        </div>
      </div>`;
    }).join('');
    return `<section style="margin-bottom:40px">
      <div style="display:flex;align-items:baseline;justify-content:space-between;padding-bottom:8px;border-bottom:0.5px solid #000;margin-bottom:14px">
        <h2 style="font-size:20px;font-weight:500;color:#000">${esc(room)}</h2>
        ${roomTot[room] ? `<div style="font-size:12px;color:#8e8e93">${fmt(roomTot[room])}</div>` : ''}
      </div>
      <div class="cards-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">${cards}</div>
    </section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(projectTitle)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fdfcfb;color:#000;font-weight:300;font-size:14px;line-height:1.6}
@media print{
  .no-print{display:none!important}
  .cards-grid{grid-template-columns:repeat(2,1fr)!important}
  header{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .sum-row{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  @page{margin:12mm;size:auto;marks:none}
}
@media(max-width:600px){
  .hdr-inner{flex-direction:column!important;align-items:flex-start!important;gap:12px!important}
  .hdr-right{width:100%!important;display:flex!important;justify-content:space-between!important;align-items:flex-end!important}
}
</style>
</head><body>
<header style="background:#7B2237">
  <div class="hdr-inner" style="max-width:1100px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px">
    <div style="display:flex;align-items:center;gap:14px">
      ${project.designer_logo
        ? `<img src="${project.designer_logo}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;border:1px solid rgba(255,255,255,0.2);flex-shrink:0" alt="logo">`
        : `<div style="width:40px;height:40px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;color:rgba(255,255,255,0.8);flex-shrink:0">ez</div>`}
      <div>
        <div style="font-size:14px;font-weight:500;color:#fff">${esc(project.designer_name)}</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px">Дизайнер интерьеров</div>
      </div>
    </div>
    <div class="hdr-right" style="display:flex;align-items:center;gap:14px">
      <div style="text-align:right">
        <div style="font-size:16px;font-weight:500;color:#fff">${esc(projectTitle)}</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px">${date}</div>
      </div>
      <button onclick="doPrint()" class="no-print" style="background:none;color:#fff;border:1px solid rgba(255,255,255,0.55);border-radius:3px;padding:7px 14px;font-size:11px;cursor:pointer;font-family:inherit;white-space:nowrap">↓ PDF</button>
    </div>
  </div>
</header>
<div style="max-width:1100px;margin:0 auto;padding:28px 24px 64px">
  <div class="sum-row" style="display:flex;gap:1px;background:#ddd5d0;border:1px solid #ddd5d0;border-radius:4px;overflow:hidden;margin-bottom:36px;flex-wrap:wrap">
    ${summaryCards}
    <div style="background:#7B2237;padding:12px 16px;min-width:90px;flex:0 0 auto">
      <div style="font-size:9px;color:rgba(255,255,255,0.4)">Итого</div>
      <div style="font-size:15px;font-weight:400;color:#fff;margin-top:3px;font-variant-numeric:tabular-nums">${fmt(grand)}</div>
    </div>
  </div>
  ${sections}
  ${comment ? `<div style="margin-bottom:20px;font-size:12px;color:#8e8e93">${esc(comment)}</div>` : ''}
  <footer style="padding-top:20px;border-top:1px solid #ddd5d0">
    <div style="font-size:11px;color:#8e8e93;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      ${project.designer_phone ? `<span>${esc(project.designer_phone)}</span>` : ''}
      ${project.designer_phone && project.designer_email ? `<span>·</span>` : ''}
      ${project.designer_email ? `<span>${esc(project.designer_email)}</span>` : ''}
      ${project.designer_site ? `<span>·</span><a href="https://${esc(project.designer_site)}" target="_blank" style="color:#778D7F;text-decoration:none">${esc(project.designer_site)}</a>` : ''}
    </div>
  </footer>
</div>
<script>
function doPrint(){
  var t=document.title;
  document.title='${esc(project.name).replace(/'/g,"\\'")} Комплектация';
  var h=document.body.scrollHeight;
  var style=document.createElement('style');
  style.id='print-size-fix';
  style.textContent='@page{size:794px '+h+'px;margin:24px}';
  document.head.appendChild(style);
  window.print();
  setTimeout(function(){
    document.title=t;
    var el=document.getElementById('print-size-fix');
    if(el)el.remove();
  },1000);
}
if(new URLSearchParams(window.location.search).get('print')==='1'){
  window.addEventListener('load',function(){setTimeout(doPrint,800)});
}
</script>
</body></html>`;
}

// SPA fallback — всё кроме /api, /p/:slug, /admin, /invite/:token отдаём index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/p/') || req.path.startsWith('/admin') || req.path.startsWith('/invite/')) return next();
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Magic Link ────────────────────────────────────────────────────────────
app.post('/api/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ ok: false, error: 'Email обязателен' });
  try {
    const { rows } = await pool.query('SELECT id, name FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    // Всегда отвечаем ok чтобы не раскрывать существование email
    if (rows.length === 0) return res.json({ ok: true });
    const user = rows[0];
    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 минут
    await pool.query(
      'INSERT INTO magic_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [token, user.id, expires]
    );
    const base = process.env.APP_URL || 'https://useseta.com';
    const link = `${base}/auth/magic?token=${token}`;
    await sendEmailTo(email, 'Ссылка для входа — SETA',
      `<p>Привет, ${user.name}!</p>
       <p>Нажмите кнопку ниже чтобы войти в SETA. Ссылка действует 30 минут.</p>
       <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:8px;font-size:15px">Войти в SETA</a></p>
       <p style="color:#999;font-size:12px">Если вы не запрашивали вход — просто проигнорируйте это письмо.</p>`
    );
    res.json({ ok: true });
  } catch(e) {
    console.error('forgot error:', e.message);
    res.json({ ok: false, error: 'Ошибка сервера' });
  }
});

app.get('/api/magic', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.redirect('/?error=invalid');
  try {
    const { rows } = await pool.query(
      'SELECT t.user_id, t.expires_at, t.used, u.email, u.name, u.id FROM magic_tokens t JOIN users u ON u.id = t.user_id WHERE t.token = $1',
      [token]
    );
    if (!rows.length) return res.redirect('/?error=invalid');
    const t = rows[0];
    if (t.used) return res.redirect('/?error=used');
    if (new Date(t.expires_at) < new Date()) return res.redirect('/?error=expired');
    await pool.query('UPDATE magic_tokens SET used = TRUE WHERE token = $1', [token]);
    req.session.userId = t.user_id;
    const appUrl = process.env.APP_URL || 'https://useseta.com';
    res.redirect(appUrl);
  } catch(e) {
    console.error('magic error:', e.message);
    res.redirect('/?error=server');
  }
});

initDB().then(() => {
  app.listen(PORT, () => console.log(`seta running on port ${PORT}`));
}).catch(err => {
  console.error('DB init error:', err);
  process.exit(1);
});
