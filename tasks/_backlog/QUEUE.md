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
| **E — KP vitrine** | `kp-vitrine/WAVE-KP-VITRINE.md` | **317 READY** focus shell; 310–316 DONE; **320 PARKED** |
| **F — UX chrome** | `TZ-UX-315-drop-pathlabel-dense-chrome.md` | **DONE** — pathLabel убран; не воскрешать |
| **G — Light theme** | `TZ-UI-LIGHT-330` | **DONE** — канва/raised/кнопки |
| **H — Dark theme** | `TZ-UI-THEME-331-dark-depth-and-on-gold.md` | **DONE** — dark depth + on-gold |
| **I — Doc tables** | `doc-tables/WAVE-DOC-TABLES.md` | **DONE** — 301–304 |

Все только из `D:\kppdf-8.0` на `main`. Не пересекать CONFLICT KEYS.

**NEXT для universal prompt (по выбору PO):**  
- **Параллель (пока PO на шаблонах/КП):** closeout только `TZ-DOC-342` → IDLE  
  · промпт `tasks/prompts/PROMPT-PARALLEL-CLOSEOUT-342-343.md`  
  · `TZ-DOC-343` уже DONE; **SALES-317** не трогать  
- После idle: предложить деплой **без** запуска, либо ждать unpark / новый TZ от Cursor  
- **Не брать:** stale READY в backlog без нужды (многие уже в `_archive/*.done`)

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
