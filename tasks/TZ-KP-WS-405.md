# TZ-KP-WS-405: Embedded doc settings (tables, texts, template mini)

**РОЛЬ АГЕНТА:** frontend executor  
**DEPENDENCIES:** TZ-KP-WS-404 DONE  
**LAYER:** frontend (+ minimal BE if audit requires)  
**WAVE:** #5 (session 3)  
**PAGES:** `/proposals/workspace` ; `/doc-constructor/*` (reuse)  
**PAGE_DOCS:** `templates.page.md` ; `builder.page.md` ; audit § embedded scope  
**CONFLICT KEYS:** `doc-constructor/tables/*`; `doc-constructor/texts/*`; `proposal-workspace*`; `pi-table-templates.service.ts`; `pi-text-blocks.service.ts`

Проверено: `table-template-dialog.component.ts`; `text-block-editor.component.ts`; `builder.page.ts`; TZ-400 embedded scope list

## ИСХОДНОЕ СОСТОЯНИЕ

- «Открыть пресет в Документах» navigates away from create.
- Text blocks edited only in `/doc-constructor/texts`.
- Full builder = separate route.

## ЧТО ДЕЛАТЬ

1. **Table preset inline:** from params/table panel — «Редактировать пресет» opens `PiDialogService` + existing `table-template-dialog` (or sheet) **without route change**; save updates TableTemplate SoT; refresh kpTableLayout sync.
2. **Text block inline:** from terms panel — create/edit TextBlock in dialog (reuse editor component); library pick stays in panel.
3. **Template mini:** from template panel — quick actions: upload background (existing API), rename, duplicate template shell; **full canvas** still opens builder route with returnUrl (acceptable navigate).
4. **Help/справка:** contextual `PiTooltip` / compact help drawer per section (RU) — content from audit or `proposals-create.page.md` hints; no empty lorem.
5. Do **not** duplicate builder canvas inline — only dialogs/sheets per AI-UI-CONTRACT.
6. Tests: dialog open/save table preset mock ≥3; text block create mock ≥2.

## ИЗМЕНЯТЬ

- Workspace panel actions + dialog wiring
- Optional: `proposal-workspace-settings.facade.ts`

## НЕ ИЗМЕНЯТЬ

- TableTemplate write-path (no patch from KP instance directly)
- Builder canvas architecture
- MCP server code (406)

## КРИТЕРИИ ПРИЁМКИ

- [ ] Edit table preset from workspace → saved → columns sync on KP
- [ ] Create text block from terms → appears in library pick
- [ ] Background upload works from template panel
- [ ] Full builder still available with returnUrl workspace
- [ ] All overlays use PiDialog/Sheet (no hand-rolled modal)
- [ ] tsc + test + lint PASS

## known_limitation

- Block-level template editing remains in builder route.

## Archive

`tasks/_archive/2026-08/TZ-KP-WS-405.done.md`
