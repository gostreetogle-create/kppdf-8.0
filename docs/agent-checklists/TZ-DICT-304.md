# TZ-DICT-304 checklist

> Status: **DONE** — Cursor Architect PASS 2026-08-04  
> Archive: `tasks/_archive/2026-08/TZ-DICT-304.done.md`  
> Lock: `.mimocode/locks/TZ-DICT-304-units-shell.lock`  
> Commit/push: **NO** unless PO says so

## Claim slot

- agent_id: buffy (partial) + Cursor closeout
- claimed_at: 2026-08-04T18:30:00Z
- workspace: D:\kppdf-8.0

## Acceptance

- [x] Units chrome D1–D2 (shell + sticky tools)
- [x] CRUD units жив (formControl fix on inline add)
- [x] Dead `dictionaries.page.ts` удалён
- [x] Docs updated (units + hub)
- [x] tsc + jest PASS (units 2/2)
- [x] Cursor PASS + archive

## Gates (Cursor)

- fe tsc: PASS
- jest units.page.spec: 2/2 PASS

## Executor / closeout note

Buffy left code ~done but empty checklist/handoff after Freebuff crash. Cursor fixed broken `[ngModel]="form.controls.*"` → `formControlName`, added `units.page.spec.ts`, closed pack.
