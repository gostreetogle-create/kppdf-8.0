# SYSTEM-REFAC-REPORT

Дата: 2026-08-26  
Задача: `TZ-SYSTEM-REFAC`

## Чек-лист результата

- [x] Создана папка `docs/_archive_legacy/`.
- [x] В архив перемещены исторические журналы и handoff-файлы: `PO-DIARY.md`, `progress.md`, `STATUS.md`, старый architecture/data-model/backend аудит и 19 исторических аудитов.
- [x] Оригиналы архивных документов сохранены без переписывания; добавлен `docs/_archive_legacy/README.md`.
- [x] На часто используемых старых путях оставлены redirect-файлы, чтобы не ломать ссылки и не возвращать большие журналы в оперативный контекст.
- [x] Создан `.cursorignore` с исключением `docs/_archive_legacy/`.
- [x] В `CLAUDE.md` и `.cursorrules` зафиксировано обязательное правило: при любой правке UI сверяться с `docs/ui-rules.md` (Stop-rules) и использовать только токены из `frontend/src/styles.css`.
- [x] В `CLAUDE.md`, `.cursorrules` и `docs/ui-rules.md` зафиксирован приоритет: `ui-rules.md` → `frontend/src/styles.css` → `ui-density-canon.md` → `paper-and-ink.md` → `design-spec.md`.
- [x] Team Room синхронизирован командой `pnpm team-room join`; агент зарегистрирован.

## Machine-enforced UI

- [x] Добавлено ESLint-правило `frontend/eslint/rules/no-raw-ui-values.cjs`.
- [x] Правило подключено в `frontend/eslint.config.js` на `*.component.ts` и `*.page.ts` с severity `error`.
- [x] Правило проверяет inline Angular `styles` и `styles: [...]` на raw `padding`/`margin` с `px` и hex-цвета в `color`, `background`, border color, outline color, `fill`, `stroke`.
- [x] Добавлен Jest-тест `frontend/eslint/rules/no-raw-ui-values.spec.cjs`.
- [x] Добавлен dependency-free checker `frontend/scripts/check-ui-tokens.mjs` для внешних `*.component.css|scss` и `*.page.css|scss`.
- [x] `frontend/package.json` теперь запускает checker в `pnpm lint` через `lint:ui-tokens`.

## Ограничения и ручные действия

- [ ] Полный `frontend` lint намеренно блокирует существующий legacy-долг: `pnpm exec eslint src/` завершился с 246 errors и 17 warnings от raw UI-значений/старых правил; `pnpm run lint:ui-tokens` сообщает 36 нарушений во внешних component/page CSS. Product-файлы не переписывались: среди них есть чужой WIP и активная волна 443.
  - После миграции выполните: `cd frontend && pnpm lint`
  - Для списка нарушений: `cd frontend && pnpm run lint:ui-tokens`
- [ ] В `desktop/` UI написан на Svelte и содержит собственные inline hex/spacing стили. Запрошенное правило добавлено только в существующий Angular ESLint-контур `frontend`; отдельный Svelte linter/Stylelint в проекте не установлен.
  - Если нужен такой же enforcement для Desktop, вручную выполните: `cd desktop && pnpm add -D stylelint stylelint-config-standard` и затем добавьте конфигурацию/скрипт под Svelte `<style>` блоки.
- [x] Team Room первоначальная команда `pnpm team-room claim TZ-SYSTEM-REFAC` завершилась `Unknown task: TZ-SYSTEM-REFAC; sync tasks first`; после `pnpm team-room join` синхронизация прошла успешно, агент зарегистрирован. Повторный claim не выполнялся: claim slot checklist уже был заполнен до первой правки.
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` проходит.
- [x] Focused rule tests проходят: `cd frontend && pnpm exec jest --runTestsByPath eslint/rules/no-raw-ui-values.spec.cjs --runInBand` — 4/4.
- [ ] Полный `frontend` test gate: `cd frontend && pnpm test --runInBand` — 187 suites passed, 6 failed; 2038 tests passed, 13 failed. Падения относятся к существующим proposal workspace/orders/categories тестам и не вызваны tooling-only изменением.
- [ ] `pnpm architecture:check` падает на двух независимых существующих cross-page импортах: `materials/material-form-dialog.component.ts` и `products/product-form-dialog.component.ts`.
- [ ] Полный lint остаётся красным по legacy-долгу: `pnpm exec eslint src/` — 238 errors и 17 warnings; `pnpm run lint:ui-tokens` — 36 нарушений. Это ожидаемый enforcement, а не скрытая ошибка конфигурации.

## Изменённые собственные пути

`CLAUDE.md`, `.cursorrules`, `.cursorignore`, `docs/ui-rules.md`, `docs/_archive_legacy/**`, redirect-файлы `docs/PO-DIARY.md`, `progress.md`, `STATUS.md`, `docs/{architecture-audit-2026-07,data-model-audit,backend-agent-checklist,SESSION-2026-08-02-DEPLOY}.md`, `frontend/eslint.config.js`, `frontend/eslint/rules/no-raw-ui-values.{cjs,spec.cjs}`, `frontend/scripts/check-ui-tokens.mjs`, `frontend/package.json`, `tasks/_park/catalog/README.md`, `docs/audits/2026-08-08-docs-hygiene-parallel.md`.

Чужие исходные изменения из стартового `git status` не включались и не переписывались.
