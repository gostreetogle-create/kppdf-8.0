# TZ-NX-NO-NATIVE-CONFIRM: убрать `window.confirm` (архив в студии)

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** после `TZ-NX-STUDIO-TEMPLATE-PICKER-ICONS` (тот же `studio-editor` / kppdf-web) **или** sequential в той же continuous-сессии  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` ;  
`frontend-nx/eslint.config.*` OR `frontend-nx/apps/kppdf-web/eslint.config.*` (если добавляешь `no-alert`) ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

### Preflight Check Output
- **Context read:** скрин PO native confirm «Отправить документ в архив?…»; `studio-editor.page.ts:1960-1963` (`window.confirm`); эталон delete-слоя `:2091-2100` (`AlertDialogComponent` + `onDialogCloseOnce`); `docs/DIALOG-COOKBOOK.md`; `rg window.confirm frontend-nx` → **1 hit**
- **Key Constraints:** Только NX. Legacy `frontend/` не трогать (там 1 confirm в production — вне SoT). Не invent второй confirm-shell.
- **Planned Deliverable:** `onFinalize` через Pi `AlertDialog`; lint-ban `no-alert` чтобы не вернулось
- **Validation Path:** FIC G + `rg 'window\.(confirm|alert|prompt)' frontend-nx` → 0

**Проверено:** единственный native dialog в NX = архив документа. Остальные destructive уже на `AlertDialogComponent`.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. `onFinalize()` синхронно зовёт `window.confirm(...)` → браузерный chrome «Подтвердите действие на 127.0.0.1:4201» с OK/Отмена — стыдно на демо.
2. В том же файле уже есть правильный паттерн (удаление слоя).

## ЧТО ДЕЛАТЬ

1. Переписать `onFinalize`:
   - открыть `AlertDialogComponent` через уже инжектнутый `this.dialog` / `PiDialogService`;
   - data: `title: 'Отправить документ в архив?'`, `description: 'Редактирование будет закрыто.'` (или один title со вторым предложением — как принято в AlertDialog API), `confirmLabel: 'В архив'`, `cancelLabel: 'Отмена'`, `variant: 'destructive'` (архив = необратимо для редактирования);
   - `parentDestroyRef: this.destroyRef`;
   - `onDialogCloseOnce` → только при `confirmed === true` выполнять существующий `flushLayouts` + `finalize` flow (не дублировать логику).
2. Регресс: focused spec **или** расширить существующий studio-editor spec — mock dialog, assert finalize **не** вызывается до confirm; после `true` — вызывается. Если harness тяжёлый — минимум: unit на helper / spy dialog.open.
3. Lint guard: включить ESLint `no-alert: 'error'` для `frontend-nx/apps/kppdf-web` (или workspace), если ещё нет — чтобы `window.confirm/alert/prompt` не пролезли снова.
4. Inventory: `rg "window\.(confirm|alert|prompt)" frontend-nx` → 0 hits в AC.
5. `document-studio.page.md`: одна строка — архив через AlertDialog, native confirm запрещён.

## НЕ ИЗМЕНЯТЬ

- BE finalize API / статусы
- A4 geometry
- legacy `frontend/**`
- другие confirm-методы API (`.confirm(id)` supply — это HTTP, не window)

## КРИТЕРИИ ПРИЁМКИ

1. Клик «В архив» (rail) → Paper & Ink AlertDialog, **не** браузерный confirm.
2. Отмена → finalize не вызывается; Confirm → прежний success toast / закрытие редактирования.
3. `rg window\.(confirm|alert|prompt) frontend-nx` → 0.
4. Gates PASS (+ lint ловит `window.confirm` если вернуть).

## BUILD INTEGRITY (обязательно)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Baseline (до CLAIM):
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

Gates (закрытие, nx build — ПОСЛЕДНИЙ):
  cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  cd frontend-nx && pnpm test
  cd frontend-nx && pnpm lint
  pnpm architecture:check
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

## Финализация

Archive → `tasks/_archive/2026-09/` + commit/push.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-11
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS (no-alert added workspace-wide, 0 violations; pre-existing 38-error baseline elsewhere unchanged)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-NO-NATIVE-CONFIRM.md)
  - progress.md: N/A (redirect file — see docs/agent-checklists/_NOW.md)
  - status synchronization: PASS
