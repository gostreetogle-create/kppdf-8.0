═══════════════════════════════════════════════════════════════
TZ-DESK-415: DeskNote — обязательный orderId + свои PATCH/DELETE
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-19
closed_by: gemini-backend-executor

result:
- findAll: валидный `orderId` обязателен, иначе BadRequestException; `find({})` больше не вызывается. `lineId`/`moduleId` — доп. фильтры поверх orderId.
- update/remove: actor `{ id, role }`; разрешено если `String(note.authorId) === actor.id` или role in `admin|director|manager`; иначе ForbiddenException. remove сначала findById (404) + author check, затем hard delete.
- Controller PATCH/DELETE передают `@CurrentUser()` в service.
- Tests: missing/invalid orderId → BadRequest (не full list); чужой `user` 403; автор и privileged OK. 10/10.

known_limitation:
  - organizationId scope не вводился (TZ НЕ)
  - page.md / PAGE-TZ-INDEX 415-строки оставлены в working tree, не staged (peer WIP 414/416)

verification:
  - acceptance criteria: PASS
  - backend typecheck: PASS (`pnpm exec tsc -p tsconfig.build.json --noEmit`, exit 0)
  - backend tests: PASS (desk-note 10/10)
  - lint: PASS (eslint desk-note files, 0 errors)
  - checklist: DONE
  - deploy/wipe: not run

Primary signal: GET без orderId не дампит заметки; чужой user не PATCH/DELETE — met
Secondary: tsc + jest 10/10 + eslint — PASS
