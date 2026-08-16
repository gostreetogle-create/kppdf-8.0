# LEDGER-09 — Angular smart/dumb
date: 2026-08-16T17:25:00+03:00
agent: Buffy (freebuff)

## Score (0–100)
overall: 93
subscores:
  evidence_quality: 92
  sync_code_docs: 94
  risk_holes: 92

## What I opened (paths)
- docs/ANGULAR-GUIDE.md §2 — Container и presentational (правила: page владеет API; presentational = inputs/outputs, без domain services/Router/global state)
- frontend/src/app/pages/products/products.page.ts — container sample
- frontend/src/app/pages/materials/materials.page.ts — container sample
- frontend/src/app/shared/ui/pi-table.component.ts — presentational sample
- frontend/src/app/shared/ui/card/pi-showcase-card.component.ts — presentational sample
- frontend/src/app/pages/products/product-form-dialog.component.ts + pages/materials/material-form-dialog.component.ts — dialog form sample

## PASS evidence
- **Page = orchestration/API:** products.page.ts инжектит 9+ сервисов (ProductsService, CategoriesService, ProductModulesService, PiDialogService, PiChromeToolsService, API_BASE_URL, …) и владеет сигналами фильтров/сортировки; materials.page.ts — то же (MaterialsService, OrganizationsService, PhotosService, dialog, chrome). Соответствует §2 «Page/container».
- **Shared UI = inputs/outputs без HTTP:** pi-table.component.ts — только `input()/output()`, OnPush, сигналы, нет ни одного domain-сервиса/Router/HttpClient; server-side режим честный (`localSort=false` + `sortChange` наружу). pi-showcase-card.component.ts — только input-сигналы (size/mediaUrl/title/…), imports = LucideAngularModule; ни одного инжекта. Соответствует §2 «Presentational component».
- **Диалог-форма:** product/material-form-dialog инжектят ProductsService/MaterialsService/PhotosService — но это self-contained workflow (форма + загрузка зависимостей + save), вызывается из page-оркестратора; ANGULAR-GUIDE §2 не классифицирует диалоги явно, паттерн согласован по проекту (material-form-dialog и product-form-dialog однотипны).
- **Границы документированы:** production-cockpit.page.md «Smart / dumb boundary (TZ-PRODUCTION-327)» — smart shell + ProductionReadFacade + dumb scale-controls (input/output-only) — перекликается с §2.
- **Extract-правила §2 соблюдаются:** pi-table/pi-showcase-card переиспользуются (materials/products/modules/orders), имеют независимые состояния — не «wrapper ради строк».

## FINDINGS
| id | sev | area | repro/proof | action |
|----|-----|------|-------------|--------|
| F-01 | P3 | dialog forms | Формы-диалоги инжектят domain-сервисы (не чисто presentational) — осознанный «workflow dialog» паттерн, однотипен по каталогу; ANGULAR-GUIDE это не запрещает | accept (документировать в GUIDE, если хотим жёсткое правило) |
| F-02 | P3 | pi-table | `keyOf()` fallback на JSON.stringify при отсутствии `_id`/`id` — документированный риск identity-коллизий (недостижим для текущих потребителей) | accept (комментарий в коде уже есть) |

## TZ drafted (if any)
- Нет (P0/P1 architecture не найдено; НЕ рефакторю по правилу lane)

## Confidence note for Cursor
- 5 файлов выборки: container/presentational граница чистая; P0/P1 нет.
- Не проверял: каждый shared-компонент проекта (выборка 2 UI + 2 page + 2 dialog); возможны локальные исключения вне выборки.
- Диалог-формы — серая зона «workflow container»; если PO хочет строгость — дописать §2 GUIDE (P3).
