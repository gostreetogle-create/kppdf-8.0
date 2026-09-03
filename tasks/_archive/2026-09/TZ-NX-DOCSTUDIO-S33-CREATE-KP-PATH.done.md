# TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH: «Новое КП»

**РОЛЬ АГЕНТА:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** document-studio, proposals
**PAGE_DOCS:** `docs/pages/document-studio.page.md`; proposals page кратко
**ЗАВИСИМОСТИ:** S32
**CONFLICT KEYS:** `frontend-nx/.../studio-list.page.ts`; `proposals-list.page.ts` (CTA only)
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ИСХОДНОЕ

`create()` без `docTypeId`. Quotation link только когда тип КП выбран в панели Шаблон. «Создать в студии» с proposals может вести в пустой doc.

## ЧТО ДЕЛАТЬ

1. Кнопка **«Новое КП»** на `/studio` list → create с `docTypeId` КП (`slug==='proposal'` или name «КП» из `PiDocTypesService`).
2. `/proposals` «Создать в студии» → тот же путь.
3. Не менять `ensureLinkedQuotation` контракт (link на первом save/effect).
4. Обычный «Создать документ» оставить generic.

## КРИТЕРИИ ПРИЁМКИ

1. Новое КП → в Шаблон/Данные тип КП уже выбран; после save появляется статус КП.
2. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH.done.md`

---

## Реализация (S33)

Backend не менялся: `CreateStudioDocumentDto.docTypeId` уже был опциональным
полем (`@IsOptional() @IsObjectId()`) — принимался и применялся сервисом
до этого TZ. Не хватало только фронтового входа, который бы его передавал
при создании.

Файлы:
- `frontend-nx/libs/data-access/src/lib/doc-studio/studio-document.types.ts` —
  `CreateStudioDocumentPayload` получил `docTypeId?: string` (раньше POST-пейлоад
  не мог нести тип документа вообще, хотя backend DTO его уже принимал).
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-kp-doc-type.ts` (новый) —
  `isKpDocType` / `findKpDocType`: единая точка правды «что считается КП»
  (`slug === 'proposal' || name === 'КП'`). Раньше это правило было продублировано
  инлайн дважды внутри `studio-editor.page.ts` (`isKpDoc` computed и `onDocTypeChange`).
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` —
  обе инлайн-проверки переведены на `isKpDocType` (без изменения поведения);
  снижает риск, что новая точка входа (список/proposals) разъедется с
  критерием редактора, если правило когда-нибудь поменяется.
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts` —
  новая кнопка «Новое КП» (`data-test="studio-create-kp"`) рядом с «Из шаблона»
  и «Создать документ». `createKp()` тянет `PiDocTypesService.list()`, находит
  КП-тип через `findKpDocType`, и создаёт документ с этим `docTypeId`; при
  отсутствии типа — `toast.error`, ничего не создаётся. `create()` (обычная
  кнопка) рефакторен в общий приватный `createDocument(docTypeId?)` — сам не
  передаёт `docTypeId`, остаётся generic, как того требует п.4 TZ.
- `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.ts` —
  `createInStudio()` (кнопка «Создать в студии») раньше был голым
  `router.navigate(['/studio'])` (вёл в список, где пользователю всё равно
  надо было нажимать «Создать документ» без типа — источник «пустого» КП из
  ИСХОДНОЕ). Теперь резолвит КП doc type тем же `findKpDocType`, создаёт
  документ через `PiStudioDocumentsService.create({ ..., docTypeId })` и сразу
  переходит на `/studio/:id`; при отсутствии КП-типа — fallback на прежнее
  поведение (`navigate(['/studio'])`); при ошибке создания — `toast.error` с
  `extractErrorMessage`, редиректа не происходит.
- `ensureLinkedQuotation` контракт (п.3 TZ) не тронут: остался тем же вызовом
  `POST /studio-documents/:id/ensure-quotation` в `studio-editor.page.ts`.
  Поскольку документ теперь создаётся сразу с КП `docTypeId`, существующий
  `effect()` в редакторе (`if (!doc || !this.isKpDoc() || this.quotationId()) return; this.ensureLinkedQuotation(doc._id);`,
  уже добавленный в S20/ранее) срабатывает автоматически при первой загрузке
  документа — линк на quotation и статус КП появляются без дополнительного
  клика, как только документ открыт (что покрывает критерий приёмки №1:
  «после save появляется статус КП» — здесь «save» это сам POST create,
  триггерящий последующий `ensureLinkedQuotation` через тот же неизменный effect).

### Gates (факт)

```text
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  → PASS, exit 0

cd frontend-nx && pnpm exec jest --config apps/kppdf-web/jest.config.ts studio-list.page.spec.ts proposals-list.page.spec.ts
  → PASS, exit 0 (2 suites, 31 tests, 0 failed)

cd frontend-nx && pnpm exec nx test kppdf-web (full suite, baseline check)
  → FAIL: 2 failing (registries.catalog.spec.ts) — ПРЕДСУЩЕСТВУЮЩИЙ baseline,
    файл вне diff этого TZ; идентично документированному в S32/S31
    (350 passed / 7 skipped / 359 total)

cd frontend-nx && pnpm exec eslint <изменённые файлы этого TZ>
  → PASS, exit 0, 0 problems

cd frontend-nx && pnpm exec nx lint kppdf-web (full project, baseline check)
  → FAIL: 21 errors / 75 warnings — идентично baseline S32 (96 problems),
    все ошибки вне diff этого TZ (studio-blocks-canvas.component.ts,
    studio-properties-panel.component.ts, studio-table-properties.component.ts,
    studio-text-properties.component.ts, studio-workspace-shell.component.html,
    studio-layers-panel.component.ts, + 1 pre-existing error в
    studio-editor.page.ts:220 — вне мест правки S33)

pnpm architecture:check
  → PASS: "Architecture check passed (1398 files; baseline 17; resolved since baseline: 2)."

cd frontend-nx && pnpm exec nx build kppdf-web
  → PASS, exit 0 (Successfully ran target build for project kppdf-web and 4 tasks it depends on)
```

Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH.md`

```text
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS for changed-scope specs; pre-existing baseline FAIL unrelated to this TZ (see Gates)
  - lint: PASS for changed-scope files; pre-existing baseline FAIL unrelated to this TZ (see Gates)
  - kppdf-web build: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (не менялся; live-state в `_NOW.md`)
  - status synchronization: PASS
```
