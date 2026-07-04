## [2026-07-04] — Завершено: TZ-30 (CRUD actions + per-page FormSchema)
**Исполнитель:** Frontend Developer (Buffy)
**Статус:** Выполнено (с 1 итерацией TS-фикса: TS4111 noPropertyAccessFromIndexSignature — dot-notation на Record<string,unknown> заменён на bracket-notation)
**Что сделано (~4 файла):**
- **form-dialog.component.ts**: расширен `FormFieldSpec` (добавлен type `'relation'`), добавлены `@case ('relation')` и `@case ('date')` в template, добавлен form submit handler.
- **pages.config.ts**: добавлен интерфейс `PageFieldSpec extends FormFieldSpec` (+ endpoint/labelKey/valueKey), поле `fields?: PageFieldSpec[]` в `PageConfig`. Заполнены fields[] для 5 страниц: counterparty (11 полей), organization (13), person (8), product (8), material (6). С enum-константами для party-type/legal-form/legal-type/counterparty-type.
- **row-actions.component.ts (NEW)**: AG Grid cell renderer с кнопками ✎/🗑. Standalone Angular component, implements ICellRendererAngularComp, agInit принимает callbacks.
- **crud-page.component.ts**: 
  - `onCreate()` → async load relation options → FormDialog → POST
  - `onEdit(row)` → FormDialog с pre-filled initial (date ISO→yyyy-MM-dd, populated refs→_id) → PATCH /:id
  - `onDelete(row)` → ConfirmDialog (destructive) → DELETE /:id
  - `columnDefs()`: добавлена actions column (pinned right, width 100, cellRenderer: RowActionsComponent) только если `config.fields` задан
  - Helpers: `prepareFieldsForForm` (async relation loading), `prepareInitialForForm` (date/populated transforms), `defaultInitial`, `cleanForBackend` (strip null/empty), `extractArray`/`normalize` (handles paginated responses)
- **Fallback**: страницы БЕЗ `fields[]` (например permissions, audit) остаются read-only — кнопки не показываются, `onCreate` показывает toast-плейсхолдер.
**TS-фиксы:** все обращения к `row._id/id/name/title`, `item._id/name/title`, `obj._id/id` переведены на bracket-notation `row['_id']` и т.п. (TS4111 на `Record<string, unknown>`).
**Затронутые файлы/папки:** frontend/src/app/shared/components/{form-dialog,row-actions,crud-page}/, frontend/src/app/configs/pages.config.ts
**Verification:** `pnpm run build` OK (2.26s, 0 errors, 0 warnings, bundle 542.84 kB).
**Известные ограничения (не блокеры):**
- Relation options грузятся ВСЕ сразу при открытии формы (нет пагинации/поиска в селекте) — приемлемо для ≤100 записей.
- onDelete использует `dialog.confirm().subscribe(... -> this.http.delete().subscribe(...))` — nested subscriptions, лучше было бы через switchMap. TODO.
- `cellRendererParams` создаёт новые стрелочные функции при каждом пересчёте `columnDefs()` — может вызвать лишние agInit. TODO.
- Все мутации попадают в backend AuditLog (TZ-05) автоматически, не требует доп. интеграции.
- Docker-верификация (login → перейти на /p/counterparty → create/edit/delete) не запускалась — браузер-верификация выходит за скоуп задачи.
