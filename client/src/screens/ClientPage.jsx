import { useState } from 'react';
import { Icon, Placeholder } from '../components/shared';
import { SETA_DESIGNER } from '../data';

const fmt = n => n.toLocaleString("ru-RU", { style: "currency", currency: "RUB", minimumFractionDigits: 0 });

export default function ClientPage({ project, categories, onBack }) {
  const allProducts = categories.flatMap(c => c.products.map(p => ({ ...p, category: c.name })));
  const total = allProducts.reduce((s, p) => s + p.qty * p.price, 0);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Preview bar */}
      <div style={{ background: "var(--ink)", color: "#fff", fontSize: 12, padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.7)" }}>
          <Icon name="link" size={13} />
          <span className="mono">seta.design/c/holloway-tx-w8x4</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Предпросмотр · так видит клиент</span>
          <button onClick={onBack} className="btn btn-sm" style={{ color: "#fff", background: "rgba(255,255,255,0.12)", height: 26 }}>
            <Icon name="back" size={12} />Выйти из предпросмотра
          </button>
        </div>
      </div>

      {/* Header */}
      <header style={{ padding: "44px 64px 28px", background: "var(--surface)", borderBottom: "1px solid var(--hairline)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--ink)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 600, fontSize: 14 }}>{SETA_DESIGNER.initials}</div>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{SETA_DESIGNER.studio}</div>
              <h1 className="serif" style={{ margin: "4px 0 0", fontSize: 32, letterSpacing: "-0.01em", lineHeight: 1.1 }}>{project.name}</h1>
              <div style={{ color: "var(--ink-2)", marginTop: 4, fontSize: 13 }}>Подготовлено для {project.client}</div>
            </div>
          </div>
          <button className="btn btn-secondary"><Icon name="download" size={14} />Скачать PDF</button>
        </div>
      </header>

      {/* Body */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 64px 40px" }}>
        {categories.map(cat => (
          <section key={cat.id} style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24, paddingBottom: 14, borderBottom: "1px solid var(--hairline-strong)" }}>
              <h2 className="serif" style={{ margin: 0, fontSize: 30, letterSpacing: "-0.01em" }}>{cat.name}</h2>
              <span style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{cat.products.length} позиций</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24 }}>
              {cat.products.map(p => <ClientCard key={p.id} product={p} />)}
            </div>
          </section>
        ))}

        <div style={{ marginTop: 24, padding: "28px 32px", background: "var(--surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Заметка от вашего дизайнера</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--ink-2)", maxWidth: 720 }}>
            Сроки поставки изделий Hewn Workshop — 12–14 недель. Если хочется более мягких стульев для ежедневных ужинов, можем заменить «Spindle» на их же версию с мягкой обивкой.
          </p>
        </div>

        <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 24, borderTop: "2px solid var(--ink)" }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Итого по проекту</div>
          <div className="serif" style={{ fontSize: 48, lineHeight: 1, letterSpacing: "-0.02em" }}>{fmt(total)}</div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--hairline)", padding: "20px 64px", background: "var(--surface)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", fontSize: 13, color: "var(--ink-2)" }}>
          <a href={`tel:${SETA_DESIGNER.phone}`} style={{ color: "var(--ink-2)", textDecoration: "none" }}>{SETA_DESIGNER.phone}</a>
          <Sep />
          <a href={`mailto:${SETA_DESIGNER.email}`} style={{ color: "var(--ink-2)", textDecoration: "none" }}>{SETA_DESIGNER.email}</a>
          <Sep />
          <a href={`https://${SETA_DESIGNER.website}`} style={{ color: "var(--ink-2)", textDecoration: "none" }}>{SETA_DESIGNER.website}</a>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em" }}>СДЕЛАНО В SETA</span>
        </div>
      </footer>
    </div>
  );
}

function Sep() {
  return <span style={{ margin: "0 14px", color: "var(--ink-3)" }}>·</span>;
}

function ClientCard({ product }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: "var(--surface)", borderRadius: "var(--radius)", boxShadow: hover ? "var(--shadow-card-hover)" : "var(--shadow-card)", transition: "box-shadow 180ms ease, transform 180ms ease", transform: hover ? "translateY(-2px)" : "none", overflow: "hidden" }}>
      <Placeholder hue={product.swatch} label="PRODUCT IMAGE" style={{ width: "100%", aspectRatio: "1 / 1" }} />
      <div style={{ padding: "14px 14px 16px" }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", lineHeight: 1.35, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 38 }}>{product.name}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 12 }}>{product.brand}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 10, borderTop: "1px solid var(--hairline)" }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Кол-во {product.qty}</div>
          <div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(product.price)}</div>
        </div>
      </div>
    </div>
  );
}
