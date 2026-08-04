# TZ-CATALOG-301 checklist

> Executor: другой ИИ · Architect: Cursor Mode A  
> TZ: `tasks/TZ-CATALOG-301.md` · Layer 4 · Канон: `tasks/TZ-CATALOG-300.md`  
> Оркестрация: `tasks/CATALOG-WAVE1.md`  
> Status: **PASS (architect)** — можно DONE / архив по сигналу PO; **302 ещё не стартовать без «стартуем 302»**

## Preflight (исполнитель — до первой правки)

- [x] Прочитал канон / TZ-301
- [x] Scope: только Material backend (+ migration + tests)
- [x] Product/ProductModule composition, FE, Excel — не тронуты

## Acceptance (из TZ-301)

- [x] Schema: `materialKind`, `assortment`, `standardRef`, `materialGrade`, `weightKg`
- [x] Поля `grade` как имени **нет**
- [x] DTO create/update + validation (enum, Min(0) weightKg); Update via PartialType
- [x] Service прокидывает поля (`create` spread dto); sku-логика не сломана
- [x] Optional list filter `GET /materials?materialKind=`
- [x] Migration idempotent: missing/null → `other`; повтор → modified=0
- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS (Cursor re-check)
- [x] Targeted Jest 23/23 PASS (Cursor re-check)
- [x] `materials.e2e-spec.ts` 6/6 PASS после `docker start kppdf-mongo` (Cursor 2026-08-04)
- [x] FE / product composition **не** изменены

## Conflict keys (факт diff)

- `backend/src/modules/material/material.schema.ts`
- `backend/src/modules/material/dto/create-material.dto.ts`
- `backend/src/modules/material/material.service.ts`
- `backend/src/modules/material/material.controller.ts`
- `backend/src/database/migrations/2026-08-04-TZ-CATALOG-301-material-fields.ts`
- `backend/src/database/migrations/2026-08-04-TZ-CATALOG-301-material-fields.spec.ts`
- `backend/src/modules/material/material.catalog-301.spec.ts`
- `backend/test/e2e/materials.e2e-spec.ts`  
- `update-material.dto.ts` — без изменений (PartialType от Create — ок)

## Executor report (auto)

- status: был BLOCKED (Mongo down); реализация/unit ок; commit не делался
- commit: none
- files: Material schema/DTO/service/controller; migration + specs; materials e2e
- gates (executor): tsc PASS; Jest 23/23; diff-check PASS; e2e BLOCKED ECONNREFUSED :27017
- known_issues: нужен Mongo для e2e — **снято Cursor’ом** (см. verdict)

## Architect verdict (Cursor)

- Status: **PASS**
- Date: 2026-08-04
- Scope: OK — нет правок `product*` / `product-module*` / `frontend/`
- Fields: OK — `MATERIAL_KINDS`, `materialGrade` (не `grade`), `weightKg` min 0
- Migration: OK — `collection.updateMany` на missing/null; unit доказывает idempotent
- Dual path create: `model.create({ ...dto })` — новые поля проходят
- E2E: Cursor поднял `kppdf-mongo`, прогон `materials.e2e-spec.ts` → **6/6 PASS**
- Notes: e2e не покрывает filter `?materialKind=` отдельно (есть unit/service path) — не блокер
- Next: PO может commit; **не** стартовать 302 без явного «стартуем 302»
