# WAVE — KP PDF from proposals list (2026-09-17)

QA gap: `POST /quotations/:id/pdf` живёт в BE (`QuotationOutputController`), NX list не вызывает.

| # | SIZE | ID |
|---|------|-----|
| 0 | S | TZ-NX-QUOTATIONS-PDF-CLIENT |
| 1 | S | TZ-NX-PROPOSALS-LIST-PDF |
| 2 | S | TZ-DOCS-QA-GENERATED-DOC-CLOSE |

Prompt: `tasks/_ready/PROMPT-FREEBUFF-KP-PDF-LIST.md`
