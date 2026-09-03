# WAVE: QA Gates Fix (2026-09-03 audit)

Источник: [`docs/audits/2026-09-03-qa-deep-test-audit.md`](../audits/2026-09-03-qa-deep-test-audit.md)

**Цель:** вернуть baseline DoD (`pnpm test` + `pnpm lint`) ближе к зелёному на `main`.  
**HOLD:** не стартовать Freebuff, пока заняты слоты KP Family + Contract File.

| # | TZ | Priority | Status | Notes |
|---|-----|----------|--------|-------|
| Q1 | `TZ-BACKEND-QA-OUTPUT-VAT-MOCK` | P0 | DONE | 6 red tests fixed (mock + finalize), full BE suite 126/126 green · `cc57266d` |
| Q2 | `TZ-BACKEND-QA-STUDIO-QUOTATION-ORG-GUARD` | P1 | DONE | assertQuotationOrg in ensure+sync, +5 tests, 126/126 BE suites · `46e7a530` |
| Q3 | `TZ-FRONTEND-QA-APP-LAYOUT-FLAKY` | P1 | DONE | stale 321-FIX width assert fixed, FE suite 196/196 green · `7b4e1013` |
| Q4a | `TZ-BACKEND-QA-LINT-UNUSED-IMPORTS` | P1 | READY | ~45 unused imports |
| Q4b | `TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-1` | P2 | READY | ≤15 files; not full 200 |

## Parallelism

- Q1 ∥ Q3 (BE tests vs FE tests) OK  
- Q2 после Q1 (оба studio-document) или sequential same agent  
- Q4a ∥ Q3 OK  
- Q4b **не** параллелить с FE NX waves (другой tree, но один Freebuff FE budget)

## Out of scope

Полный crawl ~90 BE modules / ~50 pages — отдельная Freebuff multi-day волна.
