# TZD-73 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZD-73.done.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff
- claimed_at: 2026-09-05T23:58:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет CLI Team Room у Freebuff; slot заполнен в checklist)

## Preflight

- [x] git status/branch: main; TZD-72 архивирован; чужие правки не трогаю
- [x] `_NOW.md` + `tasks/_active/` — только мой TZD-73
- [x] TZ / CAPABILITY-LEDGER / registries.page.md / desktop/README.md / WAVE checklist прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-73.md` на месте

### Preflight Check Output
- **Context read:** `docs/CAPABILITY-LEDGER.md`, `docs/pages/registries.page.md`, `desktop/README.md`, `docs/agent-checklists/WAVE-DESKTOP-EXCEL-NX-ALIGN.md`, `desktop/src/App.svelte` (кнопки Form Studio: «Скачать Excel-форму» / «Скачать с данными» / импорт+валидация)
- **Key Constraints:** docs-only + smoke list; никаких product features; Excel-кнопок в registries нет
- **Planned Deliverable:** ledger 2 строки → registries.page pointer → desktop/README (3 кнопки + RBAC NX) → WAVE DoD → smoke list в checklist → archive + wave STATUS DONE
- **Validation Path:** docs diff review; gates N/A (docs-only) — зафиксировать причину

## Acceptance (из TZ)

- [x] CAPABILITY-LEDGER: Desktop Excel Form Studio = included; NX Desktop pairing/download = included (note desktop:admin)
- [x] registries.page.md: «массовый Excel = Desktop Form Studio; на NX registries кнопок Excel нет»
- [x] desktop/README.md: 3 кнопки + RBAC скачивания приложения на сайте NX
- [x] WAVE checklist DoD отмечен (68–73 archived; smoke; ledger; pointer)
- [x] Smoke list в checklist с PASS/SKIP (ниже)

## Smoke checklist (TZD-73, evidence)

| # | Сценарий | Где проверено | Вердикт |
|---|----------|---------------|---------|
| 1 | Desktop: template → 2 rows (ok+dup) → reject dup | Unit: legacy TZD-69/70 specs (multi-import dedupe/reject; send-ready) + desktop `npx tsx --test` (TZD-70 report 101 tests) | PASS (unit) — live desktop-run: PO после deploy |
| 2 | Desktop: export materials → edit → re-import | Unit: `excel-form-template.test.ts` export mode (TZD-68); re-import path = Form Studio import | PASS (unit) — live: PO после deploy |
| 3 | Desktop: worker form 1 row | Unit: TZD-69 workers/people validation (ФИО/email/ставка/workType dedupe) | PASS (unit) — live: PO после deploy |
| 4 | NX admin: видит кнопку, скачивает, выпускает ключ | Jest: app-shell spec (hasAny true → button, click → dialog), pairing-dialog spec 14 it (issue/copy/download via compat URL), BE controller spec (admin shortcut allow) | PASS (unit-level) — браузер после deploy |
| 5 | NX user без desktop:admin: кнопки нет | Jest: app-shell spec «absent when lacks desktop:admin»; BE 403 без права | PASS (unit-level) — браузер после deploy |

Live browser/deploy smoke — только после deploy (локальный prod-контур не поднят в этой сессии; гейт разворачивания — слово PO). SKIP (deploy-dependent) задокументирован в отчёте.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: docs-only (+1 строка в page.md и README — не product code)
- [x] FIC §A–E: N/A — прав не добавлял (TZD-72 уже провёл §B); capability-строки обновлены в CAPABILITY-LEDGER
- [x] page.md: registries.page.md обновлён (pointer)
- [x] DOMAIN-MAP: N/A (обновлён в TZD-72)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A

## Gates (факт)

- Кодовые gates N/A — docs-only TZ (TZD-73 «минимальный code только если ledger/page pointer» — код не менялся). Причина зафиксирована: diff review вместо тестов; подтверждено diff `git diff --stat` (только .md).

## Executor report

- Ledger: +2 строки (Desktop Excel Form Studio included; NX Desktop pairing/download included c RBAC note) + история 2026-09-05.
- registries.page.md: секция «Массовый Excel = Desktop» — явно «кнопок Excel нет на NX registries».
- desktop/README.md: таблица 3 кнопок Form Studio (шаблон/с данными/импорт+валидация, требования+паринг) + переписан блок паринга: meta-инжект в обе SPA (TZD-71), RBAC desktop:admin на NX (TZD-72), legacy-known-limitation.
- WAVE checklist: Status DONE, chain 68–73 archived, DoD отмечен.
- Smoke: 5 сценариев — unit-level PASS; live browser после deploy — SKIP (deploy = слово PO).
- Conflict disclosure: правил только 5 файлов из conflict keys TZD-73; чужие незакоммиченные файлы не тронуты.

## Review handoff

- [x] TZ-73 не требует Cursor PASS (финализация: archive 2026-09; wave STATUS DONE)

## Closeout (после PASS)

- [x] archive + lock + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-05T23:59:00Z
- commit SHA: pending (filled after commit)