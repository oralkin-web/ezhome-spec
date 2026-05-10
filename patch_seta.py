import re

BASE = '/Users/ora/Downloads/ezhome-spec'

# ── server.js ──────────────────────────────────────────────
with open(f'{BASE}/src/server.js', 'r') as f:
    s = f.read()

s = s.replace(
    "from: 'ezhome <feedback@ezhome.design>'",
    "from: 'SETA <feedback@useseta.com>'"
)
s = s.replace(
    "process.env.APP_URL || 'https://app.ezhome.design'",
    "process.env.APP_URL || 'https://useseta.com'"
)
s = s.replace(
    "process.env.SESSION_SECRET || 'ezhome-secret-2024'",
    "process.env.SESSION_SECRET || 'seta-secret-2024'"
)
s = s.replace(
    "process.env.INVITE_TOKEN || 'ezhome-beta-2024'",
    "process.env.INVITE_TOKEN || 'seta-beta-2024'"
)
s = s.replace(
    "'Новый пароль — ezhome.design'",
    "'Новый пароль — useseta.com'"
)
s = s.replace(
    'href="https://app.ezhome.design">app.ezhome.design</a>',
    'href="https://useseta.com">useseta.com</a>'
)
s = s.replace(
    "console.log(`ezhome-spec running on port ${PORT}`)",
    "console.log(`seta running on port ${PORT}`)"
)

with open(f'{BASE}/src/server.js', 'w') as f:
    f.write(s)

print('server.js patched ✓')

# ── index.html ─────────────────────────────────────────────
with open(f'{BASE}/public/index.html', 'r') as f:
    h = f.read()

h = h.replace(
    '<title>ezhome · Спецификации</title>',
    '<title>SETA · Спецификации</title>'
)
h = h.replace(
    '<h1>ezhome.design</h1>',
    '<h1>useseta.com</h1>'
)
h = h.replace(
    'placeholder="ezhome.design"',
    'placeholder="useseta.com"'
)
h = h.replace(
    '<span class="topbar-name">ezhome.design</span>',
    '<span class="topbar-name">SETA</span>'
)
# Лого-плейсхолдер "ez" → "ST"
h = h.replace(
    '>ez</div>\n      <div class="auth-logo-text">',
    '>ST</div>\n      <div class="auth-logo-text">'
)
# Кнопка лого в настройках
h = h.replace(
    '>ez</div>\n          <div',
    '>ST</div>\n          <div'
)

with open(f'{BASE}/public/index.html', 'w') as f:
    f.write(h)

print('index.html patched ✓')
print('\nГотово! Теперь: git add . && git commit -m "Rebrand: ezhome → SETA" && git push')
