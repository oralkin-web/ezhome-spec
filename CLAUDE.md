# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Что такое SETA

Веб-приложение для дизайнеров интерьера: создание спецификаций мебели и света, публичные ссылки для клиентов, экспорт в PDF. Закрытая бета — вход только по инвайт-токену. Продакшн: **useseta.com**

---

## Команды

### Запуск в разработке

```bash
# Бэкенд (Express, порт 8080)
npm start

# Фронтенд (React + Vite, порт 5173, с прокси к бэкенду)
cd client && npm run dev

# Сборка фронтенда в ../public/ (Railway запускает это перед деплоем)
cd client && npm run build

# Линтинг фронтенда
cd client && npm run lint
```

> В разработке фронтенд (5173) проксирует API-запросы на бэкенд (8080) через `vite.config.js`.  
> В продакшне Express сам отдаёт собранный `public/index.html`.

### Переменные окружения

Скопировать `.env.example` → `.env` и заполнить. Обязательные для запуска:

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Минимум 32 символа. В production — обязателен: сервер не стартует без него |
| `INVITE_TOKEN` | Должен совпадать с токеном в URL на лендинге (сейчас `seta-beta-2026`) |
| `RESEND_API_KEY` | API Resend для email. Без него письма молча не отправляются |
| `APP_URL` | `https://app.useseta.com` — используется в ссылках в письмах |
| `NODE_ENV` | `production` на сервере |

---

## Архитектура

### Структура проекта

```
app/
├── src/server.js        # Весь бэкенд (Express, ~800 строк)
├── client/src/          # React + Vite фронтенд
│   ├── App.jsx          # Корень: роутинг, сессия, загрузка данных
│   ├── screens/
│   │   ├── Dashboard.jsx    # Список проектов
│   │   ├── Editor.jsx       # Редактор спецификации
│   │   ├── ClientPage.jsx   # Публичная страница для клиента
│   │   ├── Screens.jsx      # Auth, Settings, Feedback, Admin, Onboarding
│   │   └── shared.jsx       # Icon, Sidebar — переиспользуемые компоненты
│   └── data.js          # Не используется (мёртвый код, tech debt)
├── public/              # Собранный фронтенд (git-ignored, генерируется vite build)
├── backups/             # SQL-дампы БД (git-ignored)
├── .env.example         # Шаблон переменных окружения
└── nixpacks.toml        # Railway: точка входа = node src/server.js
```

### Бэкенд (src/server.js)

**Один файл**, Express + PostgreSQL (pg). Никаких ORM — только параметризованные SQL-запросы.

Ключевые блоки:
- **Rate limiting** (строки ~11–32): in-memory объект `loginAttempts`. Сбрасывается при перезагрузке сервера — это известное ограничение.
- **Валидация** (строки ~51–80): хелперы `validateEmail`, `validatePassword`, `validateLength`, `validateOptionalLength` — применяются во всех мутирующих роутах.
- **`initDB()`**: создаёт таблицы при старте через `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` для миграций. Миграции идемпотентны.
- **`buildClientPage()`**: server-side рендер HTML для `/p/:slug` — публичная страница клиента без React. Все данные экранируются через `esc()`.

**Роуты:**

| Путь | Описание |
|---|---|
| `GET /invite/:token` | Проверяет инвайт-токен, отдаёт SPA |
| `POST /api/register` | Регистрация с токеном; создаёт демо-проект |
| `POST /api/login` | Вход; rate limit по IP |
| `GET /api/me` | Текущий пользователь |
| `GET/POST /api/projects` | Список и создание проектов |
| `PUT /api/projects/:id/items` | **Основной**: синхронизирует все позиции проекта одной транзакцией (DELETE + bulk INSERT) |
| `GET /p/:slug` | Публичная страница клиента (server-rendered HTML) |
| `GET /api/public/projects/:id` | То же, но JSON для React ClientPage |
| `POST /api/forgot` + `GET /api/magic` | Magic link вход (токен 32 байта, TTL 30 мин) |
| `GET/PUT /api/admin/*` | Только для ADMIN_EMAIL (`oralkin@gmail.com`) |

**Авторизация:** middleware `auth` (проверяет `req.session.userId`) и `adminAuth` (дополнительно проверяет email в БД).

**Сессии:** хранятся в PostgreSQL (`connect-pg-simple`, таблица `session`).

### Фронтенд (client/src/)

**App.jsx** — центральный файл. Содержит:
- Всё состояние проектов (`projects`, `user`)
- Все API-мутации (createProject, deleteProject, archiveProject и т.д.)
- `mapProject()` и `mapCategories()` — нормализация данных из БД в формат фронтенда
- `syncToDB()` — при каждом изменении категорий вызывает `PUT /api/projects/:id/items` (полная перезапись)

**Модель данных фронтенда:**
```
project: { id, name, client, updatedAt, archived, cover: { hue }, slug, note }
category: { id, name, products: [...] }
product: { id, name, brand, comment, url, photoUrl, dimensions, color, qty, price }
```

**Соответствие фронт → БД:**
- `product.brand` → `items.cmt`
- `product.comment` → `items.note`
- `product.photoUrl` → `items.img`
- `product.dimensions` → `items.size`
- `project.note` → `projects.comment`

### Лендинг (../landing page/)

Полностью статический HTML. Основной файл: `index.html`. CTA-кнопка ведёт на `/invite/seta-beta-2026` — токен должен совпадать с `INVITE_TOKEN` в env.

---

## Схема БД

```sql
users       — id, email, password (bcrypt), name, phone, site, logo (base64), created_at
projects    — id, user_id, name, client, slug (unique), status, comment, cover_hue, created_at, updated_at
items       — id, project_id, user_id, room, name, url, img, size, color, price, qty, cmt, note, sort_order
feedback    — id, user_id, text, created_at
settings    — key, value  (banner_active, banner_text)
magic_tokens— token, user_id, expires_at, used
session     — (управляется connect-pg-simple)
```

---

## История изменений

### Сессия 2026-05-21 — аудит и фиксы перед релизом

**Исправлено:**
1. `INVITE_TOKEN` дефолт изменён с `seta-beta-2024` → `seta-beta-2026` (синхронизация с лендингом)
2. Добавлена проверка при старте: если `NODE_ENV=production` и `SESSION_SECRET` не задан — сервер падает с ошибкой вместо запуска с дефолтным секретом
3. Удалена мёртвая функция `sendEmail()` (дублировала `sendEmailTo()`)
4. Добавлены хелперы валидации (`validateEmail`, `validatePassword`, `validateLength`, `validateOptionalLength`)
5. Серверная валидация добавлена в: `POST /api/register`, `PUT /api/me`, `POST /api/feedback`, `POST /api/projects`, `POST + PUT /api/items`
6. Создан `.env.example` с документацией всех переменных
7. `backups/` добавлен в `.gitignore`

**Известные ограничения (не исправлены, низкий приоритет):**
- Rate limiting в памяти (`loginAttempts`) — сбрасывается при перезагрузке
- Нет индексов на `users.email`, `projects.user_id`, `items.project_id`
- `client/src/data.js` — неиспользуемый mock (tech debt)

### Сессия 2026-05-21 — UI-полировка перед релизом

**Исправлено:**
1. Убрана подсказка "Минимум 8 символов" под полем пароля — в мобильной (`MobileRegisterForm`) и десктопной (`AuthCard`) формах регистрации. Ошибка по-прежнему показывается, когда она есть.
2. Убран заголовок "Архив" в мобильной версии Dashboard — на мобильном теперь отображается только "Мои проекты"; в разделе Архива заголовок отсутствует.
3. Логотип SETA кликабелен во всех мобильных топбарах (Dashboard, Settings, Feedback) — `onClick={() => onNav("projects")}`.
4. Кнопка закрытия мобильного меню (×) перенесена из панели меню в оверлей: `position: absolute, top: 14, right: 14` — совпадает с позицией гамбургера. Цвет изменён с `var(--ink-3)` на `var(--ink)` (чёрный).
5. Убраны лейблы-надписи над заголовками разделов:
   - "Аккаунт" — в Settings (`Screens.jsx`)
   - "Поддержка" — в Feedback (`Screens.jsx`)
   - "Рабочее пространство" — в Dashboard (`Dashboard.jsx`)
6. Убрана абсолютно-позиционированная ссылка "Политика конфиденциальности" в нижней части десктопной страницы Auth (дублировалась; ссылка внутри формы оставлена).
