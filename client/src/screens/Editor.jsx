import { useState } from 'react';
import { Icon, Placeholder, Editable, Sidebar } from '../components/shared';

const fmt = n => n.toLocaleString("ru-RU", { style: "currency", currency: "RUB", minimumFractionDigits: 0 });

export default function Editor({ project, onBack, onShare, onRename, onRenameClient, categories, setCategories }) {
  const grandTotal = categories.reduce((sum, c) => sum + c.products.reduce((s, p) => s + p.qty * p.price, 0), 0);

  const updateProduct = (cId, pId, patch) =>
    setCategories(cs => cs.map(c => c.id === cId ? { ...c, products: c.products.map(p => p.id === pId ? { ...p, ...patch } : p) } : c));
  const addProduct = (cId) =>
    setCategories(cs => cs.map(c => c.id === cId ? { ...c, products: [...c.products, { id: "i" + Math.random().toString(36).slice(2, 7), name: "Новый товар", brand: "Бренд", url: "", qty: 1, price: 0, swatch: 30 }] } : c));
  const removeProduct = (cId, pId) =>
    setCategories(cs => cs.map(c => c.id === cId ? { ...c, products: c.products.filter(p => p.id !== pId) } : c));
  const renameCategory = (cId, name) =>
    setCategories(cs => cs.map(c => c.id === cId ? { ...c, name } : c));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="projects" onNav={onBack} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", borderBottom: "1px solid var(--hairline)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ paddingLeft: 6, paddingRight: 10, marginLeft: -6 }}>
              <Icon name="back" size={14} />Проекты
            </button>
            <div style={{ width: 1, height: 18, background: "var(--hairline-strong)" }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Editable as="div" value={project.name} onChange={onRename} style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }} />
                <span style={{ fontSize: 10, fontWeight: 500, padding: "3px 7px", borderRadius: 4, background: "var(--accent-soft)", color: "var(--accent)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Черновик</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                Для <Editable as="span" value={project.client} onChange={onRenameClient} style={{ color: "var(--ink-2)" }} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary"><Icon name="download" size={14} />Скачать PDF</button>
            <button className="btn btn-primary" onClick={onShare}><Icon name="share" size={14} />Поделиться с клиентом</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "36px 56px 80px", maxWidth: 1280, width: "100%", margin: "0 auto" }} className="seta-main">
          <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Спецификация</div>
              <h1 className="serif" style={{ margin: 0, fontSize: 42, lineHeight: 1, letterSpacing: "-0.02em" }}>
                {categories.reduce((s, c) => s + c.products.length, 0)} позиций в {categories.length} комнатах
              </h1>
            </div>
            <div style={{ textAlign: "right", color: "var(--ink-3)", fontSize: 12 }}>
              <div>Изменено 2 минуты назад</div>
              <div>Анна Полякова</div>
            </div>
          </div>

          <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "64px 1fr 80px 120px 120px 36px", gap: 16, padding: "14px 24px", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid var(--hairline)", background: "#FAF8F5" }}>
              <span/><span>Товар</span><span style={{ textAlign: "right" }}>Кол-во</span><span style={{ textAlign: "right" }}>Цена</span><span style={{ textAlign: "right" }}>Сумма</span><span/>
            </div>

            {categories.map(cat => {
              const subtotal = cat.products.reduce((s, p) => s + p.qty * p.price, 0);
              return (
                <div key={cat.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "22px 24px 12px", borderTop: "1px solid var(--hairline)" }}>
                    <Editable as="div" value={cat.name} onChange={n => renameCategory(cat.id, n)} className="serif" style={{ fontSize: 22, lineHeight: 1, letterSpacing: "-0.01em" }} />
                    <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
                    <span style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{cat.products.length} ПОЗИЦИЙ</span>
                  </div>
                  {cat.products.map(p => (
                    <ProductRow key={p.id} product={p} onChange={patch => updateProduct(cat.id, p.id, patch)} onRemove={() => removeProduct(cat.id, p.id)} />
                  ))}
                  <button onClick={() => addProduct(cat.id)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "12px 24px", color: "var(--ink-3)", fontSize: 13, borderTop: "1px dashed var(--hairline-strong)", border: "none", background: "none", cursor: "pointer", borderTopStyle: "dashed", borderTopWidth: 1, borderTopColor: "var(--hairline-strong)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-soft)"; e.currentTarget.style.color = "var(--accent)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-3)"; }}>
                    <Icon name="plus" size={14} />Добавить товар в «{cat.name}»
                  </button>
                  <div style={{ display: "grid", gridTemplateColumns: "64px 1fr 80px 120px 120px 36px", gap: 16, padding: "14px 24px", background: "#FBFAF7", borderTop: "1px solid var(--hairline)" }}>
                    <span/><span/><span/><span/>
                    <span style={{ textAlign: "right", fontWeight: 600, color: "var(--ink)" }}>{fmt(subtotal)}</span>
                    <span/>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 36 }}>
            <textarea placeholder="Добавьте заметки для клиента — палитра, поставщики, сроки поставки…"
              defaultValue="Сроки поставки изделий Hewn Workshop — 12–14 недель."
              style={{ width: "100%", minHeight: 110, resize: "vertical", border: "none", background: "transparent", fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)", padding: 4, outline: "none" }}
              onFocus={e => e.currentTarget.style.background = "var(--surface)"}
              onBlur={e => e.currentTarget.style.background = "transparent"} />
          </div>

          <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 24, borderTop: "2px solid var(--ink)" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Итого</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>Без учёта доставки, фрахта и НДС</div>
            </div>
            <div className="serif" style={{ fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em" }}>{fmt(grandTotal)}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProductRow({ product, onChange, onRemove }) {
  const [hover, setHover] = useState(false);
  const total = product.qty * product.price;
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "grid", gridTemplateColumns: "64px 1fr 80px 120px 120px 36px", gap: 16, padding: "14px 24px", alignItems: "center", borderTop: "1px solid var(--hairline)", background: hover ? "#FCFBF8" : "transparent", transition: "background 120ms ease" }}>
      <Placeholder hue={product.swatch} label="IMG" style={{ width: 48, height: 48, borderRadius: 6 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Editable as="span" value={product.name} onChange={name => onChange({ name })} style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }} />
          {product.url && <a href={`https://${product.url}`} target="_blank" rel="noopener noreferrer" onClick={e => e.preventDefault()} style={{ color: "var(--ink-3)", display: "flex", alignItems: "center" }}><Icon name="external" size={13} /></a>}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
          <Editable as="span" value={product.brand} onChange={brand => onChange({ brand })} />
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <input type="number" value={product.qty} min={1} onChange={e => onChange({ qty: parseInt(e.target.value || "1") })}
          style={{ width: 56, textAlign: "right", border: "1px solid transparent", background: "transparent", padding: "4px 8px", borderRadius: 4, fontSize: 13, color: "var(--ink)" }}
          onFocus={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--hairline-strong)"; }}
          onBlur={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }} />
      </div>
      <div style={{ textAlign: "right", fontSize: 13, color: "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>{fmt(product.price)}</div>
      <div style={{ textAlign: "right", fontSize: 13, color: "var(--ink)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</div>
      <button onClick={onRemove} style={{ opacity: hover ? 1 : 0, transition: "opacity 120ms ease", color: "var(--ink-3)", display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 6, border: "none", background: "none", cursor: "pointer" }}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--hairline)"; e.currentTarget.style.color = "var(--danger)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-3)"; }}>
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}
