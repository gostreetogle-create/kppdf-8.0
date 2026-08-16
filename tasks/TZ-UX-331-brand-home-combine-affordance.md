# TZ-UX-331: Бренд KPPDF → явная кнопка «домой» (Комбайн)

РОЛЬ АГЕНТА: Frontend UI Engineer (app shell)

ЗАВИСИМОСТИ: Нет (SWEEP-401 / dashboard.page.md уже канон: `/` → `/dashboard` = Комбайн)

LAYER: 3

CONFLICT KEYS: frontend/src/app/layout/app-layout.component.ts ; frontend/src/app/layout/app-layout.component.spec.ts ; docs/pages/dashboard.page.md ; docs/pages/page-chrome.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/agent-checklists/TZ-UX-331.md

PAGES: / ; /dashboard ; (app shell)
PAGE_DOCS: dashboard.page.md ; page-chrome.md

```text
Проверено: app-layout.component.ts ~330–338 (<a routerLink="/" aria-label="На главную">
  + plain text «KPPDF · 8.0»); app.routes `/` → dashboard; dashboard.page.md §Навигация;
  deals entryPath = /proposals/create (не Комбайн); deals-group-chips «Комбайн» только
  внутри TOC Сделок; tokens --color-sunrise-warm / gold-* в styles.css.
Loose wording PO «КПД / КППД восемь» → бренд «KPPDF · 8.0» в shell.
```

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Комбайн заказов = `/dashboard` (UI title «Комбайн заказов»). Редирект `/` → туда же.

2. В шапке слева уже есть ссылка на `/`, но она **выглядит как декоративный заголовок**,
   не как кнопка: чёрный квадрат 10×10 + жирный текст без фона/бордера/hover-chip.
   PO теряется: «куда жать, чтобы вернуться на комбайн».

3. Топ-кнопка «Сделки» ведёт на `/proposals/create` (Создать КП) — это правильно для
   entry раздела; Комбайн не должен подменять entry. Chip «Комбайн» есть только в
   dark TOC на страницах Сделок — с чужого раздела его не видно.

4. Smell: важный home-путь есть, affordance нет. Нужен **видимый кликабельный бренд**,
   не второй огромный CTA на самой доске.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Сделать бренд визуально кнопкой (home)

В `app-layout.component.ts` шаблон левого `<a routerLink="/">`:

- Сохранить `routerLink="/"` (редирект на Комбайн уже в routes).
- Оформить как компактный chip в языке топ-навигации (не чужой UI):
  - `rounded-sm` + `hairline` + мягкая заливка (`bg-sunrise-soft` / soft gold);
  - hover чуть теплее (`hover:bg-sunrise-warm/20` или эквивалент существующих tokens);
  - `pi-focus-ring`; `px-2 py-1` / `h-10` вровень с nav-entry по высоте, без раздувания шапки;
  - квадрат-маркер: **золотой** (`bg-sunrise-warm`), не чёрный `bg-ink`;
  - текст: `font-display font-bold`; допустимо лёгкий `text-ink` + акцент на маркере
    (не gold-on-white без контраста; light **и** dark читаемы).
- `aria-label` и `title`: **«Комбайн заказов — главная»** (не только «На главную»).
- `data-test="nav-brand-home"`.
- Не менять текст бренда на длинный «Комбайн…» в шапке — остаётся **«KPPDF · 8.0»**;
  смысл home — в виде кнопки + aria/title.

ШАГ 2: Тест shell

В `app-layout.component.spec.ts` (или существующий layout/nav spec):

- Есть `a[data-test="nav-brand-home"]` с `routerLink` `/` (или href `/`).
- Accessible name / aria-label содержит «Комбайн».
- Не ломать существующие nav-entry / deals highlight specs.

ШАГ 3: Канон docs

- `docs/pages/dashboard.page.md` §Навигация: явно «бренд KPPDF в шапке = кнопка домой → Комбайн».
- `docs/pages/page-chrome.md`: короткий абзац «Brand home» (chip + aria).
- `docs/pages/PAGE-TZ-INDEX.md`: строка shell / dashboard → **UX-331**.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- `frontend/src/app/layout/app-layout.component.ts` — бренд-chip
- `frontend/src/app/layout/app-layout.component.spec.ts` — assert home affordance
- `docs/pages/dashboard.page.md` — навигация
- `docs/pages/page-chrome.md` — brand home
- `docs/pages/PAGE-TZ-INDEX.md` — индекс
- `docs/agent-checklists/TZ-UX-331.md` — checklist

НЕ ИЗМЕНЯТЬ:
- `deals-group-chips.ts` / entryPath Сделок (`/proposals/create`)
- `dashboard.page.ts` логика канбана / API
- backend/**
- Токены палитры в `styles.css` (только использовать существующие sunrise/gold)
- Не добавлять вторую большую кнопку «Комбайн» внутрь тела `/dashboard` (шум на доске)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. С любой авторизованной страницы клик по бренду слева ведёт на Комбайн (`/` → `/dashboard`).
2. Бренд визуально отличается от «просто текст»: фон/бордер/золотой маркер; hover/focus заметны.
3. Light и dark: контраст текста и маркера читаемы (не бледный gold-on-white).
4. `aria-label` / title говорят про Комбайн / главную; `data-test="nav-brand-home"`.
5. Сделки entry и TOC chips без регрессии.
6. Gates:
   ```text
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- app-layout.component.spec
   ```
   (если файл spec другой для layout — ближайший focused layout/nav suite + тот же tsc).

known_limitation: отдельный leaf «Комбайн» в топ-меню Сделок не добавляем в этом TZ;
  chip TOC остаётся внутри раздела. Successor только если PO снова потеряет вход
  уже после бренда-кнопки.

Финализация: root `tasks/_archive/YYYY-MM/` + checklist + lock по `GEMINI.md`.
Archive после Cursor/PO PASS. Перед archive — `## Executor report (auto)` в checklist.
