# ezhome-spec — Спецификации интерьера

Веб-приложение для дизайнеров: создание спецификаций мебели и света,
ссылки для клиентов, экспорт в PDF.

## Быстрый старт на Railway

### Шаг 1 — Загрузи код на GitHub

```bash
# В терминале (Mac: Приложения → Терминал, Win: PowerShell)
cd путь/до/папки/ezhome-spec
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ТВО_ИМЯ/ezhome-spec.git
git push -u origin main
```

### Шаг 2 — Задеплой на Railway

1. Открой **railway.app** → войди через GitHub
2. Нажми **New Project** → **Deploy from GitHub repo**
3. Выбери репозиторий `ezhome-spec`
4. Railway автоматически определит Node.js и запустит приложение
5. Перейди в **Settings** → **Networking** → **Generate Domain**
6. Готово — приложение работает по адресу вида `ezhome-spec.up.railway.app`

### Шаг 3 (опционально) — Свой домен

В настройках Railway → Custom Domain → введи `app.ezhome.design`
В DNS-настройках домена добавь CNAME-запись:
- Имя: `app`
- Значение: домен из Railway

## Переменные окружения (Railway → Variables)

| Переменная | Описание | Пример |
|---|---|---|
| `SESSION_SECRET` | Секрет сессий (придумай строку) | `my-secret-string-2024` |
| `DB_PATH` | Путь к базе данных | `/data/data.db` |

## Функции

- Авторизация дизайнера (email + пароль)
- Список проектов с поиском и фильтрами
- Редактор спецификаций (мебель, свет по комнатам)
- Итоги по каждой комнате + общий итог
- Дублирование проектов
- Ссылка для клиента (публичная страница)
- Экспорт в PDF через печать браузера
- Редактирование и удаление позиций
- Настройки профиля (имя, телефон, сайт)
