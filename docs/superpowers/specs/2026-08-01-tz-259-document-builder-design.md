# TZ-259 — Единая модель конструктора документов

**Дата:** 2026-08-01
**Статус:** approved for implementation
**Цель:** сделать canvas, HTML preview, generated document и PDF одной согласованной системой.

## Решения

1. Целевой режим — координатный. Каждый блок получает `layout` с нормализованными координатами `0..1`; старые flow/order и overlay-поля остаются migration fallback.
2. Источники типизируются отдельно от legacy `dataBinding` и `settings`:
   - `text-block` — reusable текстовый источник;
   - `table-template` — reusable табличный источник;
   - `field` — поле registry/data source;
   - `literal` — настоящий статический текст.
3. Backend является authority для source resolution. Frontend не должен обновлять источник только потому, что Builder был открыт.
4. Preview, generated document и PDF используют один серверный layout renderer.
5. Дублирование шаблона обязано копировать все block fields, включая columns, dataBinding, source и layout.
6. Изменения нескольких геометрических свойств сохраняются batch-операцией или атомарным patch; legacy per-block PATCH сохраняется для совместимости.

## Совместимость

Legacy blocks читаются так:

- `settings.overlayLeft/overlayTop/imageWidth/imageHeight` преобразуются в `layout` только в adapter;
- `dataBinding.source === 'static'` с `value`, содержащим ID старого TextBlock, считается legacy text reference только при наличии `source`/старого признака в settings; новый literal использует `source.kind = literal`;
- `settings.tableTemplateId` читается как legacy TableTemplate reference;
- блоки без layout рендерятся в legacy flow до завершения migration.

Новые записи не должны создавать TextBlock ID в `dataBinding.value` и не должны считать snapshot таблицы основным источником.

## Этапы

### A. Contract and migration adapter

Создать типы `BlockSource` и `BlockLayout`, DTO/schema validation, pure adapter для legacy geometry и tests.

### B. Source resolution

Добавить resolver для live TextBlock/TableTemplate references. `build()` получает свежие источники независимо от того, открывался ли Builder. Legacy dataBinding остаётся рабочим.

### C. Canonical renderer

Преобразовать layout в CSS для HTML/PDF; flow fallback остаётся для legacy blocks.

### D. Canvas geometry

Canvas отображает layout normalized coordinates; новые и мигрированные блоки свободно перемещаются и сохраняются после reload.

### E. Selection and group drag

Ctrl/Cmd, Shift range, marquee, keyboard movement, group bounding box, one delta for all selected blocks, boundary clamp and batch save.

### F. Text/Table UX and uploads

Live/snapshot/detach controls, fontSize preservation, table validation, real image upload endpoint.

### G. Concurrency, duplicate and QA

Atomic reorder, optimistic versioning, complete duplicate, browser/PDF evidence and documentation.

## Non-goals

- не переписывать общий Angular DSL TZ-232;
- не удалять Team Room изменения;
- не менять unrelated security modules;
- не объявлять browser/PDF parity без фактической проверки.

## Current implementation boundary (2026-08-01)

- Canonical layout, typed sources, batch layout persistence, transactional reorder, and scoped group-drag preview are implemented.
- The current renderer and canvas intentionally support **page 1 only**. Backend DTO/service validation rejects `page > 1`; it must not be silently treated as a second page.
- Browser/PDF parity, marquee/Shift selection, keyboard movement, live/snapshot controls, and end-to-end source/duplicate tests remain follow-up work and are not marked DONE without evidence.

## Acceptance baseline

- backend and frontend compile with the same source/layout field names;
- a changed TextBlock/TableTemplate is reflected in build without opening Builder;
- duplicate preserves every block field;
- legacy blocks continue to render;
- new layout positions are applied to HTML output;
- tests cover migration, source resolution, renderer and duplicate behavior.
