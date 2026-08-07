# TZ-CATALOG-330 вЂ” Р¦РІРµС‚Р° С‚РёРїРѕРІ РєР°С‚Р°Р»РѕРіР° РЅР° РґРµСЂРµРІРµ СЃРѕСЃС‚Р°РІР°

> Backlog / park. РџРѕРґРЅСЏС‚СЊ РІ `tasks/` РєРѕРіРґР° PO СЃРєР°Р¶РµС‚ В«РІ СЂР°Р±РѕС‚СѓВ».  
> РђСѓРґРёС‚: `docs/audits/2026-08-07-catalog-entity-colors-audit.md`

```
PAGES: /products/:id ; /modules/:id
PAGE_DOCS: product-detail.page.md ; ui-composition-tree.md
```

## Р РћР›Р¬ РђР“Р•РќРўРђ

Frontend (+ РјРёРЅРёРјР°Р»СЊРЅС‹Р№ shared helper). Backend persist вЂ” **РЅРµ** РІ СЌС‚РѕРј TZ
(defaults РІ РєРѕРґРµ). Persist + СЌРєСЂР°РЅ РЅР°СЃС‚СЂРѕРµРє в†’ TZ-CATALOG-331.

## Р—РђР’РРЎРРњРћРЎРўР

- Composition tree + BOM panel РЅР° РљР°СЂС‚РѕС‡РєРµ РёР·РґРµР»РёСЏ (СѓР¶Рµ РІ main).
- Р­С‚Р°Р»РѕРЅ hue UI: `WorkTypeFormDialog` / `workTypeOklch` (С‚РѕР»СЊРєРѕ РїР°С‚С‚РµСЂРЅ, РЅРµ РєРѕРїРёРїР°СЃС‚ Р“Р°РЅС‚Р°).

## LAYER

2

## CONFLICT KEYS

```
frontend/src/app/shared/ui/composition/composition-tree.component.ts;
frontend/src/app/pages/products/product-bom-panel.component.ts;
frontend/src/app/shared/ui/catalog/catalog-kind-oklch.ts;
docs/pages/ui-composition-tree.md;
docs/pages/product-detail.page.md
```

## РРЎРҐРћР”РќРћР• РЎРћРЎРўРћРЇРќРР•

- Р”РµСЂРµРІРѕ: Р±РµР№РґР¶Рё РёР·Рґ/РјРѕРґ/РјР°С‚, Р±РµР· kind-РїР°Р»РёС‚СЂС‹.
- WorkType: `accentHue` + `workTypeOklch` вЂ” СЂР°Р±РѕС‡РёР№ UX РїСЂРµСЃРµС‚РѕРІ.
- `color_references` = RAL, **РЅРµ** С‚СЂРѕРіР°С‚СЊ.

РџСЂРѕРІРµСЂРµРЅРѕ: audit `docs/audits/2026-08-07-catalog-entity-colors-audit.md`;
`gantt-bar.model.ts` `workTypeOklch`; composition-tree kindShort.

## Р§РўРћ Р”Р•Р›РђРўР¬

1. Р”РѕР±Р°РІРёС‚СЊ `catalogKindOklch(kind, materialKind?, вЂ¦)` + default hue map
   (product / module / material; material raw vs non-raw вЂ” РґРІР° С‚РѕРЅР° РµСЃР»Рё РїСЂРѕСЃС‚Рѕ).
2. Composition-tree: wash С„РѕРЅР° СЃС‚СЂРѕРєРё + С†РІРµС‚ Р±РµР№РґР¶Р° РёР· helper.
3. BOM inspector: С‚РѕС‡РєР°/РїРѕР»РѕСЃРєР° С‚РѕРіРѕ Р¶Рµ С‚РѕРЅР° Сѓ В«Р’С‹Р±СЂР°РЅРѕВ».
4. РћР±РЅРѕРІРёС‚СЊ `ui-composition-tree.md` + `product-detail.page.md`.
5. Specs: snapshot/class РёР»Рё style assertion РЅР° kind wash.

## РќР• РР—РњР•РќРЇРўР¬

- `color_references`, Product.ralCode
- WorkType / Gantt bar colors
- Persist settings UI (в†’ 331)
- Per-instance accentHue РЅР° Product/Module (в†’ later)

## РљР РРўР•Р РР РџР РРЃРњРљР

- [ ] РќР° РљР°СЂС‚РѕС‡РєРµ РёР·РґРµР»РёСЏ РІ РґРµСЂРµРІРµ РёР·РґРµР»РёРµ/РјРѕРґСѓР»СЊ/РјР°С‚РµСЂРёР°Р» РІРёР·СѓР°Р»СЊРЅРѕ СЂР°Р·РЅРѕР№ Р·Р°Р»РёРІРєРѕР№
- [ ] РљРѕРЅС‚СЂР°СЃС‚ С‡РёС‚Р°РµРј РІ light Рё dark
- [ ] RAL-СЃРїСЂР°РІРѕС‡РЅРёРє Рё С„РѕСЂРјС‹ С‚РѕРІР°СЂР° Р±РµР· РЅРѕРІС‹С… РїРѕР»РµР№ С†РІРµС‚Р° UI
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- [ ] jest: composition-tree РёР»Рё bom-panel spec Р·РµР»С‘РЅС‹Р№

## РР—Р’Р•РЎРўРќР«Р• РћР“Р РђРќРР§Р•РќРРЇ

Р¦РІРµС‚Р° РїРѕРєР° С‚РѕР»СЊРєРѕ РёР· РєРѕРґР°-defaults; PO РєСЂСѓС‚РёС‚ РїСЂРµСЃРµС‚С‹ РїРѕСЃР»Рµ TZ-331.

---

ARCHIVE в†’ `tasks/_archive/YYYY-MM/` РїРѕ GEMINI.md РїСЂРё РёСЃРїРѕР»РЅРµРЅРёРё РёР· `tasks/`.

---
ARCHIVE_MARKER
outcome: DONE
date: 2026-08-07
summary: catalogKindOklch defaults + composition-tree wash + BOM inspector kind dot
---
