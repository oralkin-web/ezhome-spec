import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Editor from './screens/Editor';
import ClientPage from './screens/ClientPage';
import { Settings, Feedback, Admin, Auth } from './screens/Screens';

// ─── API helpers ────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || '';
const api = {
  get:    (url)       => fetch(API_BASE + url,             { credentials: 'include' }).then(r => r.json()),
  post:   (url, body) => fetch(API_BASE + url, { method: 'POST',   credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  put:    (url, body) => fetch(API_BASE + url, { method: 'PUT',    credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  delete: (url)       => fetch(API_BASE + url, { method: 'DELETE', credentials: 'include' }).then(r => r.json()),
};

// Преобразуем проект из БД в формат фронтенда
function mapProject(p) {
  return {
    id:        p.id,
    name:      p.name,
    client:    p.client || '',
    updatedAt: p.updated_at ? new Date(p.updated_at).getTime() : Date.now(),
    archived:  p.status === 'archive',
    cover:     { hue: p.cover_hue || 28 },
    slug:      p.slug,
    note:      p.comment || '',
  };
}

// Преобразуем товары из БД в категории для фронтенда
function mapCategories(items) {
  const map = {};
  items.forEach(i => {
    if (!map[i.room]) map[i.room] = { id: i.room, name: i.room, products: [] };
    map[i.room].products.push({
      id:         i.id,
      name:       i.name,
      brand:      i.cmt || '',
      url:        i.url || '',
      photoUrl:   i.img || '',
      dimensions: i.size || '',
      qty:        i.qty || 1,
      price:      Number(i.price) || 0,
      swatch:     30,
    });
  });
  return Object.values(map);
}


// ─── InviteRoute ──────────────────────────────────────────────────────────────
function InviteRoute({ setAuthMode, setInviteToken }) {
  const { token } = useParams();
  useEffect(() => {
    localStorage.setItem('inviteToken', token);
    setInviteToken(token);
    setAuthMode('register');
  }, [token]);
  return null;
}

// ─── MagicRoute — вход по magic link ────────────────────────────────────────
function MagicRoute() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) { window.location.href = '/'; return; }
    window.location.href = (import.meta.env.VITE_API_URL || '') + '/api/magic?token=' + token;
  }, []);
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Выполняем вход…</div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]         = useState(null);   // null = не проверили, false = не авторизован
  const [authMode, setAuthMode] = useState('login');
  const [inviteToken, setInviteToken] = useState('');
  const [loading, setLoading]   = useState(true);
  const [banner, setBanner]     = useState({ active: false, text: '' });

  // Проверяем сессию при загрузке
  useEffect(() => {
    Promise.all([
      api.get('/api/me'),
      fetch(API_BASE + '/api/banner').then(r => r.json()).catch(() => ({ active: false, text: '' })),
    ]).then(([me, ban]) => {
      if (me.error) { setUser(false); } else { setUser(me); }
      if (ban.active) setBanner(ban);
    }).catch(() => setUser(false))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async ({ email, password }) => {
    const r = await api.post('/api/login', { email, password });
    if (r.error) return r.error;
    const me = await api.get('/api/me');
    setUser(me);
    return null;
  };

  const handleRegister = async ({ email, password, name }) => {
    const invite = localStorage.getItem('inviteToken') || '';
    const r = await api.post('/api/register', { email, password, name, invite });
    if (r.error) return r.error;
    const me = await api.get('/api/me');
    setUser(me);
    return null;
  };

  const handleLogout = async () => {
    await api.post('/api/logout', {});
    setUser(false);
    setAuthMode('login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Загрузка…</div>
    </div>
  );

  // Публичный роут — показываем без Auth
  if (!user && window.location.pathname.match(/^\/project\/[^/]+\/client$/)) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/project/:id/client" element={<PublicClientRoute />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (!user) return (
    <BrowserRouter>
      <Routes>
        <Route path="/invite/:token" element={<InviteRoute setAuthMode={setAuthMode} setInviteToken={setInviteToken} />} />
        <Route path="/project/:id/client" element={<PublicClientRoute />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/auth/magic" element={<MagicRoute />} />
        <Route path="*" element={null} />
      </Routes>
      {!window.location.pathname.startsWith('/privacy') && <Auth
        mode={authMode}
        setMode={setAuthMode}
        onLogin={handleLogin}
        onRegister={handleRegister}
        isInvite={!!inviteToken}
      />}
    </BrowserRouter>
  );

  return (
    <BrowserRouter>
      <Banner banner={banner} />
      <AppRoutes user={user} setUser={setUser} onLogout={handleLogout} banner={banner} setBanner={setBanner} />
    </BrowserRouter>
  );
}

// ─── Privacy ─────────────────────────────────────────────────────────────────
function Privacy() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 32px 80px", background: "var(--bg)", minHeight: "100vh" }}>
      <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-3)", textDecoration: "none", marginBottom: 40 }}>← На главную</a>
      <h1 className="serif" style={{ fontSize: 42, letterSpacing: "-0.02em", marginBottom: 8 }}>Политика конфиденциальности</h1>
      <p style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 48 }}>Дата вступления в силу: 13 мая 2026 г.</p>
      {[
        ["1. Общие положения", "Настоящая Политика конфиденциальности описывает, как сервис SETA (useseta.com) собирает, использует и защищает персональные данные пользователей. Оператором персональных данных является физическое лицо, управляющее сервисом SETA. По всем вопросам: privacy@useseta.com. Используя сервис, вы соглашаетесь с условиями настоящей Политики."],
        ["2. Какие данные мы собираем", "Имя — для отображения в интерфейсе и клиентских документах. Адрес электронной почты — для входа в аккаунт и уведомлений. Данные проектов — названия, списки товаров, цены, фотографии, комментарии. Технические данные — информация о сессии, дата регистрации. Мы не собираем платёжные данные и не отслеживаем поведение через сторонние трекеры."],
        ["3. Как мы используем ваши данные", "Данные используются исключительно для работы аккаунта, отображения проектов, формирования клиентских страниц и PDF, ответов на обращения и отправки технических уведомлений. Мы не передаём данные третьим лицам и не используем их в рекламных целях."],
        ["4. Хранение данных", "Данные хранятся на серверах платформы Railway (США). При удалении аккаунта все связанные данные удаляются безвозвратно."],
        ["5. Права пользователя", "В соответствии с Федеральным законом № 152-ФЗ вы вправе получить информацию о хранимых данных, исправить их, удалить аккаунт или отозвать согласие на обработку. Для реализации прав: privacy@useseta.com"],
        ["6. Cookies и сессии", "Сервис использует технические cookies исключительно для поддержания сессии. Маркетинговые и аналитические cookies не применяются."],
        ["7. Сервисы третьих сторон", "Railway — хостинг и база данных. Resend — отправка транзакционных писем. Browserbase — обработка ссылок на товары."],
        ["8. Изменения политики", "Мы можем обновлять настоящую Политику. При существенных изменениях уведомим пользователей через интерфейс сервиса."],
        ["9. Контакты", "privacy@useseta.com · useseta.com"],
      ].map(([title, text]) => (
        <div key={title} style={{ marginBottom: 36 }}>
          <h2 className="serif" style={{ fontSize: 22, letterSpacing: "-0.01em", marginBottom: 10 }}>{title}</h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>{text}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Banner ──────────────────────────────────────────────────────────────────
function Banner({ banner }) {
  const [closed, setClosed] = useState(false);
  if (!banner.active || closed || !banner.text) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'var(--ink)', color: '#fff', fontSize: 13, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      <span style={{ textAlign: 'center', lineHeight: 1.4, color: 'rgba(255,255,255,0.9)' }}>{banner.text}</span>
      <button onClick={() => setClosed(true)} style={{ marginLeft: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '2px 6px', borderRadius: 4, fontSize: 16, lineHeight: 1, flexShrink: 0 }}>×</button>
    </div>
  );
}

// ─── PublicClientRoute — без авторизации ─────────────────────────────────────
function PublicClientRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject]       = useState(null);
  const [categories, setCategories] = useState([]);
  const [designer, setDesigner]     = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(API_BASE + '/api/public/projects/' + id).then(r => r.json()),
      fetch(API_BASE + '/api/public/projects/' + id + '/items').then(r => r.json()),
    ]).then(([proj, items]) => {
      if (proj.error) { setLoading(false); return; }
      setProject(mapProject(proj));
      setDesigner({
        name:    proj.designer_name,
        logoUrl: proj.designer_logo  || null,
        phone:   proj.designer_phone || '',
        email:   proj.designer_email || '',
        site:    proj.designer_site  || '',
      });
      if (Array.isArray(items)) setCategories(mapCategories(items));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Загрузка…</div>
    </div>
  );
  if (!project) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Проект не найден</div>
    </div>
  );
  return (
    <ClientPage
      project={project}
      categories={categories}
      logoUrl={designer?.logoUrl}
      designerName={designer?.name}
      designer={designer}
      note={project.note || ''}
      onBack={null}
    />
  );
}

// ─── AppRoutes ────────────────────────────────────────────────────────────────
function AppRoutes({ user, setUser, onLogout, banner, setBanner }) {
  const navigate = useNavigate();
  const [projects, setProjects]     = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [adminTab, setAdminTab]     = useState('users');
  const [logoUrl, setLogoUrl]       = useState(user.logo || null);

  // Загружаем проекты при монтировании
  const loadProjects = useCallback(async () => {
    const data = await api.get('/api/projects');
    if (Array.isArray(data)) setProjects(data.map(mapProject));
    setProjectsLoading(false);
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  // Сохранить лого в БД и state
  const handleChangeLogo = async (url) => {
    setLogoUrl(url);
    await api.put('/api/me', { name: user.name, phone: user.phone || '', site: user.site || '', logo: url || '' });
  };

  // ── Проекты ──
  const createProject = async () => {
    const slug = 'p-' + Math.random().toString(36).slice(2, 9);
    const r = await api.post('/api/projects', { name: 'Новый проект', client: '', slug, cover_hue: Math.floor(Math.random() * 360) });
    if (r.id) {
      await loadProjects();
      navigate('/project/' + r.id);
    }
  };

  const deleteProject = async (id) => {
    await api.delete('/api/projects/' + id);
    await loadProjects();
    navigate('/');
  };

  const archiveProject = async (id) => {
    await api.put('/api/projects/' + id, { status: 'archive' });
    setProjects(ps => ps.map(p => p.id === id ? { ...p, archived: true, updatedAt: Date.now() } : p));
  };

  const unarchiveProject = async (id) => {
    await api.put('/api/projects/' + id, { status: 'active' });
    setProjects(ps => ps.map(p => p.id === id ? { ...p, archived: false, updatedAt: Date.now() } : p));
  };

  const renameProject = async (id, name) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, name, updatedAt: Date.now() } : p));
    await api.put('/api/projects/' + id, { name });
  };

  const renameClient = async (id, client) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, client, updatedAt: Date.now() } : p));
    await api.put('/api/projects/' + id, { client });
  };

  const changeCover = async (id, hue) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, cover: { hue }, updatedAt: Date.now() } : p));
    await api.put('/api/projects/' + id, { cover_hue: hue });
  };

  const saveNote = async (id, note) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, note } : p));
    await api.put('/api/projects/' + id, { comment: note });
  };

  const nav = screen => {
    if (screen === 'admin-users') { setAdminTab('users'); navigate('/admin'); }
    else if (screen === 'admin-feedback') { setAdminTab('feedback'); navigate('/admin'); }
    else navigate('/' + (screen === 'dashboard' ? '' : screen));
  };

  return (
    <Routes>
      <Route path="/" element={
        <Dashboard
          projects={projects.filter(p => !p.archived)}
          onOpen={id => navigate('/project/' + id)}
          onRename={renameProject}
          onCreate={createProject}
          onDelete={id => deleteProject(id)}
          onArchive={id => archiveProject(id)}
          onChangeCover={(id, hue) => changeCover(id, hue)}
          onNav={nav}
          user={user}
        />
      } />
      <Route path="/archive" element={
        <Dashboard
          projects={projects.filter(p => p.archived)}
          onOpen={id => navigate('/project/' + id)}
          onRename={renameProject}
          onCreate={createProject}
          onDelete={id => deleteProject(id)}
          onUnarchive={id => unarchiveProject(id)}
          onNav={nav}
          isArchive={true}
          user={user}
        />
      } />
      <Route path="/project/:id" element={
        <EditorRoute
          projects={projects}
          onRename={renameProject}
          onRenameClient={renameClient}
          onSaveNote={saveNote}
          onProjectsReload={loadProjects}
          user={user}
        />
      } />
      <Route path="/project/:id/client" element={
        <ClientRoute projects={projects} projectsLoading={projectsLoading} logoUrl={logoUrl} user={user} />
      } />
      <Route path="/settings" element={
        <Settings
          onNav={nav}
          user={user}
          logoUrl={logoUrl}
          onChangeLogo={handleChangeLogo}
          onLogout={onLogout}
        />
      } />
      <Route path="/feedback" element={<Feedback onNav={nav} />} />
      <Route path="/admin" element={<Admin onNav={nav} tab={adminTab} setTab={setAdminTab} banner={banner} setBanner={setBanner} />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── EditorRoute ──────────────────────────────────────────────────────────────
function EditorRoute({ projects, onRename, onRenameClient, onSaveNote, onProjectsReload, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);
  const [categories, setCategories] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Загружаем товары проекта
  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    const data = await api.get('/api/projects/' + id + '/items');
    if (Array.isArray(data)) setCategories(mapCategories(data));
    setLoadingItems(false);
  }, [id]);

  useEffect(() => { loadItems(); }, [loadItems]);

  if (!project) return <Navigate to="/" replace />;
  if (loadingItems) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Загрузка товаров…</div>
    </div>
  );

  // Синхронизируем categories с БД при каждом изменении
  const syncCategories = async (updater) => {
    setCategories(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      // Сохраняем в БД асинхронно
      syncToDB(id, next);
      return next;
    });
  };

  return (
    <Editor
      project={project}
      categories={categories}
      setCategories={syncCategories}
      onBack={() => navigate('/')}
      onShare={() => navigate('/project/' + id + '/client')}
      onRename={n => onRename(id, n)}
      onRenameClient={n => onRenameClient(id, n)}
      note={project.note || ''}
      onNoteChange={n => onSaveNote(id, n)}
      user={user}
    />
  );
}

// Сохраняем все товары проекта в БД
async function syncToDB(projectId, categories) {
  const items = categories.flatMap(cat =>
    cat.products.map((p, idx) => ({
      id:         p.id,
      room:       cat.name,
      name:       p.name,
      url:        p.url || '',
      img:        p.photoUrl || '',
      size:       p.dimensions || '',
      price:      p.price || 0,
      qty:        p.qty || 1,
      cmt:        p.brand || '',
      sort_order: idx,
    }))
  );
  await api.put('/api/projects/' + projectId + '/items', { items });
}

// ─── ClientRoute ──────────────────────────────────────────────────────────────
function ClientRoute({ projects, projectsLoading, logoUrl, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);
  const [categories, setCategories] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/projects/' + id + '/items')
      .then(data => { if (Array.isArray(data)) setCategories(mapCategories(data)); })
      .finally(() => setItemsLoading(false));
  }, [id]);

  if (projectsLoading || itemsLoading) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Загрузка…</div>
    </div>
  );
  if (!project) return <Navigate to="/" replace />;

  const designer = {
    name:    user.name,
    logoUrl: logoUrl || null,
    phone:   user.phone || '',
    email:   user.email || '',
    site:    user.site  || '',
  };

  return (
    <ClientPage
      project={project}
      categories={categories}
      logoUrl={logoUrl}
      designerName={user.name}
      designer={designer}
      note={project.note || ''}
      onBack={() => navigate('/project/' + id)}
    />
  );
}
