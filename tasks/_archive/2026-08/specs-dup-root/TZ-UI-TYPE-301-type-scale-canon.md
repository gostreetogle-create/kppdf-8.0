═══════════════════════════════════════════════════════════════
TZ-UI-TYPE-301: Type scale canon (tokens + docs)
═══════════════════════════════════════════════════════════════

> Domain preflight: UI tokens only.  
> Проверено: docs/audits/2026-08-08-typography-and-theme-contrast-audit.md;
> frontend/src/styles.css (--font-*, .eyebrow 11px, .pi-tech-label 10px);
> docs/design-spec.md stale Source Serif / Work Sans.

РОЛЬ АГЕНТА: Frontend CSS Architect

ЗАВИСИМОСТИ: Нет (волна #1)

LAYER: 2

PAGES: /foundations (kit demo if present)
PAGE_DOCS: design-spec.md ; paper-and-ink.md (type section only)

CONFLICT KEYS: frontend/src/styles.css; docs/design-spec.md; docs/audits/2026-08-08-typography-and-theme-contrast-audit.md; docs/pages/foundations.page.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

Нет CSS-токенов размеров. Micro: 9/10/11/12px параллельно. Docs лгут про шрифты.

Канон аудита (зафиксировать в коде):

| Role | Size | Token / utility |
|------|------|-----------------|
| micro | 11px | `--text-micro` + `.eyebrow` + `.pi-tech-label` **оба 11px** |
| meta | 12px | `text-xs` (Tailwind default) — document as canon meta |
| body | 14px | `text-sm` / `.pi-input` already 14px |
| title | 16–18px | document; optional `--text-title: 1.125rem` |
| display-erp-max | 20px | document ban above on ERP |

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: В `styles.css` @theme / utilities
- Добавить комментарий-канон «ERP type scale» + CSS vars `--text-micro: 0.6875rem` (11px), optionally `--text-title`.
- Выровнять `.pi-tech-label` на **11px** (сейчас 10) — один micro.
- Не менять Tailwind default rem scale globally.

ШАГ 2: Docs
- `design-spec.md` typography: Hanken / Inter / JetBrains + таблица ролей выше (убрать Source Serif/Work Sans).
- Foundations page hint: заменить stale font names.
- Короткая ссылка из audit §6 → DONE note optional.

ШАГ 3: Gates
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- Visual: foundations / kit type section if exists.

НЕ ИЗМЕНЯТЬ: page templates массово (это TYPE-302); colors (COLOR-301); backend.

AC:
1. `.eyebrow` и `.pi-tech-label` оба 11px.
2. design-spec отражает shipped fonts + 5 roles.
3. tsc clean.
4. Комментарий-канон в styles.css находитcя по «ERP type scale».
