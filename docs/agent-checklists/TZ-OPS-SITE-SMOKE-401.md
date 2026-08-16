# TZ-OPS-SITE-SMOKE-401 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-OPS-SITE-SMOKE-401.done.md`
> Journal: `docs/audits/2026-08-16-site-operator-walk.md`
> Commit/push: по `docs/GIT-POLICY.md` (docs-only closeout)

## Claim slot

- agent_id: DeepC 4 Pro (fullstack sweep)
- claimed_at: 2026-08-16T15:20:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: best-effort

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0
- [x] PO-CANON / GIT-POLICY / _NOW / _active / PAGE-TZ-INDEX прочитаны
- [x] Чужой WIP зафиксирован (NAV-303, PHOTO-304) → SKIP их keys
- [x] Claim + checklist + journal созданы

## Acceptance (из промпта)

- [x] Пройдены все routes A–J из порядка обхода (24 route = PASS / PASS(SKIP) / stub)
- [x] P0 диалоги каталога (products/modules/materials) Save/create проверены (201, RU-валидация, delete+confirm)
- [x] Локальные баги: не найдено P0 — каталог здоров; чинки не потребовались
- [x] Глобальные оформлены: S1 → NAV-303 (не новый TZ, активная волна), S2 → TZ-DATA-UTF8-CLEAN (data migration)
- [x] Journal заполнен (Progress table + Findings + TZ queue + итог)

## Integrity slot

- [x] Локальных фиксов не было (нет diff в коде) — чужой WIP не задет
- [x] NAV-303 / PHOTO-304 keys не трогал
- [x] UI только RU проверен на живых экранах

## Gates (факт)

- команды + PASS/FAIL по мере фиксов — N/A (кода не меняли)

## Executor report

- Живой обход 24 routes (preview на :4200 + backend :3000), все = PASS / PASS(SKIP) / stub.
- P0 каталог: products/modules/materials диалоги Создать/Сохранить/Удалить реально пишут (201), RU-валидация («Обязательное поле»), confirm-диалоги и empty-состояния на русском.
- Локальных P0-багов НЕ найдено → кода не менял, коммита нет.
- Findings: S1 (P1) TS2339 `destructive` в `dashboard-stats.page.ts` — территория NAV-303/WAVE-HOME-STATS, передаю владельцу; S2 (P2) mojibake demo-данных → TZ `tasks/_backlog/TZ-DATA-UTF8-CLEAN.md`.
- Чужой WIP (NAV-303, PHOTO-304, CONFIDENCE-LEDGER-401) не задет.

## Review handoff

- [x] READY FOR REVIEW (обход завершён, journal закрыт)
- [x] Cursor Verdict PASS → archive closeout

## Closeout

- [x] archive + lock + progress + удалить _active
- [x] Status = DONE
- closed_at: 2026-08-16T13:49:13+03:00
