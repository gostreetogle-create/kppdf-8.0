# TZ-SALES-312 DONE — Create КП three-zone shell

**Date:** 2026-08-09  
**Wave:** WAVE-KP-VITRINE #3  
**Status:** DONE

```
ARCHIVE_MARKER
task: TZ-SALES-312
status: DONE
closed_at: 2026-08-09T02:20:00Z
agent: agent-3e757640b7
workspace: D:\kppdf-8.0
lock: .mimocode/locks/TZ-SALES-312-create-kp-shell.lock
scope: proposal-create three-zone shell + focused jest
gates: FE tsc PASS; focused Jest proposal-create + deals-chips PASS; prettier/eslint PASS; git diff --check PASS
ban: product picker; quotation save; PDF/template fill; print; deploy
```

## Product result

`/proposals/create` is now a three-zone studio shell under Deals chrome:

- Left / Center / Right regions with `data-test` hooks and RU empty copy from the 311 spec.
- Desktop ≥1280px keeps all three columns visible.
- Narrow viewports use «Товары» / «Параметры» toggles (≤1 open) and Escape closes panels.
- Quotation write, product rail, inspector, template, and print remain later TZ.

## Gates

- FE tsc: PASS
- Focused Jest: PASS (`proposal-create.page.spec.ts`, `deals-group-chips.spec.ts`)
- Prettier / ESLint on changed FE files: PASS
- `git diff --check`: PASS

## Files

- `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts`
- `docs/pages/proposals-create.page.md`
- related WAVE / ARCHITECTURE / checklist / archive / lock
