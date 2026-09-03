# WAVE — Backend Contract file (parallel Freebuff #2)

Status: **READY @ C3** · parallel to KP Family S40–S48

> **Conflict ban:** `frontend-nx/**`, `quotation/**`, `proposals-list*`
> Resume: `tasks/PROMPT-FREEBUFF-CONTRACT-FILE-RESUME.md`

### Preflight Check Output
- **Context read:** `docs/TZ-NX-BUILD-INTEGRITY.md` §2.3, `contract.schema.ts`, `CRM-CANON-DECISIONS-BACKLOG.md`, `MASTER-CORE.md` §2.4, `WAVE-NX-KP-FAMILY.md`
- **Key Constraints:** backend-only; existing `Contract.status` FSM untouched; Freebuff #1 owns kppdf-web
- **Planned Deliverable:** `contractStatus` + file attach fields + API + specs + docs
- **Validation Path:** backend tsc + focused jest; no nx build required

## Preflight

- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS

## Chain

| # | TZ | Archive | Commit |
|---|-----|---------|--------|
| 1 | [x] C1 SCHEMA | `tasks/_archive/2026-09/TZ-BACKEND-CONTRACT-C1-SCHEMA.done.md` | |
| 2 | [x] C2 WRITE-PATH | `tasks/_archive/2026-09/TZ-BACKEND-CONTRACT-C2-WRITE-PATH.done.md` | |
| 3 | [ ] C3 ATTACH-FILE | | |
| 4 | [ ] C4 SPECS | | |
| 5 | [ ] C5 DOCS | | |

## Closeout

- [ ] all [x] · `_active/` пуст для этих TZ

## Запреты

- Не NX UI `/contracts` (successor)
- Не менять Order / Quotation / KP Family
- Не deploy
