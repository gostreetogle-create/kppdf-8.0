# TZ-DOC-310 — Диалог создания: закрытие по одному клику + видимая валидация

> Checklist (конвенция GEMINI.md / AI-AGENT-GUIDE). Создан до финализации, обновлён по результатам.

## Scope

Только закрытие/валидация `TemplateSetupDialogComponent` и передача `parentDestroyRef`:

- `frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts` — видимая валидация + disabled-кнопка.
- `frontend/src/app/pages/doc-constructor/builder/builder.page.ts` — `parentDestroyRef` в open() (onCreateTemplate, onDuplicateTemplate).
- `frontend/src/app/pages/doc-constructor/templates/templates.page.ts` — `parentDestroyRef` в open() (onCreate, onDuplicate).
- Спеки: template-setup-dialog.component.spec.ts, builder.page.spec.ts, templates.page.spec.ts.

## Dependencies

- TZ-DOC-309 (кэш категорий в сервисе) — завершён, диалог открывается мгновенно.
- TZ-DOC-268 (submit-guard `submitted`) — сохранён, не переделывался.
- TZ-DOC-311 (pageNumbering) — не затрагивался.

## Conflict keys

- `frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts`
- `frontend/src/app/pages/doc-constructor/builder/builder.page.ts`
- `frontend/src/app/pages/doc-constructor/templates/templates.page.ts`
- `frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts`
- `frontend/src/app/pages/doc-constructor/templates/templates.page.spec.ts`

## Protected paths

- НЕ менять backend/API контракты.
- НЕ менять `pi-dialog.service.ts` (TZ-103.3 RAF-guard работает, дефекта overlay не доказано — parentDestroyRef уже поддерживается сервисом).
- НЕ менять `on-dialog-close-once.ts` (lifecycle-бага не доказано).
- НЕ трогать TZ-DOC-309/311 архивы, Materials/ProductModule, Admin/RBAC (TZ-278), Z-series, чужие незакоммиченные правки.

## Реализация

1. **Диалог** (`template-setup-dialog.component.ts`):
   - `confirmAttempted` signal — клик «Создать» без категории больше НЕ проглатывается молча: показывается «Выберите категорию» в любом состоянии (loading/error/empty/ready-без-выбора).
   - `canConfirm()` — кнопка disabled, пока категории грузятся / ошибка / пусто / категория не выбрана / уже submitted.
   - `onConfirm()` — без категории: `confirmAttempted=true`, диалог не закрывается, создание не запускается; с категорией: один `ref.close(result)` (guard TZ-DOC-268 сохранён).
   - `onCategoryChange()` сбрасывает `confirmAttempted` — hint исчезает после выбора.
   - Удалён `hasCategoryError()` (заменён на явный `confirmAttempted() && !categoryId()` в template).

2. **parentDestroyRef** в `dialog.open(TemplateSetupDialogComponent)` — 4 точки:
   - builder: `onCreateTemplate`, `onDuplicateTemplate`.
   - templates: `onCreate`, `onDuplicate`.
   - Гарантирует уничтожение CDK overlay при навигации (overlay не «зависает» в DOM).

## Tests

- **Dialog spec** (+5): confirm без категории не закрывает + hint видим; выбор категории после failed-попытки сбрасывает hint и закрывает ровно один раз; disabled при loading / error / empty.
- **builder.page.spec** (+2): `onCreateTemplate`/`onDuplicateTemplate` передают `parentDestroyRef` в `dialog.open`.
- **templates.page.spec** (+2): `onCreate`/`onDuplicate` передают `parentDestroyRef`.
- Итог targeted: **49/49 PASS** (3 suites, runInBand).

## Commands

```bash
cd frontend && pnpm exec jest --no-coverage --runInBand \
  src/app/pages/doc-constructor/builder/template-setup-dialog.component.spec.ts \
  src/app/pages/doc-constructor/builder/builder.page.spec.ts \
  src/app/pages/doc-constructor/templates/templates.page.spec.ts
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec ng build --configuration=development
git diff --check
bash OrchestratorKit/verify-status.sh
```

## Acceptance criteria

1. Один клик «Создать» (категория выбрана) закрывает диалог и не требует второго нажатия. ✅ (guard + canConfirm + close один раз)
2. Клик без категории показывает «Выберите категорию» и НЕ запускает создание. ✅
3. Ровно один POST на подтверждение; двойной клик без дубликата. ✅ (TZ-DOC-268 take(1) + submitted guard, регрессия зелёная)
4. Cancel/Escape/backdrop закрывают без POST. ✅ (регрессия)
5. При навигации overlay уничтожается (parentDestroyRef). ✅ (4 точки)
6. FE typecheck, targeted Jest, git diff --check. ✅

## Known limitations

- `MANUAL_BROWSER_CHECK_REQUIRED` — live authenticated browser flow не запускался; контракт доказан unit/интеграционными тестами (включая TestBed template-компиляцию → ловит NG5xxx).
