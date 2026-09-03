# NOW

updated_at: 2026-09-03T20:20:00+03:00

## ACTIVE / LIVE

**Freebuff (KP Family #1):** DONE — S40–S48 закрыты (S48 OPERATOR-DOCS closeout). Slot #1 free.

**QA Gates:** Q1–Q4b DONE; legacy frontend lint successor slices remain parked by Q4b limitation. Claude на QA-волну не сажать.

**Claude MCP (executor, slot #2):** idle — `TZ-FRONTEND-ARCH-CROSS-PAGE-IMPORTS` и `TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-2` DONE, archived, committed (см. DONE).

## NEXT

Slot #1 free — ждать новую волну от PO. Не выдавать второй claim на `kppdf-web/src/**`.

## DONE

- Sales S30–S39 · Contract C1–C5 · KP Family S40–S48 · QA Q1–Q4b
- `TZ-FRONTEND-ARCH-CROSS-PAGE-IMPORTS` (3 architecture:check, `305eec58`)
- `TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-2` (10 files / 35 no-raw-ui-values errors, `87499100`)

## PARK

- авто-резерв, statusOverride, Invoice, NX `/contracts` UI · полный page/module crawl
- FE lint slice-3: `pnpm run lint:ui-tokens` (external `.component.css`, 35 pre-existing
  violations in 3 files) — separate check from `no-raw-ui-values`, out of slice-2 scope
