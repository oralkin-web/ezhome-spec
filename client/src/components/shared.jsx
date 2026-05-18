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
    case "help-circle": return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
    case "edit":       return <svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
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

export function Sidebar({ active = "projects", onNav, admin = false, isAdmin = false }) {
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
      <div
        onClick={() => onNav?.("projects")}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 22px", cursor: "pointer" }}
      >
        <svg width="88" height="26" viewBox="0 0 275 81" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M176.307 34.9476C176.176 32.2146 175.553 29.9046 174.438 28.0176C173.323 26.0655 171.749 24.5688 169.715 23.5277C167.748 22.4215 165.485 21.8684 162.927 21.8684C159.975 21.8684 157.417 22.5517 155.253 23.9181C153.088 25.2846 151.383 27.2042 150.137 29.6769C148.956 32.1496 148.366 35.0127 148.366 38.2662C148.366 41.8451 149.021 44.9359 150.333 47.5388C151.711 50.1416 153.58 52.1588 155.941 53.5903C158.303 54.9568 161.025 55.6401 164.107 55.6401C169.006 55.6401 173.272 54.1079 176.904 51.0436C177.749 50.3312 179.009 50.317 179.794 51.0951L183.797 55.0671C184.56 55.8233 184.594 57.053 183.813 57.7896C181.47 59.9988 178.738 61.755 175.618 63.0581C171.88 64.6198 167.715 65.4006 163.123 65.4006C157.614 65.4006 152.826 64.2944 148.759 62.082C144.758 59.8046 141.61 56.7137 139.314 52.8095C137.084 48.8402 135.969 44.2202 135.969 38.9494C135.969 33.6787 137.084 29.0587 139.314 25.0894C141.61 21.1201 144.758 18.0292 148.759 15.8168C152.826 13.6044 157.483 12.4657 162.73 12.4006C168.961 12.4006 173.979 13.6695 177.783 16.2073C181.653 18.745 184.408 22.3239 186.047 26.9439C187.687 31.4989 188.277 36.9323 187.818 43.2441H146.496V34.9476H176.307Z" fill="currentColor"/>
          <path d="M249.543 41.9209C246.268 41.9209 243.828 42.4405 242.223 43.4797C240.618 44.5189 239.815 46.2401 239.815 48.6433C239.815 50.8516 240.618 52.6378 242.223 54.0017C243.892 55.3657 246.14 56.0477 248.965 56.0477C251.469 56.0477 253.716 55.6255 255.707 54.7812C257.761 53.8718 259.367 52.6702 260.522 51.1764C261.742 49.6175 262.448 47.8963 262.641 46.0128L264.76 55.0734C263.219 58.4509 260.843 61.0164 257.633 62.7701C254.423 64.5238 250.538 65.4006 245.979 65.4006C242.319 65.4006 239.141 64.6862 236.444 63.2573C233.748 61.8283 231.661 59.9123 230.184 57.5091C228.707 55.041 227.969 52.2805 227.969 49.2278C227.969 44.4215 229.67 40.6543 233.073 37.9264C236.476 35.1335 241.292 33.7046 247.52 33.6396H265.874V41.9209H249.543ZM262.545 32.0808C262.545 28.9631 261.55 26.5275 259.559 24.7738C257.633 22.9552 254.744 22.0459 250.891 22.0459C248.515 22.0459 246.011 22.5005 243.379 23.4098C241.401 24.0601 239.404 24.9414 237.388 26.0539C236.389 26.6055 235.115 26.276 234.562 25.2768L231.977 20.6027C231.459 19.6662 231.768 18.484 232.699 17.9554C234.551 16.9035 236.345 16.0262 238.082 15.3234C240.329 14.3492 242.673 13.6347 245.112 13.18C247.617 12.6604 250.474 12.4006 253.684 12.4006C260.426 12.4006 265.627 14.0244 269.287 17.272C272.946 20.5195 274.808 25.0011 274.873 30.7168L274.963 62.8104C274.966 63.9172 274.07 64.8161 272.963 64.8161H264.635C263.533 64.8161 262.638 63.9242 262.635 62.822L262.545 32.0808Z" fill="currentColor"/>
          <path d="M210.035 47.8066C210.035 50.4132 210.526 52.2051 211.51 53.1826C212.494 54.16 213.838 54.6488 215.543 54.6488C216.592 54.6488 217.739 54.4858 218.985 54.16C219.585 53.9719 220.207 53.7384 220.853 53.4597C222.003 52.9629 223.372 53.5037 223.755 54.6965L225.483 60.0739C225.767 60.9606 225.406 61.9331 224.58 62.3645C223.009 63.1856 221.341 63.8719 219.576 64.4232C217.346 65.0748 215.084 65.4006 212.789 65.4006C209.969 65.4006 207.379 64.8793 205.018 63.8367C202.658 62.729 200.789 61.0347 199.412 58.754C198.035 56.4082 197.346 53.4758 197.346 49.957V2.40063C197.346 1.29607 198.241 0.400635 199.346 0.400635H208.035C209.139 0.400635 210.035 1.29607 210.035 2.40063V47.8066ZM189.969 16.6713C189.969 15.5667 190.864 14.6713 191.969 14.6713H223.084C224.188 14.6713 225.084 15.5667 225.084 16.6713V21.566C225.084 22.6706 224.188 23.566 223.084 23.566H191.969C190.864 23.566 189.969 22.6706 189.969 21.566V16.6713Z" fill="currentColor"/>
          <path d="M128.567 24.703C128.035 25.7006 126.785 26.0535 125.775 25.5445C123.752 24.5249 121.671 23.716 119.531 23.1175C116.744 22.2732 114.223 21.851 111.967 21.851C109.843 21.851 108.118 22.2407 106.791 23.0201C105.464 23.7346 104.8 24.9686 104.8 26.7223C104.8 28.2162 105.464 29.4178 106.791 30.3271C108.184 31.2364 109.943 32.0158 112.066 32.6653C114.19 33.2499 116.446 33.8994 118.835 34.6139C121.224 35.3283 123.48 36.2701 125.603 37.4392C127.793 38.6084 129.552 40.1672 130.879 42.1157C132.272 44.0642 132.969 46.6298 132.969 49.8124C132.969 53.3198 132.007 56.2425 130.082 58.5808C128.158 60.8541 125.603 62.5753 122.418 63.7444C119.233 64.8486 115.749 65.4006 111.967 65.4006C107.985 65.4006 104.004 64.7836 100.022 63.5495C96.6707 62.4931 93.7325 61.0083 91.2077 59.0952C90.4646 58.5321 90.2778 57.5093 90.7134 56.685L93.286 51.8166C93.8829 50.6871 95.3714 50.4025 96.4232 51.1276C98.4131 52.4993 100.641 53.6197 103.108 54.4889C106.492 55.593 109.611 56.1451 112.464 56.1451C113.991 56.1451 115.351 55.9503 116.545 55.5606C117.74 55.1709 118.669 54.6188 119.332 53.9043C119.996 53.1249 120.328 52.1182 120.328 50.8841C120.328 49.1954 119.664 47.8963 118.337 46.987C117.01 46.0128 115.285 45.2009 113.161 44.5514C111.104 43.8369 108.881 43.1549 106.492 42.5054C104.103 41.791 101.847 40.8816 99.7236 39.7775C97.6665 38.6084 95.9744 37.082 94.6472 35.1984C93.3201 33.3149 92.6565 30.8142 92.6565 27.6966C92.6565 24.1892 93.5855 21.2989 95.4435 19.0256C97.3015 16.7523 99.7568 15.0961 102.809 14.0569C105.862 12.9527 109.18 12.4006 112.763 12.4006C116.214 12.4006 119.664 12.8878 123.115 13.862C125.894 14.5944 128.415 15.5795 130.677 16.8174C131.594 17.3192 131.892 18.4713 131.4 19.3936L128.567 24.703Z" fill="currentColor"/>
          <path d="M57.0879 18.2345C60.575 20.0362 59.2938 25.3068 55.3687 25.3068H25.3398C23.1307 25.3068 21.3398 27.0976 21.3398 29.3068V46.9152C21.3398 49.1243 19.549 50.9152 17.3398 50.9152H4C1.79086 50.9152 0 49.1243 0 46.9152V19.7042C0 17.4951 1.79086 15.7042 4 15.7042H11.291C13.5002 15.7042 15.291 13.9134 15.291 11.7042V4.0051C15.291 1.03923 18.4056 -0.895154 21.0642 0.419583L57.0879 18.2345Z" fill="currentColor"/>
          <path d="M11.633 60.7443C8.8466 59.3512 9.83792 55.1515 12.9532 55.1515H44.8147C47.0238 55.1515 48.8147 53.3607 48.8147 51.1515V33.5431C48.8147 31.334 50.6055 29.5431 52.8147 29.5431L66.1545 29.5431C68.3637 29.5431 70.1545 31.334 70.1545 33.5431L70.1545 60.755C70.1545 62.9642 68.3637 64.755 66.1545 64.755H58.8635C56.6544 64.755 54.8635 66.5459 54.8635 68.755V76.3498C54.8635 79.3406 51.7013 81.2735 49.0396 79.9098L11.633 60.7443Z" fill="currentColor"/>
        </svg>
        <span style={{
          fontSize: 9, padding: "2px 5px", borderRadius: 3,
          background: "var(--hairline-strong)", color: "var(--ink-3)",
          letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, alignSelf: "flex-start",
        }}>Beta</span>
        {admin && (
          <span style={{
            fontSize: 9, padding: "2px 5px", borderRadius: 3,
            background: "var(--accent)", color: "#fff",
            letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600,
          }}>Админ</span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {!admin && item("projects", "folder", "Проекты")}
        {!admin && item("archive", "archive", "Архив")}
        {!admin && item("settings", "settings", "Настройки")}
        {!admin && <div data-tour="feedback">{item("feedback", "message", "Обратная связь")}</div>}
        {admin && item("admin-users", "users", "Пользователи")}
        {admin && item("admin-feedback", "message", "Обратная связь")}
      </div>

      <div style={{ flex: 1 }} />
      {isAdmin && (
        <button
          onClick={() => onNav?.(admin ? 'projects' : 'admin-users')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '9px 12px',
            borderRadius: 8,
            background: admin ? 'var(--accent-soft)' : 'transparent',
            color: admin ? 'var(--accent)' : 'var(--ink-3)',
            fontSize: 13, fontWeight: 500,
            border: 'none', cursor: 'pointer',
            marginBottom: 4,
          }}
          onMouseEnter={e => e.currentTarget.style.background = admin ? 'var(--accent-soft)' : 'rgba(20,16,10,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = admin ? 'var(--accent-soft)' : 'transparent'}
        >
          <Icon name="shield" size={16} />
          {admin ? 'Режим пользователя' : 'Режим админа'}
        </button>
      )}
    </aside>
  );
}

export function MobileMenu({ open, onClose, onNav }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(20,16,10,0.4)" }} onClick={onClose} />
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 260,
        background: "var(--bg)", padding: "24px 16px",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        <button onClick={onClose} style={{ alignSelf: "flex-end", width: 32, height: 32, display: "grid", placeItems: "center", border: "none", background: "none", cursor: "pointer", color: "var(--ink-3)", marginBottom: 12 }}>×</button>
        {[
          { key: "projects", icon: "folder", label: "Проекты" },
          { key: "archive",  icon: "archive", label: "Архив" },
          { key: "settings", icon: "settings", label: "Настройки" },
          { key: "feedback", icon: "message", label: "Обратная связь" },
        ].map(({ key, icon, label }) => (
          <button key={key} onClick={() => { onNav(key); onClose(); }} style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "10px 12px", borderRadius: 8,
            border: "none", background: "none", cursor: "pointer",
            fontSize: 14, color: "var(--ink)", textAlign: "left",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--hairline)"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}>
            <Icon name={icon} size={16} style={{ color: "var(--ink-3)" }} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
