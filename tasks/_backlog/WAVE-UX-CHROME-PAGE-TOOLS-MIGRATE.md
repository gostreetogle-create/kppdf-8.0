# WAVE: Chrome page-tools migrate (каталог и списки → app-chrome-rail)

**Статус:** BACKLOG (после TZ-UX-325 audit)  
**Цель:** убрать локальные `w-12` filters-rail и перенести icon-only tools в `PiChromeToolsService` / `app-chrome-rail` под ←→.  
**SoT audit:** `docs/audits/2026-08-15-chrome-page-tools-migration-audit.md`  
**Canon:** `docs/pages/page-chrome.md` § Page tools  
**Эталон:** `/production` (TZ-UX-323 DONE)

## Queue (строго по порядку; по одному экрану)

| # | Draft TZ id | Route | Points | Notes |
|---|-------------|-------|-------:|-------|
| 1 | `TZ-UX-326-products-chrome-page-tools` | `/products` | 40 | P0: снять filters-rail; L=Фильтры, R=Вид+Обновить; flyout overlay |
| 2 | `TZ-UX-327-modules-chrome-page-tools` | `/modules` | 35 | P0: зеркало products (CATALOG-372 parity) |
| 3 | `TZ-UX-328-materials-chrome-page-tools` | `/materials` | 35 | P0: зеркало (CATALOG-373) |
| 4 | `TZ-UX-329-supply-chrome-refresh` | `/supply` | 15 | P1: Обновить → chrome; selects остаются |
| 5 | `TZ-UX-330-orders-chrome-refresh` | `/orders` | 15 | P1: Обновить → chrome; search/Create остаются |
| | **PASS (P0 only)** | | **110** | |
| | **PASS (+P1)** | | **140** | |

Executable specs — писать перед стартом агента (`docs/TZ-AUTHORING.md`). Имена выше — черновик ids.

## Правила successor TZ

- Один route / один CLAIM; conflict keys = page + page.spec + page.md.  
- Не трогать `/proposals/create`, `/builder` (уже studio).  
- Не трогать `/production` (locked).  
- Не переносить H1, жёлтое меню, primary Create, search input, KP savebar.  
- ≥1680 only; без локального 48px fallback.  
- Deploy только по явному «деплой».

## Out

- Backend API.  
- AUTH / admin devices (AUTH-308).  
- Gantt estimate / park 308–310.  
- «На всякий случай» chrome tools на всех entity-list без rail.

## Prompt (когда PO откроет волну)

```text
Прочитай GEMINI.md + docs/audits/2026-08-15-chrome-page-tools-migration-audit.md
+ tasks/_backlog/WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE.md.
Бери следующий READY TZ из очереди (326→…). Эталон UX-323. Локальный w-12 filters-rail удалить.
```
