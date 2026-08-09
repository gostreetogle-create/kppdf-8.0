# Очередь

**Универсальный промпт (любой агент / продолжение после обрыва):**  
→ [`tasks/PROMPT-UNIVERSAL-CONTINUOUS.md`](../PROMPT-UNIVERSAL-CONTINUOUS.md)

## Параллель

| Агент | Волна | Статус |
|-------|--------|--------|
| **A — Party-docs** | `party-docs/WAVE-PARTY-DOCS.md` | **DONE** #1–#7 · **INN-301 PARKED** |
| **B — Shop north** | `shop-north-b/WAVE-SHOP-NORTH-B.md` | **DONE** — idle |
| **C — Catalog UX** | `catalog-ux-c/WAVE-CATALOG-UX-C.md` | **DONE** — не воскрешать |
| **D — Product editor** | `product-editor/WAVE-PRODUCT-EDITOR.md` | **DONE** — 308+309 |
| **E — KP vitrine** | `kp-vitrine/WAVE-KP-VITRINE.md` | **IN WORK** — 310–312 DONE; **313 CLAIMED**; 314–316; **320 PARKED** |
| **F — UX chrome** | `TZ-UX-315-drop-pathlabel-dense-chrome.md` | **READY** — убрать pathLabel (дубль топ-меню); || после keys |

Все только из `D:\kppdf-8.0` на `main`. Не пересекать CONFLICT KEYS.

**NEXT для universal prompt:** добить **313** (уже CLAIMED) → затем 314/315/316  
**Параллель (свободный агент):** `tasks/_backlog/TZ-UX-315-drop-pathlabel-dense-chrome.md`  
(CONFLICT: только `pi-group-workspace*` — не трогать proposals CLAIM 313)

## Idle / park / done

| TZ / wave | Заметка |
|-----------|---------|
| ~~WAVE-PARTY-DOCS #1–#7~~ | DONE |
| ~~WAVE-PRODUCT-EDITOR~~ | DONE |
| ~~SALES-304~~ | **SUPERSEDED** → SALES-313 |
| TZ-INN-301 | PARKED |
| TZ-SALES-320 | PARKED (печать) |
| SHIPPING / Gantt 308–310 | park |

## Не брать

- TZ-GIT-302 CANCELLED  
- claim INN-301 / SALES-320 пока PARKED  
- claim SALES-304 (superseded)  
- deploy без команды PO  
- commit `desktop/mcp-runtime/**`  
- воскрешение ModuleMaterials / DONE-волн  
