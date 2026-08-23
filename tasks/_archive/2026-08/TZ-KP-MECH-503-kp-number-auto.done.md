# TZ-KP-MECH-503 — DONE

**Status:** DONE · archived 2026-08-23
**Agent:** cursor-executor (subagent)

ARCHIVE_MARKER

## Что сделано

1. **Inspector placeholder:** поле «Номер КП» — `placeholder="Присвоится при сохранении"` пока пусто; после autosave значение приходит через `[initialNumber]="draft.proposalNumber()"`.
2. **Create path verified:** `saveDraft` шлёт `number: undefined` при пустом поле; `finishSave` → `proposalNumber.set(res.data.number)` (BE `counter.next('Quotation','QTN')`).
3. **Не блокируем до save:** `canSaveDraft` не требует номер — только шаблон, org, ready preview.
4. **Тесты:** draft.service.spec +2 (create → QTN-001; manual edit → update payload); inspector.spec +1 (placeholder + parent rebind).

## Gates

- FE tsc: 0 errors
- jest proposal-workspace-draft + proposal-create-inspector: 25/25
- eslint (changed files): 0 errors

## Файлы

- `proposal-create-inspector.component.ts`
- `proposal-create-inspector.component.spec.ts`
- `proposal-workspace-draft.service.spec.ts`
