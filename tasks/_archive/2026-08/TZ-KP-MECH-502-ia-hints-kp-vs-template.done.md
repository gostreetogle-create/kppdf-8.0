# TZ-KP-MECH-502 — DONE

**Status:** DONE · archived 2026-08-23
**Agent:** subagent executor

ARCHIVE_MARKER

## Что сделано

1. **5 IA hint lines** (`text-xs text-muted-foreground`, `data-test="kp-hint-*"`) в панелях workspace:
   - `kp-hint-template` — над actions шаблона
   - `kp-hint-catalog` — heading каталога
   - `kp-hint-params` — верх inspector (наценка hint сохранён отдельно)
   - `kp-hint-table` — под заголовком редактора таблицы
   - `kp-hint-terms` — heading условий
2. Rails/shell/geometry не тронуты.
3. **Тесты:** workspace page (template/params/table hints), product-rail, terms.

## Gates

- FE tsc: 0 errors
- FE test (proposal-workspace proposal-create-inspector proposal-create-table-editor proposal-create-terms): 77 passed
- FE test (proposal-product-rail): 12 passed
- FE lint: 0 errors (pre-existing warnings only)

## Файлы

- `proposal-workspace-template-actions.component.ts`
- `proposal-product-rail.component.ts` (+ spec)
- `proposal-create-inspector.component.ts`
- `proposal-create-table-editor.component.ts`
- `proposal-create-terms.component.ts` (+ spec)
- `proposal-workspace.page.spec.ts`
