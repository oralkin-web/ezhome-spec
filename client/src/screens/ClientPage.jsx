import { useState, useEffect } from 'react';
import { Icon, Placeholder } from '../components/shared';

const fmt = n => n.toLocaleString("ru-RU", { style: "currency", currency: "RUB", minimumFractionDigits: 0 });


function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function ClientPage({ project, categories, logoUrl, designerName, designer, note, onBack }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const isMobile = useIsMobile();
  const total = categories.flatMap(c => c.products).reduce((s, p) => s + p.qty * p.price, 0);
  const totalItems = categories.reduce((s, c) => s + c.products.length, 0);

  const initials = designerName
    ? designerName.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handlePDF = () => {
    const prev = document.title;
    document.title = (project.name || 'Комплектация') + ' Комплектация';
    const content = document.querySelector('.client-main');
    const h = (content ? content.scrollHeight : document.body.scrollHeight) + 96;
    const style = document.createElement('style');
    style.id = 'client-print-fix';
    style.textContent = `@page{size:794px ${h}px;margin:24px}`;
    document.head.appendChild(style);
    window.print();
    window.addEventListener('afterprint', () => {
      document.title = prev;
      document.getElementById('client-print-fix')?.remove();
    }, { once: true });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const hPad = isMobile ? "16px" : "64px";
  const vPad = isMobile ? "24px" : "44px";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>


      {/* Header */}
      <header style={{ padding: `${vPad} ${hPad} ${isMobile ? "20px" : "28px"}`, background: "var(--surface)", borderBottom: "1px solid var(--hairline)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          {/* Лого — только на десктопе */}
          {!isMobile && (
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--ink)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 600, fontSize: 14, overflow: "hidden", flexShrink: 0 }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Логотип" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          )}
          {/* Название + клиент */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="serif" style={{ margin: "0 0 2px", fontSize: isMobile ? 12 : 26, letterSpacing: "-0.01em", lineHeight: 1.15 }}>{project.name}</h1>
            <div style={{ color: "var(--ink-2)", fontSize: 13, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span>{project.client}</span>
              {totalItems > 0 && <><span style={{ color: "var(--ink-3)" }}>·</span><span style={{ color: "var(--ink-3)" }}>{totalItems} {totalItems === 1 ? "позиция" : totalItems >= 2 && totalItems <= 4 ? "позиции" : "позиций"} в {categories.length} {categories.length === 1 ? "комнате" : "комнатах"}</span></>}
            </div>
            {isMobile && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={copyLink} className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
                  <Icon name={copied ? "check" : "link"} size={14} />
                  {copied ? "Скопировано" : "Ссылка"}
                </button>
                <button className="btn btn-secondary" onClick={handlePDF} style={{ justifyContent: "center" }}>
                  <Icon name="download" size={14} />PDF
                </button>
              </div>
            )}
          </div>
          {!isMobile && (
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={copyLink} className="btn btn-secondary">
              <Icon name={copied ? "check" : "link"} size={14} />
              {copied ? "Скопировано" : "Ссылка"}
            </button>
            <button className="btn btn-secondary" onClick={handlePDF}>
              <Icon name="download" size={14} />PDF
            </button>
          </div>
          )}
        </div>
      </header>

      {/* Body */}
      <main className="client-main" style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "28px 16px 40px" : "56px 64px 40px" }}>
        {/* Переключатель режима просмотра */}
        <div className="no-print" style={{ display: "flex", gap: 4, marginBottom: isMobile ? 20 : 28, background: "var(--surface)", borderRadius: 8, padding: 3, boxShadow: "var(--shadow-card)", alignSelf: "flex-start", width: "fit-content" }}>
          {[["grid", "image"], ["list", "menu"]].map(([mode, icon]) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, border: "none", background: viewMode === mode ? "var(--ink)" : "transparent", color: viewMode === mode ? "#fff" : "var(--ink-3)", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 120ms ease" }}>
              <Icon name={icon} size={14} />
              {mode === "grid" ? "Плитка" : "Список"}
            </button>
          ))}
        </div>

        {categories.map(cat => (
          <section key={cat.id} style={{ marginBottom: isMobile ? 36 : 56 }}>
            {/* Заголовок комнаты */}
            {(() => {
              const catTotal = cat.products.reduce((s, p) => s + p.qty * p.price, 0);
              return (
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: isMobile ? 16 : 24, paddingBottom: isMobile ? 10 : 14, borderBottom: "1px solid var(--hairline-strong)" }}>
                  <h2 className="serif" style={{ margin: 0, fontSize: isMobile ? 22 : 30, letterSpacing: "-0.01em" }}>{cat.name}</h2>
                  <span style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{cat.products.length} {cat.products.length === 1 ? "позиция" : cat.products.length <= 4 ? "позиции" : "позиций"}</span>
                  <span style={{ marginLeft: "auto", fontSize: isMobile ? 13 : 15, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>{fmt(catTotal)}</span>
                </div>
              );
            })()}

            {/* Сетка товаров:
                мобил  — 2 колонки
                планшет — 3 колонки
                десктоп — 5 колонок */}
            <div className="client-print-grid" style={{ display: viewMode === "grid" ? "grid" : "none", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(180px, 1fr))", gap: isMobile ? 12 : 24 }}>
              {cat.products.map(p => <ClientCard key={p.id} product={p} isMobile={isMobile} />)}
            </div>
            <div className="client-print-list" style={{ display: viewMode === "list" ? "flex" : "none", flexDirection: "column", gap: 1 }}>
              {cat.products.map(p => <ClientListRow key={p.id} product={p} isMobile={isMobile} />)}
            </div>
          </section>
        ))}

        {/* Общая сумма */}
        <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 24, borderTop: "2px solid var(--ink)" }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Общая сумма</div>
          <div className="serif" style={{ fontSize: isMobile ? 32 : 48, lineHeight: 1, letterSpacing: "-0.02em" }}>{fmt(total)}</div>
        </div>

        {/* Комментарии дизайнера */}
        {note && (
          <div style={{ marginTop: 24, padding: isMobile ? "18px 20px" : "28px 32px", background: "var(--surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-card)" }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Комментарии дизайнера</div>
            <p style={{ margin: 0, fontSize: isMobile ? 14 : 15, lineHeight: 1.6, color: "var(--ink-2)" }}>{note}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--hairline)", padding: isMobile ? "16px" : "20px 64px", background: "var(--surface)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {isMobile ? (
            // Мобил: контакты стопкой
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--ink-2)" }}>
              {designer?.phone && <a href={`tel:${designer.phone}`} style={{ color: "var(--ink-2)", textDecoration: "none" }}>{designer.phone}</a>}
              {designer?.email && <a href={`mailto:${designer.email}`} style={{ color: "var(--ink-2)", textDecoration: "none" }}>{designer.email}</a>}
              {designer?.site && <a href={`https://${designer.site}`} style={{ color: "var(--ink-2)", textDecoration: "none" }}>{designer.site}</a>}
              <a href="https://useseta.com" target="_blank" rel="noopener noreferrer" style={{ marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--hairline)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em", textDecoration: "none", display: "block" }}>СДЕЛАНО В SETA</a>
            </div>
          ) : (
            // Десктоп: контакты в строку
            <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: "var(--ink-2)" }}>
              {designer?.phone && <><a href={`tel:${designer.phone}`} style={{ color: "var(--ink-2)", textDecoration: "none" }}>{designer.phone}</a>{(designer.email || designer.site) && <Sep />}</>}
              {designer?.email && <><a href={`mailto:${designer.email}`} style={{ color: "var(--ink-2)", textDecoration: "none" }}>{designer.email}</a>{designer.site && <Sep />}</>}
              {designer?.site && <a href={`https://${designer.site}`} style={{ color: "var(--ink-2)", textDecoration: "none" }}>{designer.site}</a>}
              <a href="https://useseta.com" target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textDecoration: "none" }}>СДЕЛАНО В SETA</a>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

function Sep() {
  return <span style={{ margin: "0 14px", color: "var(--ink-3)" }}>·</span>;
}

function ClientCard({ product, isMobile }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => { if (product.url) window.open(product.url, '_blank'); }}
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        boxShadow: hover ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        transition: "box-shadow 180ms ease, transform 180ms ease",
        transform: hover && !isMobile ? "translateY(-2px)" : "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: product.url ? "pointer" : "default",
      }}
    >
      <div style={{ width: "100%", aspectRatio: "1 / 1", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
        {product.photoUrl ? (
          <img src={product.photoUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }} />
        ) : (
          <Placeholder hue={product.swatch} label="ФОТО" style={{ width: "100%", height: "100%" }} />
        )}
      </div>
      <div style={{ padding: isMobile ? "10px 10px 12px" : "14px 14px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ flex: 1, minHeight: isMobile ? 72 : 90 }}>
          <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 500, color: "var(--ink)", lineHeight: 1.35, marginBottom: 3, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", wordBreak: "break-word" }}>{product.name}</div>
          <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--ink-3)", marginBottom: product.dimensions ? 3 : 0 }}>{product.brand}</div>
          {product.dimensions && (
            <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--ink-3)" }}>{product.dimensions}</div>
          )}
          {product.color && (
            <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--ink-3)" }}>Цвет: {product.color}</div>
          )}
          {product.comment && (
            <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--ink-3)", marginTop: 3, fontStyle: "italic", lineHeight: 1.4 }}>{product.comment}</div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: isMobile ? 7 : 10, marginTop: isMobile ? 7 : 10, borderTop: "1px solid var(--hairline)" }}>
          <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--ink-3)" }}>
            {product.qty > 1 ? `${product.qty} × ${fmt(product.price)}` : ""}
          </div>
          <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(product.qty * product.price)}</div>
        </div>
      </div>
    </div>
  );
}

function ClientListRow({ product, isMobile }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 20, padding: isMobile ? "12px 0" : "14px 0", borderBottom: "1px solid var(--hairline)" }}>
      <div onClick={() => { if (product.url) window.open(product.url, '_blank'); }} style={{ width: isMobile ? 52 : 72, height: isMobile ? 52 : 72, borderRadius: 8, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, cursor: product.url ? "pointer" : "default" }}>
        {product.photoUrl ? (
          <img src={product.photoUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : (
          <Placeholder hue={product.swatch} label="" style={{ width: "100%", height: "100%" }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 500, color: "var(--ink)", lineHeight: 1.3, marginBottom: 3 }}>{product.name}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{product.brand}{product.dimensions ? ` · ${product.dimensions}` : ""}</div>
        {product.color && (
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Цвет: {product.color}</div>
        )}
        {product.comment && (
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, fontStyle: "italic" }}>{product.comment}</div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>{fmt(product.qty * product.price)}</div>
        {product.qty > 1 && <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{product.qty} × {fmt(product.price)}</div>}
      </div>
    </div>
  );
}
