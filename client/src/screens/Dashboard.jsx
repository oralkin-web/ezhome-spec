import React from 'react';
import { Icon, Placeholder, Editable, Sidebar } from '../components/shared';

function formatDate(ts) {
  if (!ts) return "";
  const now = Date.now();
  const diff = now - ts;
  const min = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (min < 2) return "Только что";
  if (min < 60) return `${min} мин. назад`;
  if (hrs < 24) return `${hrs} ч. назад`;
  if (days === 1) return "Вчера";
  if (days < 7) return `${days} дн. назад`;
  const d = new Date(ts);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

const COVER_COLORS = [
  { hue: 28,  name: "Янтарь"   },
  { hue: 18,  name: "Терракота"},
  { hue: 145, name: "Шалфей"   },
  { hue: 75,  name: "Оливка"   },
  { hue: 215, name: "Туман"    },
  { hue: 200, name: "Сталь"    },
  { hue: 270, name: "Лаванда"  },
  { hue: 320, name: "Пыльная роза"},
  { hue: 50,  name: "Песок"    },
  { hue: 0,   name: "Мел"      },
];

// Screen 1: Dashboard / project list.
function Dashboard({ projects, onOpen, onRename, onCreate, onDelete, onArchive, onUnarchive, onChangeCover, onNav, isArchive = false, user }) {
  const list = projects;
  const [deleteTarget, setDeleteTarget] = React.useState(null); // { id, name }
  return (
    <div style={{ display: "flex", minHeight: "100vh" }} data-screen-label="01 Dashboard">
      <Sidebar active={isArchive ? "archive" : "projects"} onNav={onNav} isAdmin={user?.isAdmin} />
      <main style={{ flex: 1, padding: "44px 56px 80px", maxWidth: 1280 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, gap: 24 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
              Рабочее пространство
            </div>
            <h1 className="serif" style={{ margin: 0, fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em" }}>
              {isArchive ? "Архив" : "Мои проекты"}
            </h1>
            <div style={{ marginTop: 10, color: "var(--ink-2)", fontSize: 13 }}>
              {list.length} {list.length === 1 ? "проект" : (list.length >= 2 && list.length <= 4 ? "проекта" : "проектов")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "0 12px", height: 36,
              background: "var(--surface)", borderRadius: 8,
              boxShadow: "0 0 0 1px var(--hairline-strong)",
              color: "var(--ink-3)", fontSize: 13, width: 220,
            }}>
              <Icon name="search" size={14} />
              <input
                placeholder="Поиск проектов"
                style={{ border: "none", background: "transparent", outline: "none", flex: 1, color: "var(--ink)" }}
              />
            </div>
{list.length > 0 && (
            <button className="btn btn-primary" onClick={onCreate}>
              <Icon name="plus" size={14} />
              Новый проект
            </button>
            )}
          </div>
        </div>

        {/* Grid or empty */}
        {list.length === 0 ? (
          isArchive ? <EmptyArchive /> : <EmptyState onCreate={onCreate} />
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}>
            {list.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onOpen={() => onOpen(p.id)}
                onRename={(name) => onRename(p.id, name)}
                onDelete={() => setDeleteTarget({ id: p.id, name: p.name })}
                onArchive={onArchive ? () => onArchive(p.id) : null}
                onUnarchive={onUnarchive ? () => onUnarchive(p.id) : null}
                onChangeCover={onChangeCover ? (hue) => onChangeCover(p.id, hue) : null}
                isArchive={isArchive}
              />
            ))}
          </div>
        )}
      </main>

      {/* Глобальный диалог удаления — без лага экрана */}
      {deleteTarget && (
        <div
          onClick={() => setDeleteTarget(null)}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(20, 16, 10, 0.5)", display: "grid", placeItems: "center", padding: 20, animation: "fadeIn 140ms ease both" }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "0 24px 60px -10px rgba(20,16,10,0.3)", padding: 28, maxWidth: 420, width: "100%", cursor: "default" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(220, 70, 60, 0.1)", color: "var(--danger)", display: "grid", placeItems: "center", marginBottom: 16 }}>
              <Icon name="trash" size={20} />
            </div>
            <h3 className="serif" style={{ margin: "0 0 8px", fontSize: 22, letterSpacing: "-0.01em" }}>Удалить проект?</h3>
            <p style={{ margin: "0 0 24px", color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5 }}>
              Проект «{deleteTarget.name}» и все его позиции будут удалены безвозвратно. Это действие нельзя отменить.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Отмена</button>
              <button className="btn" onClick={() => { const id = deleteTarget.id; setDeleteTarget(null); onDelete(id); }} style={{ background: "var(--danger)", color: "#fff", justifyContent: "center" }}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onOpen, onRename, onDelete, onArchive, onUnarchive, onChangeCover, isArchive }) {
  const [hover, setHover] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setMenu(false); }}
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: hover ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 180ms ease, transform 180ms ease",
        transform: hover ? "translateY(-2px)" : "none",
        position: "relative",
      }}
    >
      {/* Cover */}
      <div style={{ aspectRatio: "16 / 10", position: "relative" }}>
        <Placeholder
          hue={project.cover.hue}
          label=""
          style={{ width: "100%", height: "100%" }}
        />

        {/* Hover overlay menu */}
        <button
          onClick={(e) => { e.stopPropagation(); setMenu((v) => !v); }}
          style={{
            position: "absolute", top: 10, right: 10,
            width: 28, height: 28, borderRadius: 7,
            background: "rgba(255,255,255,0.92)",
            display: hover || menu ? "grid" : "none",
            placeItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Icon name="more" size={14} />
        </button>
        {menu && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute", top: 44, right: 10,
              background: "var(--surface)", borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px var(--hairline)",
              padding: 4, minWidth: 160, zIndex: 5,
            }}
          >
            {!isArchive && <MenuItem icon="copy" label="Дублировать" />}
            {!isArchive && onArchive && (
              <MenuItem icon="archive" label="В архив" onClick={() => { setMenu(false); onArchive(); }} />
            )}
            {isArchive && onUnarchive && (
              <MenuItem icon="folder" label="Вернуть из архива" onClick={() => { setMenu(false); onUnarchive(); }} />
            )}
            {!isArchive && (
              <MenuItem icon="image" label="Изменить обложку" onClick={() => { setShowColorPicker(v => !v); }} />
            )}
            <MenuItem icon="trash" label="Удалить" danger onClick={() => { setMenu(false); onDelete(); }} />
            {showColorPicker && (
              <div style={{ padding: "8px 6px 4px", borderTop: "1px solid var(--hairline)", marginTop: 4 }}>
                <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, paddingLeft: 4 }}>Цвет обложки</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
                  {COVER_COLORS.map(c => {
                    const a = `oklch(0.92 0.04 ${c.hue})`;
                    const b = `oklch(0.86 0.05 ${c.hue})`;
                    const isActive = project.cover.hue === c.hue;
                    return (
                      <button
                        key={c.hue}
                        title={c.name}
                        onClick={() => { onChangeCover?.(c.hue); setShowColorPicker(false); setMenu(false); }}
                        style={{
                          width: 28, height: 28, borderRadius: 6, border: isActive ? "2px solid var(--ink)" : "2px solid transparent",
                          background: `repeating-linear-gradient(135deg, ${a} 0 5px, ${b} 5px 10px)`,
                          cursor: "pointer", padding: 0,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      {/* Body */}
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 4, lineHeight: 1.3 }}>
          {project.name}
        </div>
        <div style={{ color: "var(--ink-2)", fontSize: 13, marginBottom: 14 }}>
          {project.client}
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          paddingTop: 12, borderTop: "1px solid var(--hairline)",
          fontSize: 11, color: "var(--ink-3)",
          letterSpacing: "0.02em",
        }}>
          <span>{formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", padding: "8px 10px",
        borderRadius: 6,
        fontSize: 13, color: danger ? "var(--danger)" : "var(--ink)",
        textAlign: "left",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "var(--hairline)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      <Icon name={icon} size={14} />
      {label}
    </button>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="fade-in" style={{
      display: "grid", placeItems: "center",
      padding: "80px 20px",
      textAlign: "center",
    }}>
      <div style={{
        width: 88, height: 88, borderRadius: 20,
        background: "var(--accent-soft)",
        display: "grid", placeItems: "center",
        color: "var(--accent)",
        marginBottom: 24,
      }}>
        <Icon name="folder" size={36} stroke={1.4} />
      </div>
      <h2 className="serif" style={{ fontSize: 36, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
        Создайте свой первый проект
      </h2>
      <p style={{ color: "var(--ink-2)", maxWidth: 440, margin: "0 0 28px", fontSize: 14, lineHeight: 1.5 }}>
        Соберите товары, цены и заметки в единую спецификацию и поделитесь её с клиентом одной ссылкой.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-primary" onClick={onCreate}>
          <Icon name="plus" size={14} />
          Новый проект
        </button>

      </div>
    </div>
  );
}

function EmptyArchive() {
  return (
    <div className="fade-in" style={{
      display: "grid", placeItems: "center",
      padding: "80px 20px",
      textAlign: "center",
    }}>
      <div style={{
        width: 88, height: 88, borderRadius: 20,
        background: "var(--hairline)",
        display: "grid", placeItems: "center",
        color: "var(--ink-3)",
        marginBottom: 24,
      }}>
        <Icon name="archive" size={36} stroke={1.4} />
      </div>
      <h2 className="serif" style={{ fontSize: 36, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
        Архив пуст
      </h2>
      <p style={{ color: "var(--ink-2)", maxWidth: 360, margin: 0, fontSize: 14, lineHeight: 1.5 }}>
        Проекты, которые вы отправите в архив, появятся здесь.
      </p>
    </div>
  );
}

export default Dashboard;
