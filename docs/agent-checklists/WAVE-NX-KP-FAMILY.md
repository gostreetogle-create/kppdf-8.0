# WAVE — NX KP Family S40→S48

Status: **READY @ S40** · Sales canon S30–S39 DONE (`28acaff7`)

> Resume: `tasks/PROMPT-FREEBUFF-KP-FAMILY-RESUME.md`
> Roadmap: `docs/architecture/nx-kp-family-roadmap.md`

### Preflight Check Output
- **Context read:** `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/TZ-AUTHORING.md`, `docs/TZ-NX-BUILD-INTEGRITY.md`, `docs/architecture/MASTER-CORE.md`, `docs/pages/proposals.page.md`, `quotation.controller.ts` (family endpoints), `pi-quotations.service.ts`, `WAVE-NX-SALES-CANON.md`
- **Key Constraints:** Freebuff sequential; BE family API frozen (reuse); no variant→order; `nx build kppdf-web` last on FE
- **Planned Deliverable:** S40→S48 NX family UX on `/proposals`
- **Validation Path:** FIC §A N/A (existing route); Integrity; gates per TZ

## Preflight

- [x] baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` PASS

## Chain

| # | TZ | Archive | Commit |
|---|-----|---------|--------|
| 1 | [x] S40 FAMILY-TYPES | `tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S40-TYPES.done.md` | |
| 2 | [x] S41 FAMILY-API-CLIENT | `tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S41-API-CLIENT.done.md` | |
| 3 | [x] S42 LIST-HIDE-VARIANTS | `tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S42-LIST-HIDE-VARIANTS.done.md` | |
| 4 | [x] S43 FAMILY-EXPAND | `tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S43-EXPAND.done.md` | |
| 5 | [x] S44 ATTACH-ORGS | `tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S44-ATTACH-ORGS.done.md` | |
| 6 | [x] S45 SYNC-FROM-MASTER | `tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S45-SYNC.done.md` | |
| 7 | [ ] S46 VARIANT-OPEN-STUDIO | | |
| 8 | [ ] S47 CONVERT-MASTER-ONLY-UX | | |
| 9 | [ ] S48 OPERATOR-DOCS | | |

## Closeout

- [ ] all [x] · `_active/` пуст · QUEUE/_NOW updated

## Запреты

- Не менять family schema / не Invoice / не deploy
- Не завершать turn после одной TZ
- Не два TZ параллельно на `kppdf-web/src/**`
