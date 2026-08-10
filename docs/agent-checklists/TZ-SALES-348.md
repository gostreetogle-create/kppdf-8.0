# Executor checklist — TZ-SALES-348

## Claim slot
- Status: `DONE`
- agent_id: `cursor-composer-sales348`
- claimed_at: `2026-08-10T21:04:43Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` (unknown task; message sent)

## Claim
- [x] Claim created in `tasks/_active/TZ-SALES-348.md`.
- [x] Base refreshed from `origin/main` at `640ddca9` (post–AUTH-302 docs; product base includes 347).
- [x] No competing active marker on SALES-348 conflict keys.

## Acceptance
- [x] Card shows `В КП: N` from current draft composition.
- [x] Quantity field defaults to 1; add emits requested quantity and keeps vitrine open.
- [x] Chips `Изделия` / `Модули` / `Материалы` switch the existing panel; search/categories remain scoped.
- [x] Module/material lines persist with `lineKind`, `refId`, and snapshot name/article/price.
- [x] Existing product lines and old quotations still read and render.
- [x] Removing a line updates the `В КП` badge from the real parent composition.

## Gates / evidence
- [x] Backend TypeScript.
- [x] `pnpm --dir backend test -- quotation --runInBand` → 40/40 PASS.
- [x] Frontend app TypeScript.
- [x] `pnpm --dir frontend test -- proposal-create --runInBand` → 41/41 PASS (create+rail+terms).
- [x] Prettier / ESLint / `git diff --check`.
- [x] Browser self-verify: component/DOM suite (chips, qty, badge, module/material, remove); live data stack unavailable.

## Closeout
- [x] Executor report completed.
- [x] `tasks/_archive/2026-08/TZ-SALES-348.done.md` created.
- [x] `.mimocode/locks/TZ-SALES-348-kp-vitrine-added-badge-modules.lock` created.
- [x] `_active` marker removed.
- [x] Commit and push recorded (see closeout commit).
