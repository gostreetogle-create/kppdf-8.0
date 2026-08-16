# TZD-48 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-48.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: buffy (deepseek-v4-flash, desktop executor)
- claimed_at: 2026-08-16T13:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no (desktop single-agent LAYER 3; `tasks/_active/` пуст — конфликтов нет)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0` (git root подтверждён)
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (spec TZD-48, аудит-доки сессии, PO-CANON/GIT-POLICY)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-48.md` на месте

## Acceptance (критерии из TZ)

- [x] POST `/download` отвечает за секунды; прогресс виден до конца (smoke: `{ok:true,started:true}` мгновенно, статус в `/download/status`)
- [x] Первый download создаёт `models/` без ENOENT (mkdir recursive; smoke подтвердил каталог)
- [x] Нет sticky «модель не скачана»; после «Перезапустить» — load возможен (`modelLoadErrorSticky` только для load-exception)
- [x] UI не врёт про SoT: non-material write только с честной кнопкой + confirm (label «Записать в каталог» + `confirm()`)
- [x] Inbox файл не уезжает в `processed/` при полном провале send (`finalizeInboxFileIfDone` требует proposed+created > 0)
- [x] Частичная AI-карта не обнуляет эвристики (applyTableMapping — только присутствующие ключи)
- [x] Inbox Excel читает лист с данными (`excelImporter.parse` — активный лист)
- [x] Counterparty без ИНН не `ok_new` (`requiredFields: ['name','inn']`)
- [x] `bom`/unknown target не роняет студию (`isImportTargetKey` guard + RU-сообщение; `bom` убран из BE enum)
- [x] BE не сохраняет пустой профиль (create/update → BadRequest)
- [x] Gates PASS (tsc, svelte-check, 46 desktop, 12 BE)
- [x] Commit только conflict keys + тесты + checklist; без `data/`

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: MCP (ai-runner) + desktop core + thin BE
- [x] FIC §A–E: N/A — правки в рамках существующей студии/MCP-паттерна, новых модулей/прав/страниц нет
- [x] page.md / PAGE-TZ-INDEX: N/A (Tauri desktop, не SPA-route)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (stage только свои пути)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd desktop && npx tsc --noEmit
cd desktop && npx svelte-check --threshold error
cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts
cd backend && npx jest src/modules/import-mapping-profile --no-coverage
```

- [x] tsc — PASS (desktop + backend)
- [x] svelte-check — PASS, 0 errors 0 warnings
- [x] desktop tests — PASS 46/46 (вкл. новые TZD-48: partial merge, inn, лист с данными, allowlist)
- [x] backend jest — PASS 12/12 (вкл. empty profile 400, dual-state normalize)
- [x] Smoke ai-runner: non-HF URL отклонён, job принят мгновенно, models/ создан, статус корректен

## Executor report (auto)

- **agent:** buffy (desktop executor) · TZD-48 · 2026-08-16
- **Commit:** `b03ecc22060f4d20c6d559c043910ea4701b5d87` (pushed `e108e22a..b03ecc22 → main`)
- **Сделано:** 1) ai-runner `/download` — асинхронный приём + mkdir models + allowlist HF + не-sticky missing-file; клиент — короткий timeout на приём, poll статуса, `modelLoaded` только после `/health`. 2) `applyTableMapping` — частичный merge (не обнуляет эвристики). 3) Честность SoT: кнопка «Записать в каталог» + `confirm()` для non-material, hint в шаге 2; `processed/` только при (proposed+created)>0; inbox-кнопки «Предложить/Задачу ИИ» скрыты для активного файла. 4) Inbox Excel — лист с данными. 5) BE/FE: counterparty `inn` required; `bom` убран из enum, unknown target — guard+RU; BE 400 на пустой профиль; update нормализует legacy columnMap в tables (одна SoT). 6) Копи «Модель» (Запустить→Скачать→Перезапустить) + «Студия импорта». 7) Тесты: 46 desktop (новые: partial AI map, inn, лист с данными, allowlist) + 12 BE.
- **Conflict disclosure:** stage — только conflict keys TZD-48 + тесты + checklist. Чужой WIP (TZ-PRODUCTION-336 / UX-326 / UX-332, photos, silent-http, gantt и др.) НЕ включён. `data/**`, `TZ-UX-331*`, `docs/PO-DIARY.md`, page-docs вне desktop — не трогал.
- **Known limits (successor TZD-49):** journal HITL для product/module/counterparty; живой GGUF-прогон не делался (трафик); session-per-chat Llama; размеры/вес CAD-колонок.
- **Cursor Verdict:** PASS (b03ecc22060f4d20c6d559c043910ea4701b5d87)

## Review handoff

- [x] READY FOR REVIEW — commit + push сделан, ожидание Cursor Verdict PASS
- SHA: `b03ecc22` (`e108e22a..b03ecc22 → main`, pushed)
- [x] **Не** archive до Cursor Verdict PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T12:25:00+03:00
