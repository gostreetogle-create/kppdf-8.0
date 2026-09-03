# TZ-BACKEND-CATALOG-PART-BOM-IN-TREE: Деталь BOM внутри Product/Module tree

**РОЛЬ АГЕНТА:** Executor (backend)  
**LAYER:** 4  
**CONFLICT KEYS:** `backend/src/modules/catalog-graph/catalog-graph.service.ts`; `backend/src/modules/catalog-graph/catalog-graph.service.spec.ts`  
**ЗАВИСИМОСТИ:** `TZ-NX-DETAIL-MATERIAL-BOM` DONE; `TZ-BACKEND-VALIDATION-NESTED-I18N` (предыдущая в этой волне — не пересекается по keys, можно сразу после её archive)  
**PAGES:** `/registries` (tree read)  
**PAGE_DOCS:** N/A (backend tree API)

Проверено: `catalog-graph.service.ts` `buildMaterialTree` / `getChildren` / `buildNode` / `maxDescendantDepth`; `material.schema.ts` `materialKind` + composition; PARK note в `docs/agent-checklists/_NOW.md` (Деталь BOM не виден внутри Product tree).

## ИСХОДНОЕ СОСТОЯНИЕ

1. `GET` tree для `kind=material` уже отдаёт плоский BOM через `buildMaterialTree` (A4).
2. В `buildNode` для Product/Module: `getChildren` при `lineType === 'material'` возвращает `[]`, и ветка `kind === 'material' ? [] : getChildren(...)` **не раскрывает** composition Детали (`materialKind='part'`), когда она вложена в модуль/изделие.
3. Оператор: изделие → модуль → Деталь — у Детали нет детей-сырья в полном дереве, хотя у самой Детали BOM есть.

## ЧТО ДЕЛАТЬ

1. CLAIM + checklist.
2. **Только display-path** в `buildNode`: когда child `kind === 'material'` и у материала есть `composition` (типично `materialKind='part'`), наполнить **ровно один** уровень детей (raw lines → lookupMaterial), тем же контрактом узла что `buildMaterialTree`. Не ходить глубже: raw не имеют composition.
3. **Не** менять `getChildren` / `maxDescendantDepth` семантики для cycle/depth при add-line: `lineType === 'material' → depth 0` остаётся. Иначе сломаешь CYCLE_HIT / maxDepth add validation.
4. Specs: product (или module) tree содержит part-material с children raw; raw leaf без детей; cycle/visited на product↔module не регрессирует; `getTree('material', partId)` по-прежнему работает.
5. Gates → archive → commit+push.

## ИЗМЕНЯТЬ

- `backend/src/modules/catalog-graph/catalog-graph.service.ts`  
- `backend/src/modules/catalog-graph/catalog-graph.service.spec.ts`  
- WAVE / QUEUE / archive

## НЕ ИЗМЕНЯТЬ

- `frontend-nx/**`, `frontend/**`  
- Write-path composition CRUD / material BOM API (уже есть)  
- `maxDescendantDepth` / add-composition cycle rules  
- Schema invent / новые endpoints

## КРИТЕРИИ ПРИЁМКИ

1. Tree изделия/модуля, где в составе есть Деталь с BOM, показывает сырьё Детали одним уровнем под ней.
2. `getTree('material', id)` поведение A4 не сломано.
3. Add-line cycle/depth checks (material → 0 descendant depth) без регрессии в существующих specs.
4. Gates:
   ```text
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- catalog-graph.service
   cd backend && pnpm test
   ```

## known_limitation

- FE registry tree UI может уже потреблять API as-is; отдельный FE polish — не этот TZ.
- Recurse «Деталь внутри Детали» не требуется (канон A4: part BOM = raw only).

## Финализация

Archive → `tasks/_archive/2026-08/TZ-BACKEND-CATALOG-PART-BOM-IN-TREE.done.md` + executor report.
