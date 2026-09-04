# TZ-NX-DOCSTUDIO-S42-MONGOOSE-PLAIN-SPREAD checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S42-MONGOOSE-PLAIN-SPREAD.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-04T20:58:47Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] `git status` → main; только чужой `TZ-NX-GANTT-G3-TREE-CASCADE.md` в `_active/` (Freebuff, frontend-nx) — не пересекается
- [x] TZ / эталон прочитаны: `TZ-NX-DOCSTUDIO-S42-MONGOOSE-PLAIN-SPREAD.md`, `studio-table-tokens.ts` (S37C), `injectTableContent`
- [x] Claim slot заполнен

## Сделано

### Audit (`docs/audits/2026-09-05-mongoose-plain-spread-audit.md`)

Полный grep + ручная проверка каждого `{...var}` в `studio-document/**` и
`document-render/**` (кроме `.spec.ts`) + `Object.assign(` (ноль хитов). Каждый
хит классифицирован: DTO/массив/уже-дереференснутый Mixed-field (safe) vs.
живой top-level Mongoose Document instance (риск). Найден **один** новый
подтверждённый случай: `cloneBlock` (`studio-multipage.utils.ts:82`), вызывается
при overflow таблицы на multipage. Всё остальное — safe (таблица в audit md с
файл:строка · риск · verdict по каждому хиту).

### Фикс

`cloneBlock` теперь `.toObject()` блок перед spread — тот же паттерн, что уже в
`injectTableContent`/`applyTableAggregateTokensToBlocks` (S37C). Не тронул уже
корректные файлы (не «заодно рефакторинг»), как требовала TZ.

### Regression-тесты (`studio-multipage.utils.spec.ts`)

`FakeMongooseTableBlock` — фикстура с полями как getter на прототипе (не own
property) + `toObject()`, `constructor.name === 'model'` — воспроизводит именно
тот класс Mongoose-объекта, что реально возвращает `findAllByStudioDocument`.
Два теста: (1) fixture sanity — доказывает, что сам фикстур ловит баг; (2) гоняет
`planStudioMultipage` с 30-строчным overflow, проверяет что `isActive`/`settings`/
`layout.page` сохранились на continuation-блоке. **Верифицировано на старом коде**
(`git stash` фикса → прогон → упал именно так, как ожидалось, continuation-блок
содержал `_isActive`/`_settings`/`_layout` вместо публичных полей → `git stash pop`).

### Живой sanity (multipage тронут → обязателен по TZ п.6)

Headless Chromium, dev-login через `fill-demo-button`, документ создан через
реальное приложение, таблица + 30 ручных строк добавлены через реальный
authenticated API (тот же `x-access-token`, что использует сам фронт), Preview
запрошен. Результат: **3** `doc-page` секции, «Позиция 1» и «Позиция 21» обе
присутствуют в HTML (не пустой stage), `html.length = 7615` (было бы ~3655 для
пустого случая как в S37).

## Integrity slot

- [x] Тип изменения: backend bugfix, без нового route/permission/module — FIC N/A
- [x] page.md / PAGE-TZ-INDEX / SECTION-READINESS / Coupling map — N/A (внутренний рендер-пайплайн)
- [x] Чужой WIP не в коммите (Freebuff Gantt на `frontend-nx` не тронут)

## Gates (факт)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
→ PASS, exit 0

cd backend && pnpm test
→ PASS, 126 suites / 1165 tests (incl. 2 new regression tests)

cd backend && pnpm lint
→ PASS, 0 errors (197 pre-existing warnings, none in touched files)

Regression test verified fail-on-old-code / pass-on-new-code (git stash method).
Live multipage Preview sanity: PASS (3 pages, non-empty content on later pages).
```

## Executor report

- Один новый подтверждённый случай бага (класс S37C) найден и исправлен:
  `cloneBlock` в `studio-multipage.utils.ts`. Все остальные spread-паттерны в
  scoped-модулях — DTO/массивы/уже-plain Mixed-fields, задокументированы safe
  в audit md с обоснованием по каждому.
- Ничего не тронуто вне scope (`frontend-nx`/Gantt/схема/поведение токенов).

## Review handoff

- [x] Готово к архивации
