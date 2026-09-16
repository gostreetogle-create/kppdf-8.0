# PACK 2026-09-13 — Studio / catalog / ops

> Промпты в чат — только по запросу PO.  
> **Волны:** `WAVE-MAP.md` · checklist `docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md`  
> **Смена стратегии (PO 2026-09-13):** не копить S-hints «оно работает»; для таблиц студии — **necessity cleanup**.

## Волны

| # | Промпт | Статус |
|---|--------|--------|
| 1 | `PROMPT-CLAUDE-STUDIO-OPS-WAVE1.md` | **DONE** |
| 2 | `PROMPT-CLAUDE-STUDIO-OPS-WAVE2.md` | **DONE** |
| 3 | `PROMPT-CLAUDE-STUDIO-OPS-WAVE3.md` | **DONE** |

## Successors (READY, не авто-волна)

| TZ | Зачем |
|----|--------|
| `TZ-NX-MODULE-LIST-POPULATE-PHOTOS.md` | findAll модулей без populate фото |
| `TZ-NX-CATEGORY-DUPLICATE-SLUG-409.md` | дубль slug → 409 не 500 |
| `TZ-NX-SORTORDER-EMPTY-MIN.md` | `sortOrder: Значение слишком мало` на пустом «Порядок» |
| `../TZ-VERIFY-VM52-SSH-REMAINDER-2026-09-13.md` | LAN only |

## Главная волна таблиц (волна 2)

| | |
|--|--|
| **SoT** | `docs/audits/2026-09-13-docstudio-table-necessity-wave.md` |
| **TZ L** | `TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP.md` (этапы A→B→C) |
| **Поглощает** | TABLE-KIND-IA · TABLE-SOURCE-FIX · INSERT-APPLY-KIND |

## Остальное в pack

| # | TZ | Волна |
|---|-----|-------|
| 1 | `TZ-NX-CATALOG-CATEGORY-INLINE-CREATE.md` | 3 |
| 2 | `TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.md` | 1 |
| 3 | `TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL.md` | 1 |
| 4 | `TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP.md` | 1 |
| 5 | `TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY.md` | 2 / этап C |
| 7 | `TZ-OPS-DOCS-HOST-52-SYNC.md` | 3 |

## Старые S по виду/источнику

Файлы `TZ-NX-DOCSTUDIO-TABLE-KIND-IA.md`, `…-SOURCE-FIX.md`, `…-INSERT-APPLY-KIND.md` — **superseded**. Не выдавать.

## Conflict

Волна 1 → 2 строго по очереди (общий `studio-editor` / canvas). PHOTO можно до editor-heavy TZ. CATEGORY (forms) не параллелить с волной 2 без явного слота Freebuff.
