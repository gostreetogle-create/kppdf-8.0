# TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE: admin без org не лочит документ после смены Исполнителя

**РОЛЬ АГЕНТА:** Executor (backend studio-document + FE toast) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-ISSUER-SELECT` DONE (WARN lockout)  
**LAYER:** 4 (+ лёгкий FE) · **SIZE:** M  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`backend/src/modules/studio-document/studio-document.service.ts` ;  
`backend/src/modules/studio-document/studio-document.service.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (честный toast на 403 scope, не conflict-dialog) ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/STREAM-QUEUE.md`

IMPLICIT CONFLICT: nx build kppdf-web (если трогаешь FE)

### Symptom (PO 2026-09-13)
`POST /api/studio-documents/:id/blocks` → **403** при «+ Фото» (и любом addBlock).  
Не revision-race. Сообщение BE: `Studio document belongs to another organization scope`.

### Root cause (подтверждено ISSUER evidence)
Unscoped admin (`JWT.organizationId = null`): `resolveOrganizationId(null)` → **первая org по имени**.  
`assertSameScope(doc, thatId)` на каждом findById/addBlock/…  
После PATCH «Исполнитель» на другую фирму `doc.organizationId` ≠ fallback → **полный self-lockout** (GET/PATCH/blocks 403). Документ ещё открыт в FE из памяти — следующая запись падает.

### ЧТО ДЕЛАТЬ

1. **Unscoped / admin (`organizationId` null|undefined):**  
   - `findById` / mutations: **не** assertSameScope против alphabetical fallback.  
   - Либо: skip scope check when caller org is null; load by id only.  
   - Либо: assert only when caller has bound org.  
   - `findAll` для unscoped: все docs (или filter optional) — не только fallback org (иначе UI «пропадает» после F5).

2. **Bound user:** scope check **оставить** (IDOR).

3. Specs: unscoped switches issuer A→B → addBlock/image still 200; bound user foreign doc still 403.

4. FE: 403 с текстом scope → toast «Нет доступа к документу этой фирмы…», не «изменён в другом месте».

5. page.md: снять WARN lockout или пометить fixed.

### НЕ

- Снимать org scope для bound managers  
- Wipe / менять seed org names  
- Путать с 409 revision

### AC

1. Admin unscoped: сменить Исполнитель → сразу «+ Фото» / «+ Текст» → 200, слой на листе.  
2. Bound user: чужой org doc → 403.  
3. Gates: studio-document.service.spec + FE toast path + `nx build` если FE.

### Claim
```
agent_id: claude
claimed_at: 2026-09-14T04:20:00Z
branch: main
baseline_sha: d5433ef3
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS (0 new errors vs pre-existing baseline of 38, verified via git-stash A/B)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE.md)
  - progress.md: N/A (redirected to docs/agent-checklists/_NOW.md per repo convention)
  - status synchronization: PASS
