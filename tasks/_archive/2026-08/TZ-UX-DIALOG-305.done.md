# TZ-UX-DIALOG-305 — DONE

**STATUS:** DONE · WAVE-CATALOG-UX-C #2 · archived 2026-08-08/09
**SoT:** `D:\kppdf-8.0` на `main` (push из freebuff claim worktree)
**CHECKLIST:** `docs/agent-checklists/TZ-UX-DIALOG-305.md` (DONE)

## Что сделано

1. **ModuleForm → kind C** (`module-form-dialog.component.ts`):
   `variant="content"` + `[maxWidth]="'min(1120px, calc(100vw - 2rem))'"` —
   parity с material/product FullEditor. Sticky footer / body scroll не тронуты
   (shell `content` даёт тот же body-контракт `flex-1 min-h-0 overflow-y-auto`).

2. **Composition picker → ширина эталона** (`product-composition-picker-dialog.component.ts`):
   `variant="form"` + `[maxWidth]="'min(1120px, calc(100vw - 2rem))'"` —
   визуально kind C (form xl ~920 → 1120 clamp). Overflow-select / add-and-continue без регресса.

3. **Opener не перебивает ширину**: `PiDialogComponent` читает ширину из своих
   шаблонных входов (`variant`/`maxWidth`); `width: 'lg'` в `dialog.open(...)` на
   modules list/detail инертен (PI_DIALOG_CONFIG не инжектится компонентом).

4. **Docs**:
   - `docs/DIALOG-COOKBOOK.md` — kind C строка + примечание «catalog FullEditor **и**
     composition picker = kind C width»;
   - `docs/pages/ui-dialog-canon.md` — kind C + composition picker;
   - аудит `docs/audits/2026-08-09-catalog-dialog-width-parity.md` (таблица product /
     module / material FullEditor + picker = 1120).

5. **Тесты**: smoke-проверки kind C широкого shell в module-form и picker спеках
   (по паттерну product-form spec).

## Gates

```text
pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
pnpm test -- module-form-dialog|product-composition-picker → 15/15 PASS
pnpm test (полный)                          → 129 suites / 1214 tests PASS
```

## Файлы

- `frontend/src/app/pages/modules/module-form-dialog.component.ts` (+ spec)
- `frontend/src/app/pages/products/product-composition-picker-dialog.component.ts` (+ spec)
- `docs/DIALOG-COOKBOOK.md`, `docs/pages/ui-dialog-canon.md`
- `docs/audits/2026-08-09-catalog-dialog-width-parity.md`

Tiny inventory dialogs (560/640), table-template (1400), FORM-307 — не менялись.
Deploy: **NO**.
