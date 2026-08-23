ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: freebuff-roi-521
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: N/A (docs + CSS utility, forms.page.spec 1/1 regression PASS)
  - lint: N/A (docs + CSS, no TS logic changed)
  - checklist: ADDED
  - progress.md: N/A (docs-only entry; _NOW.md will reflect)
  - status synchronization: PASS

═══════════════════════════════════════════════════════════════
TZ-UI-ROI-521.done — Native `<select>` = официальный Paper & Ink fallback
═══════════════════════════════════════════════════════════════

## Что сделано

### ШАГ 1 — Docs
- `docs/paper-and-ink.md` — новая секция «Native `<select>` как официальный fallback»:
  таблица трёх примитивов (native / OverflowSelect / PiSelect), правила «когда»,
  запреты (массовая миграция, кастомный dropdown, MatSelect).
- `docs/AI-AGENT-GUIDE.md` §3.1 — строка: «Короткий enum ≤~20 опций без поиска →
  native `<select>` (класс `.pi-native-select`) … native = официальный approved
  fallback, не "времянка"».

### ШАГ 2 — CSS utility
- `frontend/src/styles.css` — новый класс `.pi-native-select`:
  - `h-10` (40px), `px-control-x` (12px) — матч с `app-pi-input` md
  - `bg-paper-raised`, `text-ink`, `font-body`, `text-sm`
  - `border: 1px solid var(--color-rule-strong)`, `rounded-sm`
  - `focus-visible`: gold-deep outline 2px + offset 2px
  - `disabled`: opacity 0.5 + cursor not-allowed
  - Комментарий-канон в CSS: когда / НЕ когда / запреты

### ШАГ 3 — Passport
- `frontend/src/app/pages/forms/forms.page.ts` — passport-комментарий «Native <select>»:
  назначение, anti-use, keyboard, статус canonical (TZ-UI-ROI-521)

### ШАГ 4 — Proof
- FE tsc --noEmit: PASS (exit 0)
- forms.page.spec: 1/1 PASS (регрессия)
- git diff --check: PASS (только CRLF warning pre-existing)

## Consumer proof

CSS-класс `.pi-native-select` готов к использованию на любой странице. Живой
passport на `/kit/forms`. Первый consumer — любая форма с коротким enum (статус,
приоритет, роль) — `<select class="pi-native-select">`.

## Conflict disclosure

- CONFLICT KEYS: `docs/paper-and-ink.md`, `docs/AI-AGENT-GUIDE.md`, `frontend/src/styles.css` — только мои правки.
- Чужие правки в этом же коммите НЕ трогал (PO-CANON, PO-DIARY, TZ-AUTHORING, PAGE-TZ-INDEX, QUEUE-LIVE, README.md, manager-desk — все чужие, не stage).

## Known limits

- CSS-only, без Angular-компонента — браузерный chrome (стрелка) остаётся нативным.
- Нет кастомного option rendering — для этого PiSelect.
- Dark mode: токены `--color-paper-raised` / `--color-ink` / `--color-rule-strong`
  автоматически инвертируются через существующие `@variant dark` оверрайды в
  `styles.css`, отдельный dark-селект не нужен.