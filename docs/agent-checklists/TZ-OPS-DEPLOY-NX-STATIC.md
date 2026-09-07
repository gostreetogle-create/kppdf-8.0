# TZ-OPS-DEPLOY-NX-STATIC checklist

> Marker: `tasks/_active/TZ-OPS-DEPLOY-NX-STATIC.md` after claim  
> Spec: `tasks/_ready/TZ-OPS-DEPLOY-NX-STATIC.md`  
> Canon: `docs/ops/DEPLOY-NX-PROD.md`

## Claim slot

- agent_id:
- claimed_at:
- workspace: `D:\kppdf-8.0`
- branch:

## Preflight

- [ ] `git status` / `_active` empty of conflicting deploy.py owners
- [ ] Read `docs/ops/DEPLOY-NX-PROD.md` + TZ
- [ ] VPN not required for this TZ (no SSH)

## Work

- [ ] `deploy.py` builds NX → copies to `frontend/browser/`
- [ ] README / DEPLOY.md / RUNBOOK.md updated
- [ ] `nx build kppdf-web` green
- [ ] Full gates per `tasks/PROMPT-CLAUDE-DEPLOY-PREP-NX.md`
- [ ] `PRE-DEPLOY-2026-09-07-NX.md` filled
- [ ] `DEPLOY-READY.md` → READY + `frontend_target: nx` + `wipe_default: false`
- [ ] Archive + commit + push
- [ ] **Did not** run `deploy.ps1` / wipe / SSH write

## Integrity

- deploy path ships NX only
- Mongo policy documented warm
- stamp SHA = tip after push
