# NX verification — 2026-09-03 (Cursor)

**Verdict: OK for local acceptance of planned NX waves.**  
Primary app: `frontend-nx` → `http://localhost:4201`. Backend `http://localhost:3000` health **200**. Tip at verify: `94dd7625`.

## Gates

| Check | Result |
|-------|--------|
| `GET /api/health` | 200 |
| NX serve `:4201` | 200 |
| `nx build kppdf-web` | PASS (cache; NG8102 + CSS budget warnings only) |
| `tasks/_active/` | empty (`.gitkeep` only) |

## Waves (docs status) — all closed

| Wave | Checklist | Archives (`tasks/_archive/2026-09/`) |
|------|-----------|--------------------------------------|
| DocStudio S8–S16(+)/S9-FINISH | DONE (S8–S9 wave file still says PARTIAL historically; S9-FINISH DONE) | ~41 `TZ-NX-DOCSTUDIO*.done.md` |
| Sales canon S30–S39 | `WAVE-NX-SALES-CANON.md` **DONE** | 11 `TZ-NX-SALES*.done.md` |
| KP Family S40–S48 | `WAVE-NX-KP-FAMILY.md` **DONE** | 9 `TZ-NX-KP-FAMILY*.done.md` |
| Registries S25 | `WAVE-REGISTRIES-S25.md` **DONE** | 2 `TZ-NX-REGISTR*.done.md` |

Total NX done stamps in Sep archive folder: **63** `TZ-NX-*.done.md`.

## Live routes smoke (authenticated session)

| Route | Result |
|-------|--------|
| `/admin/devices` | OK (shell + devices admin) |
| `/proposals` | OK — list + «Семья» / «Несколько фирм» / «В студии» / «В заказ»; expand → «Скрыть семью» |
| `/orders` | OK — table with ORD-/З- rows, statuses, «Создать заказ» |
| `/studio` | OK — redirects to `studio/:id`; Save / PDF / Fit / panels present |
| `/registries` | OK — groups Каталог / Склад / Контрагенты / Финансы / Документы |
| `/contracts` | **no NX route** (SPA may still return index 200 → fallthrough). **PARK** |

Routes present in `frontend-nx/.../app.routes.ts`: login, enroll, admin/devices|roles, registries, studio, proposals, orders, kit. **No `contracts`.**

## Explicitly not done (PARK / out of wave scope)

From `_NOW.md` + KP Family roadmap:

- NX `/contracts` UI  
- авто-резерв · `statusOverride` · Invoice · guest KP · полный page crawl  
- CRM backlog (e.g. `Counterparty.roles[]`) — not NX wave closeout blockers  

## Operator note

Acceptance surface = **NX `:4201`**. Legacy `:4200` is archive per `docs/architecture/MASTER-CORE.md`, not the final product UI.
