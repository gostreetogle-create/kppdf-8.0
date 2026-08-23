# TZ-KP-WS-404: Right panel — params, table, terms, output

**РОЛЬ АГЕНТА:** frontend executor  
**DEPENDENCIES:** TZ-KP-WS-403 DONE  
**LAYER:** frontend  
**WAVE:** #4 (session 3)  
**PAGES:** `/proposals/workspace`  
**PAGE_DOCS:** `proposals-create.page.md` § params/table/terms/output  
**CONFLICT KEYS:** `proposal-create-inspector.*`; `proposal-create-table-editor.*`; `proposal-create-terms.*`; `proposal-create.page.ts` (read-only extract); `proposal-workspace*`

Проверено: frozen create spec §356–372; `proposal-create-table-editor.component.ts`

## ИСХОДНОЕ СОСТОЯНИЕ

- Right flyouts on create: inspector, table editor (~A4 width tier-L), terms, output.
- Table editor includes DnD, row drawer, catalog review on exit.

## ЧТО ДЕЛАТЬ

1. Mount **inspector, table editor, terms, output** components in right panel slots per store section.
2. Table tier-L: panel may exceed 480px as **overlay** (fixed width ~794px) — still **no A4 reflow** (geometry law: overlay only).
3. Wire `requestTableExit` + **kp-catalog-review** modal — same as create (reuse from parent or shared service).
4. Output: print/PDF/archive gates (368) — parity.
5. Read-only when `status === accepted'`.
6. Ribbon: move print/PDF shortcuts if audit says so — must not duplicate output panel actions awkwardly.
7. Tests: table editor + terms in workspace context ≥6 new/extended tests.

## ИЗМЕНЯТЬ

- Workspace host orchestration
- Panel width CSS for tier-L table overlay
- Optional: extract catalog-review trigger to shared helper

## НЕ ИЗМЕНЯТЬ

- Table build pipeline / `kpTableLayout` write rules
- PDF backend
- Create page until 408

## КРИТЕРИИ ПРИЁМКИ

- [ ] Params change → preview rebuild
- [ ] Table editor full parity (DnD, drawer, custom line)
- [ ] Terms add from library without leave workspace
- [ ] Output print/PDF/archive gates match create
- [ ] Catalog review on table exit works
- [ ] A4 no reflow when tier-L table open
- [ ] Tests PASS; tsc + lint PASS

## Archive

`tasks/_archive/2026-08/TZ-KP-WS-404.done.md`
