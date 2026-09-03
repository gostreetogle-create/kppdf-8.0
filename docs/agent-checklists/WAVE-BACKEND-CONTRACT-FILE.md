# WAVE — Backend Contract file (parallel Freebuff #2)

Status: **DONE** · closed 2026-09-03 · C5 closeout finished after Freebuff loop (Cursor docs)

> **Conflict ban (historical):** `frontend-nx/**`, `quotation/**`, `proposals-list*`
> Prompts spent: `tasks/_archive/2026-09/prompts-spent/PROMPT-FREEBUFF-CONTRACT-FILE-*.md`

### Preflight Check Output
- **Context read:** `docs/TZ-NX-BUILD-INTEGRITY.md` §2.3, `contract.schema.ts`, `CRM-CANON-DECISIONS-BACKLOG.md`, `MASTER-CORE.md` §2.4
- **Key Constraints:** backend-only wave; `Contract.status` FSM untouched; NX `/contracts` UI PARK
- **Deliverable:** `contractStatus` + file attach fields + API + specs + docs
- **Validation Path:** backend tsc + focused jest (C1–C4); C5 docs-only

## Preflight

- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS (C1–C4)

## Chain

| # | TZ | Archive | Commit |
|---|-----|---------|--------|
| 1 | [x] C1 SCHEMA | `tasks/_archive/2026-09/TZ-BACKEND-CONTRACT-C1-SCHEMA.done.md` | `1ba6845d` |
| 2 | [x] C2 WRITE-PATH | `tasks/_archive/2026-09/TZ-BACKEND-CONTRACT-C2-WRITE-PATH.done.md` | `52f6cac9` |
| 3 | [x] C3 ATTACH-FILE | `tasks/_archive/2026-09/TZ-BACKEND-CONTRACT-C3-ATTACH-FILE.done.md` | `fd79f955` |
| 4 | [x] C4 SPECS | `tasks/_archive/2026-09/TZ-BACKEND-CONTRACT-C4-SPECS.done.md` | `1033fdd2` |
| 5 | [x] C5 DOCS | `tasks/_archive/2026-09/TZ-BACKEND-CONTRACT-C5-DOCS.done.md` | (this closeout commit) |

## Closeout

- [x] all [x] · `_active/` без Contract C* markers
- [x] QUEUE slot #2 released
- [x] CRM backlog `contractStatus` marked DONE
- [x] NX UI `/contracts` remains PARK/successor

## Запреты (remain)

- Не NX UI `/contracts` (successor)
- Не менять Order / Quotation / KP Family
- Не deploy
