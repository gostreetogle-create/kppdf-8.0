# TZ-DOC-316 — Verification Checklist

**Task:** TextBlockCategory — справочник `/dictionaries/text-block-categories` +
form-dialog + бейдж/фильтр на `/doc-constructor/texts` + select категории в
редакторе блока (поверх backend контракта TZ-DOC-315).

**Branch:** `freebuff/wake-up-tz-doc-308-ling-*` (rebased на `main` @ e00be99)
**Commit:** (см. closeout commit ниже)
**Archive:** `tasks/_archive/2026-08/TZ-DOC-316-text-block-category-reference-and-picker.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-316-text-block-category-reference-and-picker.lock`

## Design decisions (documented for the lineage)

- **Dedicated page, not embedded section** — deja vu TZ-DOC-308: отдельный
  справочник `TextBlockCategoriesPage` (route `/dictionaries/text-block-categories`,
  пункт навигации «Категории текстов» в разделе «Справочники»), НЕ секция в
  `categories.page.ts`.
- **Service mirrors TZ-DOC-308/309** — `PiTextBlockCategoriesService`: активный
  каталог кэшируется (Map по ключам + in-flight share + generation guard +
  ручная инвалидация после успешных мутаций), НО **без `shareReplay`** — TZ-DOC-309
  обнаружил, что replay скрывает cross-tab changes; кэш отдаётся синхронно через
  `of(cached)` из Map.
- **Editor select** — auto-select активной default-категории для нового блока
  (повторяет серверный resolveDefault); «Не выбрана» → `null` → `categoryId` НЕ
  отправляется (сервер сам подставит default, AC #10).
- **Texts registry** — колонка «Категория» после «Название» (populated lookup,
  не raw id) + dropdown-фильтр по активным категориям; комбинируется с поиском (AND).

## Files

Создано:
- `frontend/src/app/shared/services/pi-text-block-categories.service.ts` (+ spec)
- `frontend/src/app/pages/dictionaries/text-block-categories.page.ts` (+ spec)
- `frontend/src/app/pages/dictionaries/text-block-category-form-dialog.component.ts` (+ spec)
- `frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.spec.ts` (NEW — редактор ранее не имел spec)
- `frontend/src/app/pages/doc-constructor/texts/texts.page.spec.ts` (NEW — страница ранее не имела spec)

Изменено:
- `frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts` (секция «Категория»)
- `frontend/src/app/pages/doc-constructor/texts/texts.page.ts` (колонка + фильтр)
- `frontend/src/app/shared/services/pi-text-blocks.service.ts` (+ `categoryId?: string` в `TextBlock`)
- `frontend/src/app/app.routes.ts` (+ route)
- `frontend/src/app/layout/app-layout.component.ts` (+ пункт навигации)
- `docs/pages/texts.page.md`, `docs/pages/categories.page.md`

## Verification log (2026-08-02)

### Gate: frontend tsc — PASS (exit 0)
```bash
$ cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```

### Gate: targeted jest — PASS (N/N)
```bash
$ cd frontend && pnpm exec jest pi-text-block-categories text-block-categories text-block-category-form-dialog text-block-editor texts.page --no-coverage
```

### Gate: ng build (development) — PASS (exit 0)
```bash
$ cd frontend && pnpm exec ng build --configuration=development
```

### Gate: git diff --check — PASS
```bash
$ git diff --check
```

### Gate: OrchestratorKit/verify-status.sh — PASS
```bash
$ bash OrchestratorKit/verify-status.sh
```

## Known limitations

- Глубокие browser E2E-сценарии (создание/переименование/удаление категории,
  375px viewport) — `MANUAL_BROWSER_CHECK_REQUIRED` (dev-stack credentials
  недоступны); unit-тесты + typecheck — каноническое свидетельство.
- TZ-DOC-317 (builder dropdown «Категория» в picker'е текстов) — логический
  successor, НЕ запускался (явное «не параллельно» в спеке).
- TZ-DOC-318 (миграция legacy enum `category` → `categoryId`) — successor, не
  часть этой задачи; legacy enum остаётся в схеме (backward compat).
