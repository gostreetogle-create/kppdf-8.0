# WAVE — QA Coverage Audit (docs-only) · 2026-09-17

**PACK:** `tasks/_ready/2026-09-17-qa-coverage/`  
**PROMPT:** `PROMPT-FREEBUFF-QA-COVERAGE-AUDIT.md` (root `_ready` + copy in pack)  
**SoT inventory:** `docs/audits/2026-09-17-qa-coverage-inventory.md`  
**Outputs:** checklist №1 / №2 / summary (append only)

> Auth/Shell/Home уже в чеклистах (Cursor). Mega `TZ-AUDIT-QA-COVERAGE-2026-09-17` = umbrella если Freebuff mid-claim; иначе claim **по одной** TZ ниже (conflict keys = одни docs → **только sequential**).

## Chain (SIZE S, docs-only)

| # | SIZE | ID | Depends | Scope |
|---|------|-----|---------|-------|
| 0 | S | TZ-AUDIT-QA-ORDERS | Auth slice done | `/orders*` + order BE |
| 1 | S | TZ-AUDIT-QA-SHIPPING | 0 | `/shipping` + shipment |
| 2 | S | TZ-AUDIT-QA-PRODUCTION | 1 | `/production` + work-* used |
| 3 | S | TZ-AUDIT-QA-SUPPLY | 2 | `/supply*` + supply |
| 4 | S | TZ-AUDIT-QA-WAREHOUSE | 3 | warehouses/storage/stock + BE |
| 5 | S | TZ-AUDIT-QA-STUDIO | 4 | `/studio*` + studio/doc modules |
| 6 | S | TZ-AUDIT-QA-REGISTRIES | 5 | registries + dict redirects |
| 7 | S | TZ-AUDIT-QA-DEALS | 6 | counterparties/contracts/proposals |
| 8 | S | TZ-AUDIT-QA-ADMIN | 7 | `/admin/*` CRUD |
| 9 | S | TZ-AUDIT-QA-DESKTOP | 8 | pairing + desktop BE + №2 OS |
| 10 | S | TZ-AUDIT-QA-KIT | 9 | `/kit/*` classify |
| 11 | S | TZ-AUDIT-QA-ORPHAN-BE | 10 | все 93 modules |
| 12 | S | TZ-AUDIT-QA-SELF-CHECK | 11 | freeze + 0 missing |

## Product follow-ups (после Self-Check / параллельно другому агенту ≠ docs keys)

| # | SIZE | ID | Path |
|---|------|-----|------|
| A | S | TZ-NX-AUTH-POSTLOGIN-HOME | `../2026-09-17-auth-smells/` |
| B | S | TZ-NX-AUTH-PRIVACY-LINK | same |
| C | S | TZ-NX-AUTH-DEMO-PASSWORD-TITLE | same |
| D | S | TZ-NX-KIT-AUTH-GUARD | same · **PO Yes/No** в TZ |

## Conflict

Все audit TZ: `docs/audits/2026-09-17-qa-*.md` — **один** Freebuff за раз.  
Product smells: `frontend-nx/...` — отдельный claim после audit или другой слот когда `_active` docs снят.
