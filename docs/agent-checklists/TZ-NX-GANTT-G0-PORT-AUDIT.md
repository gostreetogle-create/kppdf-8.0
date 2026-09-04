# TZ-NX-GANTT-G0-PORT-AUDIT checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-NX-GANTT-G0-PORT-AUDIT.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-04T21:10:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет Team Room CLI в этом контуре)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — чужой CLAIM только TZ-NX-DOCSTUDIO-S37 (DocStudio keys, не пересекаются: gantt keys = docs/audits/2026-09-04-gantt-nx-port-audit.md + WAVE-NX-PRODUCTION-GANTT.md)
- [x] TZ / канон / deps прочитаны (GEMINI.md, PO-CANON.md, executor-loop, how-to-connect-ai, WAVE, UX spec, page.md, audits 2026-08-15, TZ G1–G7)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-GANTT-G0-PORT-AUDIT.md` на месте

## Acceptance

- [x] Audit md существует, ≥1 таблица file-map + API + bug list → `docs/audits/2026-09-04-gantt-nx-port-audit.md`
- [x] WAVE G0 [x] (после archive+push)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: docs-only (audit)
- [x] FIC §A–E: N/A — документная задача без UI route/permission/module/MCP; причина: audit-артефакт волны, код не меняется
- [x] page.md / PAGE-TZ-INDEX: N/A — не меняет страницу; page.md остаётся legacy-SoT до G7
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только создаю audit doc + пачка TZ переезжает в _active)
- [x] Coupling map: N/A — общие поля не трогались
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] N/A — G0 без кода (docs + read-only legacy)
- [x] Нет другого `tasks/_active/*` с моими keys
- [ ] (не применимо) `nx build kppdf-web` — только с G1 (первый FE-код волны)

## Gates (факт)

- docs-only: markdown/diff review; кодовые тесты не применимы (причина зафиксирована в Integrity slot)
- `git diff --stat` перед коммитом — только ожидаемые файлы волны (audit, checklist, wave, _active, archive)

## Executor report

- Префлайт: legacy `frontend/src/app/pages/production/**` (15 файлов), UX spec FROZEN, page.md, аудиты 2026-08-15, TZ G0–G7, NX стороны (app.routes, nav-categories, shell-tool-rail, pi-orders.service, capabilities.metadata).
- Ключевые находки: (1) `/production` уже есть в `nav-categories.ts` (pageKey `production`, label «Гант»), route отсутствует → чип скрыт — G1 только добавляет route; (2) `production:read` уже есть в `capabilities.metadata.ts`; (3) NX `ShellToolRailService` (setTools/clear/invoke) — эталон регистрации `studio-editor.page.ts`; (4) `PiOrdersService` имеет list/getById/create/update (PATCH /orders/:id) — estimate-days/estimate-start отсутствуют → G2 добавит; (5) legacy scroll-контракт = `scrollRequest` signal (monotonic nonce target: today|fit-start) + QA-445E pulse — эталон для G4; (6) известно pan/drag-боль: после сдвига plannedDate на более раннюю дату range/scroll не обновлялся (G4).

## Review handoff

- [x] N/A — G0 документная задача волны, Cursor Verdict по TZ не требуется (TZ не задаёт review-inbox)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-04T22:00:00+03:00