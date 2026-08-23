# TZ-KP-WS-406 — DONE

- **TZ:** `tasks/TZ-KP-WS-406.md` — MCP / AI template draft bridge
- **agent_id:** freebuff-1
- **claimed_at:** 2026-08-23T16:34:26+0300
- **closed_at:** 2026-08-23T17:00:00+0300
- **SHA:** `92c458e7`
- **Deploy:** НЕ

## Что сделано

1. **BE (minimal):** `DocumentTemplate` schema + `CreateDocumentTemplateDto` +
   `service.create()` — опциональные `sourceFileRef?: string` и
   `draftSource?: 'mcp' | 'manual' | 'import'` (default null, migration-safe).
2. **MCP:** `kppdf_doc_template_create_draft` принимает опциональный
   `sourceFileRef`; при его наличии сам создаёт import-todo (TZD-29) с
   `href /proposals/workspace?templateDraft=<id>` + `templateId`
   (отдельный `kppdf_import_todo_create` не нужен).
3. **Workspace UI:** панель «Шаблон» — секция «Из файла (AI)»
   (`ProposalWorkspaceAiDraftComponent`): пояснение Desktop+MCP path,
   CTA «Подключить десктоп» (reuse `PairingDialogComponent`, если нет pairing key),
   CTA «Создать черновик шаблона» → deep-link `/import-todos` (если key есть),
   badge pending todos → `/import-todos`.
4. **Query param `?templateDraft=`:** открывает панель «Шаблон» на указанном
   черновике (store `templateDraftId` + picker `initialId`).
5. **Picker badge:** AI-draft шаблоны (`draftSource` mcp/import или
   `notes` `[AI-DRAFT]`) получают суффикс `(AI)`.

## Proof of adoption

| Пункт | Доказательство |
|-------|----------------|
| MCP draft создаёт template + import todo с workspace href | `desktop/mcp/src/doc-tools.test.ts` — 2 теста (с sourceFileRef → todo есть; без → todo нет) |
| Workspace показывает AI-draft шаблоны в picker | `proposal-create-template-picker.component.spec.ts` — тест `(AI)` label (mcp/import/[AI-DRAFT]) |
| Pairing CTA достижим из workspace | `proposal-workspace.page.spec.ts` — тест `kp-ws-ai-pairing-cta` (no keys) + тест create-CTA (paired) |
| BE unit на новые поля | `document-template.category.spec.ts` — 2 теста (passthrough + default null) |
| `?templateDraft=` открывает панель | `proposal-workspace.page.spec.ts` — тест query param |
| Docs | `desktop/docs/MCP.md` § template-from-file workflow; program audit § MCP status; `kp-workspace.page.md` query params + секции + wave |

## Gates (факт)

| Команда | Результат |
|---------|-----------|
| `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` | PASS |
| `cd backend && pnpm test -- document-template` | PASS (75/75) |
| `cd desktop/mcp && pnpm typecheck && pnpm test` | PASS (124/124) |
| `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` | PASS |
| `cd frontend && pnpm test -- proposal --runInBand` | PASS (172/172) |
| `cd frontend && pnpm lint` | PASS (0 errors; 18 pre-existing warnings) |
| `cd frontend && pnpm exec ng build --configuration development` | PASS |

## known_limitation

- Контент файла не конвертируется в блоки автоматически — человек/MCP
  завершает шаблон в builder (successor TZ после embedded builder).
- Pairing detection — по наличию активного pairing key (`DesktopPairingService.list()`);
  индикация «agent подключён» не реализована (нет прямого канала MCP→FE).

## Conflict disclosure

- `proposal-workspace*` — мой scope; параллельная сессия (407) добавила
  заглушки в draft-service/page во время моей работы — полностью убраны,
  файлы чистые от чужих правок.
- `tasks/TZ-KP-WS-404.md` (root spec) удалён параллельной сессией — в мой
  коммит не входит.
