# TZD-52 — READY FOR REVIEW

> Spec: `tasks/TZD-52-desktop-054-publish-warm-deploy.md`
> Checklist: `docs/agent-checklists/TZD-52.md`

- agent_id: composer-executor (cursor-subagent)
- claimed_at: 2026-08-16T19:11:06+03:00
- ready_for_review_at: 2026-08-16T19:20:00+03:00
- workspace: D:\kppdf-8.0
- branch: main
- Status: READY FOR REVIEW (await Cursor PASS — do not archive yet)

## Evidence (short)

- Bump SHA: `c856c178865ed4454590a3ee1c209100e7eeab19` → origin/main
- tauri build + publish-installer 0.5.4 PASS (NSIS hash match after clearing stale dist-installers)
- Warm deploy PASS (`WIPE=false`); Desktop installer OK lines present
- Prod `https://kppdf-crm.ru/api/health/ready` 200; LAN/tunnel zip 200 (public edge 401 without device cookie = AUTH-305)
