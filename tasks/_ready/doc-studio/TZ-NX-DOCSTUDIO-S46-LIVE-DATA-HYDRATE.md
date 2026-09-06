═══════════════════════════════════════════════════════════════
TZ-NX-DOCSTUDIO-S46-LIVE-DATA-HYDRATE: строки таблицы не должны исчезать после drag
═══════════════════════════════════════════════════════════════

SIZE: S
РОЛЬ АГЕНТА: Executor (frontend-nx)
ЗАВИСИМОСТИ: WAVE-DOCSTUDIO-CHROME-IA C4 DONE (общий build); **делать ДО S45** (тот же editor)
LAYER: 3
PAGES: `/studio/:id`

CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-block-helpers.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-block-helpers.spec.ts; docs/audits/2026-09-06-docstudio-live-data-hydrate-audit.md; docs/pages/document-studio.page.md

IMPLICIT CONFLICT: nx build kppdf-web

---

### Preflight Check Output
- **Context read:** PO 2026-09-06 «вставил из Выбрано → строки есть → drag/отпустил → строки пропали навсегда»; `saveLayouts` L2208–2232 `this.blocks.set(normalized)`; `applyLiveRowsFromDataSet` L1476; BE comment «Does not persist the hydrated rows»
- **Key Constraints:** `liveRows` — ephemeral FE cache после putDataSet; сервер layout response их не содержит
- **Planned Deliverable:** merge preserve liveRows (+ imageUrl pattern) after layout/block replace; re-hydrate fallback; regression test
- **Validation Path:** jest + nx build + smoke: insert from Выбрано → drag → rows still visible

## ROOT CAUSE (подтверждено кодом)

1. После «Вставить на лист» / putDataSet FE пишет `settings.liveRows` локально → таблица полная.
2. `liveRows` **не персистятся** в Mongo (by design S28 hydrate).
3. Любой drag → debounce → `flushLayouts` → `updateLayouts` → **`this.blocks.set(r.data)` целиком**.
4. Ответ API без `liveRows` → canvas `tableRows()` пустеет → одни заголовки.
5. Повторные клики **не** вызывают putDataSet → данные «навсегда» пропали до reload/re-insert.

Тот же класс бага: любой `blocks.update(... r.data ...)` replace без merge settings (проверить `patchBlockStyle`/`applyBlockContent`/single update — для table layout path обязателен merge).

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Audit
Файл `docs/audits/2026-09-06-docstudio-live-data-hydrate-audit.md`: root cause + все места `blocks.set` / replace from API.

### ШАГ 2 — Preserve ephemeral settings
- Хелпер (расширить `studioMergeBlockSettings` или `studioPreserveClientBlockSettings`): при замене блока с сервера сохранять локальные `liveRows` (и уже существующий imageUrl-паттерн).
- В `saveLayouts`: вместо голого `blocks.set(normalized)` — merge each block by id с предыдущим `this.blocks()`.
- Аналогично любые list/reload путей, где сразу после hydrate идёт layout flush.

### ШАГ 3 — Safety net
- После успешного `saveLayouts`, если у catalog/quotation/order таблицы `liveRows` всё ещё пусты, а dataSet/selections есть — один вызов `refreshLiveDataSetsOnLoad` (не infinite loop).
- Ошибки putDataSet: не silent — toast/banner.

### ШАГ 4 — Tests
- Spec: блок с liveRows + saveLayouts mock response без liveRows → после merge liveRows на месте.
- Spec (или editor): simulate insert → layout save → rows still rendered (unit-level достаточно).

### ШАГ 5 — page.md
Одна строка: liveRows ephemeral; layout save must preserve client hydrate.

## НЕ ИЗМЕНЯТЬ
S45 UI (следующий TZ); persist liveRows в Mongo (не менять S28 контракт без PO); Chrome C*; warehouse.

## КРИТЕРИИ ПРИЁМКИ

- [ ] Выбрано → Вставить на лист → строки видны → **переместить таблицу** → строки **остаются**
- [ ] Resize — то же
- [ ] Reload документа: либо hydrate снова показывает строки, либо честный loading/error (не вечный пустой thead без hint)
- [ ] Audit + tests + `nx build kppdf-web`

CLAIM: сразу после C4; затем S45.
