# TZ-OPS-315: РЎСѓР·РёС‚СЊ status РїСЂРё СЃРѕР·РґР°РЅРёРё Р·Р°РєР°Р·Р° (create bypass transition graph)

> РСЃС‚РѕС‡РЅРёРє: LEDGER-05 (docs/audits/confidence/05-deals-contract.md, F-01).
> РўРѕРЅРєРёР№ backend-РєРѕРЅС‚СЂР°РєС‚ TZ.

> **OUTCOME (2026-08-16, P2 run):** DTO СЃСѓР¶РµРЅ РґРѕ `draft|confirmed` (RU message), РІ
> `OrderService.create` РґРѕР±Р°РІР»РµРЅ guard (CREATE_ALLOWED_STATUSES + RU 400 РґР»СЏ
> shipped/delivered/cancelled/in_production/ready), 3 РЅРѕРІС‹С… spec (default draft, confirmed РѕРє,
> BLOCK create РІ HARD_FROZEN). Jest order 45/45 PASS, BE tsc PASS.

## ROLE
backend executor

## CONFLICT KEYS
- backend/src/modules/order/dto/create-order.dto.ts
- backend/src/modules/order/order.service.ts (create, РѕРґРЅР° СЃС‚СЂРѕРєР°)

## РРЎРҐРћР”РќРћР• (РїСЂРѕРІРµСЂРµРЅРѕ 2026-08-16)
`CreateOrderDto.status` enum: `draft|confirmed|in_production|ready|shipped|delivered|cancelled`
(create-order.dto.ts L68вЂ“73). `OrderService.create()` РїСЂРёСЃРІР°РёРІР°РµС‚ `status: dto.status ?? 'draft'`
Р±РµР· РїСЂРѕРІРµСЂРєРё РіСЂР°С„Р°. `POST /api/orders {status:'shipped'}` СЃРѕР·РґР°С‘С‚ Р·Р°РєР°Р· В«РћС‚РіСЂСѓР¶РµРЅВ» Р±РµР· Shipment,
audit ship-РґРµР№СЃС‚РІРёСЏ Рё Р±РµР· РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё РІРµСЂРЅСѓС‚СЊСЃСЏ (HARD_FROZEN РёР· PATCH). РЎРїРµРєРё РїРѕРєСЂС‹РІР°СЋС‚ PATCH-
Р±Р»РѕРєРёСЂРѕРІРєРё, РЅРѕ РЅРµ create. FE form С€Р»С‘С‚ Р±РµР· status в†’ draft (Р±Р°РіР° РЅРµС‚).

## Р§РўРћ Р”Р•Р›РђРўР¬
1. Р’ `CreateOrderDto.status` СЃСѓР·РёС‚СЊ РґРѕ `'draft' | 'confirmed'` (РёР»Рё СѓР±СЂР°С‚СЊ РїРѕР»Рµ в†’ РІСЃРµРіРґР° draft).
2. Р’ `OrderService.create` РќР• РїСЂРёРЅРёРјР°С‚СЊ shipped/delivered/cancelled (Р·Р°С‰РёС‚Р° РѕС‚ РѕР±С…РѕРґР° С‡РµСЂРµР·
   raw JSON, РµСЃР»Рё DTO-whitelist РѕР±РѕР№РґС‘РЅ).
3. Spec: СЃРѕР·РґР°С‚СЊ Р·Р°РєР°Р· СЃРѕ СЃС‚Р°С‚СѓСЃРѕРј shipped в†’ 400 (RU message). РџСЂРѕРІРµСЂРёС‚СЊ convertToOrder
   (СЃРѕР·РґР°С‘С‚ Р·Р°РєР°Р· РёР· РљРџ) РЅРµ СЃР»РѕРјР°РЅ вЂ” С‚Р°Рј СЃС‚Р°С‚СѓСЃ draft.
4. Gates: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` + `jest order`.

## РР—РњР•РќРЇРўР¬ / РќР• РР—РњР•РќРЇРўР¬
- РР·РјРµРЅСЏС‚СЊ: DTO + create + spec.
- РќР• РјРµРЅСЏС‚СЊ: PATCH-РіСЂР°С„, ship/cancel endpoints, FE, freeze Р»РѕРіРёРєСѓ.

## AC
- [ ] create СЃРѕ shipped/delivered/cancelled в†’ 400 СЃ RU
- [ ] convertToOrder/РѕР±С‹С‡РЅС‹Р№ create в†’ draft (СЂРµРіСЂРµСЃСЃРёР№ РЅРµС‚)
- [ ] gates PASS

## known_limitation
- РљР°СЃС‚РѕРјРЅС‹Рµ СЂРѕР»Рё/РёРЅС‹Рµ РєР»РёРµРЅС‚С‹ API РІРЅРµ РїСЂРѕРІРµСЂРєРё.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T13:25:00+03:00
closed_by: cursor-composer (P2 remediation closeout + OPS-315 UpdateOrderDto regression fix)
TZ: TZ-OPS-315
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

COMMIT: aba3842b6574a58d3ca078d4f1fc1a9401786aa7

## known_limitation

- Deploy not run (PO: deploy forbidden for this wave).
