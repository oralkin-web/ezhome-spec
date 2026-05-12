import { useState } from 'react';
import { Icon, Sidebar } from '../components/shared';

// ─── Helpers ───────────────────────────────────────────────────────────────

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function SettingsSection({ title, description, children }) {
  return (
    <section className="settings-section" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 48, padding: "32px 0", borderTop: "1px solid var(--hairline)" }}>
      <div>
        <h2 className="serif" style={{ margin: 0, fontSize: 22, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{title}</h2>
        {description && <p style={{ margin: "8px 0 0", color: "var(--ink-3)", fontSize: 13, lineHeight: 1.5 }}>{description}</p>}
      </div>
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", padding: 28 }}>{children}</div>
    </section>
  );
}

function PasswordField({ label }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div style={{ position: "relative" }}>
        <input className="input" type={show ? "text" : "password"} defaultValue="••••••••••" style={{ paddingRight: 44 }} />
        <button onClick={() => setShow(v => !v)} tabIndex={-1}
          style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, display: "grid", placeItems: "center", color: "var(--ink-3)", borderRadius: 6, border: "none", background: "none", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--hairline)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <Icon name={show ? "eye-off" : "eye"} size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── LOGO SECTION ──────────────────────────────────────────────────────────

function LogoSection({ logoUrl, onChangeLogo }) {
  const logo = logoUrl;
  const setLogo = onChangeLogo;
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setLogo(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  return (
    <SettingsSection title="Логотип" description="Отображается в шапке клиентской страницы и в PDF.">
      <div style={{ display: "flex", gap: 20, alignItems: "stretch" }} className="logo-row">
        {/* Фрейм с лого / инициалами */}
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{ width: 96, height: 96, borderRadius: 12, background: "var(--ink)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 22, flexShrink: 0, position: "relative", overflow: "hidden" }}
        >
          {logo ? (
            <img src={logo} alt="Логотип" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }} />
          ) : (
            <span>АП</span>
          )}
          {/* Кнопка удаления при наведении */}
          {logo && hover && (
            <button
              onClick={() => setLogo(null)}
              style={{ position: "absolute", inset: 0, background: "rgba(20,16,10,0.55)", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: "#fff" }}
            >
              <Icon name="trash" size={18} />
            </button>
          )}
        </div>
        {/* Зона загрузки */}
        <label
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          style={{ flex: 1, border: `1.5px dashed ${drag ? "var(--accent)" : "var(--hairline-strong)"}`, background: drag ? "var(--accent-soft)" : "transparent", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 20px", color: drag ? "var(--accent)" : "var(--ink-2)", fontSize: 13, transition: "all 120ms ease", cursor: "pointer" }}
        >
          <input type="file" accept="image/png,image/svg+xml,image/jpeg" style={{ display: "none" }} onChange={handleInput} />
          <Icon name="upload" size={16} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 500 }}>Перетащите файл сюда или нажмите</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>PNG, JPG или SVG, до 2 МБ</div>
          </div>
        </label>
      </div>
    </SettingsSection>
  );
}

// ─── SCREEN 4: SETTINGS ────────────────────────────────────────────────────

export function Settings({ onNav, logoUrl, onChangeLogo }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="settings" onNav={onNav} />
      <main style={{ flex: 1, padding: "44px 56px 80px", maxWidth: 1100, width: "100%" }} className="seta-main">
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Аккаунт</div>
          <h1 className="serif" style={{ margin: 0, fontSize: 48, lineHeight: 1, letterSpacing: "-0.02em" }}>Настройки</h1>
        </div>

        <SettingsSection title="Профиль" description="Эти данные видите только вы и команда SETA.">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="settings-grid">
            <div className="field"><label className="label">Имя</label><input className="input" defaultValue="Анна Полякова" /></div>
            <div className="field"><label className="label">Email</label><input className="input" type="email" defaultValue="anna@asterandfield.ru" /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><button className="btn btn-primary">Сохранить</button></div>
        </SettingsSection>

        <LogoSection logoUrl={logoUrl} onChangeLogo={onChangeLogo} />

        <SettingsSection title="Контакты для клиента" description="Отображаются в футере страницы, которую вы отправляете клиенту.">
          <div className="field"><label className="label">Телефон</label><input className="input" type="tel" defaultValue="+7 (495) 555 01 88" /></div>
          <div className="field"><label className="label">Email</label><input className="input" type="email" defaultValue="hello@asterandfield.ru" /></div>
          <div className="field"><label className="label">Сайт</label><input className="input" defaultValue="asterandfield.ru" /></div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><button className="btn btn-primary">Сохранить</button></div>
        </SettingsSection>

        <SettingsSection title="Пароль" description="Используйте надёжную комбинацию букв, цифр и символов. Мы рекомендуем не менее 8 символов.">
          <PasswordField label="Текущий пароль" />
          <PasswordField label="Новый пароль" />
          <PasswordField label="Подтвердите новый пароль" />
          <div style={{ display: "flex", justifyContent: "flex-end" }}><button className="btn btn-primary">Изменить пароль</button></div>
        </SettingsSection>
      </main>
    </div>
  );
}

// ─── SCREEN 5: FEEDBACK ────────────────────────────────────────────────────

export function Feedback({ onNav }) {
  const [topic, setTopic] = useState("Сообщить об ошибке");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState("");

  const showImage = topic === "Сообщить об ошибке" || topic === "Предложить функцию";

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setImageError("Файл превышает 2 МБ"); return; }
    setImageError("");
    const reader = new FileReader();
    reader.onload = (ev) => setImage({ src: ev.target.result, name: file.name });
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="feedback" onNav={onNav} />
      <main style={{ flex: 1, padding: "60px 24px 80px", display: "grid", placeItems: "start center" }} className="seta-main">
        <div style={{ width: "100%", maxWidth: 560 }}>
          {!sent ? (
            <div className="fade-in">
              <div style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Поддержка</div>
              <h1 className="serif" style={{ margin: 0, fontSize: 44, lineHeight: 1, letterSpacing: "-0.02em" }}>Написать нам</h1>
              <p style={{ margin: "12px 0 32px", color: "var(--ink-2)", fontSize: 15, lineHeight: 1.5 }}>Расскажите что работает хорошо, а что можно улучшить.</p>
              <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", padding: 28 }}>
                <div className="field">
                  <label className="label">Тема</label>
                  <div style={{ position: "relative" }}>
                    <select value={topic} onChange={e => { setTopic(e.target.value); setImage(null); setImageError(""); }} className="input" style={{ appearance: "none", paddingRight: 36, cursor: "pointer" }}>
                      <option>Сообщить об ошибке</option>
                      <option>Предложить функцию</option>
                      <option>Общий вопрос</option>
                    </select>
                    <Icon name="chevron" size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%) rotate(90deg)", color: "var(--ink-3)", pointerEvents: "none" }} />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Сообщение</label>
                  <textarea className="input" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Ваше сообщение..." rows={5} />
                </div>
                {/* П2: загрузка изображения для ошибки и функции */}
                {showImage && (
                  <div className="field">
                    <label className="label">Изображение <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>— необязательно</span></label>
                    {image ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--hairline-strong)", borderRadius: 8, background: "var(--bg)" }}>
                        <img src={image.src} alt="" style={{ width: 40, height: 40, borderRadius: 5, objectFit: "cover", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "var(--ink-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{image.name}</span>
                        <button onClick={() => setImage(null)} style={{ color: "var(--ink-3)", border: "none", background: "none", cursor: "pointer", display: "grid", placeItems: "center", padding: 4, borderRadius: 5 }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--hairline)"; e.currentTarget.style.color = "var(--danger)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--ink-3)"; }}>
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1.5px dashed var(--hairline-strong)", borderRadius: 8, cursor: "pointer", color: "var(--ink-2)", fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--ink-3)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--hairline-strong)"}>
                        <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" style={{ display: "none" }} onChange={handleImage} />
                        <Icon name="image" size={15} />
                        <span>Прикрепить изображение</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-3)" }}>PNG, JPG, WEBP · до 2 МБ</span>
                      </label>
                    )}
                    {imageError && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{imageError}</div>}
                  </div>
                )}
                {/* П3: кнопка с текстом по центру */}
                <button className="btn btn-primary" onClick={() => setSent(true)} style={{ width: "100%", height: 44, fontSize: 14, justifyContent: "center" }}>Отправить</button>
              </div>
            </div>
          ) : (
            <div className="fade-in" style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", margin: "0 auto 24px" }}>
                <Icon name="check" size={32} stroke={2} />
              </div>
              <h1 className="serif" style={{ margin: 0, fontSize: 36, letterSpacing: "-0.01em" }}>Спасибо!</h1>
              <p style={{ margin: "12px 0 28px", color: "var(--ink-2)", fontSize: 15 }}>Ваше сообщение очень важно для развития SETA.</p>
              <button className="btn btn-secondary" onClick={() => { setSent(false); setMsg(""); setImage(null); }}>Отправить ещё одно</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── SCREEN 6: ADMIN ───────────────────────────────────────────────────────

const ADMIN_USERS = [
  { name: "Иван Соколов", email: "ivan@studio-loft.ru", plan: "Студия", projects: 24, joined: "12 фев 2026", last: "2 мин назад", blocked: false },
  { name: "Мария Лебедева", email: "maria.l@gmail.com", plan: "Фрилансер", projects: 8, joined: "03 мар 2026", last: "Сегодня", blocked: false },
  { name: "Артём Воронин", email: "voronin@design.ru", plan: "Бесплатный", projects: 1, joined: "21 мар 2026", last: "3 дня назад", blocked: false },
  { name: "Ольга Кравец", email: "olga@interior-now.com", plan: "Студия", projects: 47, joined: "08 янв 2026", last: "Сегодня", blocked: false },
  { name: "Тимур Газизов", email: "timur.g@yandex.ru", plan: "Фрилансер", projects: 12, joined: "27 фев 2026", last: "Вчера", blocked: true },
];



const ADMIN_FEEDBACK = [
  { id: "f1", user: "Иван Соколов", tag: "Функция", title: "Возможность экспорта в Excel", preview: "Хотелось бы выгружать спецификацию в .xlsx с разбивкой по комнатам…", date: "07 мая", status: "Новое" },
  { id: "f2", user: "Мария Лебедева", tag: "Ошибка", title: "При смене количества пропадает цена", preview: "Если ввести количество больше 99, итоговая сумма обнуляется…", date: "06 мая", status: "Прочитано" },
  { id: "f3", user: "Артём Воронин", tag: "Вопрос", title: "Можно ли пригласить ассистента?", preview: "Скажите, есть ли возможность дать доступ к одному проекту коллеге…", date: "05 мая", status: "Отвечено" },
];

function PlanBadge({ plan }) {
  const styles = { "Бесплатный": { bg: "var(--hairline)", fg: "var(--ink-2)" }, "Фрилансер": { bg: "var(--accent-soft)", fg: "var(--accent)" }, "Студия": { bg: "var(--ink)", fg: "#fff" } };
  const s = styles[plan] || styles["Бесплатный"];
  return <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: s.bg, color: s.fg, fontWeight: 500, whiteSpace: "nowrap" }}>{plan}</span>;
}

function StatusBadge({ status }) {
  const styles = { "Активна": { bg: "oklch(0.95 0.04 145)", fg: "oklch(0.42 0.13 145)" }, "Отменена": { bg: "rgba(220,70,60,0.1)", fg: "var(--danger)" }, "Пробный период": { bg: "var(--accent-soft)", fg: "var(--accent)" }, "Новое": { bg: "var(--accent-soft)", fg: "var(--accent)" }, "Прочитано": { bg: "var(--hairline)", fg: "var(--ink-2)" }, "Отвечено": { bg: "oklch(0.95 0.04 145)", fg: "oklch(0.42 0.13 145)" } };
  const s = styles[status] || { bg: "var(--hairline)", fg: "var(--ink-2)" };
  return <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: s.bg, color: s.fg, fontWeight: 500, whiteSpace: "nowrap" }}>{status}</span>;
}

function StatCard({ label, value, delta, accent }) {
  return (
    <div style={{ background: accent ? "var(--ink)" : "var(--surface)", color: accent ? "#fff" : "var(--ink)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", padding: "20px 22px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: accent ? "rgba(255,255,255,0.6)" : "var(--ink-3)" }}>{label}</div>
      <div className="serif" style={{ fontSize: 32, lineHeight: 1.1, marginTop: 8, letterSpacing: "-0.01em" }}>{value}</div>
      <div style={{ fontSize: 12, marginTop: 6, color: accent ? "rgba(255,255,255,0.5)" : "var(--ink-3)" }}>{delta}</div>
    </div>
  );
}

export function Admin({ onNav, tab, setTab }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar admin onNav={onNav} active={`admin-${tab}`} />
      <main style={{ flex: 1, padding: "44px 48px 80px", overflowX: "hidden" }} className="seta-main">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Icon name="shield" size={18} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Только для администраторов</span>
        </div>
        <h1 className="serif" style={{ margin: "0 0 28px", fontSize: 48, lineHeight: 1, letterSpacing: "-0.02em" }}>Админ-панель</h1>
        <div className="tabs" style={{ maxWidth: 480, marginBottom: 28 }}>
          <button className={`tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>Пользователи</button>
          <button className={`tab ${tab === "feedback" ? "active" : ""}`} onClick={() => setTab("feedback")}>Обратная связь</button>
        </div>
        {tab === "users" && <AdminUsers />}
        {tab === "feedback" && <AdminFeedback />}
      </main>
    </div>
  );
}

function AdminUsers() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState(ADMIN_USERS);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const filtered = users.filter(u => (u.name + u.email).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", height: 44, background: "var(--surface)", borderRadius: 10, boxShadow: "0 0 0 1px var(--hairline-strong)", marginBottom: 20, maxWidth: 380 }}>
        <Icon name="search" size={15} style={{ color: "var(--ink-3)" }} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск по имени или email" style={{ border: "none", background: "transparent", outline: "none", flex: 1, fontSize: 14 }} />
      </div>
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640, fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#FAF8F5" }}>
              {["Имя", "Email", "Проектов", "Регистрация", "Последняя активность", ""].map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, borderBottom: "1px solid var(--hairline)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={i} onMouseEnter={e => e.currentTarget.style.background = "#FCFBF8"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--hairline)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, color: "var(--ink-2)", flexShrink: 0 }}>{u.name.split(" ").map(s => s[0]).join("")}</div>
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)", color: "var(--ink-2)" }}>{u.email}</td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)" }}>{u.projects}</td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)", color: "var(--ink-2)" }}>{u.joined}</td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)", color: "var(--ink-2)" }}>{u.last}</td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)", textAlign: "right" }}>
                  <button onClick={() => setConfirmDelete(u)}
                    style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent", color: "var(--ink-3)", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,70,60,0.08)"; e.currentTarget.style.color = "var(--danger)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-3)"; }}>
                    <Icon name="trash" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Диалог подтверждения удаления */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(20,16,10,0.5)", display: "grid", placeItems: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "0 24px 60px -10px rgba(20,16,10,0.3)", padding: 28, maxWidth: 400, width: "100%" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(220,70,60,0.1)", color: "var(--danger)", display: "grid", placeItems: "center", marginBottom: 16 }}>
              <Icon name="trash" size={20} />
            </div>
            <h3 className="serif" style={{ margin: "0 0 8px", fontSize: 22, letterSpacing: "-0.01em" }}>Удалить пользователя?</h3>
            <p style={{ margin: "0 0 24px", color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5 }}>
              Аккаунт «{confirmDelete.name}» будет удалён безвозвратно вместе со всеми его проектами.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Отмена</button>
              <button className="btn" onClick={() => { setUsers(us => us.filter(u => u.email !== confirmDelete.email)); setConfirmDelete(null); }} style={{ background: "var(--danger)", color: "#fff", justifyContent: "center" }}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



function AdminFeedback() {
  const tagColor = t => ({ "Ошибка": { bg: "rgba(220,70,60,0.1)", fg: "var(--danger)" }, "Функция": { bg: "var(--accent-soft)", fg: "var(--accent)" }, "Вопрос": { bg: "var(--hairline)", fg: "var(--ink-2)" } }[t]);
  return (
    <div className="fade-in" style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
      {ADMIN_FEEDBACK.map((m, i) => {
        const tc = tagColor(m.tag);
        return (
          <div key={m.id} style={{ borderTop: i ? "1px solid var(--hairline)" : "none", padding: "20px 24px", display: "flex", gap: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "var(--hairline)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, color: "var(--ink-2)", marginTop: 2 }}>{m.user.split(" ").map(s => s[0]).join("")}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{m.user}</span>
                <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: tc.bg, color: tc.fg, fontWeight: 600, textTransform: "uppercase" }}>{m.tag}</span>
                <span style={{ fontSize: 12, color: "var(--ink-3)", marginLeft: "auto" }}>{m.date}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{m.title}</div>
              <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>{m.preview}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SCREEN 7: AUTH ────────────────────────────────────────────────────────

function PasswordFieldLg({ value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input className="input lg" type={show ? "text" : "password"} placeholder="••••••••" style={{ paddingRight: 48 }} autoComplete="current-password" value={value || ""} onChange={e => onChange?.(e.target.value)} />
      <button onClick={() => setShow(v => !v)} type="button" tabIndex={-1}
        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, display: "grid", placeItems: "center", color: "var(--ink-3)", borderRadius: 6, border: "none", background: "none", cursor: "pointer" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--hairline)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <Icon name={show ? "eye-off" : "eye"} size={16} />
      </button>
    </div>
  );
}

function ResetCard({ back }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");

  const handleSend = () => {
    if (!isValidEmail(email)) { setEmailErr("Email введён некорректно"); return; }
    setEmailErr("");
    setSent(true);
  };

  return (
    <div className="auth-card" style={{ width: "100%", maxWidth: 420, background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "0 1px 2px rgba(20,16,10,0.04), 0 24px 60px -20px rgba(20,16,10,0.18)", padding: 32 }}>
      {!sent ? (
        <div className="fade-in">
          <button onClick={back} className="btn btn-ghost btn-sm" style={{ paddingLeft: 6, marginLeft: -6, marginBottom: 20 }}><Icon name="back" size={14} />Назад</button>
          <h1 className="serif" style={{ margin: "0 0 8px", fontSize: 30, letterSpacing: "-0.01em" }}>Восстановление пароля</h1>
          <p style={{ margin: "0 0 24px", color: "var(--ink-3)", fontSize: 13, lineHeight: 1.5 }}>Укажите email — мы отправим ссылку для входа.</p>
          <div className="field">
            <label className="label">Email</label>
            <input className="input lg" type="email" placeholder="you@studio.ru"
              value={email} onChange={e => { setEmail(e.target.value); setEmailErr(""); }}
              style={{ borderColor: emailErr ? "var(--danger)" : undefined }} />
            {emailErr && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{emailErr}</div>}
          </div>
          <button className="btn btn-primary" onClick={handleSend} style={{ width: "100%", height: 48, fontSize: 14, justifyContent: "center" }}>Отправить ссылку</button>
        </div>
      ) : (
        <div className="fade-in" style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}><Icon name="envelope" size={28} /></div>
          <h1 className="serif" style={{ margin: "0 0 8px", fontSize: 26, letterSpacing: "-0.01em" }}>Проверьте почту</h1>
          <p style={{ margin: "0 0 24px", color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5 }}>Мы отправили ссылку для входа. Если письмо не пришло — проверьте папку «Спам».</p>
          <button className="btn btn-secondary" onClick={back} style={{ width: "100%", height: 44, border: "none", justifyContent: "center", gap: 6 }}><Icon name="back" size={14} />Назад ко входу</button>
        </div>
      )}
    </div>
  );
}

function AuthCard({ mode, setMode, onLogin, onRegister }) {
  const [error, setError] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regEmailErr, setRegEmailErr] = useState("");
  const [regPasswordVal, setRegPasswordVal] = useState("");
  const [regName, setRegName] = useState("");

  const handleLogin = async () => {
    if (!isValidEmail(emailVal)) { setEmailErr("Email введён некорректно"); return; }
    setEmailErr("");
    setError("");
    const err = await onLogin({ email: emailVal, password: passwordVal });
    if (err) setError(err);
  };

  const handleRegister = async () => {
    if (!isValidEmail(regEmail)) { setRegEmailErr("Email введён некорректно"); return; }
    setRegEmailErr("");
    const err = await onRegister({ email: regEmail, password: regPasswordVal, name: regName });
    if (err) setRegEmailErr(err);
  };

  return (
    <div className="auth-card" style={{ width: "100%", maxWidth: 420, background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "0 1px 2px rgba(20,16,10,0.04), 0 24px 60px -20px rgba(20,16,10,0.18)", padding: 32 }}>
      <div className="tabs" style={{ marginBottom: 28 }}>
        <button className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); setEmailErr(""); }}>Вход</button>
        <button className={`tab ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setRegEmailErr(""); }}>Регистрация</button>
      </div>
      {mode === "login" ? (
        <div className="fade-in">
          <h1 className="serif" style={{ margin: "0 0 6px", fontSize: 30, letterSpacing: "-0.01em" }}>С возвращением</h1>
          <p style={{ margin: "0 0 24px", color: "var(--ink-3)", fontSize: 13 }}>Войдите, чтобы продолжить работу с вашими комплектациями.</p>
          <div className="field">
            <label className="label">Email</label>
            <input className="input lg" type="email" placeholder="you@studio.ru"
              value={emailVal}
              onChange={e => { setEmailVal(e.target.value); setEmailErr(""); setError(""); }}
              style={{ borderColor: emailErr ? "var(--danger)" : undefined }} />
            {emailErr && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{emailErr}</div>}
          </div>
          <div className="field"><label className="label">Пароль</label><PasswordFieldLg value={passwordVal} onChange={setPasswordVal} /></div>
          {error && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 8, background: "rgba(220,70,60,0.08)", border: "1px solid rgba(220,70,60,0.2)", marginBottom: 14 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              <span style={{ fontSize: 13, color: "var(--danger)", lineHeight: 1.4 }}>{error}</span>
            </div>
          )}
          <button className="btn btn-primary" onClick={handleLogin} style={{ width: "100%", height: 48, fontSize: 14, marginTop: 4, justifyContent: "center" }}>Войти</button>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => setMode("reset")} style={{ color: "var(--ink-3)", fontSize: 12, padding: 4, border: "none", background: "none", cursor: "pointer" }}>Забыли пароль?</button>
          </div>
        </div>
      ) : (
        <div className="fade-in">
          <h1 className="serif" style={{ margin: "0 0 24px", fontSize: 30, letterSpacing: "-0.01em" }}>Создайте аккаунт</h1>
          <div className="field"><label className="label">Имя</label><input className="input lg" placeholder="Ваше имя" value={regName} onChange={e => setRegName(e.target.value)} /></div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input lg" type="email" placeholder="you@studio.ru"
              value={regEmail}
              onChange={e => { setRegEmail(e.target.value); setRegEmailErr(""); }}
              style={{ borderColor: regEmailErr ? "var(--danger)" : undefined }} />
            {regEmailErr && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{regEmailErr}</div>}
          </div>
          <div className="field"><label className="label">Пароль</label><PasswordFieldLg value={regPasswordVal} onChange={setRegPasswordVal} /></div>
          <button className="btn btn-primary" onClick={handleRegister} style={{ width: "100%", height: 48, fontSize: 14, marginTop: 4, justifyContent: "center" }}>Создать аккаунт</button>
          <p style={{ margin: "16px 0 0", fontSize: 11, color: "var(--ink-3)", textAlign: "center", lineHeight: 1.5 }}>
            Регистрируясь, вы соглашаетесь с <a href="#" style={{ color: "var(--ink-2)" }}>Политикой конфиденциальности</a>.
          </p>
        </div>
      )}
    </div>
  );
}

export function Auth({ onLogin, onRegister, mode, setMode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "grid", placeItems: "center", padding: "24px 16px", paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}>
      {/* П1: логотип SETA с бета-бейджем */}
      <div style={{ position: "absolute", top: 32, left: 32, display: "flex", alignItems: "center", gap: 10 }} className="auth-brand">
        <svg width="72" height="22" viewBox="0 0 275 81" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "var(--ink)" }}>
          <path d="M176.307 34.9476C176.176 32.2146 175.553 29.9046 174.438 28.0176C173.323 26.0655 171.749 24.5688 169.715 23.5277C167.748 22.4215 165.485 21.8684 162.927 21.8684C159.975 21.8684 157.417 22.5517 155.253 23.9181C153.088 25.2846 151.383 27.2042 150.137 29.6769C148.956 32.1496 148.366 35.0127 148.366 38.2662C148.366 41.8451 149.021 44.9359 150.333 47.5388C151.711 50.1416 153.58 52.1588 155.941 53.5903C158.303 54.9568 161.025 55.6401 164.107 55.6401C169.006 55.6401 173.272 54.1079 176.904 51.0436C177.749 50.3312 179.009 50.317 179.794 51.0951L183.797 55.0671C184.56 55.8233 184.594 57.053 183.813 57.7896C181.47 59.9988 178.738 61.755 175.618 63.0581C171.88 64.6198 167.715 65.4006 163.123 65.4006C157.614 65.4006 152.826 64.2944 148.759 62.082C144.758 59.8046 141.61 56.7137 139.314 52.8095C137.084 48.8402 135.969 44.2202 135.969 38.9494C135.969 33.6787 137.084 29.0587 139.314 25.0894C141.61 21.1201 144.758 18.0292 148.759 15.8168C152.826 13.6044 157.483 12.4657 162.73 12.4006C168.961 12.4006 173.979 13.6695 177.783 16.2073C181.653 18.745 184.408 22.3239 186.047 26.9439C187.687 31.4989 188.277 36.9323 187.818 43.2441H146.496V34.9476H176.307Z" fill="currentColor"/>
          <path d="M249.543 41.9209C246.268 41.9209 243.828 42.4405 242.223 43.4797C240.618 44.5189 239.815 46.2401 239.815 48.6433C239.815 50.8516 240.618 52.6378 242.223 54.0017C243.892 55.3657 246.14 56.0477 248.965 56.0477C251.469 56.0477 253.716 55.6255 255.707 54.7812C257.761 53.8718 259.367 52.6702 260.522 51.1764C261.742 49.6175 262.448 47.8963 262.641 46.0128L264.76 55.0734C263.219 58.4509 260.843 61.0164 257.633 62.7701C254.423 64.5238 250.538 65.4006 245.979 65.4006C242.319 65.4006 239.141 64.6862 236.444 63.2573C233.748 61.8283 231.661 59.9123 230.184 57.5091C228.707 55.041 227.969 52.2805 227.969 49.2278C227.969 44.4215 229.67 40.6543 233.073 37.9264C236.476 35.1335 241.292 33.7046 247.52 33.6396H265.874V41.9209H249.543ZM262.545 32.0808C262.545 28.9631 261.55 26.5275 259.559 24.7738C257.633 22.9552 254.744 22.0459 250.891 22.0459C248.515 22.0459 246.011 22.5005 243.379 23.4098C241.401 24.0601 239.404 24.9414 237.388 26.0539C236.389 26.6055 235.115 26.276 234.562 25.2768L231.977 20.6027C231.459 19.6662 231.768 18.484 232.699 17.9554C234.551 16.9035 236.345 16.0262 238.082 15.3234C240.329 14.3492 242.673 13.6347 245.112 13.18C247.617 12.6604 250.474 12.4006 253.684 12.4006C260.426 12.4006 265.627 14.0244 269.287 17.272C272.946 20.5195 274.808 25.0011 274.873 30.7168L274.963 62.8104C274.966 63.9172 274.07 64.8161 272.963 64.8161H264.635C263.533 64.8161 262.638 63.9242 262.635 62.822L262.545 32.0808Z" fill="currentColor"/>
          <path d="M210.035 47.8066C210.035 50.4132 210.526 52.2051 211.51 53.1826C212.494 54.16 213.838 54.6488 215.543 54.6488C216.592 54.6488 217.739 54.4858 218.985 54.16C219.585 53.9719 220.207 53.7384 220.853 53.4597C222.003 52.9629 223.372 53.5037 223.755 54.6965L225.483 60.0739C225.767 60.9606 225.406 61.9331 224.58 62.3645C223.009 63.1856 221.341 63.8719 219.576 64.4232C217.346 65.0748 215.084 65.4006 212.789 65.4006C209.969 65.4006 207.379 64.8793 205.018 63.8367C202.658 62.729 200.789 61.0347 199.412 58.754C198.035 56.4082 197.346 53.4758 197.346 49.957V2.40063C197.346 1.29607 198.241 0.400635 199.346 0.400635H208.035C209.139 0.400635 210.035 1.29607 210.035 2.40063V47.8066ZM189.969 16.6713C189.969 15.5667 190.864 14.6713 191.969 14.6713H223.084C224.188 14.6713 225.084 15.5667 225.084 16.6713V21.566C225.084 22.6706 224.188 23.566 223.084 23.566H191.969C190.864 23.566 189.969 22.6706 189.969 21.566V16.6713Z" fill="currentColor"/>
          <path d="M128.567 24.703C128.035 25.7006 126.785 26.0535 125.775 25.5445C123.752 24.5249 121.671 23.716 119.531 23.1175C116.744 22.2732 114.223 21.851 111.967 21.851C109.843 21.851 108.118 22.2407 106.791 23.0201C105.464 23.7346 104.8 24.9686 104.8 26.7223C104.8 28.2162 105.464 29.4178 106.791 30.3271C108.184 31.2364 109.943 32.0158 112.066 32.6653C114.19 33.2499 116.446 33.8994 118.835 34.6139C121.224 35.3283 123.48 36.2701 125.603 37.4392C127.793 38.6084 129.552 40.1672 130.879 42.1157C132.272 44.0642 132.969 46.6298 132.969 49.8124C132.969 53.3198 132.007 56.2425 130.082 58.5808C128.158 60.8541 125.603 62.5753 122.418 63.7444C119.233 64.8486 115.749 65.4006 111.967 65.4006C107.985 65.4006 104.004 64.7836 100.022 63.5495C96.6707 62.4931 93.7325 61.0083 91.2077 59.0952C90.4646 58.5321 90.2778 57.5093 90.7134 56.685L93.286 51.8166C93.8829 50.6871 95.3714 50.4025 96.4232 51.1276C98.4131 52.4993 100.641 53.6197 103.108 54.4889C106.492 55.593 109.611 56.1451 112.464 56.1451C113.991 56.1451 115.351 55.9503 116.545 55.5606C117.74 55.1709 118.669 54.6188 119.332 53.9043C119.996 53.1249 120.328 52.1182 120.328 50.8841C120.328 49.1954 119.664 47.8963 118.337 46.987C117.01 46.0128 115.285 45.2009 113.161 44.5514C111.104 43.8369 108.881 43.1549 106.492 42.5054C104.103 41.791 101.847 40.8816 99.7236 39.7775C97.6665 38.6084 95.9744 37.082 94.6472 35.1984C93.3201 33.3149 92.6565 30.8142 92.6565 27.6966C92.6565 24.1892 93.5855 21.2989 95.4435 19.0256C97.3015 16.7523 99.7568 15.0961 102.809 14.0569C105.862 12.9527 109.18 12.4006 112.763 12.4006C116.214 12.4006 119.664 12.8878 123.115 13.862C125.894 14.5944 128.415 15.5795 130.677 16.8174C131.594 17.3192 131.892 18.4713 131.4 19.3936L128.567 24.703Z" fill="currentColor"/>
          <path d="M57.0879 18.2345C60.575 20.0362 59.2938 25.3068 55.3687 25.3068H25.3398C23.1307 25.3068 21.3398 27.0976 21.3398 29.3068V46.9152C21.3398 49.1243 19.549 50.9152 17.3398 50.9152H4C1.79086 50.9152 0 49.1243 0 46.9152V19.7042C0 17.4951 1.79086 15.7042 4 15.7042H11.291C13.5002 15.7042 15.291 13.9134 15.291 11.7042V4.0051C15.291 1.03923 18.4056 -0.895154 21.0642 0.419583L57.0879 18.2345Z" fill="currentColor"/>
          <path d="M11.633 60.7443C8.8466 59.3512 9.83792 55.1515 12.9532 55.1515H44.8147C47.0238 55.1515 48.8147 53.3607 48.8147 51.1515V33.5431C48.8147 31.334 50.6055 29.5431 52.8147 29.5431L66.1545 29.5431C68.3637 29.5431 70.1545 31.334 70.1545 33.5431L70.1545 60.755C70.1545 62.9642 68.3637 64.755 66.1545 64.755H58.8635C56.6544 64.755 54.8635 66.5459 54.8635 68.755V76.3498C54.8635 79.3406 51.7013 81.2735 49.0396 79.9098L11.633 60.7443Z" fill="currentColor"/>
        </svg>
        <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: "var(--hairline-strong)", color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Beta</span>
      </div>
      {mode === "reset" ? <ResetCard back={() => setMode("login")} /> : <AuthCard mode={mode} setMode={setMode} onLogin={onLogin} onRegister={onRegister} />}
    </div>
  );
}
