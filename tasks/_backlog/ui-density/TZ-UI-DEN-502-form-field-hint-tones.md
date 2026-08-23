# TZ-UI-DEN-502: FormField — Label/Value/Hint density

PAGES: (global forms)
PAGE_DOCS: ui-density-canon.md ; AI-UI-CONTRACT.md

РОЛЬ АГЕНТА: Frontend Component Engineer

ЗАВИСИМОСТИ: TZ-UI-DEN-501

LAYER: 2

CONFLICT KEYS: frontend/src/app/shared/ui/form-field/form-field.component.ts; frontend/src/app/shared/ui/label/label.component.ts; frontend/src/app/shared/ui/form-field/form-field.component.spec.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

`FormFieldComponent` уже использует `variant="eyebrow"` (11px caps) — близко к canon.

Hint: `text-xs text-muted-foreground` — не gold/amber по роли.
Error: `text-xs text-destructive` — ок по цвету, проверить 11px.
Gap label→field: `gap-form-row` — сверить с 4px canon после 501.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Input `hintTone: 'default' | 'ai' | 'success' | 'warn'` (default `'default'`)

- `ai` → `text-hint-ai`
- `warn` → `text-hint-warn`
- `success` → `text-hint-success`
- backward compatible: без tone = muted как сейчас

ШАГ 2: Error line — `text-xs`, role=alert, без shadow

ШАГ 3: Tests + kit/forms demo row «Hint tones»

ШАГ 4: Migration note: не массово менять hintTone на страницах в этом TZ — только primitive

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Feature pages (adoption в DEN-530+)
- PiSelect/PiOverflowSelect internals

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] `hintTone` input documented in component JSDoc
- [ ] spec: default hint muted; ai hint uses hint-ai token class
- [ ] `pnpm test -- --testPathPattern=form-field` PASS
- [ ] tsc + lint PASS
