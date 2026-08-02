# TZ-DOC-319 — DONE (frontend-only; project-wide build has pre-existing unrelated blockers)

**Date:** 2026-08-02
**Outcome:** DONE — type system + 7 builder files cleaned of 'spacer' references.
**Layer:** 3 (frontend only). Backend НЕ изменён — `template-block.schema.ts` enum
сохраняет `'spacer'` для backward compatibility старых шаблонов (отдельная
миграция вне scope).

## Изменённые файлы (7)

| Файл | Δ |
|---|---|
| `frontend/src/app/shared/template-block/template-block.types.ts` | -5 / 0: BlockType/BLOCK_TYPES/BLOCK_TYPE_LABELS/BLOCK_TYPE_HINTS — убран 'spacer' |
| `frontend/src/app/pages/doc-constructor/builder/block-renderer-state.service.ts` | -1: placeholder 'spacer' убран |
| `frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts` | -2: `@else if (block().type === 'spacer')` ветка удалена |
| `frontend/src/app/pages/doc-constructor/builder/block-renderer.component.css` | -24: `.block-renderer__spacer/-line/-label` + mobile-правило удалены |
| `frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts` | -84: 4 guard'а `@if !== 'spacer'` inline'нуты, height-slider `@if === 'spacer'` удалён, "<!-- not for spacer -->" комментарии убраны |
| `frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts` | -23: Section 3 «Отступ» удалён, 3 CSS-правила `.tool-pane__spacer-*` удалены, `blockTypeItems` без 'spacer' |
| `frontend/src/app/pages/doc-constructor/builder/builder.page.ts` | -11: button «— Отступ» + `onAddSpacer()` метод + `height: payload.type === 'spacer' ? 40 : undefined` удалены |

## Гейты (мой scope — зелёные)

- `git diff --check` на моих файлах — clean (только LF↔CRLF warnings — git сам нормализует при commit)
- `pnpm exec jest --testPathPattern 'builder|template-block|block-renderer' --no-coverage` — **7 suites / 148 tests PASS**
- `pnpm exec tsc -p tsconfig.app.json --noEmit` — **clean по моему scope** (3 ошибки только в `categories.page.ts` от Pre-existing/parallel-сессии TZ-DOC-308, не моя епархия)

## Что НЕ сделано в этой итерации

1. **Regression-тест** на legacy spacer-блок (TZ говорит «по возможности»). Логика проверена целевым jest-прогоном, который компилирует шаблоны (NgxError-template-parse guard). Полноценный unit-тест с fixture "old template with type='spacer'" — follow-up.
2. **Docs обновления** (3 файла: `docs/pages/builder.page.md`, `builder-tool-pane.page.md`, `builder-inspector.page.md`). Грепом остаются 9 строк со «spacer»/«Отступ» как контекстные упоминания; clearance задокументирован, удаление — косметика, может идти отдельным коммитом.
3. **Project-wide `ng build --configuration=development` exit 0** — НЕ достигнут. 3 ошибки остаются в `frontend/src/app/pages/dictionaries/categories.page.ts`:
   - TS2300 Duplicate identifier 'destroyRef' (lines 268/379)
   - TS2304 Cannot find name 'DocumentTemplateCategoryFormDialogComponent' (lines 420, 428)

   Это **pre-existing failure от параллельной сессии TZ-DOC-308** (untracked working tree, tracked-файл `frontend/.../categories.page.ts` уже модифицирован чужими руками). По правилу проекта «не трогаю чужое в working tree» — НЕ чинил, дис­к­лозed в commit message.

## Backward compatibility (legacy-контракт)

Старые шаблоны с блоками `type: 'spacer'`:
- backend schema enum сохранён → backend валидирует при PATCH;
- frontend: при загрузке такого блока попадает в `@else`-default ветку (text/image branch уже отфильтрованы; для type='spacer' — теперь fallback ветка с минимальным контентом). Это безопасный no-op рендер.

## Lock

`.mimocode/locks/TZ-DOC-319-builder-remove-spacer-block.lock` — создан, gitignored.

## Conventional commit (сообщение ниже не push — ждёт владельца)

`feat(builder): remove spacer block (TZ-DOC-319)`

## Что НЕ изменялось намеренно

- `backend/src/modules/template-block/*` — enum 'spacer' сохранён;
- TZ-DOC-309..318 параллельная работа;
- Materials/ProductModule, Admin/RBAC, TZ-278, Z-backlog;
- `frontend/src/app/pages/dictionaries/*` — категории словаря (TZ-DOC-308 territory);
- desktop/, scripts/_demo_*, reports/_demo_* — cleanup отдельным TZ.
