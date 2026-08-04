# Catalog readiness audit — FE↔BE before Wave 1 closeout

**Date:** 2026-08-04  
**Mode:** Audit + remediation plan (read-only; no product code)  
**HEAD:** `5c9d33e6774304e06b5d7337f41a6bf3a712fd9b` (`main`)  
**Dirty tree:** ~80 paths (CATALOG-301, MATERIALS-311, ACCESS/RBAC-304, UX-306, methodology) — **не трогались**  
**Parallel:** TZ-CATALOG-302 у другого ИИ · conflict keys product / product-module  
**Canon:** `tasks/TZ-CATALOG-300.md` · `docs/AUDIT-METHODOLOGY.md` · prior `docs/audits/2026-08-04-catalog-coherence-audit.md`

## Question

Будет ли каталог «на 100% рабочим» после 302→305, если закрыть только backend?
Что упущено во FE/cost/docs, и как разнести работу: другой ИИ vs Cursor?

## Verdict

**Нет — Wave 1 backend alone ≠ рабочая система.**  
После **304** текущий UI товаров/модулей и пересчёт себестоимости сломаются или начнут врать, пока нет FE cutover (или attach→composition redirect).  
**301 Material fields** на BE уже есть; **FE формы/типы их не знают** — классификация сырья в UI недоступна.  
WIP `backend/src/modules/catalog/composition-line.*` — **не подключён** к Product/Module (исполнитель 302 должен вобрать или удалить orphan).

Runtime/browser: **недоступен в этом прогоне** → LIKELY где нужен живой HTTP.

---

## Preflight

| Item | Value |
|------|--------|
| Branch | `main` |
| Active catalog stream | 302 (other AI) |
| Parked Wave 2 | 310–315 in `_backlog/catalog/` |
| Mongo/browser | not used (static audit) |
| Docs read | 300, CATALOG-WAVE1, AUDIT-METHODOLOGY, prior audit, explore inventory |

---

## Inventory (summary)

| Surface | FE | API today | BE SoT | Gap |
|---------|----|-----------|--------|-----|
| Materials list/form | `/materials` + dialog | CRUD `/materials` | Schema + 301 fields | FE **без** materialKind/weightKg/… |
| Material detail | **нет route** | GET `:id` есть | — | Wave 2 **312** |
| Modules list/detail | `/modules`, `:id` | CRUD `/modules`; materials via PATCH | `materials[]`, `workTypes[]` | нет composition; hard-delete |
| Products list/detail | `/products`, `:id` | CRUD + **attach** `POST …/modules` | `productModuleIds[]` | нет composition client |
| Cost | product detail dialogs | cost-calculations | rollup **только** legacy | 304 must dual-read |
| Work-types | `/work-types` | CRUD | вне composition | OK Phase 1 |
| People | `/people` | `/workers` | decoupled | **не блокер** каталога |
| Composition API | **нет** | planned 302 | WIP orphan files | 302 |

---

## Relation matrix (today vs Phase 1)

| Link | Today | After 302–305 | Risk |
|------|-------|---------------|------|
| Product→Module | `productModuleIds` (no qty) | composition `lineType=module` + qty | FE attach dies at 304 |
| Module→Material | embedded `materials[]` | composition `lineType=material` | FE PATCH materials dies |
| Module→WorkType | embedded `workTypes[]` | **остаётся** (не в composition) | не миграция 304 |
| Product→raw Material | нет UI | **запрет D2** | 302 validates |
| Product→Product | нет | 305 | после 304 |
| Cost | legacy walk | dual-read в 304 | иначе пустой rollup |

---

## Findings

### P0 — [CONFIRMED] FE 100% на legacy attach / materials[]

- Evidence: `pi-product-modules.service.ts` `attachToProduct` / `detachFromProduct`; `product-form-dialog` sync; `module-materials-form-dialog` PATCH `materials[]`; `products.page` expand читает `productModuleIds` + `m.materials.length`.
- Impact: день применения **304** (запрет legacy write) → create/edit состава в UI падает с 400/410.
- Recommendation: **TZ-CATALOG-317** (FE composition client + cutover) **до/вместе с** apply 304; либо 304 обязан redirect attach→composition (временный мост, задокументировать).
- Out of scope: полный CompositionTree polish (**311**).

### P0 — [CONFIRMED] Cost rollup только legacy

- Evidence: `cost-calculation.service.ts` populate `productModuleIds` → `mod.materials` / `workTypes`.
- Impact: после миграции в composition без sync `materials[]` → себестоимость 0/неверная.
- Recommendation: усилить AC **304** (уже есть пункт dual-read) — Cursor review **must** fail 304 без cost evidence.
- Child-TZ отдельный не нужен, если 304 не урежут.

### P1 — [CONFIRMED] Material 301 fields отсутствуют во FE

- Evidence: BE `material.schema.ts` / DTO имеют `materialKind`, `assortment`, `standardRef`, `materialGrade`, `weightKg`; FE `materials.service.ts` / form dialog — **0** совпадений по grep.
- Impact: нельзя классифицировать сырьё в UI; D2 на Product нельзя поддержать осознанно с карточки материала.
- Recommendation: **TZ-CATALOG-316** (можно **параллельно с 302** — только materials FE, без product/module composition keys).

### P1 — [CONFIRMED] Soft-delete декоративный + Module hard-delete

- Evidence: Material/Product/WorkType `remove()` пишет `deletedAt`, но list не фильтрует; Module `deleteOne()`. Docs `modules.page.md` врёт про soft-delete.
- Recommendation: Wave 2 **314**; docs fix → **TZ-CATALOG-319** (Cursor).

### P1 — [CONFIRMED] Orphan WIP composition package

- Evidence: `backend/src/modules/catalog/composition-line.{schema,service,dto}.ts` не подключены к product/module controllers.
- Recommendation: исполнитель **302** вобрать в wiring или удалить до archive; Cursor review checklist: «нет orphan catalog/».

### P2 — Photos split Module vs Product/Material

- Evidence: Module → `ProductModulePhoto` + `/product-module-photos`; Product/Material → `photoIds`.
- Recommendation: **313** после 305.

### P2 — Docs drift

- Evidence: `module-detail.page.md` пути photos; нет `product-detail.page.md`; PAGE-TZ-INDEX частично устарел.
- Recommendation: **319**.

### P3 / NOT A BUG

- WorkTypes вне composition — канон 300.
- People/UX-306 — вне состава каталога.
- Excel / BOM write / Gantt — out of Phase 1.
- UI composition поверх legacy — **запрет** (prior audit).

---

## Dependency graph (исполнение)

```text
301 DONE ──► 316 Material FE fields     } параллельно OK с 302
         └──► 302 composition API ──► 303 guards ──► 304 migrate+cost dual-read
                                              │         ▲
                                              └── 317 FE cutover ──┘  (GATE перед prod apply 304)
                                                    │
                                                    ▼
                                              305 Product→Product
                                                    │
                    ┌─────── Wave 2 ────────────────┤
                    310 where-used → 312 material detail
                    311 CompositionEditor (полная)
                    313 photos · 314 soft-delete · 315 polish
                    319 docs sync (Cursor, можно раньше)
```

---

## Child-TZ (новые / уточнённые)

| ID | Title | Who | When | File |
|----|-------|-----|------|------|
| **316** | Material FE: materialKind + weightKg + refs | Cursor **или** другой ИИ | **сейчас** ∥ 302 | `tasks/_backlog/catalog/TZ-CATALOG-316.md` |
| **317** | FE composition client + cutover (attach→composition) | другой ИИ (FE) | после 302 read API; **до prod 304** | `tasks/_backlog/catalog/TZ-CATALOG-317.md` |
| **319** | Catalog docs sync (soft-delete, photos, detail index) | **Cursor** | сейчас | `tasks/_backlog/catalog/TZ-CATALOG-319.md` |
| 302–305 | Wave 1 backend | другой ИИ | in flight | `tasks/TZ-CATALOG-302…305` |
| 310–315 | Wave 2 | later | after 305 | existing backlog |

---

## Who does what (практика)

| Агент | Делает спокойно | Не трогает |
|-------|-----------------|------------|
| **Другой ИИ** | 302→305; затем 317; затем 310/314 | FE polish косметику; docs lies (можно 319 Cursor) |
| **Cursor** | Review inbox `CATALOG-WAVE1-REVIEW.md`; **319**; **316** если свободен; аудит/TZ | product/module backend пока 302 IN WORK |
| **PO** | Не un-park 311 UI tree до composition GET | Не требовать «100%» после одного только 302 |

---

## Verification commands (для будущих executors)

```bash
# FE still legacy-only?
rg "attachToProduct|/composition" frontend/src/app/shared/services

# Material 301 on FE?
rg "materialKind|weightKg" frontend/src/app/pages/materials frontend/src/app/shared/services/materials.service.ts

# Cost dual-read?
rg "composition|productModuleIds" backend/src/modules/cost-calculation/cost-calculation.service.ts
```

## Handoff

После согласования PO: un-park **316** (сразу) и **317** (в очередь после 302 PASS).  
Обновить `_backlog/catalog/README.md` (сделано вместе с этим отчётом).
