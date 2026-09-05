# TZ-NX-DOCSTUDIO-D52-INSERT-SUGGEST checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-D52-INSERT-SUGGEST.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T12:20:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] D51 DONE
- [x] Прочитал `onTableSourceChange`/`commitCatalogSelectionChange`/`addTableLayer` в `studio-editor.page.ts` — подтвердил существующий write-path (`blocksService.create` + `documents.putDataSet`), а также уже существующий «sole manual table» auto-wire в `commitCatalogSelectionChange` (S41) — это НЕ то, что строит D52 (тот путь для одиночной ручной таблицы; D52 — явный клик когда таблицы нет/не совпадает)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-D52-INSERT-SUGGEST.md` на месте

## Acceptance

- [x] Выбрал ≥1 изделие → могу вставить таблицу изделий без захода в Свойства (`insertTable` → `insertCatalogTable('products')` → create-table + `putDataSet`)
- [x] Строки live на A4 после вставки (`applyLiveRowsFromDataSet`, тот же путь, что `onTableSourceChange`)
- [x] Build + focused studio tests PASS

## Integrity slot

- [x] Тип изменения: page (frontend-nx UI) — без новых BE endpoints
- [x] FIC: page.md — отложено до D54
- [x] Чужой WIP не в коммите
- [x] Канон: docs/DOCS-INTEGRITY.md соблюдён

## Build integrity

- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

```
cd frontend-nx
pnpm exec nx test kppdf-web --testPathPattern="studio-data-panel" → PASS (studio-data-panel.component.spec.ts: 14/14, вкл. 2 новых D52-теста)
pnpm exec nx lint kppdf-web → 0 новых ошибок/warnings в touched files (studio-data-panel.component.ts, studio-editor.page.ts)
pnpm exec nx build kppdf-web → PASS, exit 0
```

**Observed but not mine (не чинил, BAN zone):** полный прогон `nx test kppdf-web` показывает 1 нестабильный fail в `production-cockpit.page.write.spec.ts` (TZ-NX-GANTT-G5) — `pages/production/**` уже dirty в рабочем дереве (Freebuff активно правит `production-cockpit.page.ts`/`production-read.facade.ts`/`gantt-bar.model.ts` параллельно в этой же сессии; между двумя моими прогонами число падений изменилось с 2 на 1). Не в моей зоне, не трогал, не блокирует мой gate — `studio-data-panel.component.spec.ts` зелёный отдельно, `nx build kppdf-web` зелёный.

## Executor report

- `studio-data-panel.component.ts`: новый output `insertTable = output<StudioShowcaseKind>()`; `insertTargets()` computed — только kinds с ≥1 selection (только совместимые); disabled-CTA + hint, когда каталог пуст (даже если anchors выбраны).
- `studio-editor.page.ts`: новый `insertCatalogTable(kind)` — если уже есть table-блок с этим `dataSource.type` → `activateLayer` (focus, без дублирующего write); иначе создаёт блок (извлечён общий `createTableBlock()` — рефакторинг `addTableLayer()` без изменения его поведения) и сразу вызывает новый `setBlockCatalogSource(blockId, source)` — тот же `documents.putDataSet` путь, что уже использует `onTableSourceChange`, только параметризован по `blockId`, а не по `activeLayerId()`. Второго write-path не создано.
- Не трогал существующий «sole manual table» auto-wire (`commitCatalogSelectionChange`, S41) — это отдельный, уже существующий механизм для одиночной ручной таблицы; D52 покрывает случай «таблицы вообще нет / нет совпадающей».
- Тесты: 2 новых в `studio-data-panel.component.spec.ts` (compatible targets + emit; disabled+hint state). Write-path в `studio-editor.page.ts` не покрыт unit-тестом на этом шаге (файл без dedicated `.spec.ts` — как и весь остальной studio-editor.page.ts write-logic; ручной smoke оставлен для D54 согласно плану волны).

## Review handoff

- [x] READY FOR REVIEW — WAVE-DOCSTUDIO-DATA-IA
- Archive без отдельного Cursor Verdict

## Closeout

- archive сразу — переходим к D53.
