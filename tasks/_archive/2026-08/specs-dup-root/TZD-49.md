# TZD-49: Desktop Import Studio — CAD follow-ups + journal (снят с PARK)

> Successor **TZD-48** + excel rework audit. **Брать после TZD-58** (installer честный).
> Снимает главные дыры «80% → 100%» для CAD-импорта PO.

РОЛЬ АГЕНТА: Desktop (+ тонкий BE только если AC требует DTO поля)

ЗАВИСИМОСТИ: **TZD-58 DONE** (рекомендуется; не блокер кода, но PO smoke после 58)

LAYER: 3

CONFLICT KEYS: `desktop/src/App.svelte` ; `desktop/src/core/specification-import.ts` ;
`desktop/src/core/import-targets.ts` ; `desktop/src/core/import-mapping.ts` ;
(опц. journal) `backend/src/modules/**` mutation proposals

PAGES: N/A (Tauri)

CHECKLIST: `docs/agent-checklists/TZD-49.md` (создать при claim)

Источник: `tasks/_park/desktop/TZD-49-desktop-import-studio-hitl-followups.md` ;
audit `docs/audits/2026-08-16-desktop-excel-import-rework.md` § follow-up

---

## Цель (приоритет)

1. **Имена модулей CAD:** если `name` пустой — fallback `name = article` + issue/warning «имя из артикула» (не блокировать confirm, если article есть).
2. **Габариты/вес:** маппинг колонок Длина/Ширина/Толщина/Масса → `dimensions` + `weight` на create module (DTO уже поддерживает).
3. **Spec confirm lookup:** не `limit=100` blind — lookup по article/sku (точный или paginated search).
4. **(Thin) Journal hint:** UI честно: non-material «пишется после подтверждения»; полный journal unify — только если ≤2 файла BE, иначе known_limitation + отдельный TZ.

---

## НЕ

- GPU / новые модели
- Deploy / wipe
- Переписывать `findHeaderRow` без регресса `excel.test.ts`
- Параллель с другим агентом на `App.svelte`

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] Файл PO `6104 test Tigran…xlsx`: confirm проходит (или ≤ явных manual fixes), не 83× `missing_name` block
- [ ] Хотя бы один модуль получает dimensions/weight из Excel при маппинге
- [ ] Новые/обновлённые tests: `specification-import.test.ts`, при необходимости mapping
- [ ] `cd desktop && npx tsc --noEmit` + svelte-check 0/0 + desktop tests PASS
- [ ] Archive `TZD-49.done.md`

---

## Smoke PO (записать в archive)

1. Desktop v0.5.6 → Импорт → загрузить CAD xlsx → Предложить сопоставление → confirm состав.
