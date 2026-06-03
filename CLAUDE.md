# CLAUDE.md

<!-- ДЕПЛОЙ: git push origin main → Amvera подхватывает автоматически и пересобирает seta-client -->

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
users       — id, email, password (bcrypt), name, phone, site, logo (base64), created_at, last_active
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

### Сессия 2026-05-25 — онбординг: разделение мобильного и десктопного флага

**Сделано:**
1. **`App.jsx`** — хелпер `tourDoneKey()` возвращает разный ключ в зависимости от ширины экрана:
   - мобильный (≤768px): `seta_tour_done_mobile`
   - десктопный: `seta_tour_done_desktop`
   - все три вхождения `seta_tour_done` заменены на `tourDoneKey()`
2. **`Screens.jsx`** — обновлён текст мобильного онбординг-типса:
   > «Вы в мобильной версии SETA. Для первого знакомства мы создали тестовый проект с товарами. Все функции приложения доступны на компьютере — зайдите в аккаунт с ПК. Приятной работы.»

---

### Сессия 2026-05-25 — трекинг активности пользователей

**Сделано:**
1. **`last_active` колонка** — миграция `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP` в `initDB()`
2. **Middleware `auth`** (`server.js:193`) — fire-and-forget `UPDATE users SET last_active = NOW() WHERE id = $1` при каждом аутентифицированном запросе; не блокирует ответ
3. **`GET /api/admin/users`** — добавлен `u.last_active` в SELECT
4. **`Screens.jsx:502`** — колонка «Последняя активность» в таблице пользователей показывает реальную дату (`toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })`); `null` → `—`

---

### Сессия 2026-05-21 — бэкенд-фиксы после релиза

**Исправлено:**
1. **Логирование ошибок email** (`sendEmailTo`):
   - При отсутствии `RESEND_API_KEY` — явный `console.error` (раньше тихий `return`)
   - При HTTP-ошибке Resend (4xx/5xx) — `console.error` со статусом и телом + `throw` (раньше молча игнорировалось)
   - Исключения теперь пробрасываются наружу; все три вызова обёрнуты в `try/catch`
2. **`from` адрес** в письмах изменён с `onboarding@resend.dev` → `noreply@useseta.com`
3. **Уведомление о регистрации**: после создания аккаунта отправляется письмо на `oralkin@gmail.com` с именем, email и датой пользователя
4. **Удаление пользователя в админке** (`DELETE /api/admin/users/:id`):
   - Добавлен `DELETE FROM magic_tokens WHERE user_id=$1` перед удалением из `users` — без него запрос падал из-за FK-constraint (`magic_tokens.user_id REFERENCES users(id)`)
   - Весь роут обёрнут в `try/catch`, возвращает `500 JSON` при ошибке
   - Фронт теперь парсит ответ и показывает `alert` при ошибке
5. **Количество проектов в админке** (`GET /api/admin/users`):
   - Запрос не джойнил таблицу `projects` и возвращал `feedback_count` вместо `project_count`
   - Добавлен `LEFT JOIN projects p ON p.user_id = u.id AND p.status != 'archived'` с `COUNT(DISTINCT p.id) AS project_count`
6. **Баннер**: факт закрытия сохраняется в `localStorage` (`seta_banner_closed` = текст баннера). При перезагрузке страницы закрытый баннер не показывается снова. Новый баннер с другим текстом появится у всех.

---

### Сессия 2026-06-04 — синхронизация счётчика товаров и фикс поля Кол-во

**Исправлено:**

1. **`ClientPage.jsx` — счётчик позиций** (коммит `b852f7d`):
   - Добавлена переменная `totalItems = categories.reduce((s, c) => s + c.products.length, 0)` — формула идентична `Editor.jsx:53`
   - Шапка публичной страницы теперь показывает `ClientName · N позиций в M комнатах` с правильным склонением — как в редакторе дизайнера (`Editor.jsx:174`)
   - Исправлено склонение счётчика по комнате: было жёсткое `позиций`, стало `позиция / позиции / позиций`
   - Исправлен баг с `fontSize: isMobile ? 22 : 13` в блоке имени клиента (значения были перепутаны)

2. **`Editor.jsx` — поле Кол-во** (коммит `da21765`):
   - Баг: `parseInt('') || 1` немедленно возвращало `1` при попытке очистить поле — невозможно было ввести новое число
   - Фикс: `onChange` теперь разрешает пустую строку в черновике (`e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1)`)
   - Нормализация до `≥ 1` происходит только в `handleSave` через `Math.max(1, parseInt(draft.qty) || 1)`

---

### Сессия 2026-05-30 — деплой фронтенда на Amvera + доступность для РФ без VPN

**Контекст:** Перенос фронтенда с Railway на отдельный проект `seta-client` на Amvera. Бэкенд (Railway + БД) не трогали.

**Инфраструктура:**
- `app.useseta.com` → Amvera `seta-client` (Node.js, порт 3000) — фронтенд
- `api.useseta.com` → Amvera `seta-backend` (Express, порт 8080) — бэкенд
- Оба сервиса на IP `158.160.116.199` (Yandex Cloud), Amvera управляет роутингом по hostname
- **Cloudflare убран из цепочки для `app.useseta.com`** — переключён в "DNS only" в Cloudflare. Причина: Cloudflare блокировал загрузку JS-бандла для российских пользователей

**Файлы деплоя (`app/`):**

`Dockerfile.amvera` — multi-stage: build (node:20-alpine + npm ci + vite build) → serve (node:20-alpine + serve-client.js):
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY serve-client.js .
EXPOSE 3000
CMD ["node", "serve-client.js"]
```

`amvera.yaml`:
```yaml
meta:
  environment: docker
  toolchain:
    name: docker
    version: latest
build:
  dockerfile: Dockerfile.amvera
run:
  containerPort: 3000
```

`serve-client.js` — zero-dependency Node.js HTTP сервер:
- Статика из `dist/` с SPA-fallback на `index.html`
- Прозрачный прокси `/api/*` и `/p/*` → `api.useseta.com:443` (HTTPS)
- `Cache-Control: no-cache` для HTML, `immutable` для хешированных ассетов
- Причина прокси: устранить cross-origin зависимость (браузер всегда делает запросы на тот же домен)

**Изменения клиентского кода:**

1. **`client/src/main.jsx`** — убран Google Fonts `@import`, добавлены локальные шрифты через `@fontsource` (Inter, PT Serif, JetBrains Mono). Причина: Google Fonts заблокирован у части РФ-провайдеров.

2. **`client/src/index.css`** — удалён `@import url('https://fonts.googleapis.com/...')` из первой строки.

3. **`client/package.json`** — добавлены зависимости: `@fontsource/inter`, `@fontsource/pt-serif`, `@fontsource/jetbrains-mono`.

4. **`client/src/App.jsx`** — `useEffect` для проверки сессии использует `AbortController` с таймаутом 5 секунд + `API_BASE = import.meta.env.VITE_API_URL || ''` (пустая строка = относительные URL через прокси).

5. **`client/index.html`** — добавлен HTML fallback-лоадер:
   - `<div id="html-loader">` с фирменным фоном `#FAF8F5` виден до монтирования React
   - Если React не смонтировался за 12 секунд → показывает кнопку «Обновить»
   - `window.__reactMounted()` — вызывается из `App.jsx` в `useEffect([], [])`, убирает оверлей

**Диагностика белого экрана (хронология):**
- Контейнер не стартовал → заменили `serve` на `serve-client.js`
- Cross-origin API → добавили прокси в serve-client.js, убрали VITE_API_URL
- Google Fonts CDN → заменили на @fontsource
- Старый кэш браузера → Cache-Control: no-cache для index.html
- JS не загружался за 12с → **Cloudflare блокировал/не доставлял JS-бандл российским пользователям** → убрали Cloudflare proxy для `app.useseta.com`

**Важно для следующих сессий:**
- Railway **не трогать** — там только PostgreSQL (через DATABASE_URL в бэкенде на Amvera)
- `app.useseta.com` в Cloudflare = DNS only (серое облако). Если кто-то включит Proxy — РФ-пользователи снова сломаются
- `api.useseta.com` тоже DNS only — так было изначально и работало

---

### Сессия 2026-06-01 (продолжение) — подключение парсера к UI, подсветка незаполненных полей

**Контекст:** Продолжение сессии по парсеру. Layer 1 завершён, подключён к фронтенду, Browserbase отключён.

**Изменения в `src/server.js`:**

1. **`extractFromJsonLd`** — добавлено извлечение `color` (`item.color`) и `dimensions` (из `item.size` или `item.width/height/depth`)
2. **`extractFromMicrodata`** — добавлено извлечение `color` (`md.color || md.colour`) и `dimensions` (`md.size || md.width`)
3. **Мерж** — добавлены поля `color` и `dimensions` в объект merged
4. **`extractColorDimensions(html)`** — новая функция, извлекает цвет и размеры из HTML-характеристик четырьмя паттернами:
   - Смежные теги с одинаковым классом (Bitrix/zvet.ru: `detail-tabs-content__abs`)
   - `<tr><td>ключ</td><td>значение</td></tr>`
   - `<dt>ключ</dt><dd>значение</dd>`
   - Regex для размеров вида "228 × 103 × 94 см"
   - Фильтр: размеры без цифр отбрасываются (напр. "Маленькие")
5. **`fetchHtml`** — детекция кодировки из `Content-Type` и `<meta charset>`, декодирование через `TextDecoder` (исправлены кракозябры на windows-1251 сайтах — cosmorelax.ru)
6. **`cleanName`** — новая функция, чистит маркетинговые префиксы/суффиксы: "Купить", "Заказать", "в Москве", "с доставкой" и т.д.
7. **`extractFromNuxt`** — новый метод: цены из `window.__NUXT__` (Nuxt.js devalue: `"81300.00"` в аргументах IIFE). Закрыл dantonehome.ru
8. **`extractFromDataLayer`** — новый метод: GTM Enhanced Ecommerce (`"event":"productDetail"` и `"event":"view_item"`)
9. **Диагностический `parse-test`** — добавлены поля `priceContext`, `windowVars`, `imgTags`

**Изменения в `client/src/screens/Editor.jsx`:**

1. Удалён `PARSER_URL = 'https://web-production-b181.up.railway.app'` (Browserbase/Railway)
2. Кнопка «Заполнить» теперь вызывает `GET /api/parse?url=` (наш бэкенд)
3. Маппинг полей из нового API: `name`, `price`, `imageUrl→photoUrl`, `dimensions`, `color`
4. **Бренд** — автоматически заполняется из hostname URL (`www.askona.ru` → `Askona`), только если поле пустое или содержит дефолтное "Бренд"
5. **`parseHints` state** — после парсинга подсвечивает янтарной рамкой (`#E8A838`) и текстом "Не найдено — заполните вручную" поля которые не заполнились: `name`, `price`, `photoUrl`, `dimensions`, `color`
6. Подсветка снимается при ручном вводе в поле
7. Подсветка `dimensions` срабатывает также если значение не содержит цифр

**Итоговое покрытие парсера (11 сайтов из 14 работают без браузера):**

| Сайт | name | price | img | color | dimensions |
|---|---|---|---|---|---|
| askona.ru | ✅ | ✅ | ✅ | ❌ JS | ❌ JS |
| zvet.ru | ✅ | ✅ | ✅ | ✅ | ✅ |
| dantonehome.ru | ✅ | ✅ | ✅ | ❌ | ✅ |
| inmyroom.ru | ✅ | ✅ | ✅ | — | — |
| roomsee.ru | ✅ | ✅ | ✅ | — | — |
| thefields.ru | ✅ | ✅ | ✅ | — | — |
| dg-home.ru | ✅ | ✅ | ✅ | — | — |
| cosmorelax.ru | ✅ | ✅ | ✅ | — | — |
| imodern.ru | ✅ | ✅ | ✅ | — | — |
| maytoni.ru | ✅ | ✅ | ✅ | — | — |
| divan.ru | ❌ IP-блок | ❌ | ❌ | ❌ | ❌ |
| hoff.ru | ❌ IP-блок | ❌ | ❌ | ❌ | ❌ |
| laredoute.ru | ❌ 403 | ❌ | ❌ | ❌ | ❌ |

**Что отключено:**
- Railway-сервис с Browserbase-парсером — удалён
- Платный тариф Browserbase — отменён
- Экономия: $20/мес

---

### Сессия 2026-05-31 — фикс VITE_API_URL, health check, баг "Забыли пароль?" на мобильном

**Сделано:**
1. **`Dockerfile.amvera`** — добавлена строка `ARG VITE_API_URL=https://api.useseta.com` перед `RUN npm run build`. Причина: Amvera не передаёт build-time переменные автоматически, без этого `VITE_API_URL` был пустым и API-запросы уходили на `app.useseta.com/api/...` вместо `api.useseta.com/api/...`
2. **`src/server.js`** — добавлен эндпоинт `GET /health` → 200 для Amvera health check
3. **`serve-client.js`** — добавлен обработчик `GET /health` → 200 для Amvera health check
4. **`client/src/screens/Screens.jsx`** — баг: на мобильном клик "Забыли пароль?" показывал "Создайте аккаунт" вместо формы восстановления. Причина: десктоп проверял `mode === 'reset'` до рендера, мобильная ветка — нет. Исправлено добавлением `mode === 'reset' ? <ResetCard> : <>...</>` в мобильной ветке `Auth`

---

### Сессия 2026-06-01 — парсер товаров Layer 1 (HTTP fetch)

**Контекст:** Замена платного Browserbase ($20/мес) на бесплатный двухслойный парсер. Сессия — реализация и отладка Слоя 1 (HTTP fetch без браузера).

**Добавлено в `src/server.js`:**

#### Роут `GET /api/parse?url=` (требует авторизации)
Основной продакшн-роут. Возвращает:
```json
{ "ok": true, "name": "...", "price": 12345, "imageUrl": "...", "currency": "RUB", "source": "json-ld", "needsBrowser": false }
```
`needsBrowser: true` — если имя или цена не найдены → сигнал для будущего Слоя 2 (Playwright).

#### Пайплайн — 6 методов, результаты мержатся (не "первый выигрывает"):
1. **`extractFromJsonLd`** — `<script type="application/ld+json">` с `@type: Product`
2. **`extractFromOg`** — `og:title`, `og:image`, `og:price:amount` / `product:price:amount`
3. **`extractFromMicrodata`** — `itemprop` только внутри `itemtype="...schema.org/Product"` (исправлен баг: раньше хватал название магазина)
4. **`extractFromNuxt`** — цены из `window.__NUXT__` (Nuxt.js devalue формат: `"81300.00"` в аргументах IIFE)
5. **`extractFromDataLayer`** — GTM Enhanced Ecommerce: `"event":"productDetail"` и `"event":"view_item"`
6. **`extractFromHtml`** — h1 + Bitrix-классы (`detail-price__item current`, `price_value`, `data-price`) + `itemprop="image"` на `<img src>`

#### Вспомогательные улучшения:
- **`fetchHtml`** — определение кодировки из `Content-Type` заголовка и `<meta charset>`, декодирование через `TextDecoder` (исправлены кракозябры на windows-1251 сайтах)
- **`cleanName`** — чистит маркетинговые префиксы/суффиксы: "Купить", "Заказать", "в Москве", "с доставкой" и т.д.

#### Диагностический роут `GET /api/parse-test` (без авторизации, TEMP):
Расширен дополнительными полями для отладки: `priceContext`, `windowVars`, `imgTags`, `microdata`, `metaTags`, `initialStatePreview`, `scriptDataPreview`.

**Результаты тестирования (11 сайтов):**

| Сайт | Имя | Цена | Фото | Метод | needsBrowser |
|---|---|---|---|---|---|
| askona.ru | ✅ | ✅ | ✅ | json-ld | false |
| zvet.ru | ✅ | ✅ | ✅ | microdata+html | false |
| dantonehome.ru | ✅ | ✅ | ✅ | og+nuxt | false |
| inmyroom.ru | ✅ | ✅ | ✅ | json-ld | false |
| roomsee.ru | ✅ | ✅ | ✅ | og | false |
| thefields.ru | ✅ | ✅ | ✅ | og | false |
| dg-home.ru | ✅ | ✅ | ✅ | og | false |
| cosmorelax.ru | ✅ | ✅ | ✅ | json-ld | false |
| imodern.ru | ✅ | ✅ | ✅ | og | false |
| maytoni.ru | ✅ | ✅ | ✅ | json-ld | false |
| divan.ru | ❌ | ❌ | ❌ | — | true (IP-блок) |
| hoff.ru | ❌ | ❌ | ❌ | — | true (IP-блок) |
| laredoute.ru | ❌ | ❌ | ❌ | — | true (403) |

**Важные баги исправлены в процессе:**
- Microdata хватала название магазина вместо товара → ограничена scope `itemtype=Product`
- Пайплайн останавливался на первом результате с именем, даже если цена null → заменён на мерж лучшего из всех методов
- Последний резервный паттерн `первое ₽ на странице` давал ложные срабатывания (баннер "Новинки кухонь от 889 000 ₽") → удалён
- Цена dantonehome.ru (Nuxt.js) не находилась — данные вшиты в `window.__NUXT__` как `"81300.00"` → добавлен `extractFromNuxt`

**Что не решено (нужен Слой 2 или прокси):**
- divan.ru — возвращает 404 с IP Amvera (IP-блокировка)
- hoff.ru — возвращает 401 (Cloudflare Bot Management)
- laredoute.ru — возвращает 403
- dantonehome.ru — цена найдена через Nuxt, но в общем случае Nuxt-цены могут быть ненадёжны

---

### Сессия 2026-05-26 — иконки соцсетей в футере лендинга

**Сделано:**
1. **`landing page/index.html`** — в футер добавлен блок `.footer-social` между логотипом и копирайтом
2. Иконки SVG (Instagram, LinkedIn), контурные, `currentColor` — наследуют цвет `var(--black)` из `.footer-copy`
3. Ссылки: Instagram → `https://www.instagram.com/setaapps`, LinkedIn → `https://www.linkedin.com/company/useseta`; `target="_blank" rel="noopener"`
4. Добавлены стили `.footer-social` и `.footer-social a` с `opacity: 0.8` → `1` при наведении
5. Деплой — вручную через Cloudflare Pages Dashboard (wrangler требует Node ≥20, в системе v18)
