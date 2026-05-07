import { useState } from 'react';
import { SETA_PROJECTS, SETA_CATEGORIES } from './data';
import Dashboard from './screens/Dashboard';
import Editor from './screens/Editor';
import ClientPage from './screens/ClientPage';
import { Settings, Feedback, Admin, Auth } from './screens/Screens';

export default function App() {
  const [authed, setAuthed] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [screen, setScreen] = useState("dashboard");
  const [adminTab, setAdminTab] = useState("users");
  const [projects, setProjects] = useState(SETA_PROJECTS);
  const [activeId, setActiveId] = useState(null);
  const [categories, setCategories] = useState(SETA_CATEGORIES);

  const active = projects.find(p => p.id === activeId) || projects[0];
  const openProject = (id) => { setActiveId(id); setScreen("editor"); };
  const renameProject = (id, name) => setProjects(ps => ps.map(p => p.id === id ? { ...p, name } : p));
  const renameClient = (id, client) => setProjects(ps => ps.map(p => p.id === id ? { ...p, client } : p));
  const createProject = () => {
    const id = "p" + Math.random().toString(36).slice(2, 7);
    setProjects(ps => [{ id, name: "Новый проект", client: "Новый клиент", items: 0, date: "Создан сегодня", cover: { hue: Math.floor(Math.random() * 360), label: "НОВЫЙ · ЧЕРНОВИК" } }, ...ps]);
    setActiveId(id); setScreen("editor");
  };
  const deleteProject = (id) => setProjects(ps => ps.filter(p => p.id !== id));

  if (!authed) return <Auth mode={authMode} setMode={setAuthMode} onEnter={() => setAuthed(true)} />;

  return (
    <>
      {screen === "dashboard" && <Dashboard projects={projects} onOpen={openProject} onRename={renameProject} onCreate={createProject} onDelete={deleteProject} onNav={setScreen} />}
      {screen === "editor" && active && <Editor project={active} categories={categories} setCategories={setCategories} onBack={() => setScreen("dashboard")} onShare={() => setScreen("client")} onRename={n => renameProject(active.id, n)} onRenameClient={n => renameClient(active.id, n)} />}
      {screen === "client" && active && <ClientPage project={active} categories={categories} onBack={() => setScreen("editor")} />}
      {screen === "settings" && <Settings onNav={setScreen} />}
      {screen === "feedback" && <Feedback onNav={setScreen} />}
      {screen === "admin" && <Admin onNav={setScreen} tab={adminTab} setTab={setAdminTab} />}
      <ScreenSwitcher screen={screen} setScreen={setScreen} hasActive={!!active} onLogout={() => { setAuthed(false); setAuthMode("login"); }} />
    </>
  );
}

function ScreenSwitcher({ screen, setScreen, hasActive, onLogout }) {
  const tab = (key, label, num) => {
    const isActive = screen === key;
    const disabled = !hasActive && (key === "editor" || key === "client");
    return <button key={key} onClick={() => !disabled && setScreen(key)} disabled={disabled} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, background: isActive ? "var(--ink)" : "transparent", color: isActive ? "#fff" : disabled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", cursor: disabled ? "not-allowed" : "pointer", border: "none" }}><span style={{ opacity: 0.6, fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>0{num}</span>{label}</button>;
  };
  return (
    <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(26,26,26,0.92)", backdropFilter: "blur(10px)", borderRadius: 999, padding: 4, display: "flex", gap: 2, alignItems: "center", boxShadow: "0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06)", zIndex: 100, maxWidth: "calc(100vw - 24px)", overflowX: "auto" }}>
      {tab("dashboard", "Дашборд", 1)}{tab("editor", "Редактор", 2)}{tab("client", "Клиент", 3)}{tab("settings", "Настройки", 4)}{tab("feedback", "Связь", 5)}{tab("admin", "Админ", 6)}
      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />
      <button onClick={onLogout} style={{ padding: "8px 12px", borderRadius: 999, color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer" }}><span style={{ opacity: 0.6, fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>07</span>Вход</button>
    </div>
  );
}
