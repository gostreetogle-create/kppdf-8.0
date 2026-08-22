# TZ-UI-401 DONE — Починить общий PiSelect

```
ARCHIVE_MARKER
task_id: TZ-UI-401
outcome: DONE
closed_at: 2026-08-22T09:38:00+03:00
agent_id: claude (Buffy, Freebuff executor)
workspace: D:\kppdf-8.0
branch: main
```

## Что сделано

- `select.component.ts`: добавлен `open` signal, `@if (open())` на listbox, `toggleOpen()`, `@HostListener('document:click')` для click-outside, `Escape` закрывает, выбор закрывает список через `open.set(false)`
- `select-trigger.component.ts`: добавлен `open` input + `toggle` output; trigger клик → emitting toggle
- `select-option.component.ts`: `color: var(--color-paper)` → `color: var(--color-on-gold)` (dark-safe)
- Новый spec `select.component.spec.ts`: 8 тестов (closed by default, open/close toggle, aria-expanded, select+close, Escape, click-outside, text-on-gold classes)

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm exec jest --testPathPattern="select.component.spec"` PASS (8/8)
- `pnpm lint` PASS (0 new errors, только pre-existing warnings)

## Не трогали

- `select-option.component.ts` стили — только одна замена `--color-paper` → `--color-on-gold`
- native `<select>` migration (TZ scope)
- pages вне forms.page.ts
- overflow-select spec (pre-existing jsdom @layer failure)