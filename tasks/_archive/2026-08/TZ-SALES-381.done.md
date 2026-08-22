# TZ-SALES-381: Вместимость страницы КП — перенос длинного текста

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude
sha: 4ee24fec

## Outcome

`splitPreviewLines` теперь учитывает conservative wrap capacity для preview line:
- базовый вес строки: 1;
- `extraWrap = max(0, ceil((productName + description).length / 36) - 1)`;
- дополнительный вес ограничен максимумом 3;
- автоматические и ручные `rowsFirstPage`/`rowsNextPage` используют единый вес строки.

Добавлены focused continuation tests: 8 коротких строк остаются на одной странице, 8 длинных строк переходят на несколько страниц; header-drop regression сохранён.

## Verification

- acceptance criteria: PASS
- backend typecheck: PASS (`pnpm exec tsc -p tsconfig.build.json --noEmit`)
- focused Jest: PASS (3/3, `document-template.continuation.spec`)
- backend lint: N/A (TZ gates ограничены tsc + focused Jest)
- browser/UI: N/A (backend-only scope)
- checklist: ADDED
- page docs: N/A (no UI change required)
- status synchronization: PASS (`docs/agent-checklists/_NOW.md`, SHA `4ee24fec`)
- review diff: PASS
- deploy: NOT RUN

## Executor report

Чужой dirty WIP в checkout не включался. Изменены только `document-template.service.ts` и continuation spec; FE, renderer, deploy и `.github/` не трогались.

known_limitation: точный браузерный wrap не вычисляется; используется conservative 36-character capacity.
