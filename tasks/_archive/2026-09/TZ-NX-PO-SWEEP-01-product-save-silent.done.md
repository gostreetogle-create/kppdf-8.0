# TZ-NX-PO-SWEEP-01: product form — Save молчит при invalid

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web includes AOT type check)
  - tests: PASS (116 suites / 810 tests, 0 failed)
  - lint: N/A (не запускал отдельно; build/AOT прошёл, диапазон правки узкий)
  - checklist: ADDED (`docs/agent-checklists/TZ-NX-PO-SWEEP-01-product-save-silent.md`)
  - progress.md: N/A (ops/UX sweep wave, progress не ведётся построчно per-TZ в этой волне)
  - status synchronization: PASS (PO-SWEEP-CONTINUOUS-CHECKLIST, WAVE обновлены)

## Root cause

`onSubmit()` на `form.invalid` делал только `markAllAsTouched(); return;` — без
toast/inline feedback/focus. Оператор видел «мёртвую» кнопку Save (жаловался на
скрине: фото добавлено, dirty есть, Save — тишина; на деле пустые required
Единица/Категория).

## Fix

`product-form-dialog.component.ts`:
- `onSubmit()` invalid-ветка: `errorMessage.set(buildInvalidMessage())` (список
  пустых обязательных: Артикул/Тип/Единица/Категория) + `focusFirstInvalidField()`.
- Переиспользован уже существующий `errorMessage` signal + `role="alert"` блок
  (раньше только для server-ошибок).
- `app-pi-form-field [error]="fieldError(key)"` на 4 обязательных полях —
  hint «Обязательное поле» после touched, в зарезервированной строке (no layout shift).
- `focusFirstInvalidField()`: `app-pi-input` кладёт `id` на host-тег, не на
  внутренний `<input>` — ищет `input, select, textarea` внутри host при
  необходимости; нативные `<select>` (unit/kind/category) фокусятся напрямую.

## Backlog (не в scope)

Тот же silent-invalid паттерн — `category-form-dialog`, `material-form-dialog`,
`module-form-dialog`, `unit-form-dialog`, `work-type-form-dialog`,
`worker-form-dialog`, `simple-registry-form-dialog`. Записано в
`docs/agent-checklists/WAVE-NX-PO-SWEEP-2026-09-12.md` §Backlog — не трогал по
прямой инструкции TZ («не scope creep»).

## Gates

| Gate | Result |
|------|--------|
| `nx test kppdf-web` (product-form-dialog + full suite) | PASS 810/810 (7 skipped) |
| `nx build kppdf-web` | PASS |

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.spec.ts`
- `docs/agent-checklists/TZ-NX-PO-SWEEP-01-product-save-silent.md` (checklist, new)
- `docs/agent-checklists/WAVE-NX-PO-SWEEP-2026-09-12.md` (backlog note)
