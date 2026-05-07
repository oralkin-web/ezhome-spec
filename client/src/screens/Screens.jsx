import { useState } from 'react';
import { Icon, Sidebar } from '../components/shared';

// ─── Helpers ───────────────────────────────────────────────────────────────

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

// ─── SCREEN 4: SETTINGS ────────────────────────────────────────────────────

export function Settings({ onNav }) {
  const [drag, setDrag] = useState(false);
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

        <SettingsSection title="Логотип" description="Отображается в шапке клиентской страницы и в PDF.">
          <div style={{ display: "flex", gap: 20, alignItems: "stretch" }} className="logo-row">
            <div style={{ width: 96, height: 96, borderRadius: 12, background: "var(--ink)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 22, flexShrink: 0 }}>АП</div>
            <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); }}
              style={{ flex: 1, border: `1.5px dashed ${drag ? "var(--accent)" : "var(--hairline-strong)"}`, background: drag ? "var(--accent-soft)" : "transparent", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 20px", color: drag ? "var(--accent)" : "var(--ink-2)", fontSize: 13, transition: "all 120ms ease", cursor: "pointer" }}>
              <Icon name="upload" size={16} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 500 }}>Перетащите файл сюда или нажмите</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>PNG или SVG, до 2 МБ</div>
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Контакты для клиента" description="Отображаются в футере страницы, которую вы отправляете клиенту.">
          <div className="field"><label className="label">Телефон</label><input className="input" type="tel" defaultValue="+7 (495) 555 01 88" /></div>
          <div className="field"><label className="label">Email</label><input className="input" type="email" defaultValue="hello@asterandfield.ru" /></div>
          <div className="field"><label className="label">Сайт</label><input className="input" defaultValue="asterandfield.ru" /></div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><button className="btn btn-primary">Сохранить</button></div>
        </SettingsSection>

        <SettingsSection title="Пароль" description="Используйте надёжную комбинацию букв, цифр и символов.">
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
                    <select value={topic} onChange={e => setTopic(e.target.value)} className="input" style={{ appearance: "none", paddingRight: 36, cursor: "pointer" }}>
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
                <button className="btn btn-primary" onClick={() => setSent(true)} style={{ width: "100%", height: 44, fontSize: 14 }}>Отправить</button>
                <p style={{ margin: "14px 0 0", fontSize: 12, color: "var(--ink-3)", textAlign: "center", lineHeight: 1.5 }}>Мы читаем каждое сообщение и отвечаем в течение 24 часов.</p>
              </div>
            </div>
          ) : (
            <div className="fade-in" style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", margin: "0 auto 24px" }}>
                <Icon name="check" size={32} stroke={2} />
              </div>
              <h1 className="serif" style={{ margin: 0, fontSize: 36, letterSpacing: "-0.01em" }}>Спасибо!</h1>
              <p style={{ margin: "12px 0 28px", color: "var(--ink-2)", fontSize: 15 }}>Мы получили ваше сообщение и ответим в течение 24 часов.</p>
              <button className="btn btn-secondary" onClick={() => { setSent(false); setMsg(""); }}>Отправить ещё одно</button>
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

const ADMIN_SUBS = [
  { user: "Иван Соколов", plan: "Студия", amount: "9 900 ₽", since: "12 фев 2026", status: "Активна" },
  { user: "Мария Лебедева", plan: "Фрилансер", amount: "2 900 ₽", since: "03 мар 2026", status: "Активна" },
  { user: "Тимур Газизов", plan: "Фрилансер", amount: "2 900 ₽", since: "27 фев 2026", status: "Отменена" },
  { user: "Дмитрий Шевчук", plan: "Фрилансер", amount: "0 ₽", since: "01 май 2026", status: "Пробный период" },
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
          <button className={`tab ${tab === "subs" ? "active" : ""}`} onClick={() => setTab("subs")}>Подписки</button>
          <button className={`tab ${tab === "feedback" ? "active" : ""}`} onClick={() => setTab("feedback")}>Обратная связь</button>
        </div>
        {tab === "users" && <AdminUsers />}
        {tab === "subs" && <AdminSubs />}
        {tab === "feedback" && <AdminFeedback />}
      </main>
    </div>
  );
}

function AdminUsers() {
  const [q, setQ] = useState("");
  const filtered = ADMIN_USERS.filter(u => (u.name + u.email).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", height: 44, background: "var(--surface)", borderRadius: 10, boxShadow: "0 0 0 1px var(--hairline-strong)", marginBottom: 20, maxWidth: 380 }}>
        <Icon name="search" size={15} style={{ color: "var(--ink-3)" }} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск по имени или email" style={{ border: "none", background: "transparent", outline: "none", flex: 1, fontSize: 14 }} />
      </div>
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880, fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#FAF8F5" }}>
              {["Имя", "Email", "Тариф", "Проектов", "Регистрация", "Последняя активность", "Действия"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, borderBottom: "1px solid var(--hairline)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={i} style={{ background: u.blocked ? "rgba(220,70,60,0.04)" : "transparent" }}>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--hairline)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, color: "var(--ink-2)" }}>{u.name.split(" ").map(s => s[0]).join("")}</div>
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                    {u.blocked && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(220,70,60,0.12)", color: "var(--danger)", fontWeight: 600 }}>Заблок.</span>}
                  </div>
                </td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)", color: "var(--ink-2)" }}>{u.email}</td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)" }}><PlanBadge plan={u.plan} /></td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)" }}>{u.projects}</td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)", color: "var(--ink-2)" }}>{u.joined}</td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)", color: "var(--ink-2)" }}>{u.last}</td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-secondary btn-sm">Просмотр</button>
                    <button className="btn btn-sm" style={{ color: u.blocked ? "var(--ink)" : "var(--danger)", background: u.blocked ? "var(--hairline)" : "rgba(220,70,60,0.08)" }}>{u.blocked ? "Разблок." : "Заблок."}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminSubs() {
  return (
    <div className="fade-in">
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Всего пользователей" value="2 847" delta="+128 за месяц" />
        <StatCard label="Платящих" value="612" delta="21,5% конверсия" />
        <StatCard label="MRR" value="2 384 600 ₽" delta="+12% за месяц" accent />
      </div>
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760, fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#FAF8F5" }}>
              {["Пользователь", "Тариф", "Сумма", "Дата начала", "Статус"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, borderBottom: "1px solid var(--hairline)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ADMIN_SUBS.map((s, i) => (
              <tr key={i}>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)", fontWeight: 500 }}>{s.user}</td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)" }}><PlanBadge plan={s.plan} /></td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)" }}>{s.amount}</td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)", color: "var(--ink-2)" }}>{s.since}</td>
                <td style={{ padding: "14px 16px", borderTop: "1px solid var(--hairline)" }}><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminFeedback() {
  const [open, setOpen] = useState(null);
  const [items, setItems] = useState(ADMIN_FEEDBACK);
  const tagColor = t => ({ "Ошибка": { bg: "rgba(220,70,60,0.1)", fg: "var(--danger)" }, "Функция": { bg: "var(--accent-soft)", fg: "var(--accent)" }, "Вопрос": { bg: "var(--hairline)", fg: "var(--ink-2)" } }[t]);
  return (
    <div className="fade-in" style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
      {items.map((m, i) => {
        const isOpen = open === m.id;
        const tc = tagColor(m.tag);
        return (
          <div key={m.id} style={{ borderTop: i ? "1px solid var(--hairline)" : "none" }}>
            <button onClick={() => setOpen(isOpen ? null : m.id)} style={{ width: "100%", textAlign: "left", padding: "18px 24px", display: "flex", alignItems: "center", gap: 16, border: "none", background: "none", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#FCFBF8"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "var(--hairline)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>{m.user.split(" ").map(s => s[0]).join("")}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{m.user}</span>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: tc.bg, color: tc.fg, fontWeight: 600, textTransform: "uppercase" }}>{m.tag}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-3)", marginLeft: "auto" }}>{m.date}</span>
                  <StatusBadge status={m.status} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{m.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", display: isOpen ? "none" : "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.preview}</div>
              </div>
              <Icon name="chevron" size={14} style={{ color: "var(--ink-3)", flexShrink: 0, transform: `rotate(${isOpen ? 270 : 90}deg)`, transition: "transform 180ms ease" }} />
            </button>
            {isOpen && (
              <div style={{ padding: "0 24px 24px 76px" }} className="fade-in">
                <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>{m.preview}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setItems(its => its.map(x => x.id === m.id ? { ...x, status: "Прочитано" } : x))}>Отметить как прочитанное</button>
                  <button className="btn btn-primary btn-sm">Ответить</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SCREEN 7: AUTH ────────────────────────────────────────────────────────

function PasswordFieldLg() {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input className="input lg" type={show ? "text" : "password"} placeholder="••••••••" style={{ paddingRight: 48 }} autoComplete="current-password" />
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
  return (
    <div className="auth-card" style={{ width: "100%", maxWidth: 420, background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "0 1px 2px rgba(20,16,10,0.04), 0 24px 60px -20px rgba(20,16,10,0.18)", padding: 32 }}>
      {!sent ? (
        <div className="fade-in">
          <button onClick={back} className="btn btn-ghost btn-sm" style={{ paddingLeft: 6, marginLeft: -6, marginBottom: 20 }}><Icon name="back" size={14} />Назад</button>
          <h1 className="serif" style={{ margin: "0 0 8px", fontSize: 30, letterSpacing: "-0.01em" }}>Восстановление пароля</h1>
          <p style={{ margin: "0 0 24px", color: "var(--ink-3)", fontSize: 13, lineHeight: 1.5 }}>Укажите email — мы отправим ссылку для входа.</p>
          <div className="field"><label className="label">Email</label><input className="input lg" type="email" placeholder="you@studio.ru" /></div>
          <button className="btn btn-primary" onClick={() => setSent(true)} style={{ width: "100%", height: 48, fontSize: 14 }}>Отправить ссылку</button>
        </div>
      ) : (
        <div className="fade-in" style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}><Icon name="envelope" size={28} /></div>
          <h1 className="serif" style={{ margin: "0 0 8px", fontSize: 26, letterSpacing: "-0.01em" }}>Проверьте почту</h1>
          <p style={{ margin: "0 0 24px", color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5 }}>Мы отправили ссылку для входа. Если письмо не пришло — проверьте папку «Спам».</p>
          <button className="btn btn-secondary" onClick={back} style={{ width: "100%", height: 44 }}>Вернуться ко входу</button>
        </div>
      )}
    </div>
  );
}

function AuthCard({ mode, setMode, onEnter }) {
  return (
    <div className="auth-card" style={{ width: "100%", maxWidth: 420, background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "0 1px 2px rgba(20,16,10,0.04), 0 24px 60px -20px rgba(20,16,10,0.18)", padding: 32 }}>
      <div className="tabs" style={{ marginBottom: 28 }}>
        <button className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Вход</button>
        <button className={`tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>Регистрация</button>
      </div>
      {mode === "login" ? (
        <div className="fade-in">
          <h1 className="serif" style={{ margin: "0 0 6px", fontSize: 30, letterSpacing: "-0.01em" }}>С возвращением</h1>
          <p style={{ margin: "0 0 24px", color: "var(--ink-3)", fontSize: 13 }}>Войдите, чтобы продолжить работу со спецификациями.</p>
          <div className="field"><label className="label">Email</label><input className="input lg" type="email" placeholder="you@studio.ru" /></div>
          <div className="field"><label className="label">Пароль</label><PasswordFieldLg /></div>
          <button className="btn btn-primary" onClick={onEnter} style={{ width: "100%", height: 48, fontSize: 14, marginTop: 4 }}>Войти</button>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => setMode("reset")} style={{ color: "var(--ink-3)", fontSize: 12, padding: 4, border: "none", background: "none", cursor: "pointer" }}>Забыли пароль?</button>
          </div>
        </div>
      ) : (
        <div className="fade-in">
          <h1 className="serif" style={{ margin: "0 0 6px", fontSize: 30, letterSpacing: "-0.01em" }}>Создайте аккаунт</h1>
          <p style={{ margin: "0 0 24px", color: "var(--ink-3)", fontSize: 13 }}>Бесплатно. Первые два проекта — без ограничений.</p>
          <div className="field"><label className="label">Имя</label><input className="input lg" placeholder="Ваше имя" /></div>
          <div className="field"><label className="label">Email</label><input className="input lg" type="email" placeholder="you@studio.ru" /></div>
          <div className="field"><label className="label">Пароль</label><PasswordFieldLg /></div>
          <button className="btn btn-primary" onClick={onEnter} style={{ width: "100%", height: 48, fontSize: 14, marginTop: 4 }}>Создать аккаунт</button>
          <p style={{ margin: "16px 0 0", fontSize: 11, color: "var(--ink-3)", textAlign: "center", lineHeight: 1.5 }}>
            Регистрируясь, вы соглашаетесь с <a href="#" style={{ color: "var(--ink-2)" }}>Политикой конфиденциальности</a>.
          </p>
        </div>
      )}
    </div>
  );
}

export function Auth({ onEnter, mode, setMode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "grid", placeItems: "center", padding: "24px 16px", paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}>
      <div style={{ position: "absolute", top: 32, left: 32, display: "flex", alignItems: "center", gap: 10 }} className="auth-brand">
        <div style={{ width: 30, height: 30, borderRadius: 7, background: "var(--accent)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>S</div>
        <span style={{ fontWeight: 600, fontSize: 14 }}>SETA</span>
      </div>
      {mode === "reset" ? <ResetCard back={() => setMode("login")} /> : <AuthCard mode={mode} setMode={setMode} onEnter={onEnter} />}
    </div>
  );
}
