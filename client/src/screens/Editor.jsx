import { useState } from 'react';
import { Icon, Placeholder, Editable, Sidebar } from '../components/shared';

const PARSER_URL = 'https://web-production-b181.up.railway.app';

const fmt = n => n.toLocaleString("ru-RU", { style: "currency", currency: "RUB", minimumFractionDigits: 0 });


export default function Editor({ project, onBack, onShare, onRename, onRenameClient, categories, setCategories, note, onNoteChange }) {
  const grandTotal = categories.reduce((sum, c) => sum + c.products.reduce((s, p) => s + p.qty * p.price, 0), 0);

  const [parsing, setParsing] = useState(false);

  const updateProduct = (cId, pId, patch) =>
    setCategories(cs => cs.map(c => c.id === cId ? { ...c, products: c.products.map(p => p.id === pId ? { ...p, ...patch } : p) } : c));
  const addProduct = (cId) => {
    const newId = "i" + Math.random().toString(36).slice(2, 7);
    setCategories(cs => cs.map(c => c.id === cId ? {
      ...c, products: [...c.products, {
        id: newId,
        name: "Новый товар", brand: "Бренд", url: "", photoUrl: "", dimensions: "", qty: 1, price: 0, swatch: 30
      }]
    } : c));
    return newId;
  };
  const removeProduct = (cId, pId) =>
    setCategories(cs => cs.map(c => c.id === cId ? { ...c, products: c.products.filter(p => p.id !== pId) } : c));
  const renameCategory = (cId, name) =>
    setCategories(cs => cs.map(c => c.id === cId ? { ...c, name } : c));
  // Правка 6: удаление комнаты
  const removeCategory = (cId) =>
    setCategories(cs => cs.filter(c => c.id !== cId));
  const addCategory = () =>
    setCategories(cs => [...cs, { id: "c" + Math.random().toString(36).slice(2, 7), name: "Новая комната", products: [] }]);

  const totalItems = categories.reduce((s, c) => s + c.products.length, 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="projects" onNav={onBack} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top bar — правка 1: только навигация, без названия и клиента */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", borderBottom: "1px solid var(--hairline)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ paddingLeft: 6, paddingRight: 10, marginLeft: -6 }}>
              <Icon name="back" size={14} />Проекты
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary"><Icon name="download" size={14} />Скачать PDF</button>
            <button className="btn btn-primary" onClick={onShare}><Icon name="link" size={14} />Ссылка клиенту</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "36px 56px 80px", maxWidth: 1280, width: "100%", margin: "0 auto" }} className="seta-main">
          {/* Правка 1: название и клиент только здесь, с возможностью редактировать */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Комплектация</div>
            <Editable as="h1" value={project.name} onChange={onRename} className="serif" style={{ margin: "0 0 6px", fontSize: 42, lineHeight: 1, letterSpacing: "-0.02em", fontWeight: 400 }} />
            <div style={{ fontSize: 15, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 6 }}>
              <Editable as="span" value={project.client} onChange={onRenameClient} style={{ color: "var(--ink-2)" }} />
              <span style={{ color: "var(--ink-3)" }}>&nbsp;·&nbsp;</span>
              <span>{totalItems} {totalItems === 1 ? "позиция" : totalItems >= 2 && totalItems <= 4 ? "позиции" : "позиций"} в {categories.length} {categories.length === 1 ? "комнате" : "комнатах"}</span>
            </div>
          </div>

          <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
            {/* Заголовок таблицы */}
            <div style={{ display: "grid", gridTemplateColumns: "96px 1fr 80px 120px 120px", gap: 16, padding: "14px 24px", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid var(--hairline)", background: "#FAF8F5" }}>
              <span/><span>Товар</span><span style={{ textAlign: "right" }}>Кол-во</span><span style={{ textAlign: "right" }}>Цена</span><span style={{ textAlign: "right" }}>Сумма</span>
            </div>

            {categories.map(cat => {
              const subtotal = cat.products.reduce((s, p) => s + p.qty * p.price, 0);
              return (
                <CategorySection
                  key={cat.id}
                  cat={cat}
                  subtotal={subtotal}
                  onRename={n => renameCategory(cat.id, n)}
                  onRemove={() => removeCategory(cat.id)}
                  onAddProduct={() => addProduct(cat.id)}
                  onUpdateProduct={(pId, patch) => updateProduct(cat.id, pId, patch)}
                  onRemoveProduct={pId => removeProduct(cat.id, pId)}
                />
              );
            })}

            {/* Кнопка добавить комнату */}
            <div style={{ borderTop: "1px solid var(--hairline)", padding: "16px 24px" }}>
              <button onClick={addCategory}
                style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-3)", fontSize: 13, border: "none", background: "none", cursor: "pointer", padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--ink-3)"}>
                <Icon name="plus" size={14} />Добавить комнату
              </button>
            </div>
          </div>

          {/* Правка 8: итоговая сумма над комментарием */}
          <div style={{ marginTop: 36, display: "flex", justifyContent: "flex-end", alignItems: "baseline", paddingBottom: 20, borderBottom: "2px solid var(--ink)" }}>
            <div className="serif" style={{ fontSize: 48, lineHeight: 1, letterSpacing: "-0.02em" }}>{fmt(grandTotal)}</div>
          </div>

          {/* Правка 9: убран блок «Итого / Без учёта...», остался только textarea */}
          <div style={{ marginTop: 20 }}>
            <textarea placeholder="Добавьте заметки для клиента — палитра, поставщики, сроки поставки…"
              value={note || ""}
              onChange={e => onNoteChange(e.target.value)}
              style={{ width: "100%", minHeight: 110, resize: "vertical", border: "none", background: "transparent", fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)", padding: 4, outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.currentTarget.style.background = "var(--surface)"}
              onBlur={e => e.currentTarget.style.background = "transparent"} />
          </div>
        </div>
      </main>
    </div>
  );
}

function CategorySection({ cat, subtotal, onRename, onRemove, onAddProduct, onUpdateProduct, onRemoveProduct }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [autoExpandId, setAutoExpandId] = useState(null);

  return (
    <div style={{ borderTop: "1px solid var(--hairline)", position: "relative" }}>
      {/* Заголовок комнаты */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 12px" }}>
        {/* П5: редактирование названия нажатием на текст */}
        <Editable as="div" value={cat.name} onChange={onRename} className="serif" style={{ fontSize: 22, lineHeight: 1, letterSpacing: "-0.01em" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{cat.products.length} ПОЗИЦИЙ</span>
          {/* П6: только иконка корзины */}
          <button onClick={() => setConfirmDelete(true)}
            style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent", color: "var(--ink-3)", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,70,60,0.08)"; e.currentTarget.style.color = "var(--danger)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-3)"; }}>
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>

      {/* Товары */}
      {cat.products.map(p => (
        <ProductRow key={p.id} product={p} onChange={patch => onUpdateProduct(p.id, patch)} onRemove={() => onRemoveProduct(p.id)} autoExpand={p.id === autoExpandId} onExpanded={() => setAutoExpandId(null)} />
      ))}

      {/* Правка 7: кнопка без названия комнаты */}
      <button onClick={() => { const id = onAddProduct(); setAutoExpandId(id); }}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "12px 24px", color: "var(--ink-3)", fontSize: 13, border: "none", borderTop: "1px dashed var(--hairline-strong)", background: "none", cursor: "pointer" }}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-soft)"; e.currentTarget.style.color = "var(--accent)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-3)"; }}>
        <Icon name="plus" size={14} />Добавить товар
      </button>

      {/* Сумма по комнате */}
      <div style={{ display: "grid", gridTemplateColumns: "96px 1fr 80px 120px 120px", gap: 16, padding: "14px 24px", background: "#FBFAF7", borderTop: "1px solid var(--hairline)" }}>
        <span/><span/><span/><span/>
        <span style={{ textAlign: "right", fontWeight: 600, color: "var(--ink)" }}>{fmt(subtotal)}</span>
      </div>

      {/* Правка 6: диалог подтверждения удаления комнаты */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(false)}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(20,16,10,0.5)", display: "grid", placeItems: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "0 24px 60px -10px rgba(20,16,10,0.3)", padding: 28, maxWidth: 420, width: "100%" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(220,70,60,0.1)", color: "var(--danger)", display: "grid", placeItems: "center", marginBottom: 16 }}>
              <Icon name="trash" size={20} />
            </div>
            <h3 className="serif" style={{ margin: "0 0 8px", fontSize: 22, letterSpacing: "-0.01em" }}>Удалить комнату?</h3>
            <p style={{ margin: "0 0 24px", color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5 }}>
              Комната «{cat.name}» и все {cat.products.length > 0 ? `${cat.products.length} ${cat.products.length === 1 ? "товар в ней" : cat.products.length <= 4 ? "товара в ней" : "товаров в ней"}` : "товары в ней"} будут удалены безвозвратно.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Отмена</button>
              <button className="btn" onClick={() => { setConfirmDelete(false); onRemove(); }}
                style={{ background: "var(--danger)", color: "#fff", justifyContent: "center" }}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, onChange, onRemove, autoExpand, onExpanded }) {
  const [hover, setHover] = useState(false);
  const [expanded, setExpanded] = useState(!!autoExpand);
  const [draft, setDraft] = useState({ ...product });
  const total = product.qty * product.price;

  // Сброс autoExpandId после раскрытия
  if (autoExpand && !expanded) { setExpanded(true); onExpanded?.(); }

  const handleSave = () => { onChange(draft); setExpanded(false); };
  const handleDiscard = () => { setDraft({ ...product }); setExpanded(false); };
  const updateDraft = (patch) => setDraft(d => ({ ...d, ...patch }));

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ borderTop: "1px solid var(--hairline)" }}>
      {/* Основная строка — клик раскрывает форму */}
      <div
        onClick={() => { if (!expanded) { setDraft({ ...product }); setExpanded(true); } else setExpanded(false); }}
        style={{ display: "grid", gridTemplateColumns: "96px 1fr 80px 120px 120px", gap: 16, padding: "14px 24px", alignItems: "center", background: expanded ? "#F5F3EF" : hover ? "#FCFBF8" : "transparent", transition: "background 120ms ease", cursor: "pointer" }}
      >
        {/* Фото: бокс 96×96, contain по центру */}
        <div style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", background: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {product.photoUrl ? (
            <img src={product.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }} onError={e => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <Placeholder hue={product.swatch} label="IMG" style={{ width: "100%", height: "100%" }} />
          )}
        </div>
        {/* Название — перенос по словам, до 3 строк */}
        <div style={{ minWidth: 0 }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", wordBreak: "break-word" }}>{product.name}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{product.brand}</div>
          {product.dimensions && <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{product.dimensions}</div>}
        </div>
        {/* Кол-во — только отображение, редактирование в форме */}
        <div style={{ textAlign: "right", fontSize: 13, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{product.qty}</div>
        <div style={{ textAlign: "right", fontSize: 13, color: "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>{fmt(product.price)}</div>
        <div style={{ textAlign: "right", fontSize: 13, color: "var(--ink)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</div>
      </div>

      {/* Раскрытая форма */}
      {expanded && (
        <div onClick={e => e.stopPropagation()} style={{ padding: "16px 24px 20px 136px", background: "#F5F3EF", borderTop: "1px solid var(--hairline)" }}>
          {/* Строка 1: Название + Бренд */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <FieldGroup label="Название товара">
              <input value={draft.name} onChange={e => updateDraft({ name: e.target.value })} placeholder="Название" style={inputStyle} />
            </FieldGroup>
            <FieldGroup label="Бренд / производитель">
              <input value={draft.brand} onChange={e => updateDraft({ brand: e.target.value })} placeholder="Бренд" style={inputStyle} />
            </FieldGroup>
          </div>
          {/* Строка 2: Размеры + Цена + Кол-во */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <FieldGroup label="Размеры">
              <input value={draft.dimensions || ""} onChange={e => updateDraft({ dimensions: e.target.value })} placeholder="напр. 240 × 90 × 80 см" style={inputStyle} />
            </FieldGroup>
            <FieldGroup label="Цена, ₽">
              <input type="number" value={draft.price || ""} onChange={e => updateDraft({ price: parseFloat(e.target.value) || 0 })} placeholder="0" style={{ ...inputStyle, textAlign: "right" }} />
            </FieldGroup>
            <FieldGroup label="Кол-во">
              <input type="number" value={draft.qty} min={1} onChange={e => updateDraft({ qty: parseInt(e.target.value) || 1 })} placeholder="1" style={{ ...inputStyle, textAlign: "right" }} />
            </FieldGroup>
          </div>
          {/* Строка 3: Ссылка на товар + Заполнить */}
          <FieldGroup label="Ссылка на товар" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={draft.url || ""} onChange={e => updateDraft({ url: e.target.value })} placeholder="https://..." style={{ ...inputStyle, flex: 1 }} />
              <button
                onClick={async () => {
                  if (!draft.url) return;
                  setParsing(true);
                  try {
                    const r = await fetch(PARSER_URL + '/parse', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ url: draft.url })
                    });
                    const d = await r.json();
                    if (d.ok) {
                      updateDraft({
                        name: d.name || draft.name,
                        price: d.price || draft.price,
                        dimensions: d.size || draft.dimensions,
                        photoUrl: d.image_url || draft.photoUrl,
                      });
                    } else {
                      alert('Не удалось загрузить данные');
                    }
                  } catch(e) {
                    alert('Ошибка: ' + e.message);
                  } finally {
                    setParsing(false);
                  }
                }}
                style={{ padding: "7px 14px", borderRadius: 6, background: "var(--ink)", color: "#fff", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                {parsing ? 'Загрузка...' : 'Заполнить'}
              </button>
            </div>
          </FieldGroup>
          {/* Строка 4: Ссылка на фото */}
          <FieldGroup label="Ссылка на фото" style={{ marginBottom: 16 }}>
            <input value={draft.photoUrl || ""} onChange={e => updateDraft({ photoUrl: e.target.value })} placeholder="https://..." style={inputStyle} />
          </FieldGroup>
          {/* Кнопки: Сохранить / Отмена / Удалить */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={handleSave}
              style={{ padding: "8px 18px", borderRadius: 7, background: "var(--ink)", color: "#fff", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", justifyContent: "center" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              Сохранить
            </button>
            <button onClick={handleDiscard}
              style={{ padding: "8px 14px", borderRadius: 7, background: "transparent", color: "var(--ink-2)", fontSize: 13, border: "1px solid var(--hairline-strong)", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--hairline)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              Отмена
            </button>
            <div style={{ flex: 1 }} />
            {/* Кнопка удаления товара перенесена в форму */}
            <button onClick={onRemove}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 7, background: "transparent", color: "var(--ink-3)", fontSize: 13, border: "1px solid transparent", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,70,60,0.08)"; e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.borderColor = "rgba(220,70,60,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-3)"; e.currentTarget.style.borderColor = "transparent"; }}>
              <Icon name="trash" size={14} />Удалить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldGroup({ label, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: "7px 10px",
  border: "1px solid var(--hairline-strong)",
  borderRadius: 6,
  fontSize: 13,
  color: "var(--ink)",
  background: "var(--surface)",
  outline: "none",
  width: "100%",
  fontFamily: "inherit",
};
