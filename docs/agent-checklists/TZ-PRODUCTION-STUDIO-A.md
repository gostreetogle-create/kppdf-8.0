# TZ-PRODUCTION-STUDIO-A checklist

> Status: **DONE** (archived)  
> Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-A.done.md`  
> Lock: `.mimocode/locks/TZ-PRODUCTION-STUDIO-A-spec.lock`  
> Type: docs-only / architect-executor

## Claim slot

- agent_id: Cursor (Wave A plan closeout)
- claimed_at: 2026-08-15
- closed_at: 2026-08-15
- workspace: D:\kppdf-8.0
- team_room_claim: N/A — docs-only

## Preflight

- [x] Проверен `git status --short --branch`.
- [x] Проверены текущие `_active` задачи и conflict keys.
- [x] Прочитаны audit, WAVE, `PO-CANON`, KP studio spec pattern и page docs.
- [x] Claim marker создан до документационных правок.
- [x] Scope ограничен docs/tasks; product-код запрещён.

## Acceptance

- [x] SoT `docs/ux/production-gantt-studio-spec.md` создан.
- [x] Frozen shell вставлен дословно.
- [x] Mapping UI↔код, responsive, a11y и geometry gate описаны.
- [x] Заказы≠Фильтры: search в Заказах; reset в Фильтрах.
- [x] `production-cockpit.page.md` синхронизирован: target studio / current docked until B/C.
- [x] `work-types.page.md` говорит «Цех», не «Каталог».
- [x] `SECTION-READINESS.md` содержит `STUDIO REFACTOR / WAVE A SPEC`, не READY.
- [x] `PAGE-TZ-INDEX.md` содержит STUDIO-A.
- [x] Park 308–310 помечены blocked/absorbed; 309 остаётся отдельной будущей write-wave.
- [x] В diff нет frontend/backend файлов.

## Integrity slot

- [x] Тип изменения: docs-only.
- [x] FIC product checks: N/A — product-код запрещён.
- [x] page docs / PAGE-TZ-INDEX обновлены.
- [x] SECTION-READINESS обновлён.
- [x] Чужой WIP не перезаписывать; существующие PO-CANON/PO-DIARY изменения не трогать.
- [x] `git diff --check` PASS.

## Gates

- [x] `git diff --check` — PASS.
- [x] Проверка списка изменённых путей: product diff отсутствует.
- [x] Проверка ссылок на spec/TZ.

## Closeout

**Wave A result:** DONE. Product code was not touched.  
**Architectural PASS:** Cursor + PO filter-split lock (2026-08-15).  
**STOP:** не начинать product Wave B в рамках этой TZ. Следующий шаг — отдельная выдача `PROMPT-PRODUCTION-STUDIO-CONTINUOUS` / TZ-B.

- [x] READY FOR REVIEW после gates.
- [x] Archive + удалить `_active`.
- [x] Lock создан.
- [x] progress.md запись.
- [x] WAVE master Phase A отмечен.

## Executor report (auto)

```
tz: TZ-PRODUCTION-STUDIO-A
outcome: DONE
type: docs-only
archive: tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-A.done.md
lock: .mimocode/locks/TZ-PRODUCTION-STUDIO-A-spec.lock
product_diff: none
next: TZ-PRODUCTION-STUDIO-B-shell.md (только по continuous prompt / явной выдаче PO)
```
