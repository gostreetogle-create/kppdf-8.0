# TZ-NX-DOCSTUDIO-S42-MONGOOSE-PLAIN-SPREAD: охота на `{...doc}` без `.toObject()`

**РОЛЬ АГЕНТА:** Executor (backend)  
**LAYER:** 2  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`  
**ЗАВИСИМОСТИ:** S37C DONE (`a576fa33`) — эталон фикса  
**CONFLICT KEYS:** `backend/src/modules/studio-document/**`; `backend/src/modules/document-render/studio-multipage.utils.ts`; при необходимости соседние helpers в `document-render/**` только если там тот же класс бага; `docs/audits/2026-09-0X-mongoose-plain-spread-audit.md` (создать)  
**IMPLICIT:** нет `frontend-nx` / Gantt

### Preflight Check Output
- **Context read:** `studio-table-tokens.ts` (S37C), `studio-data-resolver.ts` (`injectTableContent`), `studio-multipage.utils.ts` `cloneBlock` L78–83, WAVE FINISH closed  
- **Key Constraints:** Mode A wrote TZ; executor BE-only; parallel OK with Freebuff Gantt FE  
- **Planned Deliverable:** audit md + fix all same-class spreads + regression tests  
- **Validation Path:** backend tsc/test/lint; Preview smoke optional if multipage touched

## ИСХОДНОЕ

S37C: `{...mongooseDocument}` теряет nested `layout` → пустой Preview.  
Уже защищены: `injectTableContent`, `applyTableAggregateTokensToBlocks`.  

**Подозреваемый (подтвердить + починить):**  
`backend/src/modules/document-render/studio-multipage.utils.ts` → `cloneBlock`:
```ts
return { ...block, ...patch } as TemplateBlockDocument;
```
Вызывается при multipage/table overflow — те же hydrated blocks из `findAllByStudioDocument` без `.lean()`.

## ЧТО ДЕЛАТЬ

1. **Audit (обязателен):** grep/read pipeline Preview/PDF:  
   `studio-document/**`, `document-render/**` (особенно всё, что принимает `TemplateBlockDocument` и делает object spread / `Object.assign` на блоке).  
   Записать в `docs/audits/2026-09-05-mongoose-plain-spread-audit.md`: файл:строка · риск · fix/skip+почему.  
2. **Fix:** каждый confirmed case — паттерн как S37C / `injectTableContent`:
   ```ts
   const plain = typeof block.toObject === 'function' ? block.toObject() : { ...block };
   return { ...plain, ...patch };
   ```
   Допустимо вынести tiny helper `toPlainBlock(block)` в один модуль и переиспользовать (не раздувать).  
3. **Regression:** для каждого фикса — тест с fixture «layout на prototype / toObject» (как S37C), где старый spread теряет поле. Минимум: `cloneBlock` / multipage.  
4. Прогнать существующие studio-output / document-render / studio-table-tokens specs.  
5. Gates:
   ```bash
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test && pnpm lint
   ```
6. Если тронут multipage: короткий Preview/PDF sanity (документ с table overflow или 2+ pages) — не пустой stage.

## НЕ ИЗМЕНЯТЬ

- `frontend-nx/**`, Gantt, legacy `frontend/**`  
- Схему TemplateBlock / StudioDocument  
- Поведение токенов кроме сохранения plain fields  
- «Заодно» рефакторинг всего render

## Сбои (≥3)

1. Multipage clone теряет layout → страница без блока.  
2. Plain-object fixtures в unit-тестах остаются зелёными после фикса.  
3. Двойной `.toObject()` на уже plain — не должен ломать (idempotent guard).

## КРИТЕРИИ ПРИЁМКИ

1. Audit md существует; `cloneBlock` либо исправлен, либо в audit доказан safe (с фактом).  
2. Нет оставленных confirmed `{...TemplateBlockDocument}` без plain в scoped modules.  
3. ≥1 regression test на mongoose-like fixture PASS.  
4. Backend gates PASS.

## known_limitation

Другие модули BE вне studio/document-render — out of scope (отдельный TZ, если audit найдёт вне scope — только строка в audit «park»).

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S42-MONGOOSE-PLAIN-SPREAD.done.md`  
Checklist → `docs/agent-checklists/TZ-NX-DOCSTUDIO-S42-MONGOOSE-PLAIN-SPREAD.md`  
`_NOW` / QUEUE: Claude slot → done

## Claim slot
- agent_id: claude
- claimed_at: 2026-09-04T20:58:47Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

### Preflight Check Output
- **Context read:** `tasks/_ready/TZ-NX-DOCSTUDIO-S42-MONGOOSE-PLAIN-SPREAD.md`, `backend/src/modules/studio-document/studio-table-tokens.ts` (S37C fix), `backend/src/modules/studio-document/studio-data-resolver.ts` (`injectTableContent` reference pattern)
- **Key Constraints:** backend-only (`studio-document/**`, `document-render/**`); do not touch frontend-nx/Gantt (Freebuff active there); do not touch schema or token behavior beyond plain-field preservation
- **Planned Deliverable:** audit md across scoped modules → fix each confirmed case (starting with `cloneBlock`) with the S37C `.toObject()` pattern → regression test per fix → gates → optional multipage Preview sanity → archive + checklist + commit/push
- **Validation Path:** `tsc --noEmit` + `pnpm test` + `pnpm lint`; regression tests using a Mongoose-like fixture (layout as prototype getter) proven to fail pre-fix

## Что сделано (см. полный отчёт `docs/agent-checklists/TZ-NX-DOCSTUDIO-S42-MONGOOSE-PLAIN-SPREAD.md`)

Audit: `docs/audits/2026-09-05-mongoose-plain-spread-audit.md`. Один новый
подтверждённый случай — `cloneBlock` (`studio-multipage.utils.ts`), исправлен тем
же `.toObject()` паттерном, что S37C. Regression-тест с Mongoose-like фикстурой
(verified fail-on-old/pass-on-new). Живой multipage sanity: 3 страницы,
непустой контент на поздних страницах.

## Gates (факт)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
cd backend && pnpm test  → PASS, 126 suites / 1165 tests
cd backend && pnpm lint  → PASS, 0 errors
Live multipage Preview sanity → PASS
```

## Финализация (ARCHIVE_MARKER)

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: Claude
verification:
  - acceptance criteria: PASS (audit exists; cloneBlock fixed; regression test fail-on-old/pass-on-new; gates PASS)
  - typecheck: PASS
  - tests: PASS (1165/1165 incl. 2 new)
  - lint: PASS (0 errors)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-S42-MONGOOSE-PLAIN-SPREAD.md)
  - progress.md: N/A (bugfix, no architecture change)
  - status synchronization: PASS
```
