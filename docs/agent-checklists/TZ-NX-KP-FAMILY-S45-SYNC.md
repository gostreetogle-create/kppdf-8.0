# TZ-NX-KP-FAMILY-S45-SYNC checklist

> Status: **DONE** (archived `2026-09-03`)
> Marker: removed after archive

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-03T18:30:00Z
- workspace: `D:\kppdf-8.0`
- branch: `main`
- baseline_sha: `36ca2ee3` (S44 pushed; build PASS exit 0 at S44 close)
- team_room_claim: unavailable (no Team Room CLI in this workspace)

## Preflight Check Output

- **Context read:** `tasks/TZ-NX-KP-FAMILY-S45-SYNC.md`, `docs/agent-checklists/WAVE-NX-KP-FAMILY.md` (row 6 unchecked), S44 records, `docs/pages/proposals.page.md`, `frontend-nx/libs/data-access/src/lib/sales/pi-quotations.service.ts` (`syncFromMaster` exists, S41), `backend/src/modules/quotation/quotation.service.ts` (`syncFromMaster` bumps familyVersion, copies master items→variants; solo → no-op).
- **Key Constraints:** TZ-exec on `frontend-nx` only; do not touch S44 attach dialog / backend / studio editor; confirm before POST (destructive-ish rewrite); `nx build kppdf-web` last.
- **Planned Deliverable:** «Синхронизировать» CTA in expand panel for master families → `AlertDialogComponent` confirm (RU copy) → `quotationsApi.syncFromMaster(id)` → cache update + toast; specs (confirm → POST, cancel → no POST, error toast).
- **Validation Path:** FIC §A N/A (existing `/proposals`); scoped jest specs; `nx build kppdf-web` last.

## Acceptance

- [x] Sync CTA only in family context where it makes sense (master family with variants)
- [x] AlertDialog confirm with RU copy (состав вариантов перезапишется с мастера)
- [x] Confirm → `syncFromMaster(id)` → family cache refresh + success toast
- [x] Cancel → no POST; error → toast, cache unchanged
- [x] Specs PASS; `nx build kppdf-web` PASS last

## Gates (facts)

- Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0 at S44 close, `36ca2ee3`)
- Scoped jest `proposals-list.page.spec`: **19/19 PASS** (incl. 4 new S45 tests)
- Full kppdf-web jest: 58/59 suites, **337 PASS** — only pre-existing `registries.catalog.spec` (2, unrelated, red at HEAD)
- Scoped eslint `apps/kppdf-web/src/app/pages/proposals/`: **0 problems** (exit 0)
- `pnpm exec nx build kppdf-web` (last): **PASS (exit 0)**

## Integrity slot (до archive)

- [x] Тип изменения: page (existing `/proposals` UX only)
- [x] FIC §A–E: N/A
- [x] page.md / PAGE-TZ-INDEX: S45 bullet + row
- [x] Чужой WIP не в коммите; conflict keys = page.ts + spec + records
- [x] Канон: DOCS-INTEGRITY + TZ-NX-BUILD-INTEGRITY

## Executor report

Delivered on `frontend-nx` only:
- `proposals-list.page.ts`: sync CTA «Синхронизировать состав с мастером» (`proposal-family-sync`) inside the expanded family panel when `family.variants.length > 0 && family.master.familyRole === 'master'`; `confirmSyncFromMaster(row)` opens `AlertDialogComponent` confirm (RU copy: состав вариантов перезапишется с мастера) with `parentDestroyRef: this.destroyRef`; on confirm `syncFamilyFromMaster(row)` → `PiQuotationsService.syncFromMaster(row._id)` → family cache update from response + toast «Состав синхронизирован»; cancel → no POST; error → toast «Не удалось синхронизировать состав» (extracted message), cache untouched.
- Specs: 4 new tests in `proposals-list.page.spec.ts` (CTA shown only for expanded master family with variants / not for solo; confirm → POST + cache version bump + toast; cancel → no POST; error → toast + cache unchanged). Guarded sync-button helper avoids non-null assertions.
- Docs: `docs/pages/proposals.page.md` NX S45 bullet; PAGE-TZ-INDEX `/proposals` row updated.

## Closeout

- [x] archive + wave [x] + `_NOW`/QUEUE sync + remove `_active`
- Status = DONE
- closed_at: 2026-09-03
