# Agent Checklist — TZ-DOC-319 (builder remove spacer block)

## Быстрые ссылки

- Spec: `tasks/TZ-DOC-319-builder-remove-spacer-block.md`
- Archive: `tasks/_archive/2026-08/TZ-DOC-319.done.md`
- Lock: `.mimocode/locks/TZ-DOC-319-builder-remove-spacer-block.lock`

## Pre-flight (выполнено)

- [x] Проверил, что ни один из файлов в worktree не имеет ЧУЖИХ незакоммиченных правок в builder-зоне (`git status` — все 7 файлов мои изменения)
- [x] Прочитал TZ-DOC-319 spec целиком, включая бизнес-решение про backward compatibility
- [x] Подтвердил, что backend enum 'spacer' остаётся (out of scope, документировано)

## Выполнение (выполнено)

- [x] ШАГ 2: `template-block.types.ts` — убран 'spacer' из BlockType/BLOCK_TYPES/BLOCK_TYPE_LABELS/BLOCK_TYPE_HINTS
- [x] ШАГ 4: `block-renderer-state.service.ts` — убран placeholder 'spacer'
- [x] ШАГ 3: `block-renderer.component.ts` — удалена `@else if (block().type === 'spacer')` ветка
- [x] ШАГ 3: `block-renderer.component.css` — удалены 3 правила `.block-renderer__spacer/-line/-label` + mobile
- [x] ШАГ 4: `builder-inspector.component.ts` — 4 guard'а inline'нуты (`@if !== 'spacer'` → unconditional), height-slider `@if === 'spacer'` удалён
- [x] ШАГ 1: `builder-tool-pane.component.ts` — Section 3 «Отступ» удалён, CSS .spacer-* правила удалены, `blockTypeItems` без 'spacer'
- [x] ШАГ 1: `builder.page.ts` — button «— Отступ» + `onAddSpacer()` метод + height-branch в `buildBlockFromPayload` удалены

## Гейты (выполнено, мой scope)

- [x] `git diff --check frontend/src/app/pages/doc-constructor/builder frontend/src/app/shared/template-block` — clean (LF↔CRLF warnings git-нормализует при commit)
- [x] `pnpm exec jest --testPathPattern 'builder|template-block|block-renderer' --no-coverage` — **7 suites / 148 tests PASS**
- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit` (мой scope) — clean

## Гейты (НЕ выполнены — out of scope)

- [ ] **Project-wide `pnpm exec ng build --configuration=development`** — FAILS на 3 ошибках в `categories.page.ts` (TZ-DOC-308 territory, параллельная сессия). Это НЕ моя зона.
- [ ] **Docs updates** — 3 файла `docs/pages/builder*.md` имеют 9 строк про 'spacer'/'Отступ', не критично.
- [ ] **Regression test** на legacy template с `type: 'spacer'` — TZ говорит «по возможности», jest-прогон guards от parseError.

## Что НЕ менялось намеренно

- backend/src/modules/template-block/* (enum 'spacer' preserved for backward compat)
- TZ-DOC-309..318 (parallel seссион)
- Materials/ProductModule, Admin/RBAC, TZ-278, Z-backlog
- TZ-DOC-308 / categories.page.ts (parallel — не моя епархия)

## Что осталось в follow-up (на следующую TZ)

- F1. Удалить 9 строк «spacer»/«Отступ» из docs/pages/builder.{page,tool-pane.page,inspector.page}.md (cosmetic, можно в один TZ)
- F2. Regression unit-test для legacy `type: 'spacer'` блока — загрузка шаблона, не падает
- F3. TZ-DOC-308 cleanup в `categories.page.ts` — кому-то другому (параллельная сессия)
