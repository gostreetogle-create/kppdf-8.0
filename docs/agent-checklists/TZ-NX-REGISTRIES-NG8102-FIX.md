# TZ-NX-REGISTRIES-NG8102-FIX checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-REGISTRIES-NG8102-FIX.done.md`

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T21:20:00+03:00

## Acceptance

- [x] NG8102 removed from registry-detail-panel filter bindings
- [x] Missing filter key renders empty string (text + select)
- [x] Regression test added
- [x] Gates PASS

## Gates

- [x] build kppdf-web — PASS (no NG8102)
- [x] test kppdf-web — PASS (121/121)
- [x] lint --all — PASS
- [x] architecture:check:nx — PASS
- [x] ui:tokens:nx — PASS

## Executor report

`filterInputValue(key)` with `const raw: string | undefined = filters[key]; return raw ?? ''`.
Template uses method for both text input and select bindings.

**Outcome: PASS.**

## Closeout

- [x] archive done
- [x] active claim deleted
- closed_at: 2026-08-29T21:22:00+03:00
