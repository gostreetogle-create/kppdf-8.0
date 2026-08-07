# TZ-PRODUCTION-303.1b-land-hotfix-main checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-PRODUCTION-303.1b-land-hotfix-main.md`
> Commit/push: **YES** to main · Deploy: **NO**
> TZ: `tasks/TZ-PRODUCTION-303.1b-land-hotfix-main.md`
> Handoff: `tasks/HANDOFF-PRODUCTION-303.1b-land-hotfix-main.md`

## Claim slot

- agent_id: `agent-3e757640b7`
- claimed_at: `2026-08-07T18:30:02.952Z`
- workspace: `D:\\kppdf-8.0`
- team_room_claim: `yes`

## Preflight

- [x] canonical root `D:\\kppdf-8.0`; HEAD `12672678fcd5866bd942902edae3b92cc40f7906`
- [x] no foreign CLAIM on production/** / orders.page.ts; Team Room claim owns canonical main
- [x] read Cursor verdict: 303.1 deep-link PASS; Gantt hotfix dirty on canonical main and absent from origin/main

## Acceptance

- [ ] freebuff 303.1 merged/cherry-picked onto main
- [ ] Gantt hotfix files committed on main
- [ ] verdict audit doc committed
- [ ] tsc + jest production/orders PASS
- [ ] eslint without --fix PASS
- [ ] push main; deploy NO

## Executor report (auto)

```
commit:
push:
gates:
deploy: NO
known_limits:
```

## Working notes

- Canonical main was fast-forwarded by the owner to `12672678` before this claim.
- Product WIP is intentionally dirty at claim time in the listed production files; it is the subject of this TZ.
- The previous audit file `tasks/AUDIT-2026-08-07-first-look-project-audit.md` is outside this TZ and remains untracked elsewhere.
