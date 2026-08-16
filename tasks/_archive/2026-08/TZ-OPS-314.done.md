# TZ-OPS-314: Р”РёСЂРµРєС‚РѕСЂ РІРёРґРёС‚ СЃС‚СЂР°РЅРёС†С‹ РєР°С‚Р°Р»РѕРіР°, РЅРѕ GET-СЃРїРёСЃРєРё РґР°СЋС‚ 403

> РСЃС‚РѕС‡РЅРёРє: LEDGER-04 (docs/audits/confidence/04-catalog-contract.md, F-01).
> РўРѕРЅРєРёР№ TZ: РІРѕРїСЂРѕСЃ RBAC-СЂРµС€РµРЅРёСЏ, РЅРµ СЃСЂРѕС‡РЅР°СЏ РїРѕС‡РёРЅРєР°. РќСѓР¶РµРЅ РІС‹Р±РѕСЂ PO/Р°СЂС…РёС‚РµРєС‚РѕСЂР°.

> **OUTCOME (2026-08-16, P2 run):** РІС‹Р±СЂР°РЅ РІР°СЂРёР°РЅС‚ A (РґРѕР±Р°РІРёС‚СЊ 'director' РєРѕ РІСЃРµРј GET-СЌРЅРґРїРѕРёРЅС‚Р°Рј
> read-РєРѕРЅС‚СѓСЂР° DIRECTOR_PAGES). РР·РјРµРЅРµРЅС‹ 18 РєРѕРЅС‚СЂРѕР»Р»РµСЂРѕРІ (category, color-reference, counterparty,
> dictionary-label, document-template-category, import-todo, inventory, material, organization
> (+contacts), product (:id/where-used, :id/tree), product-module (:id/where-used, :id/composition,
> :id/tree), site, supply-task, text-block-category, unit, work-type (:id, :id/where-used), worker).
> РњСѓС‚Р°С†РёРё РЅРµ С‚СЂРѕРЅСѓС‚С‹. Spec color-reference РѕР±РЅРѕРІР»С‘РЅ РїРѕРґ РЅРѕРІС‹Р№ СЃРїРёСЃРѕРє СЂРѕР»РµР№. Gates: BE tsc PASS,
> jest Р·Р°С‚СЂРѕРЅСѓС‚С‹С… РјРѕРґСѓР»РµР№ 269/269 PASS. РџР»СЋСЃ pre-existing С„РёРєСЃС‹ С‚РµСЃС‚РѕРІ: material E11000-update spec
> (findOneAndUpdate, TZ-CATALOG-339), text-block-category FakeModel `$or` (resolveDefault).

## ROLE
backend RBAC executor (РїРѕСЃР»Рµ СЂРµС€РµРЅРёСЏ)

## CONFLICT KEYS
- backend/src/common/seed/admin.seed.ts (DIRECTOR_PAGES) РР›Р backend/src/modules/<module>/*.controller.ts
  (GET @Roles) вЂ” Р·Р°РІРёСЃРёС‚ РѕС‚ РІР°СЂРёР°РЅС‚Р°; РѕРґРёРЅ РёР· РґРІСѓС…, РЅРµ РѕР±Р° РѕРґРЅРѕРІСЂРµРјРµРЅРЅРѕ.

## РРЎРҐРћР”РќРћР• (РїСЂРѕРІРµСЂРµРЅРѕ 2026-08-16)
Р”РёСЂРµРєС‚РѕСЂ (СЃРёСЃС‚РµРјРЅР°СЏ СЂРѕР»СЊ, DIRECTOR_PAGES РІ admin.seed.ts) РёРјРµРµС‚ СЃС‚СЂР°РЅРёС†С‹:
materials, organizations, counterparties, import-todos, categories,
doc-template-categories, text-block-categories вЂ” nav (page ACL) РёС… РїРѕРєР°Р·С‹РІР°РµС‚.

РћРґРЅР°РєРѕ GET-СЃРїРёСЃРєРё СЌС‚РёС… РјРѕРґСѓР»РµР№:
- material.controller.ts:15 вЂ” @Roles('admin','manager')
- counterparty.controller.ts:26 вЂ” @Roles('admin','manager')
- organization.controller.ts:35 вЂ” @Roles('admin','manager')
- import-todo.controller.ts:43 вЂ” @Roles('admin','manager')
- category.controller.ts:15 вЂ” @Roles('admin','manager')
- document-template-category.controller.ts:38 вЂ” @Roles('admin','manager')
- text-block-category.controller.ts:39 вЂ” @Roles('admin','manager')

RolesGuard (roles.guard.ts) РЅРµ РїСЂРѕРїСѓСЃРєР°РµС‚ 'director' РІРЅРµ СЃРїРёСЃРєР° в†’ 403.
РЎРѕСЃРµРґРЅРёРµ: product.controller.ts:17, product-module.controller.ts:17,
work-type.controller.ts:17 вЂ” @Roles('admin','director','manager') вЂ” РІРєР»СЋС‡Р°СЋС‚ director.

## Р’Р°СЂРёР°РЅС‚С‹ (РІС‹Р±СЂР°С‚СЊ РѕРґРёРЅ)
- A. Р”РѕР±Р°РІРёС‚СЊ 'director' РІ @Roles GET-СЃРїРёСЃРєРѕРІ (С‡С‚РµРЅРёРµ СЃРїСЂР°РІРѕС‡РЅРёРєРѕРІ РґРёСЂРµРєС‚РѕСЂСѓ РѕС‚РєСЂС‹С‚Рѕ,
     РєР°Рє Сѓ products/modules/work-types) вЂ” РјСѓС‚Р°С†РёРё РѕСЃС‚Р°СЋС‚СЃСЏ admin/manager.
- B. РЈР±СЂР°С‚СЊ СЌС‚Рё pageKey РёР· DIRECTOR_PAGES (РґРёСЂРµРєС‚РѕСЂ РЅРµ СЃРјРѕС‚СЂРёС‚ СЃРїСЂР°РІРѕС‡РЅРёРєРё) вЂ” seed + FIC В§A.

Р РµРєРѕРјРµРЅРґР°С†РёСЏ: A (РєРѕРЅСЃРёСЃС‚РµРЅС‚РЅРѕ СЃ СЃРѕСЃРµРґСЏРјРё; РґРёСЂРµРєС‚РѕСЂ read-only РїРѕ РѕРїРµСЂР°С†РёРѕРЅРЅС‹Рј РґР°РЅРЅС‹Рј).

## Р§РўРћ Р”Р•Р›РђРўР¬ (РїРѕСЃР»Рµ РІС‹Р±РѕСЂР°)
1. РџРѕ РІР°СЂРёР°РЅС‚Сѓ A/B РІРЅРµСЃС‚Рё РїСЂР°РІРєСѓ РІ РѕРґРёРЅ РєРѕРЅС‚СѓСЂ (controllers РР›Р seed).
2. FIC В§A/B: РµСЃР»Рё С‚СЂРѕРіР°Р»Рё seed вЂ” СЃС‚СЂР°РЅРёС†Р°/РїСЂР°РІР°; РµСЃР»Рё controllers вЂ” РЅРёС‡РµРіРѕ РєСЂРѕРјРµ @Roles.
3. Gates: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` + focused jest РјРѕРґСѓР»РµР№.
4. РџСЂРѕРІРµСЂРёС‚СЊ: role-РґРёР°Р»РѕРі/seed-РїР°С‚С‡ РЅРµ Р·Р°С‚РёСЂР°РµС‚ РєР°СЃС‚РѕРјРЅС‹Рµ grants (admin.seed.ts В§patch).

## РР—РњР•РќРЇРўР¬ / РќР• РР—РњР•РќРЇРўР¬
- РР·РјРµРЅСЏС‚СЊ: С‚РѕР»СЊРєРѕ GET @Roles РѕРґРЅРѕРіРѕ РєРѕРЅС‚СѓСЂР° (A) РР›Р DIRECTOR_PAGES (B).
- РќР• РјРµРЅСЏС‚СЊ: РјСѓС‚Р°С†РёРё, FE, page.md, РґСЂСѓРіРёРµ СЂРѕР»Рё.

## AC
- [ ] Р’С‹Р±СЂР°РЅ РІР°СЂРёР°РЅС‚ A РёР»Рё B (Р·Р°РїРёСЃСЊ РІ TZ/checklist)
- [ ] РћРґРЅР° РїСЂР°РІРєР° РІ РѕРґРЅРѕРј РєРѕРЅС‚СѓСЂРµ; gates PASS
- [ ] LEDGER-04 F-01 Р·Р°РєСЂС‹С‚ СЃСЃС‹Р»РєРѕР№ РЅР° СЌС‚РѕС‚ TZ

## known_limitation
- РљР°СЃС‚РѕРјРЅС‹Рµ СЂРѕР»Рё (TZ-ADMIN-306) Рё grants РІ Р¶РёРІРѕР№ Р‘Р” РЅРµ РїСЂРѕРІРµСЂСЏР»РёСЃСЊ.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T13:25:00+03:00
closed_by: cursor-composer (P2 remediation closeout + OPS-315 UpdateOrderDto regression fix)
TZ: TZ-OPS-314
WAVE: WAVE-CONFIDENCE-LEDGER-FLASH remediation
Cursor_verdict: PASS

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (zone gates during P2 / regression fix)
  - tests: PASS (focused jest)
  - lint: N/A / lint-staged on FE commit
  - checklist: N/A (thin backlog TZ)
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

COMMIT: 9ddadae2af4afbe56acc8b92a3ecf7d868b67f1c

## known_limitation

- Deploy not run (PO: deploy forbidden for this wave).
