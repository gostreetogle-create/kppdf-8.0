# Очередь

**Универсальный промпт (любой агент / продолжение после обрыва):**  
→ [`tasks/PROMPT-UNIVERSAL-CONTINUOUS.md`](../PROMPT-UNIVERSAL-CONTINUOUS.md)

## Параллель

| Агент | Волна | Статус |
|-------|--------|--------|
| **A — Party-docs** | `party-docs/WAVE-PARTY-DOCS.md` | **DONE** #1–#7 · **INN-301 PARKED** |
| **B — Shop north** | `shop-north-b/WAVE-SHOP-NORTH-B.md` | **DONE** — #1–#7 DONE; idle |
| **C — Catalog UX** | `catalog-ux-c/WAVE-CATALOG-UX-C.md` | **DONE** — не воскрешать |
| **D — Product editor** | `product-editor/WAVE-PRODUCT-EDITOR.md` | **IN PROGRESS** — **308 DONE**; next **309** |

Все только из `D:\kppdf-8.0` на `main`. Не пересекать CONFLICT KEYS.

**NEXT для universal prompt:** `tasks/_backlog/product-editor/TZ-PRODUCTS-309-composition-in-fulleditor.md`
(или узкий `product-editor/PROMPT-CONTINUOUS.md`)

## Idle / park / done

| TZ / wave | Заметка |
|-----------|---------|
| ~~WAVE-PARTY-DOCS #1–#7~~ | DONE |
| ~~WAVE-DESKTOP-DOC-TEXTS / TZD-30~~ | DONE |
| ~~TYPE-303~~ · ~~DIALOG-303~~ · ~~UX-313~~ · ~~DEDUP-301~~ · ~~SELECT-301~~ | DONE |
| TZ-INN-301 | PARKED (нужен ключ PO) |
| SALES-304 | RESERVED |
| SHIPPING / Gantt 308–310 | park |

## Не брать

- TZ-GIT-302 CANCELLED  
- чужой journal / import-task без wave  
- deploy без команды PO  
- claim INN-301 пока PARKED  
- commit `desktop/mcp-runtime/**` (не SoT; канон = `desktop/mcp`)  
- воскрешение ModuleMaterials / DONE-волн Catalog / Party-docs  
