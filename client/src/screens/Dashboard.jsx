import React from 'react';
import { Icon, Placeholder, Editable, Sidebar, MobileMenu } from '../components/shared';

const SETA_LOGO_PATHS = (<>
  <path d="M176.307 34.9476C176.176 32.2146 175.553 29.9046 174.438 28.0176C173.323 26.0655 171.749 24.5688 169.715 23.5277C167.748 22.4215 165.485 21.8684 162.927 21.8684C159.975 21.8684 157.417 22.5517 155.253 23.9181C153.088 25.2846 151.383 27.2042 150.137 29.6769C148.956 32.1496 148.366 35.0127 148.366 38.2662C148.366 41.8451 149.021 44.9359 150.333 47.5388C151.711 50.1416 153.58 52.1588 155.941 53.5903C158.303 54.9568 161.025 55.6401 164.107 55.6401C169.006 55.6401 173.272 54.1079 176.904 51.0436C177.749 50.3312 179.009 50.317 179.794 51.0951L183.797 55.0671C184.56 55.8233 184.594 57.053 183.813 57.7896C181.47 59.9988 178.738 61.755 175.618 63.0581C171.88 64.6198 167.715 65.4006 163.123 65.4006C157.614 65.4006 152.826 64.2944 148.759 62.082C144.758 59.8046 141.61 56.7137 139.314 52.8095C137.084 48.8402 135.969 44.2202 135.969 38.9494C135.969 33.6787 137.084 29.0587 139.314 25.0894C141.61 21.1201 144.758 18.0292 148.759 15.8168C152.826 13.6044 157.483 12.4657 162.73 12.4006C168.961 12.4006 173.979 13.6695 177.783 16.2073C181.653 18.745 184.408 22.3239 186.047 26.9439C187.687 31.4989 188.277 36.9323 187.818 43.2441H146.496V34.9476H176.307Z" fill="currentColor"/>
  <path d="M249.543 41.9209C246.268 41.9209 243.828 42.4405 242.223 43.4797C240.618 44.5189 239.815 46.2401 239.815 48.6433C239.815 50.8516 240.618 52.6378 242.223 54.0017C243.892 55.3657 246.14 56.0477 248.965 56.0477C251.469 56.0477 253.716 55.6255 255.707 54.7812C257.761 53.8718 259.367 52.6702 260.522 51.1764C261.742 49.6175 262.448 47.8963 262.641 46.0128L264.76 55.0734C263.219 58.4509 260.843 61.0164 257.633 62.7701C254.423 64.5238 250.538 65.4006 245.979 65.4006C242.319 65.4006 239.141 64.6862 236.444 63.2573C233.748 61.8283 231.661 59.9123 230.184 57.5091C228.707 55.041 227.969 52.2805 227.969 49.2278C227.969 44.4215 229.67 40.6543 233.073 37.9264C236.476 35.1335 241.292 33.7046 247.52 33.6396H265.874V41.9209H249.543ZM262.545 32.0808C262.545 28.9631 261.55 26.5275 259.559 24.7738C257.633 22.9552 254.744 22.0459 250.891 22.0459C248.515 22.0459 246.011 22.5005 243.379 23.4098C241.401 24.0601 239.404 24.9414 237.388 26.0539C236.389 26.6055 235.115 26.276 234.562 25.2768L231.977 20.6027C231.459 19.6662 231.768 18.484 232.699 17.9554C234.551 16.9035 236.345 16.0262 238.082 15.3234C240.329 14.3492 242.673 13.6347 245.112 13.18C247.617 12.6604 250.474 12.4006 253.684 12.4006C260.426 12.4006 265.627 14.0244 269.287 17.272C272.946 20.5195 274.808 25.0011 274.873 30.7168L274.963 62.8104C274.966 63.9172 274.07 64.8161 272.963 64.8161H264.635C263.533 64.8161 262.638 63.9242 262.635 62.822L262.545 32.0808Z" fill="currentColor"/>
  <path d="M210.035 47.8066C210.035 50.4132 210.526 52.2051 211.51 53.1826C212.494 54.16 213.838 54.6488 215.543 54.6488C216.592 54.6488 217.739 54.4858 218.985 54.16C219.585 53.9719 220.207 53.7384 220.853 53.4597C222.003 52.9629 223.372 53.5037 223.755 54.6965L225.483 60.0739C225.767 60.9606 225.406 61.9331 224.58 62.3645C223.009 63.1856 221.341 63.8719 219.576 64.4232C217.346 65.0748 215.084 65.4006 212.789 65.4006C209.969 65.4006 207.379 64.8793 205.018 63.8367C202.658 62.729 200.789 61.0347 199.412 58.754C198.035 56.4082 197.346 53.4758 197.346 49.957V2.40063C197.346 1.29607 198.241 0.400635 199.346 0.400635H208.035C209.139 0.400635 210.035 1.29607 210.035 2.40063V47.8066ZM189.969 16.6713C189.969 15.5667 190.864 14.6713 191.969 14.6713H223.084C224.188 14.6713 225.084 15.5667 225.084 16.6713V21.566C225.084 22.6706 224.188 23.566 223.084 23.566H191.969C190.864 23.566 189.969 22.6706 189.969 21.566V16.6713Z" fill="currentColor"/>
  <path d="M128.567 24.703C128.035 25.7006 126.785 26.0535 125.775 25.5445C123.752 24.5249 121.671 23.716 119.531 23.1175C116.744 22.2732 114.223 21.851 111.967 21.851C109.843 21.851 108.118 22.2407 106.791 23.0201C105.464 23.7346 104.8 24.9686 104.8 26.7223C104.8 28.2162 105.464 29.4178 106.791 30.3271C108.184 31.2364 109.943 32.0158 112.066 32.6653C114.19 33.2499 116.446 33.8994 118.835 34.6139C121.224 35.3283 123.48 36.2701 125.603 37.4392C127.793 38.6084 129.552 40.1672 130.879 42.1157C132.272 44.0642 132.969 46.6298 132.969 49.8124C132.969 53.3198 132.007 56.2425 130.082 58.5808C128.158 60.8541 125.603 62.5753 122.418 63.7444C119.233 64.8486 115.749 65.4006 111.967 65.4006C107.985 65.4006 104.004 64.7836 100.022 63.5495C96.6707 62.4931 93.7325 61.0083 91.2077 59.0952C90.4646 58.5321 90.2778 57.5093 90.7134 56.685L93.286 51.8166C93.8829 50.6871 95.3714 50.4025 96.4232 51.1276C98.4131 52.4993 100.641 53.6197 103.108 54.4889C106.492 55.593 109.611 56.1451 112.464 56.1451C113.991 56.1451 115.351 55.9503 116.545 55.5606C117.74 55.1709 118.669 54.6188 119.332 53.9043C119.996 53.1249 120.328 52.1182 120.328 50.8841C120.328 49.1954 119.664 47.8963 118.337 46.987C117.01 46.0128 115.285 45.2009 113.161 44.5514C111.104 43.8369 108.881 43.1549 106.492 42.5054C104.103 41.791 101.847 40.8816 99.7236 39.7775C97.6665 38.6084 95.9744 37.082 94.6472 35.1984C93.3201 33.3149 92.6565 30.8142 92.6565 27.6966C92.6565 24.1892 93.5855 21.2989 95.4435 19.0256C97.3015 16.7523 99.7568 15.0961 102.809 14.0569C105.862 12.9527 109.18 12.4006 112.763 12.4006C116.214 12.4006 119.664 12.8878 123.115 13.862C125.894 14.5944 128.415 15.5795 130.677 16.8174C131.594 17.3192 131.892 18.4713 131.4 19.3936L128.567 24.703Z" fill="currentColor"/>
  <path d="M57.0879 18.2345C60.575 20.0362 59.2938 25.3068 55.3687 25.3068H25.3398C23.1307 25.3068 21.3398 27.0976 21.3398 29.3068V46.9152C21.3398 49.1243 19.549 50.9152 17.3398 50.9152H4C1.79086 50.9152 0 49.1243 0 46.9152V19.7042C0 17.4951 1.79086 15.7042 4 15.7042H11.291C13.5002 15.7042 15.291 13.9134 15.291 11.7042V4.0051C15.291 1.03923 18.4056 -0.895154 21.0642 0.419583L57.0879 18.2345Z" fill="currentColor"/>
  <path d="M11.633 60.7443C8.8466 59.3512 9.83792 55.1515 12.9532 55.1515H44.8147C47.0238 55.1515 48.8147 53.3607 48.8147 51.1515V33.5431C48.8147 31.334 50.6055 29.5431 52.8147 29.5431L66.1545 29.5431C68.3637 29.5431 70.1545 31.334 70.1545 33.5431L70.1545 60.755C70.1545 62.9642 68.3637 64.755 66.1545 64.755H58.8635C56.6544 64.755 54.8635 66.5459 54.8635 68.755V76.3498C54.8635 79.3406 51.7013 81.2735 49.0396 79.9098L11.633 60.7443Z" fill="currentColor"/>
</>);

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

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
function Dashboard({ projects, onOpen, onRename, onCreate, onDelete, onArchive, onUnarchive, onChangeCover, onNav, isArchive = false, user, logoUrl }) {
  const list = projects;
  const [deleteTarget, setDeleteTarget] = React.useState(null); // { id, name }
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = React.useState(false);
  if (isMobile) {
    const initials = (user?.name || 'АП').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <div className="mobile-topbar">
          <svg width="68" height="20" viewBox="0 0 275 81" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "var(--ink)" }}>{SETA_LOGO_PATHS}</svg>
          <button onClick={() => setMenuOpen(true)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", cursor: "pointer", color: "var(--ink)" }}>
            <Icon name="menu" size={20} />
          </button>
          <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onNav={onNav} />
        </div>
        <div style={{ padding: "72px 16px 24px" }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--ink)", margin: "16px 0" }}>{isArchive ? "Архив" : "Мои проекты"}</div>
          {list.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 80, textAlign: "center", gap: 12 }}>
              <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 280 }}>У вас еще нет проектов. Чтобы начать работу откройте SETA на компьютере.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {list.map(p => {
                const hue = p.cover?.hue ?? 28;
                const a = `oklch(0.92 0.04 ${hue})`, b = `oklch(0.86 0.05 ${hue})`;
                return (
                  <div key={p.id} className="mobile-proj-card" onClick={() => onOpen(p.id)}>
                    <div style={{ width: 52, height: 52, borderRadius: 8, flexShrink: 0, background: `repeating-linear-gradient(135deg, ${a} 0 5px, ${b} 5px 10px)` }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.client ? p.client + " · " : ""}{formatDate(p.updatedAt)}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(window.location.origin + "/project/" + p.id + "/client"); }}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--hairline-strong)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                      <Icon name="link" size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
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
            <button data-tour="new-project" className="btn btn-primary" onClick={onCreate}>
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
            {list.map((p, idx) => (
              <div key={p.id} data-tour={idx === 0 ? "projects" : undefined}>
              <ProjectCard
                isFirst={idx === 0}
                project={p}
                onOpen={() => onOpen(p.id)}
                onRename={(name) => onRename(p.id, name)}
                onDelete={() => setDeleteTarget({ id: p.id, name: p.name })}
                onArchive={onArchive ? () => onArchive(p.id) : null}
                onUnarchive={onUnarchive ? () => onUnarchive(p.id) : null}
                onChangeCover={onChangeCover ? (hue) => onChangeCover(p.id, hue) : null}
                isArchive={isArchive}
              />
              </div>
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

function ProjectCard({ project, onOpen, onRename, onDelete, onArchive, onUnarchive, onChangeCover, isArchive, isFirst }) {
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
          data-tour={isFirst ? "project-menu" : undefined}
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
