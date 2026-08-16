# TZD-51 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZD-51.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (после gates/review)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff (deepseek-v4-pro)
- claimed_at: 2026-08-16T18:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room runner in this chat)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0` (main)
- [x] `tasks/_archive/2026-08/TZD-50.done.md` есть; `tasks/_active/` пуст от TZD-50
- [x] `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `desktop/src/App.svelte` / conflict keys
- [x] Прочитал AI-AGENT-GUIDE §1.3a, TZD-51 spec, WAVE-DESKTOP-EXCEL-FORMS.md
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-51.md` на месте

## Acceptance (из TZ)

- [x] Form Studio категория `references` «Справочники» → 4 таблицы (warehouse/workType/colorReference/category) с RU-колонками
- [x] Скачивание формы `_kppdf` переиспользует TZD-50 generator (round-trip warehouse/category в тестах)
- [x] Валидация строк: enum type, hex `#RRGGBB`, hourlyRate ≥0, skuPrefix `/^[A-Z0-9-]+$/`, slug `/^[a-z0-9-]+$/`
- [x] Dedupe до POST (warehouse/workType по name; colorReference name/slug; category type+slug | skuPrefix) → `duplicate` в отчёте, не пишется
- [x] Write path: POST `/api/warehouses|work-types|color-references|categories` + Policy A confirm; org для color с сервера
- [x] UX hint: «Slug и префикс SKU лучше латиницей; префикс — заглавными»; «Ставка 0 = явно бесплатно»
- [x] V1 таблицы TZD-50 не сломаны (прежние тесты зелёные)
- [x] Tests: allowlist V2 + identity mapping + round-trip warehouse/category + bad hex / bad skuPrefix → invalid
- [x] Gates desktop tsc + svelte-check + tsx --test PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: desktop core/UI (Layer 3)
- [x] FIC §A–E — N/A (не новая страница/право/модуль Nest; desktop-only)
- [x] page.md / PAGE-TZ-INDEX — N/A (нет UI route в Angular)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] COUPLING-MAP — N/A (не трогаю общее поле/статус)
- [x] Deploy/wipe/seed — запрещены, не выполнялись; Google/заказы/КП/TZD-49/start.mjs не тронуты

## Gates (факт)

- `cd desktop && npx tsc --noEmit` → **PASS** (0 ошибок)
- `cd desktop && npx svelte-check --threshold error` → **PASS** (0 errors, 0 warnings)
- `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → **PASS 64/64** (+8 новых)
  - (TZ пишет `pnpm test` — в desktop нет такого script; канон TZD-50 — `npx tsx --test`.)

## Executor report

- `import-targets.ts`: `ImportTargetKey` + 4 справочника (`warehouse`/`workType`/`colorReference`/`category`), `REFERENCE_TARGET_KEYS` + `isReferenceTargetKey`; таблицы с RU-колонками/алиасами; порядок UI дополнен.
- `excel-form-template.ts`: категория `references` + 4 `FORM_TEMPLATES` с RU-hints («пишется сразу после подтверждения», slug/SKU-латиница, ставка 0).
- `multi-import.ts`: `referenceDedupeKeysOf` (normalized name/slug/type+slug/skuPrefix) + `validateReferenceRows` (enum/hex/skuPrefix/slug/hourlyRate; catalog-hit → `duplicate`, не пишется).
- `App.svelte`: `createEntities` 4 ветки POST; `fetchDedupeKeys` — 4 list endpoints через `referenceDedupeKeysOf`; confirm-текст «справочники пишутся сразу».
- Known limits: TZD-49 journal unify — PARK, не тронут; parentId дерево категорий — не строится; справочники создают новые записи (нет PATCH/обновления).

## Review handoff

- [x] READY FOR REVIEW
- [x] **Не** archive до Cursor/PO PASS (по TZ HANDOFF)

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
