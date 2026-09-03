# NOW

updated_at: 2026-09-03T20:05:00+03:00

## ACTIVE / LIVE

**Freebuff (KP Family #1):** S47 DONE (`frontend-nx` `/proposals` convert guard). Сейчас — **S48 OPERATOR-DOCS** (последний [ ] в волне), затем closeout.

**QA Gates:** Q1–Q4b DONE; legacy frontend lint successor slices remain parked by Q4b limitation. Claude на QA-волну не сажать.

**Claude MCP (executor, slot #2):** idle — `TZ-FRONTEND-ARCH-CROSS-PAGE-IMPORTS` и `TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-2` DONE, archived, committed (см. DONE).

## NEXT

S48 → closeout волны (wave [x], `_active` пуст, QUEUE/_NOW sync). Не выдавать второй claim на `kppdf-web/src/**`.

## DONE

- Sales S30–S39 · Contract C1–C5 · KP Family S40–S47 · QA Q1–Q4b
- `TZ-FRONTEND-ARCH-CROSS-PAGE-IMPORTS` (3 architecture:check, `305eec58`)
- `TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-2` (10 files / 35 no-raw-ui-values errors, `87499100`)

## PARK

- авто-резерв, statusOverride, Invoice, NX `/contracts` UI · полный page/module crawl
- FE lint slice-3: `pnpm run lint:ui-tokens` (external `.component.css`, 35 pre-existing
  violations in 3 files) — separate check from `no-raw-ui-values`, out of slice-2 scope
