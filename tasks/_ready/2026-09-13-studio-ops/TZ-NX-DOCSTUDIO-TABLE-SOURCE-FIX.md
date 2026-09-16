# TZ-NX-DOCSTUDIO-TABLE-SOURCE-FIX: источник строк — починить round-trip + убрать ложный дубль Insert

> **SIZE:** S · **PACK:** `tasks/_ready/2026-09-13-studio-ops/`  
> **РОЛЬ:** Claude (studio-editor) или Freebuff  
> **LAYER:** 3  
> **AUDIT:** `docs/audits/2026-09-13-studio-table-source-select.md`  
> **ЗАВИСИМОСТИ:** не параллелить с INSERT-APPLY-KIND / PHOTO / COL-WIDTH на `studio-editor.page.ts`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts; docs/pages/document-studio.page.md`

IMPLICIT CONFLICT: nx build kppdf-web

---

## Domain preflight

- Источник строк = `dataSource` / dataSet.source — **нужен** для +Таблица, КП, заказ, manual.  
- Insert уже задаёт catalog-* → select выглядит дублем; round-trip сломан (audit B1–B4).  
- **Не** удалять контрол целиком.

## ЧТО ДЕЛАТЬ

**ШАГ 1 — Баги (обязательно).**  
1.1 `onTableSourceChange`: персистить `dataSource` на блок через тот же путь, что settings (`blocksService.update`), **до или атомарно с** putDataSet (revision-safe — serial).  
1.2 При уходе на `manual`: `liveRows: null` (не `[]`), чтобы canvas брал sample rows.  
1.3 Canvas `tableRows`: считать live только если `Array.isArray(liveRows) && liveRows.length > 0` **или** явный live source + length≥0 с честным empty-state (предпочтение: null = нет live cache; `[]` при live source = «нет строк из источника»). Не показывать пустой live cache поверх sample при manual.  
1.4 После putDataSet catalog/КП/заказ: если hydrated rows пусты — toast с причиной (`Выбрано` пусто / нет КП / нет заказа), не «Источник строк: витрина» как успех.  
1.5 Spec: manual→catalog-products при непустых selections → liveRows length > 0; manual clears liveRows null; empty selections → WARN toast.

**ШАГ 2 — IA (анти-дубль).**  
2.1 Если текущий source `catalog-*` и совпадает с типичным Insert: в UI — **badge/статус** «Строки: Изделия (из Выбрано)» + secondary «Сменить источник…» раскрывает select (или confirm).  
2.2 Hint: «Insert из Выбрано уже задаёт источник; здесь — смена или таблицы без Insert.»  
2.3 page.md: сценарии keep + round-trip.

**ШАГ 3 — Gates.** scoped specs + nx build.

## НЕ

Удалять putDataSet / catalog sources; не трогать photo resolver; не смешивать с width/%; wipe/deploy.

## ACCEPT

1. Изделия → manual → снова Изделия (при непустом Выбрано) → строки снова на листе.  
2. Manual не остаётся «пустым призраком» из-за `liveRows: []`.  
3. Insert-таблица не выглядит как бессмысленный второй select без объяснения.  
4. Пустое Выбрано → честный toast.  
5. Build/tests green.
