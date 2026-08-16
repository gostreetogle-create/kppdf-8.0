# TZ-PRODUCTION-340: Gantt — summary header чуть теплее/темнее children

STATUS: DONE  
РОЛЬ АГЕНТА: local executor (GEMINI.md + kppdf-executor-loop)  
LAYER: 2  
PAGES: /production  
CONFLICT KEYS: `frontend/src/app/pages/production/blocks/gantt-bars.component.ts` ;
`frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`

---

## ARCHIVE_MARKER

```
outcome: DONE
closed_at: 2026-08-16T17:50:00Z
agent: composer-executor
gates: FE tsc PASS; jest gantt-bars 43/43
deploy: no
```

## Что сделано

1. **Summary header tint:** `.gantt-order-group-start` light `oklch(0.94 0.025 85)` vs children wash `0.97 0.012 95`; dark header `0.29 0.03 85` vs mid `0.26 0.02 260`.
2. **Meta-active:** combined `.gantt-order-active.gantt-order-group-*` re-asserts active background (light+dark) so header tint does not win.
3. **Spec:** +1 assert class + CSS marker strings for 340.
4. **Docs:** PAGE-TZ-INDEX one line; production-cockpit.page.md note.

## Verification

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm test -- gantt-bars.component` → **43/43** PASS
- Commit: `bb4d36f8` (pushed)
- Deploy: **нет**
- Не трогали: chevron size, estimate, PATCH, facade, worker-view logic

## known_limitation

Visual smoke in browser (light/dark) — PO; no Playwright in this TZ.
