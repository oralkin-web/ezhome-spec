import { useState, useRef } from 'react';

export function Icon({ name, size = 16, stroke = 1.6, style }) {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round",
    style,
  };
  switch (name) {
    case "folder":     return <svg {...props}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>;
    case "archive":    return <svg {...props}><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/></svg>;
    case "settings":   return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h0a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>;
    case "plus":       return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "share":      return <svg {...props}><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>;
    case "download":   return <svg {...props}><path d="M4 14v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/><path d="M8 12l4 4 4-4"/><path d="M12 16V2"/></svg>;
    case "link":       return <svg {...props}><path d="M10 14a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07l-1.5 1.5"/><path d="M14 10a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>;
    case "search":     return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case "more":       return <svg {...props}><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/></svg>;
    case "chevron":    return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case "back":       return <svg {...props}><path d="M15 6l-6 6 6 6"/></svg>;
    case "trash":      return <svg {...props}><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/></svg>;
    case "copy":       return <svg {...props}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>;
    case "check":      return <svg {...props}><path d="M5 12l4.5 4.5L19 7"/></svg>;
    case "image":      return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M3 17l5-5 4 4 3-3 6 6"/></svg>;
    case "external":   return <svg {...props}><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>;
    case "logout":     return <svg {...props}><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>;
    case "eye":        return <svg {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "eye-off":    return <svg {...props}><path d="M2 12s4-7 10-7c2.4 0 4.5.9 6.2 2"/><path d="M22 12s-4 7-10 7c-2.4 0-4.5-.9-6.2-2"/><path d="M3 3l18 18"/></svg>;
    case "upload":     return <svg {...props}><path d="M4 14v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/><path d="M16 8l-4-4-4 4"/><path d="M12 4v14"/></svg>;
    case "envelope":   return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>;
    case "users":      return <svg {...props}><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="3"/><path d="M16 20a6 6 0 0 1 5-3"/></svg>;
    case "card":       return <svg {...props}><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 11h20"/></svg>;
    case "message":    return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case "menu":       return <svg {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case "lock":       return <svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case "user":       return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case "shield":     return <svg {...props}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/></svg>;
    default: return null;
  }
}

export function Placeholder({ hue = 30, label = "PHOTO", style, square = false }) {
  const a = `oklch(0.92 0.04 ${hue})`;
  const b = `oklch(0.86 0.05 ${hue})`;
  return (
    <div
      className="ph-stripe"
      style={{
        background: `repeating-linear-gradient(135deg, ${a} 0 8px, ${b} 8px 16px)`,
        color: "rgba(0,0,0,0.45)",
        ...(square ? { aspectRatio: "1 / 1" } : {}),
        ...style,
      }}
    >
      <span style={{ fontSize: 9, letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
}

export function Editable({ value, onChange, as: Tag = "span", className = "", style, placeholder, multiline = false }) {
  const ref = useRef(null);
  const handleBlur = (e) => {
    const next = e.currentTarget.innerText.trim();
    if (next !== value) onChange?.(next || value);
  };
  const handleKey = (e) => {
    if (!multiline && e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); }
    if (e.key === "Escape") { e.currentTarget.innerText = value; e.currentTarget.blur(); }
  };
  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKey}
      onClick={(e) => e.stopPropagation()}
      className={`editable ${className}`}
      style={style}
      data-placeholder={placeholder}
    >{value}</Tag>
  );
}

export function Sidebar({ active = "projects", onNav, admin = false }) {
  const item = (key, icon, label) => {
    const isActive = active === key;
    return (
      <button
        key={key}
        onClick={() => onNav?.(key)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          width: "100%", padding: "9px 12px",
          borderRadius: 8,
          background: isActive ? "var(--surface)" : "transparent",
          color: isActive ? "var(--ink)" : "var(--ink-2)",
          fontSize: 13, fontWeight: 500,
          textAlign: "left",
          boxShadow: isActive ? "var(--shadow-sm)" : "none",
          transition: "background 120ms ease, color 120ms ease",
          border: "none", cursor: "pointer",
        }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(20,16,10,0.04)"; }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
      >
        <Icon name={icon} size={16} />
        <span style={{ flex: 1 }}>{label}</span>
        {isActive && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)" }} />}
      </button>
    );
  };

  return (
    <aside
      className="seta-sidebar"
      style={{
        width: 232, background: "var(--bg)",
        display: "flex", flexDirection: "column",
        padding: "20px 14px",
        flexShrink: 0,
        height: "100vh", position: "sticky", top: 0,
        borderRight: "1px solid var(--hairline)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 22px" }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7, background: "var(--accent)",
          display: "grid", placeItems: "center", color: "#fff",
          fontWeight: 700, fontSize: 13,
        }}>S</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "var(--ink)", fontWeight: 600, fontSize: 13 }}>SETA</span>
            {admin && (
              <span style={{
                fontSize: 9, padding: "2px 5px", borderRadius: 3,
                background: "var(--accent)", color: "#fff",
                letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600,
              }}>Админ</span>
            )}
          </div>
          <div style={{ color: "var(--ink-3)", fontSize: 11 }}>
            {admin ? "Панель администратора" : "Студия Aster & Field"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {!admin && item("projects", "folder", "Проекты")}
        {!admin && item("archive", "archive", "Архив")}
        {!admin && item("settings", "settings", "Настройки")}
        {!admin && item("feedback", "message", "Обратная связь")}
        {admin && item("admin-users", "users", "Пользователи")}
        {admin && item("admin-subs", "card", "Подписки")}
        {admin && item("admin-feedback", "message", "Обратная связь")}
      </div>

      <div style={{ flex: 1 }} />
    </aside>
  );
}
