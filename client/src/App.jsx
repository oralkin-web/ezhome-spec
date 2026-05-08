import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { SETA_PROJECTS, SETA_CATEGORIES } from './data';
import Dashboard from './screens/Dashboard';
import Editor from './screens/Editor';
import ClientPage from './screens/ClientPage';
import { Settings, Feedback, Admin, Auth } from './screens/Screens';

export default function App() {
  const [authed, setAuthed] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [adminTab, setAdminTab] = useState("users");
  const [projects, setProjects] = useState(SETA_PROJECTS);
  const [categories, setCategories] = useState(SETA_CATEGORIES);

  const renameProject = (id, name) => setProjects(ps => ps.map(p => p.id === id ? { ...p, name } : p));
  const renameClient = (id, client) => setProjects(ps => ps.map(p => p.id === id ? { ...p, client } : p));
  const createProject = (navigate) => {
    const id = "p" + Math.random().toString(36).slice(2, 7);
    setProjects(ps => [{ id, name: "Новый проект", client: "Новый клиент", items: 0, date: "Создан сегодня", cover: { hue: Math.floor(Math.random() * 360), label: "НОВЫЙ · ЧЕРНОВИК" } }, ...ps]);
    navigate('/project/' + id);
  };
  const deleteProject = (id, navigate) => {
    setProjects(ps => ps.filter(p => p.id !== id));
    navigate('/');
  };

  if (!authed) return <Auth mode={authMode} setMode={setAuthMode} onEnter={() => setAuthed(true)} />;

  return (
    <BrowserRouter>
      <AppRoutes
        projects={projects}
        categories={categories}
        setCategories={setCategories}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        renameProject={renameProject}
        renameClient={renameClient}
        createProject={createProject}
        deleteProject={deleteProject}
        onLogout={() => { setAuthed(false); setAuthMode("login"); }}
      />
    </BrowserRouter>
  );
}

function AppRoutes({ projects, categories, setCategories, adminTab, setAdminTab, renameProject, renameClient, createProject, deleteProject, onLogout }) {
  const navigate = useNavigate();

  return (
    <>
      <Routes>
        <Route path="/" element={
          <Dashboard
            projects={projects}
            onOpen={id => navigate('/project/' + id)}
            onRename={renameProject}
            onCreate={() => createProject(navigate)}
            onDelete={id => deleteProject(id, navigate)}
            onNav={screen => navigate('/' + (screen === 'dashboard' ? '' : screen))}
          />
        } />
        <Route path="/project/:id" element={
          <EditorRoute
            projects={projects}
            categories={categories}
            setCategories={setCategories}
            renameProject={renameProject}
            renameClient={renameClient}
          />
        } />
        <Route path="/project/:id/client" element={
          <ClientRoute projects={projects} categories={categories} />
        } />
        <Route path="/settings" element={<Settings onNav={screen => navigate('/' + (screen === 'dashboard' ? '' : screen))} />} />
        <Route path="/feedback" element={<Feedback onNav={screen => navigate('/' + (screen === 'dashboard' ? '' : screen))} />} />
        <Route path="/admin" element={<Admin onNav={screen => navigate('/' + (screen === 'dashboard' ? '' : screen))} tab={adminTab} setTab={setAdminTab} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ScreenSwitcher onLogout={onLogout} />
    </>
  );
}

function EditorRoute({ projects, categories, setCategories, renameProject, renameClient }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);
  if (!project) return <Navigate to="/" replace />;
  return (
    <Editor
      project={project}
      categories={categories}
      setCategories={setCategories}
      onBack={() => navigate('/')}
      onShare={() => navigate('/project/' + id + '/client')}
      onRename={n => renameProject(id, n)}
      onRenameClient={n => renameClient(id, n)}
    />
  );
}

function ClientRoute({ projects, categories }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);
  if (!project) return <Navigate to="/" replace />;
  return (
    <ClientPage
      project={project}
      categories={categories}
      onBack={() => navigate('/project/' + id)}
    />
  );
}

function ScreenSwitcher({ onLogout }) {
  const navigate = useNavigate();
  const { id } = useParams() || {};

  // Определяем активный экран по URL
  const path = window.location.pathname;
  const screen =
    path === '/' ? 'dashboard' :
    path.endsWith('/client') ? 'client' :
    path.startsWith('/project/') ? 'editor' :
    path.slice(1) || 'dashboard';

  const hasActive = path.startsWith('/project/');

  const tab = (key, label, num, to) => {
    const isActive = screen === key;
    const disabled = !hasActive && (key === "editor" || key === "client");
    return (
      <button
        key={key}
        onClick={() => !disabled && navigate(to)}
        disabled={disabled}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, background: isActive ? "var(--ink)" : "transparent", color: isActive ? "#fff" : disabled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", cursor: disabled ? "not-allowed" : "pointer", border: "none" }}
      >
        <span style={{ opacity: 0.6, fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>0{num}</span>{label}
      </button>
    );
  };

  // Извлекаем project id из URL для editor/client табов
  const projectId = path.match(/\/project\/([^/]+)/)?.[1];

  return (
    <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(26,26,26,0.92)", backdropFilter: "blur(10px)", borderRadius: 999, padding: 4, display: "flex", gap: 2, alignItems: "center", boxShadow: "0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06)", zIndex: 100, maxWidth: "calc(100vw - 24px)", overflowX: "auto" }}>
      {tab("dashboard", "Дашборд", 1, "/")}
      {tab("editor", "Редактор", 2, projectId ? '/project/' + projectId : '/')}
      {tab("client", "Клиент", 3, projectId ? '/project/' + projectId + '/client' : '/')}
      {tab("settings", "Настройки", 4, "/settings")}
      {tab("feedback", "Связь", 5, "/feedback")}
      {tab("admin", "Админ", 6, "/admin")}
      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />
      <button onClick={onLogout} style={{ padding: "8px 12px", borderRadius: 999, color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer" }}>
        <span style={{ opacity: 0.6, fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>07</span>Вход
      </button>
    </div>
  );
}
