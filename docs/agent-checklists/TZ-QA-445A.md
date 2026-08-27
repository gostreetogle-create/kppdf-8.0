# TZ-QA-445A checklist

> Status: **DONE**
> Marker: pending archive вЂ” `tasks/_archive/2026-08/TZ-QA-445A.done.md`
> Commit/push: РїРѕ `docs/GIT-POLICY.md`

## Claim slot (РћР‘РЇР—РђРўР•Р›Р¬РќРћ РґРѕ РєРѕРґР°)

- agent_id: claude
- claimed_at: 2026-08-27T18:23:41Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable вЂ” Team Room РЅРµ РІ СЌС‚РѕР№ СЃРµСЃСЃРёРё; claim РІ marker/checklist

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel в†’ РѕР±Р° `D:\kppdf-8.0`
- [x] РџСЂРѕС‡РёС‚Р°Р» `_NOW.md` + `tasks/_active/` вЂ” keys РЅРµ РїРµСЂРµСЃРµРєР°СЋС‚СЃСЏ СЃ UX-444C (product-detail/material-detail)
- [x] TZ РїСЂРѕС‡РёС‚Р°РЅ (`tasks/TZ-QA-445A-work-types-create-modal.md`)
- [x] Claim slot Р·Р°РїРѕР»РЅРµРЅ
- [x] `tasks/_active/TZ-QA-445A.md` РЅР° РјРµСЃС‚Рµ (removed on archive)

### Preflight Check Output
- **Context read:** `tasks/TZ-QA-445A-work-types-create-modal.md`, `frontend/.../pages/work-types/work-types.page.ts`, `frontend/.../pages/work-types/work-types.page.spec.ts`, `frontend/.../shared/util/on-dialog-close-once.ts`, `frontend/.../pages/dictionaries/color-references.page.spec.ts` (mirror pattern for dialog-closeв†’reload test)
- **Key Constraints:** conflict keys only `pages/work-types/*`; РЅРµ С‚СЂРѕРіР°С‚СЊ `products` domain; РЅРµ С‡РёРЅРёС‚СЊ 401 РІСЃР»РµРїСѓСЋ вЂ” СЃРЅР°С‡Р°Р»Р° РІРѕСЃРїСЂРѕРёР·РІРµСЃС‚Рё Рё РґРёР°РіРЅРѕСЃС‚РёСЂРѕРІР°С‚СЊ
- **Planned Deliverable:** diagnosis + regression test lock (no product code change unless a real defect is proven)
- **Validation Path:** focused Jest РЅР° `work-types.page.spec.ts`

## Diagnosis (РІРѕСЃРїСЂРѕРёР·РІРµРґРµРЅРѕ Р»РѕРєР°Р»СЊРЅРѕ)

- 401 `GET /api/products/.../tree?maxDepth=2` вЂ” СЌС‚Рѕ **С„РѕРЅРѕРІС‹Р№ С€СѓРј**, РЅРµ РѕС‚РЅРѕСЃРёС‚СЃСЏ Рє work-types
  С„Р»РѕСѓ. work-types СЃС‚СЂР°РЅРёС†Рµ РЅРµ РЅСѓР¶РµРЅ Рё РЅРµ Р·Р°РїСЂР°С€РёРІР°РµС‚ `products/tree`; РІ РєРѕРґРµ
  `work-types.page.ts` РµРґРёРЅСЃС‚РІРµРЅРЅС‹Р№ HTTP-Р·Р°РїСЂРѕСЃ вЂ” `httpResource` РЅР°
  `/api/work-types` (`listRes`, СЃРј. `work-types.page.ts:192-194`). URL
  `products/.../tree` РїСЂРёРЅР°РґР»РµР¶РёС‚ РґСЂСѓРіРѕР№ С‡Р°СЃС‚Рё РїСЂРёР»РѕР¶РµРЅРёСЏ (product-detail
  where-used / composition tree), РєРѕС‚РѕСЂР°СЏ, СЃСѓРґСЏ РїРѕ СЃРєСЂРёРЅС€РѕС‚Сѓ, Р±С‹Р»Р° РѕС‚РєСЂС‹С‚Р° РІ
  С„РѕРЅРµ/РґСЂСѓРіРѕР№ РІРєР»Р°РґРєРµ С‚РѕРіРѕ Р¶Рµ Р±СЂР°СѓР·РµСЂР° Рё РµС‘ СЃРµСЃСЃРёРѕРЅРЅС‹Р№ С‚РѕРєРµРЅ РёСЃС‚С‘Рє РѕС‚РґРµР»СЊРЅРѕ.
  РќРёРєР°РєРѕРіРѕ Р·Р°РїСЂРѕСЃР° Рє work-types endpoint СЃ 401 РЅРµС‚.
- Refresh-after-create СѓР¶Рµ СЂРµР°Р»РёР·РѕРІР°РЅ РєРѕСЂСЂРµРєС‚РЅРѕ: `openCreate()` в†’
  `this.dialog.open(WorkTypeFormDialogComponent, вЂ¦)` в†’ `refreshOnDialogClose(ref)`
  в†’ `onDialogCloseOnce(ref, this.injector, () => this.listRes.reload())`
  (`work-types.page.ts:284-304`). Р”РёР°Р»РѕРі Р·Р°РєСЂС‹РІР°РµС‚СЃСЏ СЃРѕ Р·РЅР°С‡РµРЅРёРµРј С‚РѕР»СЊРєРѕ РїСЂРё
  СѓСЃРїРµС€РЅРѕРј СЃРѕС…СЂР°РЅРµРЅРёРё (`filter(Boolean)` РІ `on-dialog-close-once.ts`), РїРѕСЃР»Рµ
  С‡РµРіРѕ `listRes.reload()` Р±СЊС‘С‚ РїРѕ `/api/work-types` Р·Р°РЅРѕРІРѕ вЂ” СЃРїРёСЃРѕРє
  РѕР±РЅРѕРІР»СЏРµС‚СЃСЏ Р±РµР· СЂСѓС‡РЅРѕРіРѕ refresh. Р­С‚Рѕ С‚РѕС‚ Р¶Рµ РїР°С‚С‚РµСЂРЅ, С‡С‚Рѕ СѓР¶Рµ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ Рё
  РїСЂРѕС‚РµСЃС‚РёСЂРѕРІР°РЅ РІ `modules.page.ts` / `color-references.page.ts`.
- В«РџРѕРєР°Р·Р°РЅРѕ 0 РІРёРґРѕРІВ» РЅР° СЃРєСЂРёРЅС€РѕС‚Рµ, РІРµСЂРѕСЏС‚РЅРµРµ РІСЃРµРіРѕ, Р±С‹Р»Рѕ СѓР¶Рµ РґРѕ СЃР°Р±РјРёС‚Р°
  (СЃРїРёСЃРѕРє РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ РїСѓСЃС‚ РІ Р‘Р” РЅР° РјРѕРјРµРЅС‚ СЃРєСЂРёРЅС€РѕС‚Р°) вЂ” СЃР°Рј С„Р°РєС‚ РѕС‚РєСЂС‹С‚РёСЏ
  РјРѕРґР°Р»РєРё РЅРµ СЃРІСЏР·Р°РЅ СЃ СЃРѕСЃС‚РѕСЏРЅРёРµРј СЃРїРёСЃРєР° В«РґРѕВ».

## Acceptance

- [x] РЎРѕР·РґР°РЅРёРµ РІРёРґР° СЂР°Р±РѕС‚ С‡РµСЂРµР· РјРѕРґР°Р»РєСѓ РЅРµ РґР°С‘С‚ 401 РІ РєРѕРЅСЃРѕР»Рё, РѕС‚РЅРѕСЃСЏС‰РёР№СЃСЏ Рє
      work-types С„Р»РѕСѓ (401 РЅР° `products/tree` вЂ” РЅРµ РѕС‚РЅРѕСЃРёС‚СЃСЏ, РѕР±СЉСЏСЃРЅРµРЅРѕ РІС‹С€Рµ).
- [x] РЎРѕР·РґР°РЅРЅС‹Р№ РІРёРґ СЂР°Р±РѕС‚ РїРѕСЏРІР»СЏРµС‚СЃСЏ РІ С‚Р°Р±Р»РёС†Рµ Р±РµР· СЂСѓС‡РЅРѕРіРѕ refresh вЂ” СѓР¶Рµ
      СЂРµР°Р»РёР·РѕРІР°РЅРѕ (`refreshOnDialogClose` в†’ `listRes.reload()`), Р·Р°РєСЂРµРїР»РµРЅРѕ
      СЂРµРіСЂРµСЃСЃРёРѕРЅРЅС‹Рј С‚РµСЃС‚РѕРј.
- [x] NO product code change вЂ” РґРёР°РіРЅРѕР· РїРѕРґС‚РІРµСЂРґРёР» РѕС‚СЃСѓС‚СЃС‚РІРёРµ РґРµС„РµРєС‚Р°.

## Regression test added

- `frontend/src/app/pages/work-types/work-types.page.spec.ts`:
  `'reloads the list when the create dialog closes with a saved value'`
  вЂ” mirrors `color-references.page.spec.ts` dialog-close-signal pattern:
  opens create dialog, sets `closed` signal to a saved `WorkType`, asserts a
  second `GET /api/work-types` fires and the list reflects the reload.

## Integrity slot (РґРѕ READY / archive)

- [x] РўРёРї РёР·РјРµРЅРµРЅРёСЏ: test-only (regression lock; no product defect found)
- [x] FIC В§AвЂ“E N/A (РЅРµС‚ РЅРѕРІРѕРіРѕ route/permission/module/MCP); В§F N/A
- [x] docs/pages N/A вЂ” work-types page.md РЅРµ СЃСѓС‰РµСЃС‚РІСѓРµС‚ РѕС‚РґРµР»СЊРЅРѕ; РїРѕРІРµРґРµРЅРёРµ РЅРµ РёР·РјРµРЅРµРЅРѕ
- [x] SECTION-READINESS N/A
- [x] Р§СѓР¶РѕР№ WIP РЅРµ РІ РєРѕРјРјРёС‚Рµ; conflict keys СЃРѕР±Р»СЋРґРµРЅС‹ (С‚РѕР»СЊРєРѕ `pages/work-types/*`)
- [x] Coupling map N/A
- [x] РљР°РЅРѕРЅ: docs/DOCS-INTEGRITY.md

## Gates / Executor report

- FE tsc: PASS
- Jest (focused `work-types.page.spec.ts`): PASS
- Archive: `tasks/_archive/2026-08/TZ-QA-445A.done.md`
- Lock: `.mimocode/locks/TZ-QA-445A-work-types-create-modal.lock`
- Deploy: NO
## Gates (факт)

- `cd frontend && npx jest --testPathPattern=pages/work-types/work-types.page` → PASS 6/6

## Executor report (auto)

- Diagnosis: 401 = products/tree background noise; refresh-after-create already correct
- Added regression test locking create→reload
- closed_at: 2026-08-27T21:25:47+03:00
- Archive: tasks/_archive/2026-08/TZ-QA-445A.done.md
- Deploy: NO
