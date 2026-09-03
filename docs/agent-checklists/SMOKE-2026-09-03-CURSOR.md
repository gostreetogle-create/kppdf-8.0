# Smoke 2026-09-03 (Cursor browser + HTTP)

## Stack
- GET /api/health → 200
- legacy :4200 → 200 (routes desk/proposals/orders/contracts/doc-constructor)
- NX :4201 → 200 (nx serve up)

## NX authenticated smoke
- Login via demo fill → /admin/devices OK
- /proposals → heading «Коммерческие предложения» OK
- /orders → list with ORD-/З- rows, statuses, «Создать заказ» OK
- /studio → redirected into editor `studio/:id` with Save/PDF/Fit controls OK
- /registries → navigated (confirm substantive UI)

## Legacy FE note
- First visit showed Angular overlay TS2304 after ARCH dynamic-import (likely stale HMR).
- Hard navigate to `http://localhost:4200/` → clean login page, **no overlay**.
- `tsc -p tsconfig.app.json --noEmit` PASS.
- Treat overlay as non-blocker if Claude confirms after FE serve restart / hard refresh.

## TZ for Claude
`tasks/_ready/TZ-OPS-DEPLOY-PREP-2026-09-03.md`
