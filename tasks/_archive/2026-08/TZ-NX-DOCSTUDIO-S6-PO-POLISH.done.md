# TZ-NX-DOCSTUDIO-S6-PO-POLISH — студия: A4-рамка, слои, свойства, навигация

**РОЛЬ АГЕНТА:** executor (Claude CLI / Freebuff), frontend-nx only  
**СТАТУС:** DONE — archived 2026-08-30

## Claim

| Field | Value |
|-------|-------|
| agent_id | claude |
| claimed_at | 2026-08-30T16:46:00+03:00 |
| completed_at | 2026-08-30T16:48:00+03:00 |

**ЗАВИСИМОСТИ:** S3–S5 DONE  
**LAYER:** 3 — `frontend-nx/apps/kppdf-web/src/app/pages/studio/**`

## Evidence

| Gate | Exit |
|------|------|
| `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` | 0 |
| `jest --testPathPattern=pages/studio` (3 suites, incl. `studioCanvasBlocks`) | 0 |
| `nx build kppdf-web` | 0 |

Note: `nx test kppdf-web --testPathPattern=studio` runs full suite (nx/jest quirk); unrelated pre-existing FAIL in `app-shell.component.spec.ts`. Studio specs pass.

## КРИТЕРИИ ПРИЁМКИ

- [x] `nx build kppdf-web` exit 0
- [x] studio unit tests exit 0 (+ `studio-block-helpers.spec.ts` for canvas filter)
- [x] A4 рамка via `sheetHost=false`, canvas 100% white inside sheet
- [x] Только активный слой на canvas (`studioCanvasBlocks`)
- [x] Стрелки 32×32, ChevronLeft/Right, aria-label RU
- [x] Свойства: категории, русский тип, empty state
- [x] data-test сохранены

## Изменённые файлы

- `studio-editor.page.ts` — `panelSide`, `propertiesBlock`, page nav, `openLayerProperties`
- `studio-blocks-canvas.component.ts` — layer isolation, no ghost opacity
- `studio-block-helpers.ts` + `studio-block-helpers.spec.ts` — `studioCanvasBlocks`
- `studio-properties-panel.component.ts` — categorized RU sections
- `studio-layers-panel.component.ts` — no inactive opacity, properties button
- `docs/pages/document-studio.page.md`

## known_limitation (successor S7)

- Rich-text TipTap, table cell editor, multi-object per layer, Fit/100% toolbar wiring.
