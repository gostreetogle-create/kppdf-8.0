# TZ-DESK-440 checklist

> Status: **DONE** (Cursor/PO PASS принят по evidence `e835003b` / `0b52a7cb`)
> Marker: `tasks/_archive/2026-08/TZ-DESK-440.done.md`
> Conflict keys: `frontend/src/app/shared/orders/order-hub-tray.component.ts`; `frontend/src/app/shared/orders/order-hub-tray.component.spec.ts`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff (Buffy)
- claimed_at: 2026-08-25T18:26:20+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room CLI не предоставлен)

## Preflight

- [x] `pwd` + `git rev-parse --show-toplevel` → `D:/kppdf-8.0`
- [x] branch → `main`; `tasks/_active/` до claim не содержал чужих задач
- [x] `_NOW.md` + очередь + audit прочитаны; конфликтующих claimed keys нет
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DESK-440-tray-honest-cta.md` на месте

### Preflight Check Output
- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/ui-rules.md`, `docs/UX-FORM-CANON.md`, `docs/CONTEXT.md`, `docs/COUPLING-MAP.md`, `docs/GIT-POLICY.md`, `docs/DOCS-INTEGRITY.md`, `tasks/QUEUE-LIVE.md`, `docs/audits/2026-08-25-ux-hygiene-sweep.md`, `tasks/TZ-DESK-440-tray-honest-cta.md`
- **Key Constraints:** Executor claim before product code; preserve DESK-430 ship semantics; no backend/shipping/order-rollup changes; UI must retain Paper & Ink/a11y conventions.
- **Planned Deliverable:** restrict tray primary CTA to draft confirmation; remove dead status CTAs and copy; add focus rings; update tray specs; run gates and review diff.
- **Validation Path:** FIC N/A (existing routed page, no new route); checklist Integrity slot; FE typecheck, focused Jest, lint, architecture check, diff check.

## Acceptance

- [x] No visible «подключится позже» copy in tray (branches removed from `primaryCtaDisabledReason`; new spec asserts absence for all non-draft statuses)
- [x] `desk-primary-cta` only appears for draft (visibility gate `deskPrimaryCtaVisible()`); hidden entirely for confirmed/in_production/ready/shipped/delivered/cancelled
- [x] Ready has only existing `desk-ship-button` ship control (gold «Отгрузить» CTA removed)
- [x] No visible `siteId` in tray copy («площадка» / «изделия» RU)
- [x] Primary, ship, and cancel controls have `pi-focus-ring`
- [x] Existing ship/cancel behavior and specs remain intact (DESK-430 / SHIP-433 specs untouched, 20/20 pass)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: other — existing `/desk` tray UX behavior, no route/API/domain change
- [x] FIC §A–E: N/A — no new route, permission, backend module, MCP, or shared capability (existing routed page)
- [x] `manager-desk.page.md` обновлён: bullet 440 + строка TZ-таблицы; `PAGE-TZ-INDEX` `/desk` row → 440 DONE
- [x] `SECTION-READINESS`: N/A — existing desk section remains routed and available
- [x] Чужой WIP не в коммите; conflict keys соблюдены (stage только свои пути поимённо)
- [x] Coupling map: N/A — `Order.status` semantics и ship write-path не менялись
- [x] Канон: `docs/DOCS-INTEGRITY.md` прочитан

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — **PASS** (0)
- `cd frontend && pnpm test -- order-hub-tray.component.spec` — **PASS** 20/20 (16 existing + 4 new 440)
- `cd frontend && pnpm test -- manager-desk.page.spec` — **PASS** 37/37 (desk-primary-cta assert на draft — зелёный)
- `cd frontend && pnpm lint` — **PASS** 0 errors / 17 pre-existing warnings (не мои файлы; tray-файлы чисты — grep подтвердил)
- `pnpm architecture:check` — **FAIL 2** — НЕ мои файлы: `materials/material-form-dialog.component.ts:52` (committed HEAD, вне baseline) и `supply-quick-order.component.ts:47` (чужой uncommitted WIP параллельного агента, UX-440 keys). `--no-baseline` grep по моим файлам: 0 violations.

## Executor report

- `order-hub-tray.component.ts`: `PRIMARY_CTA_LABELS` сужен до `draft` (`Partial`), CTA скрыт вне draft через `deskPrimaryCtaVisible()`, `primaryCtaDisabledReason` — только draft-ветки без `siteId` («площадка»/«изделия»), `pi-focus-ring` добавлен на primary/ship/cancel. DESK-430/433 семантика (`canMarkShipped`, ship POST, cancel) не тронута; `manager-desk.page.ts` не менялся.
- Spec: +4 теста — все non-draft статусы без CTA и без «подключится позже»/`siteId`; draft eligible → gold + emit; ready → один ship control без «Отгрузить»; draft без siteId → muted + «площадку» hint.
- Docs: `manager-desk.page.md` bullet 440 + TZ row; `PAGE-TZ-INDEX` `/desk` row DONE.
- Conflict disclosure: `architecture:check` красный из-за чужих правок (см. Gates) — не в моих conflict keys; не чинил чужой WIP.
- Known limits: живой `/desk` smoke не гонялся (dev stack не поднят в сессии); DOM-уровень покрыт jest-спеками. Live PASS — шаг Cursor/PO после волны.

## Review handoff

- [x] READY FOR REVIEW — code + gates green; Cursor/PO PASS принят по переданному evidence
- [x] Cursor/PO PASS принят по переданному evidence `e835003b` / `0b52a7cb` (FE tsc + Jest зелёные)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-25T20:27:06+03:00
