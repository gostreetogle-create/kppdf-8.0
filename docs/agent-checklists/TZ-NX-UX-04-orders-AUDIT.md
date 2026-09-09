# TZ-NX-UX-04-orders-AUDIT checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-UX-04-orders-AUDIT.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T16:17:01Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM (`_active/` пуст, только `.gitkeep`)
- [x] TZ / канон / deps прочитаны: canon sweep, gold `/registries` pattern (from wave #03), `orders-list.page.ts`, `order-hub-tray.component.ts` full read, `.pi-outline-btn` definition (`global.css:997-1048`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-UX-04-orders-AUDIT.md` на месте (до archive)

### Preflight Check Output
- **Context read:** `frontend-nx/apps/kppdf-web/src/app/pages/orders/orders-list.page.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts`, `frontend-nx/libs/ui/paper-and-ink/src/styles/global.css` (`.pi-button`/`.pi-outline-btn`/`min-h-touch` tokens), grep confirming ad-hoc class string uniqueness across `pages/**`
- **Key Constraints:** audit-only, no product code, two files per conflict keys (`orders-list.page.ts`, `order-hub-tray.component.ts`) — not order-create/order-detail or dialog components
- **Planned Deliverable:** `docs/audits/2026-09-09-nx-ux-orders-audit.md` with T1–C1 table + verdict
- **Validation Path:** verdict PASS-FIX → claim FIX TZ next in same wave-cycle

## Acceptance

- [x] Audit file exists with every checklist row marked OK/FAIL/N/A.
- [x] No product code in commit.
- [x] Verdict PASS-FIX → FIX TZ claimed next (not skipped).

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: docs-only (audit)
- [x] FIC §A–E: N/A (audit produces no product/page/permission change)
- [x] page.md / PAGE-TZ-INDEX: N/A for this AUDIT step (FIX step will add NX UX note to `orders.page.md` per its own criteria)
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`docs/audits/2026-09-09-nx-ux-orders-audit.md`, WAVE row 04 — оба заявлены в TZ)
- [x] Coupling map: N/A (no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён (docs-only closeout)

## Gates (факт)

- Docs-only TZ: код не менялся, typecheck/tests/lint/nx build не применимы к этой волне (audit-only).

## Executor report

- Прочитаны оба файла из conflict keys: `orders-list.page.ts` (161 строк) и `order-hub-tray.component.ts` (598 строк). Order-create/order-detail и диалоговые компоненты (kit-reserve-confirm-dialog, ship-confirm-dialog) сознательно вне скоупа — не названы в conflict keys этого TZ.
- Найден 1 системный **P1**: `order-hub-tray.component.ts` использует hand-rolled класс `border border-rule-strong rounded-sm bg-transparent text-xs` (~9 элементов) вместо канонического `.pi-outline-btn` (существует именно для native `<a>`/`<button>` контекстов, `global.css:997-1048`) или `pi-button`. Этот класс-строка встречается **только** в этом файле (проверено grep по всему `pages/**`) — соседний `orders-list.page.ts` в том же модуле и 17 других страниц уже используют `pi-button`. Один экземпляр (`Шаблоны документов`) — буквальный `<a class="underline">` анти-паттерн из канона. 8 из 9 элементов также лишены `pi-focus-ring` — нет видимого keyboard-focus индикатора, нарушает собственное WCAG-обязательство проекта.
- Verdict: **PASS-FIX**.
- Продуктовый код не менялся в этом TZ (audit-only).
- Файлы: `docs/audits/2026-09-09-nx-ux-orders-audit.md` (создан), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 04 → PASS-FIX), `docs/agent-checklists/TZ-NX-UX-04-orders-AUDIT.md` (этот файл), `tasks/_active/TZ-NX-UX-04-orders-AUDIT.md` (создан → удалён при archive).
- Next: claim `TZ-NX-UX-04-orders-FIX` в этой же сессии (PASS-FIX не PASS-EMPTY).

## Review handoff

- [x] Review не требуется по TZ (audit-only, docs); explicit review gate в TZ не указан.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T16:35:00Z
