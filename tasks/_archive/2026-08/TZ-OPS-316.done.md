# TZ-OPS-316: РЈР±СЂР°С‚СЊ stale Material.stockQty РёР· РІРёС‚СЂРёРЅС‹ РјР°С‚РµСЂРёР°Р»РѕРІ

> РСЃС‚РѕС‡РЅРёРє: LEDGER-07 (docs/audits/confidence/07-warehouse.md, F-01/F-02).
> РљР°РЅРѕРЅ: COUPLING-MAP В§3 / FIC В§D вЂ” SoT РѕСЃС‚Р°С‚РєР° = StorageItem, РќР• Material.stockQty.

> **OUTCOME (2026-08-16, P2 run):** В«РћСЃС‚Р°С‚РѕРє: {{ row.stockQty }}В» СѓР±СЂР°РЅ РёР· expand-Р±Р»РѕРєР°
> В«Р¦РµРЅР° Рё СЃРєР»Р°РґВ» (materials.page.ts); РєРѕР»РѕРЅРєР° В«РЎРєР»Р°РґВ» РѕСЃС‚Р°С‘С‚СЃСЏ РєР°Рє СЃСЃС‹Р»РєР° В«РЎРєР»Р°Рґ в†’В» РЅР°
> /storage-items?materialId= (РѕРЅР° РЅРёРєРѕРіРґР° РЅРµ РїРѕРєР°Р·С‹РІР°Р»Р° С‡РёСЃР»Рѕ). FE tsc PASS, jest materials.page
> 27/27 PASS. registry.service.ts (legacy metadata) РЅРµ С‚СЂРѕРіР°Р»СЃСЏ вЂ” РІРЅРµ scope.

## ROLE
frontend (materials page) + РѕРїС†. backend registry

## CONFLICT KEYS
- frontend/src/app/pages/materials/materials.page.ts (+ spec)
- РѕРїС†. backend/src/modules/registry/registry.service.ts

## РРЎРҐРћР”РќРћР• (РїСЂРѕРІРµСЂРµРЅРѕ 2026-08-16)
- materials.page.ts: РєРѕР»РѕРЅРєР° `{ key: 'stockQty', label: 'РЎРєР»Р°Рґ' }` (L899) + expand В«Р¦РµРЅР° Рё СЃРєР»Р°РґВ» в†’ В«РћСЃС‚Р°С‚РѕРє: {{ row.stockQty }}В» (L573вЂ“577).
- `Material.stockQty` (material.schema.ts L69) РЅРёРєС‚Рѕ РЅРµ РѕР±РЅРѕРІР»СЏРµС‚ РёР· РґРІРёР¶РµРЅРёР№ (grep: stock-movement/storage-item/inventory вЂ” 0 Р°РїРґРµР№С‚РѕРІ); С„РѕСЂРјР° РјР°С‚РµСЂРёР°Р»Р° РїРѕР»Рµ СѓР±СЂР°Р»Р° (В«РћСЃС‚Р°С‚РѕРє вЂ” РІ СЂР°Р·РґРµР»Рµ вЂћРЎРєР»Р°Рґ"В»).
- РџСЂР°РІРёР»СЊРЅС‹Р№ РѕСЃС‚Р°С‚РѕРє: `GET /api/storage-items?materialId=<id>` в†’ StorageItem[].quantity (read-only).

## Р§РўРћ Р”Р•Р›РђРўР¬ (РІР°СЂРёР°РЅС‚ A вЂ” СЂРµРєРѕРјРµРЅРґСѓРµРјС‹Р№)
1. РЈР±СЂР°С‚СЊ РєРѕР»РѕРЅРєСѓ В«РЎРєР»Р°РґВ» (stockQty) РёР· СЃРїРёСЃРєР° РјР°С‚РµСЂРёР°Р»РѕРІ Рё Р±Р»РѕРє В«РћСЃС‚Р°С‚РѕРєВ» РёР· expand.
2. РћСЃС‚Р°РІРёС‚СЊ С‚РѕР»СЊРєРѕ СЃСЃС‹Р»РєСѓ В«РЎРєР»Р°Рґ в†’В» (/storage-items?materialId=) РєР°Рє escape-hatch.
3. (РћРїС†РёРѕРЅР°Р»СЊРЅРѕ, РѕРґРЅРёРј РєРѕРјРјРёС‚РѕРј) РІ registry.service.ts СѓР±СЂР°С‚СЊ/РїРµСЂРµРїРёСЃР°С‚СЊ stockQty РёР· РјРµС‚Р°РґР°РЅРЅС‹С….
4. Spec: РѕР±РЅРѕРІРёС‚СЊ materials.page.spec / 373.spec (СѓР±СЂР°С‚СЊ РѕР¶РёРґР°РЅРёСЏ stockQty); РґРѕР±Р°РІРёС‚СЊ С‚РµСЃС‚ В«РєРѕР»РѕРЅРєРё РЅРµС‚В».
5. Gates: `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` + jest materials.page.

## РР—РњР•РќРЇРўР¬ / РќР• РР—РњР•РќРЇРўР¬
- РР·РјРµРЅСЏС‚СЊ: С‚РѕР»СЊРєРѕ РІРёС‚СЂРёРЅСѓ materials (РєРѕР»РѕРЅРєР°/Р±Р»РѕРє) + spec; registry РїСЂРё Р¶РµР»Р°РЅРёРё.
- РќР• РјРµРЅСЏС‚СЊ: /storage-items, backend storage-item, Material schema/DTO (РїРѕР»Рµ РѕСЃС‚Р°С‘С‚СЃСЏ legacy-СЃРѕРІРјРµСЃС‚РёРјС‹Рј), products.

## AC
- [ ] Р’ СЃРїРёСЃРєРµ РјР°С‚РµСЂРёР°Р»РѕРІ РЅРµС‚ РєРѕР»РѕРЅРєРё В«РЎРєР»Р°РґВ» СЃРѕ stockQty
- [ ] Р’ expand РЅРµС‚ В«РћСЃС‚Р°С‚РѕРєВ» РёР· row.stockQty; СЃСЃС‹Р»РєР° В«РЎРєР»Р°Рґ в†’В» СЂР°Р±РѕС‚Р°РµС‚
- [ ] tsc + jest PASS
- [ ] FIC В§D РЅРµ РЅР°СЂСѓС€Р°РµС‚СЃСЏ (РѕСЃС‚Р°С‚РѕРє РЅРёРіРґРµ РЅРµ РІС‹РґР°С‘С‚СЃСЏ Р·Р° РїСЂР°РІРґСѓ)

## known_limitation
- Р•СЃР»Рё РєР°РєРѕР№-С‚Рѕ СЌРєСЂР°РЅ РІСЃС‘ Р¶Рµ РїРёС€РµС‚ stockQty С‡РµСЂРµР· API вЂ” РЅРµ С‚СЂРѕРіР°РµРј (legacy), С‚РѕР»СЊРєРѕ РІРёС‚СЂРёРЅР°.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T13:25:00+03:00
closed_by: cursor-composer (P2 remediation closeout + OPS-315 UpdateOrderDto regression fix)
TZ: TZ-OPS-316
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

COMMIT: a1ad0e35d12299423d33cf8db890d0e3710f5585

## known_limitation

- Deploy not run (PO: deploy forbidden for this wave).
