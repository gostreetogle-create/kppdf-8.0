# Очередь

**Шпаргалка PO (куда что копировать):**  
→ [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат исполнителя (Buffy) — ВСЕГДА этот промпт:**  
→ [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

**Универсальный continuous (длинный канон):**  
→ [`tasks/PROMPT-UNIVERSAL-CONTINUOUS.md`](../PROMPT-UNIVERSAL-CONTINUOUS.md)

**Перед деплоем (VPN OFF):**  
→ [`ops/PROMPT-OPS-310-HARDEN.md`](./ops/PROMPT-OPS-310-HARDEN.md) · TZ `ops/TZ-OPS-310-server-harden-before-deploy.md`

## Параллель

| Агент | Волна | Статус |
|-------|--------|--------|
| **A — Party-docs** | `party-docs/WAVE-PARTY-DOCS.md` | **DONE** #1–#7 · **INN-301 PARKED** |
| **B — Shop north** | `shop-north-b/WAVE-SHOP-NORTH-B.md` | **DONE** — idle |
| **C — Catalog UX** | `catalog-ux-c/WAVE-CATALOG-UX-C.md` | **DONE** — не воскрешать |
| **D — Product editor** | `product-editor/WAVE-PRODUCT-EDITOR.md` | **DONE** — 308+309 |
| **E — KP vitrine** | `kp-vitrine/WAVE-KP-VITRINE.md` | **317/319/321 DONE**; usable DONE; **COMPLETE READY** |
| **F — UX chrome** | `TZ-UX-315-drop-pathlabel-dense-chrome.md` | **DONE** — pathLabel убран; не воскрешать |
| **G — Light theme** | `TZ-UI-LIGHT-330` | **DONE** — канва/raised/кнопки |
| **H — Dark theme** | `TZ-UI-THEME-331-dark-depth-and-on-gold.md` | **DONE** — dark depth + on-gold |
| **I — Doc tables** | `doc-tables/WAVE-DOC-TABLES.md` | **DONE** (305–308) |
| **Desktop MCP** | `desktop/WAVE-MCP-GAP-2026-08-10.md` | **DONE** TZD-31→34 |
| **Desktop Excel** | `desktop/WAVE-EXCEL-IMPORT-STUDIO.md` | **DONE** TZD-36→38 |
| **Dict demo** | `dictionaries/WAVE-DICT-DEMO-2026-08-10.md` | **DONE** |

Все только из `D:\kppdf-8.0` на `main`. Не пересекать CONFLICT KEYS.

**NEXT сейчас:**  
1. Добить **WAVE-KP-COMPLETE**: смотри `_active-map` / `_active/` (обычно 346→347→348) через `PROMPT-RESUME-ANY`  
2. Параллель (VPN OFF): **TZ-OPS-310**  
3. Idle → warm deploy только по команде PO (preflight требует OPS-310)

## Idle / park / done

| TZ / wave | Заметка |
|-----------|---------|
| ~~WAVE-PARTY-DOCS #1–#7~~ | DONE |
| ~~WAVE-PRODUCT-EDITOR~~ | DONE |
| ~~WAVE-MCP-GAP / EXCEL / DICT-DEMO~~ | DONE |
| ~~WAVE-KP-USABLE~~ | DONE |
| ~~SALES-304~~ | **SUPERSEDED** → SALES-313 |
| TZ-INN-301 | PARKED |
| TZ-SALES-320 | PARKED (печать; часть закрыта 345 в COMPLETE) |
| TZ-DOC-344 | PARKED (ops-309) |
| TZ-SUPPLY-303 | PARKED |
| SHIPPING / Gantt 308–310 | park |

## Не брать

- TZ-GIT-302 CANCELLED  
- claim INN-301 / SUPPLY-303 / DOC-344 пока PARKED  
- claim SALES-304 (superseded)  
- deploy / wipe / desktop ZIP без команды PO  
- commit `desktop/mcp-runtime/**`  
- воскрешение ModuleMaterials / DONE-волн  
- nginx/VPS Basic Auth (уже включён; секреты в `CREDENTIALS.md`)  
- деплой **без** `TZ-OPS-310.done.md` (preflight FAIL — сначала harden)
