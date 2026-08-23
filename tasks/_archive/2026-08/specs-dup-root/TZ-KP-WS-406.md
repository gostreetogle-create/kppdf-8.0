# TZ-KP-WS-406: MCP / AI template draft bridge

**РОЛЬ АГЕНТА:** frontend + backend + desktop-mcp (scoped)  
**DEPENDENCIES:** TZ-KP-WS-405 DONE  
**LAYER:** full-stack bridge  
**WAVE:** #6 (session 4)  
**PAGES:** `/proposals/workspace` ; `/import-todos`  
**PAGE_DOCS:** `desktop/docs/MCP.md` ; program audit § MCP  
**CONFLICT KEYS:** `desktop/mcp/src/doc-tools.ts`; `backend/src/modules/document-template/*`; `proposal-workspace*`; `import-todos.page.ts`

Проверено: `doc-tools.ts`; `import-todo`; pairing UI; audit MCP gaps

## ИСХОДНОЕ СОСТОЯНИЕ

- MCP: `kppdf_doc_template_create_draft` — empty shell, notes `[AI-DRAFT]`.
- No FE entry from proposals; PDF parser stub in desktop.
- Pairing = global header only.

## ЧТО ДЕЛАТЬ

1. **BE (minimal):** optional `sourceFileRef?: string` + `draftSource?: 'mcp'|'manual'|'import'` on DocumentTemplate (migration safe, defaults null).
2. **MCP:** extend `kppdf_doc_template_create_draft` to accept optional `sourceFileRef`; auto `kppdf_import_todo_create` with href `/proposals/workspace?templateDraft=` or builder link.
3. **Workspace UI — template panel:** section «Из файла (AI)»: explain Desktop+MCP path; button «Создать черновик шаблона» → if desktop paired, call internal API proxy OR deep-link to import-todo instructions; show pending todos badge link `/import-todos`.
4. **Workspace UI — pairing hint:** if no pairing key, CTA «Подключить десктоп» opens existing pairing dialog (reuse).
5. Opening `[AI-DRAFT]` template from workspace → inline mini (405) + «Открыть в конструкторе».
6. Tests: BE unit for new fields; MCP commercial-tools/doc-tools test extended; FE smoke test template panel CTA.
7. Docs: patch `desktop/docs/MCP.md` § template-from-file workflow (MVP, no parser).

## ИЗМЕНЯТЬ

- BE schema/DTO/template service (backward compatible)
- `desktop/mcp/src/doc-tools.ts` + tests
- Workspace template panel UI
- `docs/audits/2026-08-23-kp-single-workspace-program.md` § MCP status

## НЕ ИЗМЕНЯТЬ

- PDF parsing implementation
- Desktop chat → MCP writes (still forbidden)
- Autonomous publish without HITL

## КРИТЕРИИ ПРИЁМКИ

- [ ] MCP draft creates template + import todo with workspace href
- [ ] Workspace shows AI-draft templates in picker (filter/badge)
- [ ] Pairing CTA reachable from workspace
- [ ] BE e2e or unit for new fields PASS
- [ ] `cd backend && pnpm exec tsc && pnpm test -- document-template` PASS
- [ ] FE tsc + lint PASS

## known_limitation

- File content not auto-converted to blocks; human/MCP client finishes in builder.

## Archive

`tasks/_archive/2026-08/TZ-KP-WS-406.done.md`
