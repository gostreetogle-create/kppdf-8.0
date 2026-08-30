# TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE checklist

> Status: **BLOCKED**
> Marker: `tasks/_active/TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff-block-style
- claimed_at: 2026-08-30T06:45:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: yes

## Preflight Check Output

- **Context read:** `GEMINI.md`, `docs/PO-CANON.md`, `docs/agent-checklists/_NOW.md`, `docs/architecture/nx-doc-studio.md` §4, `tasks/TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE.md`, `backend/src/modules/template-block/{schema,service,controller,dto/*}.ts`, `backend/src/modules/document-render/{document-render.service,studio-render.adapter,module}.ts`, `backend/src/common/sanitize-html.ts`, `backend/src/modules/studio-document/dto/create-studio-block.dto.ts`, `backend/src/main.ts`, `backend/Dockerfile`
- **Key Constraints:** executor backend-only; чужой WIP (auth/unit/rbac) не трогать; block.style — единственный источник типографики; sanitize font-family/size/color из inline; миграции нет; templateId:required и cutover не трогать
- **Planned Deliverable:** (1) BlockStyle schema+dto, (2) self-host @font-face + whitelist, (3) sanitize, (4) render обоих путей, (5) тесты + gates
- **Validation Path:** FIC §A (модуль, schema) + gates (tsc/jest/lint/architecture:check) + живая API-проверка HTML/PDF

## Acceptance (from TZ)

- [ ] `style` сохраняется и возвращается для блоков и шаблона, и studio-документа
- [ ] шрифт вне списка / size вне 6..96 / кривой color → 400 с понятным сообщением
- [ ] inline font-family/font-size/color не доживают до базы; bold/italic/ссылки и `{{…}}` доживают
- [ ] HTML и PDF используют шрифт из block.style; для каждой гарнитуры доказано, что рендер её реально рисует
- [ ] блок без `style` рендерится побайтово как до волны (регресс-тест)
- [ ] PATCH одного поля стиля не затирает остальные
- [ ] self-host @font-face: dev+prod одинаково (пересечение системных непусто → только self-host)

## Gates (дополняется по шагам 1–5)

| Шаг | Проверка | Факт |
|---|---|---|
| 1 | BlockStyle schema, whitelist, DTO | PASS — tsc; `backend/src/modules/template-block/block-style.ts` |
| 2 | Existing whitelist/@font-face wiring audited | PASS in code; runtime font/PDF evidence unavailable |
| 3 | Pure sanitizer + template/studio write paths | PASS — focused sanitizer and studio/dual-read tests |
| 4 | Styled render paths and column fallback | PASS — tsc and focused tests |
| 5 | DTO exposure and partial style merge | PASS — inherited studio DTO; full test rerun has only no failures in changed tests |
| Gate | Full checks | BLOCKED — repository-wide lint has 51 unrelated errors; architecture has 3 unrelated frontend violations |

## known_limitation

- Live API/PDF smoke unavailable in this run; actual deployed font-file availability is not independently verified.
- Full backend lint is blocked by pre-existing errors outside the conflict keys.

## Executor report (auto)

- task_id: TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE
- status: BLOCKED
- closed_at: 2026-08-30
- closed_by: freebuff-block-style
- head_sha: unavailable (no commit; shared checkout contains foreign WIP)

## Integrity slot (до READY / archive)

- [x] Тип изменения: module (schema + render + dto, backend)
- [x] FIC §A: N/A кроме §A5-sanitize — нет новых коллекций/прав/роутов
- [x] page.md: `docs/pages/document-studio.page.md` обновлён секцией про типографику и список шрифтов
- [x] SECTION-READINESS: N/A (без UI route)
- [x] Чужой WIP (auth/unit/rbac, backend/common) не изменён
- [x] Coupling map: N/A (общее поле/статус не трогал)
- [x] Канон: docs/DOCS-INTEGRITY.md