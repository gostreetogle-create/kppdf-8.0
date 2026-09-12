# TZ-NX-PO-SWEEP-02: studio table — клик = select/resize, свойства по dblclick / rail

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build AOT)
  - tests: PASS (813/820, 7 skipped, 0 failed; +3 new)
  - lint: N/A (не запускал отдельно, build/AOT clean)
  - checklist: ADDED
  - progress.md: N/A (ops/UX sweep wave)
  - status synchronization: PASS

## Root cause

S45 сделал `selectBlock()` эмитить `tableEditRequest` на single click для
table-блоков → правая панель Свойства открывалась сразу и перекрывала SE
resize handle. PO-CANON требует: 1 клик = select + drag/resize, dblclick/rail
= открыть Свойства (как у text-блока).

## Fix

`studio-blocks-canvas.component.ts`:
- `selectBlock()` больше не эмитит `tableEditRequest` для таблиц — только
  `selected.emit()`.
- Новый `openTableBlock()` на `(dblclick)` table `<article>` (зеркалит
  `openTextBlock()`/text dblclick) — эмитит `tableEditRequest`.

`studio-editor.page.ts`:
- `tableEditRequest → openLayerProperties` wiring не менялся.
- Rail «Свойства» button: новый `propertiesHint` — active/жёлтый стиль, когда
  выбрана (не locked) таблица, а панель Свойства ещё не открыта. Клик по
  кнопке открывает панель как раньше (`onSection('properties')`).

## Backlog / not touched

A4 geometry, inline cell edit на холсте (остаётся запрещён), image-блок click
behaviour — без изменений.

## Gates

| Gate | Result |
|------|--------|
| `nx test kppdf-web` (canvas + chrome-ia specs, ran full suite) | PASS 813/820 |
| `nx build kppdf-web` | PASS |

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-chrome-ia.spec.ts`
- `docs/agent-checklists/TZ-NX-PO-SWEEP-02-studio-table-click-resize.md` (new)
