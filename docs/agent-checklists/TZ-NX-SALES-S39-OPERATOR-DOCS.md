# TZ-NX-SALES-S39-OPERATOR-DOCS checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-NX-SALES-S39-OPERATOR-DOCS.md` (present)
> Commit/push: per `docs/GIT-POLICY.md` (claimed executor: after gates/review)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `claude`
- claimed_at: `2026-09-03T09:10:00+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` (no team-room CLI in executor)

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no competing claim on the S39 conflict keys
- [x] TZ / wave state read (S30–S38 all archived and pushed)
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SALES-S39-OPERATOR-DOCS.md` present

### Preflight Check Output

- **Context read:** S39 TZ, `docs/pages/orders.page.md`, `docs/pages/proposals.page.md`, `docs/pages/PAGE-TZ-INDEX.md`, `docs/SECTION-READINESS.md`, `docs/CAPABILITY-LEDGER.md`, `docs/architecture/nx-sales-canon-roadmap.md`, `tasks/QUEUE-LIVE.md`, WAVE checklist.
- **Key Constraints:** docs-only; finalize the sales wave; PAGE-TZ-INDEX rows for this wave already drafted in the worktree (adopted + finalized to DONE); no product runtime changes.
- **Planned Deliverable:** page docs verified, PAGE-TZ-INDEX wave rows finalized, SECTION-READINESS + CAPABILITY-LEDGER + roadmap updated, WAVE all [x] + SHA, QUEUE/_NOW empty, prompts archived, closeout commit/push.
- **Validation Path:** docs diff review; code gates N/A (docs-only, explicit in archive).

## Acceptance

- [x] NX sections in `orders.page.md` / `proposals.page.md` current (S34–S38 already synchronized; verified).
- [x] `PAGE-TZ-INDEX.md` — S30–S39 wave rows finalized to DONE (adopted the worktree-drafted rows for `/orders` and `/proposals`).
- [x] `SECTION-READINESS.md` — Сделки row notes NX orders journal + КП studio; legacy HUB not promised in NX.
- [x] WAVE checklist all [x] with SHAs; closeout box checked; `_active/` empty; QUEUE/_NOW updated (QUEUE EMPTY).
- [x] `CAPABILITY-LEDGER.md` — one row: NX orders list/create/detail + payment `included`.
- [x] Roadmap `nx-sales-canon-roadmap.md` — S30–S39 DONE.
- [x] Wave PROMPT files moved to `tasks/_archive/2026-09/prompts-spent/` (same step as last TZ archive).
- [x] Docs diff review PASS; code gates N/A (docs-only).

## Integrity slot

- [x] Type: docs-only (operator docs / wave closeout).
- [x] FIC: N/A — no new page/permission/capability beyond the already-committed S30–S38 code; ledger row records the capability.
- [x] `docs/pages/orders.page.md` + `docs/pages/proposals.page.md`: verified current.
- [x] `docs/pages/PAGE-TZ-INDEX.md`: updated (final wave rows).
- [x] `docs/SECTION-READINESS.md`: updated.
- [x] Foreign WIP: PAGE-TZ-INDEX rows were worktree-drafted for this wave by the TZ author; S39 adopts and finalizes them (documented). Other dirty files untouched.
- [x] COUPLING-MAP: N/A.
- [x] `docs/DOCS-INTEGRITY.md` applied.

## Gates (факт)

- Code gates: **N/A** — docs-only TZ (no runtime change); markdown diff reviewed.
- `git diff --check` on all touched docs → PASS.

## Executor report

- (заполняется при archive)

## Review handoff

- [ ] READY FOR REVIEW — wave-internal chain; no external Cursor Verdict required by the TZ.

## Closeout (после PASS)

- [ ] archive + lock + live-state sync + remove `_active` marker
- [ ] Status = DONE
- closed_at: _(ISO)_