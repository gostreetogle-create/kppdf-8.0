# TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP: порядок в Свойствах таблицы (нужное оставить, дубли/хардкод убрать)

> **SIZE:** L · **PACK:** `tasks/_ready/2026-09-13-studio-ops/`  
> **РОЛЬ:** Claude continuous (этапы A→B→C) или Freebuff по этапам  
> **LAYER:** 3  
> **SoT аудита:** `docs/audits/2026-09-13-docstudio-table-necessity-wave.md`  
> **Поглощает / заменяет стратегию:** TABLE-KIND-IA, TABLE-SOURCE-FIX, INSERT-APPLY-KIND (не три отдельных «hint»-TZ)

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-catalog-insert.spec.ts; docs/pages/document-studio.page.md`

IMPLICIT CONFLICT: nx build kppdf-web

---

## Domain preflight / Necessity

- **Цель PO:** модуль Документы (таблицы) — финальный порядок: нужный функционал, без легаси-дублей и хардкодов, даже если «старое ещё кликается».  
- **Не цель:** доказать что сломанный select меняет state.  
- **Happy path:** Выбрано → Insert → одна живая таблица → колонки из реестра видов → Просмотр.  
- **Проверено:** audits kind-vs-source, source-select, necessity-wave (этот pack).

## ЭТАП A — IA: убрать ложные дубли (UX)

1. Для таблицы с `catalog-*` после Insert: вместо голого «Источник строк» enum — **статус** «Строки: {Изделия|…} из Выбрано (N)» + «Обновить строки» + «Сменить…» (confirm → полный select).  
2. «Вид таблицы» → **«Макет колонок»**: показать имя текущего вида; смена = явный select; пустой вид при catalog = CTA выбрать/создать в реестре (не молчание).  
3. page.md: одна схема happy path + что удалено из UI как дубль.

## ЭТАП B — SoT макета + round-trip источника (логика)

1. Insert / setBlockCatalogSource: применить `TableTemplate` по `dataSource` (registry SoT). **Запрещён outcome:** Insert оставляет только `STUDIO_DEFAULT` 3 колонки, если в БД есть matching active template. Нет template → toast в реестр, не тихий хардкод «как Продукты».  
2. Починить source round-trip: persist `dataSource` на блок; `liveRows: null` при manual; canvas не держит пустой `[]` поверх sample; пустое Выбрано → честный toast.  
3. Specs на A+B.

## ЭТАП C — Мёртвые controls

1. `col.width`: либо % на canvas+preview (как COL-WIDTH-APPLY), либо **убрать поле из UI** до apply — нельзя оставлять цифры без эффекта.  
2. Assert: ≤1 active template на канон. имя/`dataSource` catalog-products (скрипт/тест или docs check).

## НЕ

- Не плодить отдельные TZ «добавить hint».  
- Не удалять реестр видов / putDataSet / Insert.  
- Не параллелить с PHOTO-BROKEN на тех же editor/resolver файлах без очереди.  
- Photo broken-img — отдельный P0 display, не смешивать в этот L без нужды.

## ACCEPT (модуль «готово» по таблицам)

1. Happy path без обучения: Insert → колонки канона из реестра → строки из Выбрано.  
2. В Свойствах нет контрола, который повторяет Insert без статуса.  
3. manual↔catalog round-trip восстанавливает строки при непустом Выбрано.  
4. Нет видимого width без эффекта (apply или removed).  
5. page.md + specs + nx build; checklist WAVE с этапами A/B/C DONE.

## known_limitation

Категория модуля «+» / enroll VERIFY / ops .52 — вне этого TZ. PHOTO-BROKEN — соседний P0.
