# ADR: Документ-студия (Document Studio)

> **Status:** ACCEPTED v1.2 (MVP audit, 2026-08-29)  
> **Program SoT:** [`tasks/WAVE-DOC-STUDIO.md`](../../tasks/WAVE-DOC-STUDIO.md) (Waves 0–11 DONE)  
> **Plan (Cursor-local):** `.cursor/plans/document_studio_plan_612b618a.plan.md` v2.3 — **not tracked**; use this ADR + page.md + WAVE for executor handoff.

## Context

Нужна **универсальная** страница создания документов (не только КП): A4-центр, chrome-rails, overlay-панели, слои, таблицы с данными ERP, multipage, шаблоны. Старый builder (`/doc-constructor/builder`) и KP workspace остаются параллельно до kill-plan.

## Decision

### 1. Два уровня данных

| Уровень | Collection | Роль |
|---------|------------|------|
| Шаблон | `document_templates` + `template_blocks` (`parentType=template`) | Picker, save-as-template |
| Экземпляр | `studio_documents` + blocks (`parentType=studio-document`) | Рабочий документ, autosave |

Отдельная коллекция `studio_blocks` **не создаём** — полиморфный `template_blocks`.

### 2. Рендер и PDF

- Extract **`DocumentRenderService`** из `DocumentTemplateService` (Wave 1).
- **Wave 1:** render extract only; **Wave 2c:** typed `StudioAggregate → BuildDocumentDto` adapter + golden HTML tests.
- Studio orchestration в `studio-document`.
- **PDF MVP:** Studio вызывает **тот же** puppeteer lifecycle, что `QuotationOutputService` (facade / shared `DocumentOutputService` — Wave 1 extract hook, Wave 10 harden).

**Operational contract (Wave 10):**

- один managed browser lifecycle (не browser-per-request);
- `Page` per job + `finally` close;
- semaphore/queue на concurrent PDF;
- timeout + structured errors + render duration metrics.

### 2b. StudioDocument DTO rules

- `organizationId` — **server-derived** from auth; never trust client alone.
- `docTypeId` — **optional in draft** / «Пустой A4» (default seed); **required only on** `draft → final` transition.
- List/get/clone — **always** org-scoped (Wave 2b, не Wave 6).

### 3. Edit / Preview

| Режим | Canvas | Preview |
|-------|--------|---------|
| **Редактор** | drag/resize blocks; таблица растёт вниз | **нет** server page breaks |
| **Просмотр** | read-only stack | debounced `POST …/preview` (~300–500ms) |

Autosave (~1.2s) пишет blocks/dataSets only, **не** full preview.

### 4. Draft data (гибрид)

| До `frozen` | После `frozen` |
|-------------|----------------|
| Якоря в preview: **live-read** | `bakeSnapshot()` + GeneratedDocument |
| `dataSets`: editable; live source rows | snapshot rows |
| Ручные правки ячеек сохраняются | as-is |

### 5. Optimistic lock (409)

**Два разных поля revision:**

| Поле | Где | Назначение |
|------|-----|------------|
| `StudioDocument.revision` | mutable draft | optimistic concurrency при редактировании |
| `GeneratedDocument.sourceRevision` | immutable archive | provenance: какую ревизию студии заархивировали |

**API contract (MVP):**

- `StudioDocument.revision` стартует с `1`; каждый успешный PATCH / bulk layout / data-set PUT → `+1`.
- Client передаёт **`expectedRevision`** (не только читает `revision`).
- Mismatch → **409** `STUDIO_DOCUMENT_REVISION_CONFLICT` + body `{ revision, updatedAt }`.
- UI: **«Обновить»** (confirm) + **«Сохранить копию»**; **«Перезаписать»** — нет в MVP.
- **dataSets** и block CRUD — **тот же** conflict contract (не LWW).
- LWW допустим только для **transient preview UI** (zoom, active page tab) — не для render-affecting state.

### 6. GeneratedDocument (Wave 2b design → Wave 10 migrate)

**Wave 2b:** compatibility audit + migration contract (без production cutover).

**Wave 10:** migration + archive/PDF integration tests.

Текущая схема [`generated-document.schema.ts`](../../backend/src/modules/generated-document/generated-document.schema.ts): `templateId` required, `sourceType` без `'studio'`.

**Рекомендованный путь (меньше риска, чем global optional `templateId`):**

- `sourceType` **+=** `'studio'`
- **`studioDocumentId`** optional ref (новое поле)
- `templateId` **остаётся required** для legacy template-based archives; для studio-archive — `sourceId` = studio doc id + `studioDocumentId` set; `templateId` = copy from `sourceTemplateId` **или** per-org sentinel «Пустой A4» (TZ-DOC-STUDIO-2004, **Variant A implemented**)
- **+** `sourceRevision` (snapshot provenance)
- `number` unique — `SD-{org}-{seq}` в Wave 10 TZ

**TZ-DOC-STUDIO-2004 (Variant A — chosen):** blank studio docs (`sourceTemplateId` absent) finalize via seeded per-org sentinel `DocumentTemplate` «Пустой A4» (`tags: system-sentinel-blank-a4`). `ensureBlankA4Sentinel(orgId)` idempotent on boot + lazy on first finalize. Rejected Variant B (global optional `templateId`) — higher legacy breakage risk per audit.

Альтернатива «`templateId` optional globally» — **reject** unless audit proves zero legacy breakage.

### 7. template_blocks migration (Wave 2a) — phased

**Не one-shot schema flip.** Порядок:

1. **Expand** — add `parentType`, `parentId` (optional in schema).
2. **Backfill** — `parentType='template'`, `parentId=templateId` for all rows.
3. **Dual-read** — services read `templateId` OR `(parentType, parentId)`.
4. **Dual-write** — new studio rows write parent fields; legacy builder keeps `templateId`.
5. **Cutover** — studio writes only parent; builder still dual-read.
6. **Cleanup** — deprecate `templateId` index (successor).

**Sparse index rule:** не писать `templateId: null` — поле **omit** ($unset), иначе sparse index ведёт себя иначе.

Indexes: `{ parentType, parentId, order }` new; `{ templateId, order }` keep until cleanup.

Gate: legacy builder open/edit/save **без** mutation existing blocks.

### 8. Single-page law

Редактор `/doc-constructor/studio/:id` — **без navigate** на texts/tables/builder. Embed dialogs + tier-L panels.

### 9. Photos & pages

- One upload path: `POST /template-blocks/:id/image`.
- Image block + `layout`; aspect-ratio resize; z-order via layers panel.
- Full-page + z-bottom **or** `backgroundImage[]` for letterhead on all pages (TZ-SALES-378 reuse).
- Manual pages + auto overflow (Wave 9); page numbering toggle.

### 10. Save-as-template (Wave 6)

Checkbox **«Сохранить привязанные данные»**: off = clear anchor IDs; on = PO org-specific bolvanki.

### 11. Orphan files

DELETE block → unlink image; hard-delete doc → cascade; cron sweep — Wave 11 successor.

## Consequences

- Wave 1: render extract + BlockType sync + **layout parity inventory** (no merge yet).
- Wave 2a: block migration; Wave 2b: StudioDocument + org scope + revision API; Wave 2c: render adapter tests.
- Wave 3: **CSS geometry contract** extract (`--kp-panel-w`, overlay 480px, flex-end 8px) — not empty TS fork.
- Page clamp removal **sync** FE+BE+`assertSupportedPage` in Wave 9.
- Legacy `DocumentTemplate` picker org-scope — Wave 6; Studio APIs org-scope — Wave 2b.

## Not in MVP

- Ctrl+Z; block version history; overwrite on 409; PDF→blocks MCP; replace KP workspace/builder.

## MVP delivered vs deferred (updated 2026-08-29, waves 12–19)

Waves **0–19** — full PO path (template → ERP data → edit → preview → PDF → archive).

| Area | Delivered | Still deferred |
|------|-----------|----------------|
| Canvas + blocks | text/table/image; layers; lock; full-page image | — |
| List / template | from-template, duplicate, save-as-template, deep links, **blank A4 finalize** | — |
| Output | ribbon PDF + archive; multipage preview; SD numbering | PDF ops dashboard (optional) |
| Revision | BE 409; FE reload + **save copy** | overwrite on 409 (Not in MVP) |
| Data | Данные rail; **quotation-items / order-items live**; bakeSnapshot | catalog-products live |
| Background | per-page `backgroundImage[]` in preview | — |
| Multipage | manual pages + **auto overflow** + page numbering | — |
| Orphan files | cascade delete + daily sweep cron | — |
| Blocks parent refs | dual-read/write | cutover step 5–6 (successor) |

**PO path:** Документы → **Студия документов** → **Из шаблона** → **Данные** (КП) → таблица live → **PDF** / **В архив**.

## References

- Geometry: [`docs/pages/kp-workspace-geometry.md`](../pages/kp-workspace-geometry.md)
- Builder canvas: [`docs/pages/builder.page.md`](../pages/builder.page.md)
- Photos: [`docs/pages/photo-block-architecture.md`](../pages/photo-block-architecture.md)
- Multipage bg: TZ-SALES-378, [`docs/audits/2026-08-15-kp-multipage-table-overflow-audit.md`](../audits/2026-08-15-kp-multipage-table-overflow-audit.md)
