# TZ-UX-DIALOG-302 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-UX-DIALOG-302.done.md`
> Commit/push: YES (executor-loop)

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-08T08:35:40Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; send used)
- closed_at: 2026-08-08T08:42:00Z

## Preflight

- [x] Claim до кода; `_active/` empty before claim

## Acceptance

- [x] Cookbook + ui-dialog-canon.md с kinds A–D
- [x] QuickCreate L шире (xl~920), M/L 2-col, body max-h+scroll
- [x] products/modules opener без узкого width override
- [x] Outliers table в audit
- [x] jest quick-create 7/7 + tsc PASS; archive; push

## Gates (факт)

- `pnpm exec jest …/quick-create-dialog.component.spec.ts` → PASS 7/7
- `pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS

## Executor report

- SIZE_TO_WIDTH S/M/L→md/lg/xl; form xl 920; useTwoCol + fieldsGridClass
- Docs canon + outliers; FieldKey/API/deploy untouched
- Conflict disclosure: peer desktop/admin/chrome WIP not staged

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
