# LEDGER-03 — Nav / RBAC sample
date: 2026-08-16T15:50:00+03:00
agent: Buffy (freebuff)

## Score (0–100)
overall: 91
subscores:
  evidence_quality: 93
  sync_code_docs: 92
  risk_holes: 88

## What I opened (paths)
- frontend/src/app/layout/app-layout.component.ts — NAV_CATEGORIES (L99–280), navCategories computed-filter (L670–699, pageKey + capabilities + systemRoles)
- frontend/src/app/app.routes.ts — sample 30+ routes (все nav-пути), data.pageKey / capabilities / guards
- backend/src/common/seed/permissions.constants.ts — PERMISSIONS + PAGE_KEYS (L43–57)
- backend/src/common/seed/admin.seed.ts — ADMIN/DIRECTOR/MANAGER/WORKER_PAGES + permissions per role
- docs/FEATURE-INTEGRATION-CHECKLIST.md — §A (route/nav/PAGE_KEYS/seed/page.md), §B (capability)

## PASS evidence
- **Каждый nav item имеет route:** все ~35 пунктов NAV_CATEGORIES (Каталог/Клиенты/Сделки/Проект/Снабжение/Цех/Склад/Документы/Справочники/Админ) подтверждены grep-ом по app.routes.ts (products, products/:id, modules, materials, materials/:id, catalog/appearance, counterparties, people, proposals/create, proposals, contracts, orders, orders/:id, design, design/combine, supply, production, work-types, inventory, storage-items, stock-movements, warehouses, shipping, doc-constructor/{templates,texts,tables,documents,builder/:id}, import-todos, categories, dictionaries/measurements, color-references, doc-template-categories, text-block-categories, form-profiles, kind-labels, admin/devices, admin/roles, organizations).
- **Nav pageKey ∈ PAGE_KEYS:** все pageKey из NAV_CATEGORIES присутствуют в backend PAGE_KEYS (28 ключей); свёрка 1:1.
- **route.data.pageKey = nav item.pageKey** (выборка 30+): products, modules, materials, people, orders, production, proposals, contracts, doc-templates, doc-texts, doc-tables, doc-documents, inventory, storage-items, stock-movements, warehouses→inventory, categories, dictionaries, admin-users, admin-roles — совпадают.
- **Capabilities зеркалят:** production → data.capabilities ['production:read'] = nav (нет caps, но pageKey+CAPABILITY-гейт); admin/devices → ['user:admin']+systemRoles admin (route и nav идентичны); admin/roles → ['role:read']+ownerOnly (route mirror backend OwnerOnlyGuard) = nav.
- **Seed консистентен:** ADMIN_PAGES все 28; DIRECTOR/MANAGER без admin-*; WORKER только doc-texts/doc-documents; production есть у admin/director/manager; MANAGER_PERMISSIONS = production:read+write (TZ-PRODUCTION-309), DIRECTOR = production:read.
- **Nav-фильтр** (TZ-256 §ШАГ 3 / TZ-ACCESS-302): `user.pages.includes(pageKey)` + `caps.hasAny(capabilities)` + systemRoles — падает категория целиком при пустых items; admin-категория не видна не-админу.

## FINDINGS
| id | sev | area | repro/proof | action |
|----|-----|------|-------------|--------|
| F-01 | P3 | nav vs guard | «Цвета» (/dictionaries/color-references), «Виды изделий и материалов», «Профили быстрых форм» видны **директору** (страницы в DIRECTOR_PAGES), но route = `adminOnlyRouteGuard` (admin\|manager) → директор получает /forbidden. Backend всё равно Roles-гейтит — security ок, UX-разрыв | accept (документировано TZ-PRODUCTS-301 для цветов; для kind-labels/form-profiles — добавить systemRoles в nav или пометить TZ) |
| F-02 | P3 | seed выборка | MANAGER_PAGES не содержит 'categories'/'color-references' (менеджер не видит Классификацию/Цвета в nav) при наличии 'dictionaries' и остальных справочников — выглядит осознанно, но без явного комментария | accept / проверить с PO |

## TZ drafted (if any)
- Нет (обе находки P3, не дыры)

## Confidence note for Cursor
- Static-сверка nav ↔ route ↔ PAGE_KEYS ↔ seed чистая; **seed-выполнение в живой БД не доказано** (UNKNOWN по правилу lane: смотрел константы, не boot).
- Директор видит 2–3 справочных пункта, ведущих в /forbidden — косметика, не ACL-дыра.
- Кастомные роли (TZ-ADMIN-306) и динамика pages[] вне выборки.
