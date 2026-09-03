# Smoke 2026-09-03 (Cursor browser + HTTP)

Full NX wave audit: `docs/audits/2026-09-03-nx-verification.md` (PASS local).

## Stack
- GET /api/health → 200
- NX `:4201` → **primary** acceptance surface (200)
- legacy `:4200` → secondary/archive only (200 if up)

## NX authenticated smoke (re-verified tip `94dd7625`)
- Session on `/admin/devices` OK
- `/proposals` → list + KP Family controls («Семья» expand / «Несколько фирм» / «В студии» / «В заказ») OK
- `/orders` → ORD-/З- rows, statuses, «Создать заказ» OK
- `/studio` → `studio/:id` with Save/PDF/Fit OK
- `/registries` → Каталог/Склад/Контрагенты/Финансы/Документы OK
- `/contracts` → **no NX route** (PARK)

## Gates
- `nx build kppdf-web` PASS (warnings only)

## Legacy FE note
- Earlier TS2304 overlay after ARCH dynamic-import = stale HMR; tsc PASS. Not NX acceptance.

## Deploy prep
See `docs/agent-checklists/DEPLOY-READY.md` / `PRE-DEPLOY-2026-09-03.md` — deploy only on explicit PO command.
