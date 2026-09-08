# TZ-NX-DOCSTUDIO-S47-AUDIT-RECHECK: повторный аудит привязок (без кода)

**РОЛЬ АГЕНТА:** Executor / peer auditor — claude  
**ЗАВИСИМОСТИ:** нет  
**LAYER:** 4 (docs only) · **SIZE:** S  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`docs/audits/2026-09-08-docstudio-table-field-binding-audit-claude-recheck.md` (create) ;  
`docs/agent-checklists/WAVE-DOCSTUDIO-S47-S48.md` (status row 0)

### Preflight Check Output
- **Context read:** Cursor audit `docs/audits/2026-09-08-docstudio-table-field-binding-audit.md`; live sources listed therein
- **Key Constraints:** **ZERO product code.** Only open files and write recheck audit.
- **Planned Deliverable:** `…-claude-recheck.md` with PASS/FAIL per BUG-1…5 + file:line
- **Validation Path:** recheck file exists; WAVE row 0 DONE only if PASS or documented delta

---

## ЧТО ДЕЛАТЬ

1. Открой (не по памяти) пути из Cursor-аудита: `studio-data-resolver.ts`, `studio-table-defaults.ts`, `studio-blocks-canvas.component.ts` (tableRows + cell loop), `studio-editor.page.ts` (`patchTableSettingsForBlock`, `putDataSet`, insert table defaults), `studio-table-properties.component.ts` (`onTemplateSelect`), эталон `proposal-table-layout.util.ts`.
2. Для каждого BUG-1…5: **CONFIRM** / **REJECT** / **AMEND** + `path:line` + 1 предложение.
3. Напиши `docs/audits/2026-09-08-docstudio-table-field-binding-audit-claude-recheck.md`:
   - verdict: `PASS — proceed S47` **или** `BLOCK — stop, need Cursor update`
   - если AMEND: точный delta для S47 TZ (не правь код сам).
4. Обнови WAVE row 0. Archive этот TZ. **STOP** — не claim S47 fix в том же claim.

## НЕ ИЗМЕНЯТЬ
Любой `frontend-nx/**/*.ts`, `backend/**/*.ts` app logic, studio components.

## КРИТЕРИИ ПРИЁМКИ
1. Recheck file committed with explicit PASS/BLOCK.
2. No product code in the commit.
3. If BLOCK — Executor report explains which claim failed; do not start S47.
