# TZ-PRODUCTION-303.1b-land-hotfix-main checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-PRODUCTION-303.1b-land-hotfix-main.md`
> Commit/push: **YES** to main · Deploy: **NO**
> TZ: `tasks/TZ-PRODUCTION-303.1b-land-hotfix-main.md`
> Handoff: `tasks/HANDOFF-PRODUCTION-303.1b-land-hotfix-main.md`

## Claim slot

- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0
- team_room_claim:

## Preflight

- [ ] canonical root D:\kppdf-8.0
- [ ] no foreign CLAIM on production/** / orders.page.ts
- [ ] read Cursor verdict: 303.1 deep-link PASS; Gantt hotfix NOT on remote

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
gates:
deploy: NO
known_limits:
```
