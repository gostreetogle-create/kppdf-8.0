═══════════════════════════════════════════════════════════════
TZ-265: Admin-страницы — Paper & Ink токен-комплаенс
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend CSS Architect

ЗАВИСИМОСТИ: TZ-261 (страницы должны компилироваться).
             Layer 3: СТРОГО 1 агент — НЕ запускать параллельно с
             TZ-264 (TZ-264 пишет spec-ы, инстанцирующие те же диалоговые
             компоненты, — тесты должны компилироваться против финальных
             компонентов, поэтому строго последовательно: TZ-265 → TZ-264);
             безопасен параллельно с TZ-263 (.agents/skills + docs) —
             НЕ параллелить с TZ-262 (тоже Layer 3: TZF-00 разрешает
             только 1 агента в Layer 3; оркестратор: TZ-262 → TZ-265).

LAYER: 3 (правка styles-массивов и template-классов в существующих
       компонентах — это edit существующих компонентов, НЕ CSS-only)

CONFLICT KEYS:
frontend/src/app/pages/admin/users-admin.page.ts;
frontend/src/app/pages/admin/roles-admin.page.ts;
frontend/src/app/pages/admin/user-form-dialog.component.ts;
frontend/src/app/pages/admin/role-form-dialog.component.ts;
frontend/src/app/pages/admin/reset-password-dialog.component.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Admin-страницы и диалоги используют классы/цвета вне дизайн-системы
   Paper & Ink (OKLCH токены, hairline, pi-focus-ring).

2. Проблемы / неточности текущего состояния (доказательства — grep
   2026-08-02):
   - `users-admin.page.ts` и `roles-admin.page.ts`: error-сообщение
     использует `text-red-600` (Tailwind-палитра, hex) вместо токена
     `text-destructive` (конвенция Paper & Ink, см. materials/products).
     Строки: users-admin «text-sm text-red-600»,
     roles-admin «text-sm text-red-600».
   - Все 3 диалога: внутри `styles:` есть hex-фолбэки
     `var(--color-muted, #7f7663)`, `var(--color-ink, #191c1d)` и т.д.
     (fallback-значения в var() допустимы, но не должны быть единственным
     источником цвета; основные цвета должны приходить из `--color-*`
     токенов).
   - В `builder-canvas.component.ts` (строки 285/386/436), `builder.page.ts`
     (540/619), `block-renderer.component.css` (576) используются
     `box-shadow` — это РАЗДЕЛЬНАЯ тема (дизайн-решение canvas:
     «бумага на столе», токен `--shadow-executive` существует в
     `styles.css` строка 92/250/438/505). В ЭТОМ TZ НЕ трогать builder —
     там нужен отдельный TZ/решение PO о легализации токена в
     paper-and-ink.md.
   - `user-form-dialog` / `role-form-dialog` / `reset-password-dialog`
     используют нативные `<input>/<select>/<label>` с кастомными
     классами `.field__input` вместо shared UI-компонентов
     (`PiInputComponent`/`PiSelectComponent`/`FormFieldComponent`).
     Миграция на shared-компоненты — ОТДЕЛЬНЫЙ TZ (большой объём);
     в этом TZ только цветовые токены.

3. Контекст (внешние зависимости, conventions, нюансы):
   - Дизайн-система: `docs/paper-and-ink.md`, палитра OKLCH в
     `frontend/src/styles.css`; классы `text-destructive`,
     `text-muted-foreground`, `hairline`, `pi-focus-ring`.
   - Запрещено: `#[hex]` цвета напрямую, `text-red-600` и др.
     Tailwind-палитры вне токенов, `bg-white`, `border-dashed`.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: В `users-admin.page.ts` и `roles-admin.page.ts` заменить
       `text-red-600` → `text-destructive` в error-сообщениях
       (2 вхождения, по одному на файл). Проверить контраст: токен
       `--color-destructive` — AA-совместим.

ШАГ 2: В 3 диалогах (`styles:` массивы) заменить хардкод-цвета на токены
       БЕЗ hex-фолбэков где это безопасно:
       - `#7f7663` (muted) → `var(--color-muted)`
       - `#191c1d` (ink) → `var(--color-ink)`
       - `#f8f9fa` (paper) → `var(--color-paper)`
       - `#d0c5af` (rule) → `var(--color-rule)`
       - `#735c00` (sunrise-warm) → `var(--color-sunrise-warm)`
       - `#b91c1c` (destructive) → `var(--color-destructive)`
       Фолбэки оставить ТОЛЬКО там, где CSS-переменная может быть не
       определена (например, в изолированном контексте) — иначе убрать.

ШАГ 3: Проверить grep-ом, что в 5 файлах admin НЕ осталось:
       `text-red-600`, прямых `#7f7663|#191c1d|#f8f9fa|#d0c5af|#735c00|#b91c1c`
       вне var()-fallback.

ШАГ 4: `cd frontend && pnpm exec ng build --configuration=development`
       — 0 ошибок; `pnpm exec tsc -p tsconfig.app.json --noEmit` — exit 0.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/admin/users-admin.page.ts        [text-red-600 → text-destructive]
- frontend/src/app/pages/admin/roles-admin.page.ts        [text-red-600 → text-destructive]
- frontend/src/app/pages/admin/user-form-dialog.component.ts    [hex → токены в styles]
- frontend/src/app/pages/admin/role-form-dialog.component.ts    [hex → токены в styles]
- frontend/src/app/pages/admin/reset-password-dialog.component.ts [hex → токены в styles]

НЕ ИЗМЕНЯТЬ (явно перечислите):
- frontend/src/app/pages/doc-constructor/builder/** [box-shadow — отдельный TZ/решение PO]
- frontend/src/styles.css [токены уже корректны]
- backend/**, app.routes.ts (TZ-262), .agents/skills/** (TZ-263)
- progress.md, ARCHITECTURE.md, _templates/*

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. grep `text-red-600` в 5 admin-файлах → 0 совпадений.
2. grep хардкод-hex (`#7f7663|#191c1d|#f8f9fa|#d0c5af|#735c00|#b91c1c`)
   вне `var(..., fallback)` в 5 admin-файлах → 0 совпадений.
3. Визуально: error-сообщения на /admin/users и /admin/roles —
   цвет destructive (не красный Tailwind-600), контраст читаемый
   (проверка вручную, MANUAL_BROWSER_CHECK при доступном фронтенде).
4. `ng build --configuration=development` exit 0; tsc exit 0.
5. Существующие тесты admin (users-admin.page.spec.ts 5/5) — PASS.

═══════════════════════════════════════════════════════════════
TZF-00: ОБЯЗАТЕЛЬНАЯ ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

После завершения работы применить TZF-00 (_templates/TZF-00.txt).
Выполняет агент-исполнитель ПОСЛЕ TZ-265.
