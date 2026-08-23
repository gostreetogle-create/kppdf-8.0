# TZ-KP-WS-409: Legacy cleanup + documentation

**РОЛЬ АГЕНТА:** frontend executor  
**DEPENDENCIES:** TZ-KP-WS-408 DONE + PO smoke PASS  
**LAYER:** frontend docs  
**WAVE:** #9 (session 4)  
**PAGES:** all proposals  
**PAGE_DOCS:** `kp-workspace.page.md` (уже SoT с 2026-08-23; довести post-cutover)

## ЧТО ДЕЛАТЬ

1. Remove or archive **`ProposalCreatePage`** god shell if 408 stable — keep subcomponents.
2. **Довести** `docs/pages/kp-workspace.page.md`: убрать Wave-0 gaps, сверить data-test/API с кодом, пометить create superseded; не создавать с нуля.
3. Update **`docs/pages/PAGE-TZ-INDEX.md`**, **`docs/ux/kp-create-studio-spec.md`** header → points to workspace.
4. Sync **`tasks/kp-workspace-dummy/README.md`**: Wave 0 done; dummy deprecated except geometry reference.
5. Remove dead CSS/data-test from legacy flyout grid if unused.
6. **`pnpm architecture:check`** PASS.
7. Wave closeout: `WAVE-KP-SINGLE-WORKSPACE.md` status DONE; move to `tasks/_archive/2026-08/waves-done/`.

## НЕ ИЗМЕНЯТЬ

- Subcomponents business logic
- Geometry law doc (кроме ссылок)

## КРИТЕРИИ ПРИЁМКИ

- [ ] No duplicate create route component
- [ ] `kp-workspace.page.md` актуален post-cutover (секции/API/data-test совпадают с кодом)
- [ ] architecture:check PASS
- [ ] tsc + test + lint PASS

## Archive

`tasks/_archive/2026-08/TZ-KP-WS-409.done.md` + wave done marker
