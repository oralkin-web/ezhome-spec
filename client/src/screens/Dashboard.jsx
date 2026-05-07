import { useState } from 'react';
import { Icon, Placeholder, Editable, Sidebar } from '../components/shared';

export default function Dashboard({ projects, onOpen, onRename, onCreate, onDelete, onNav }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="projects" onNav={onNav} />
      <main style={{ flex: 1, padding: "44px 56px 80px", maxWidth: 1280 }} className="seta-main">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, gap: 24 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Рабочее пространство</div>
            <h1 className="serif" style={{ margin: 0, fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em" }}>Мои проекты</h1>
            <div style={{ marginTop: 10, color: "var(--ink-2)", fontSize: 13 }}>
              {projects.length} {projects.length === 1 ? "проект" : projects.length <= 4 ? "проекта" : "проектов"} · Последняя активность 28 апреля
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 36, background: "var(--surface)", borderRadius: 8, boxShadow: "0 0 0 1px var(--hairline-strong)", color: "var(--ink-3)", fontSize: 13, width: 220 }}>
              <Icon name="search" size={14} />
              <input placeholder="Поиск проектов" style={{ border: "none", background: "transparent", outline: "none", flex: 1, color: "var(--ink)" }} />
            </div>
            <button className="btn btn-primary" onClick={onCreate}><Icon name="plus" size={14} />Новый проект</button>
          </div>
        </div>
        {projects.length === 0 ? <EmptyState onCreate={onCreate} /> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {projects.map(p => <ProjectCard key={p.id} project={p} onOpen={() => onOpen(p.id)} onRename={n => onRename(p.id, n)} onDelete={() => onDelete(p.id)} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function ProjectCard({ project, onOpen, onRename, onDelete }) {
  const [hover, setHover] = useState(false);
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <div onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setMenu(false); }}
      style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: hover ? "var(--shadow-card-hover)" : "var(--shadow-card)", overflow: "hidden", cursor: "pointer", transition: "box-shadow 180ms ease, transform 180ms ease", transform: hover ? "translateY(-2px)" : "none", position: "relative" }}>
      <div style={{ aspectRatio: "16 / 10", position: "relative" }}>
        <Placeholder hue={project.cover.hue} label={project.cover.label} style={{ width: "100%", height: "100%" }} />
        <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(6px)", padding: "5px 9px", borderRadius: 6, fontSize: 11, fontWeight: 500, color: "var(--ink)" }}>{project.items} позиций</div>
        <button onClick={e => { e.stopPropagation(); setMenu(v => !v); }} style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.92)", display: hover || menu ? "grid" : "none", placeItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "none", cursor: "pointer" }}>
          <Icon name="more" size={14} />
        </button>
        {menu && (
          <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 44, right: 10, background: "var(--surface)", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px var(--hairline)", padding: 4, minWidth: 140, zIndex: 5 }}>
            <MenuItem icon="copy" label="Дублировать" />
            <MenuItem icon="archive" label="В архив" />
            <MenuItem icon="trash" label="Удалить" danger onClick={() => { setMenu(false); setConfirm(true); }} />
          </div>
        )}
        {confirm && (
          <div onClick={e => { e.stopPropagation(); setConfirm(false); }} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(20,16,10,0.5)", display: "grid", placeItems: "center", padding: 20 }}>
            <div onClick={e => e.stopPropagation()} className="fade-in" style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "0 24px 60px -10px rgba(20,16,10,0.3)", padding: 28, maxWidth: 420, width: "100%", cursor: "default" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(220,70,60,0.1)", color: "var(--danger)", display: "grid", placeItems: "center", marginBottom: 16 }}><Icon name="trash" size={20} /></div>
              <h3 className="serif" style={{ margin: "0 0 8px", fontSize: 22 }}>Удалить проект?</h3>
              <p style={{ margin: "0 0 24px", color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5 }}>Проект «{project.name}» и все его позиции будут удалены безвозвратно.</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => setConfirm(false)}>Отмена</button>
                <button className="btn" onClick={() => { setConfirm(false); onDelete(); }} style={{ background: "var(--danger)", color: "#fff" }}>Удалить</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <Editable as="div" value={project.name} onChange={onRename} style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 4, lineHeight: 1.3 }} />
        <div style={{ color: "var(--ink-2)", fontSize: 13, marginBottom: 14 }}>{project.client}</div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--hairline)", fontSize: 11, color: "var(--ink-3)" }}><span>{project.date}</span></div>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, danger, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 6, fontSize: 13, color: danger ? "var(--danger)" : "var(--ink)", textAlign: "left", border: "none", background: "none", cursor: "pointer" }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--hairline)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <Icon name={icon} size={14} />{label}
    </button>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="fade-in" style={{ display: "grid", placeItems: "center", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ width: 88, height: 88, borderRadius: 20, background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--accent)", marginBottom: 24 }}><Icon name="folder" size={36} stroke={1.4} /></div>
      <h2 className="serif" style={{ fontSize: 36, margin: "0 0 10px" }}>Создайте свой первый проект</h2>
      <p style={{ color: "var(--ink-2)", maxWidth: 440, margin: "0 0 28px", fontSize: 14, lineHeight: 1.5 }}>Соберите товары, цены и заметки в единую спецификацию и поделитесь с клиентом одной ссылкой.</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-primary" onClick={onCreate}><Icon name="plus" size={14} />Новый проект</button>
        <button className="btn btn-secondary">Шаблоны</button>
      </div>
    </div>
  );
}
