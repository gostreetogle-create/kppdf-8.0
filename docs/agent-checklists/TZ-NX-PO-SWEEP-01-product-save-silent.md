# TZ-NX-PO-SWEEP-01 checklist — product form Save молчит при invalid

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PO-SWEEP-01-product-save-silent.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T00:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI local, no Team Room in this session)

## Preflight

- [x] git rev-parse --show-toplevel → D:\kppdf-8.0
- [x] `_NOW.md` + `tasks/_active/` — только этот TZ, конфликтов нет
- [x] TZ прочитан

### Preflight Check Output
- **Context read:** `frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.ts` (onSubmit L272-278, form L233-244, template L88-184), `.component.spec.ts`, `@kppdf/ui/form-field` `form-field.component.ts` (`error` input already exists)
- **Key Constraints:** Confirm: `onSubmit` молчал на invalid (только `markAllAsTouched()+return`), уже есть `errorMessage` signal + `role="alert"` template (переиспользован для server-ошибок) — reuse вместо нового toast. Required controls: `sku`, `kind`, `unit`, `categoryId`.
- **Planned Deliverable:** invalid submit → `errorMessage` с списком пустых обязательных полей + focus/scrollIntoView первого invalid control (id `prod-sku`/`prod-kind`/`prod-unit`/`prod-category`); per-field `[error]` hint на `app-pi-form-field` через `fieldError(key)`; spec на invalid submit (no create/update call + alert текст)
- **Validation Path:** `nx test kppdf-web --testPathPattern=product-form-dialog`; `nx build kppdf-web` last

## Acceptance (из TZ)

- [x] Invalid Save → toast/inline + focus, не «мёртвая» кнопка
- [x] Valid form + фото → Save работает как раньше (не менял success-path)
- [x] Specs green; `nx build kppdf-web` last

## Integrity slot

- [x] Тип изменения: page (registries product dialog)
- [x] FIC: §A UI-правка внутри существующего диалога, без нового route/permission — N/A остальные секции
- [x] page.md: `docs/pages/registries.page.md` — N/A (диалог-level UX fix, не меняет page contract; не создаю новую строку)
- [x] DOMAIN-MAP: N/A (не менял module/route/page контур)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите
- [x] COUPLING-MAP: N/A (не трогал общее поле/статус)

## Gates (факт)

- `nx test kppdf-web --testPathPattern=product-form-dialog` (запустил весь project suite, nx свернул паттерн в alternation) → PASS: 116 suites / 810 tests passed, 7 skipped, 0 failed
- `nx build kppdf-web` → PASS (pre-existing NG8102/gantt-bars budget warnings не мои, не трогал эти файлы)

## Executor report

- `onSubmit()`: invalid больше не молчит — `errorMessage.set(buildInvalidMessage())` (список пустых обязательных: Артикул/Тип/Единица/Категория) + `focusFirstInvalidField()` (scrollIntoView + focus первого invalid в порядке sku→kind→unit→categoryId).
- Переиспользован существующий `errorMessage` signal + `<p role="alert" data-test="product-form-error">` (уже был в шаблоне для server-ошибок) — новый toast не заводил.
- `app-pi-form-field [error]="fieldError(key)"` на 4 обязательных полях (sku/kind/unit/categoryId) — hint «Обязательное поле» после touched, в зарезервированной `min-h-4` строке (не двигает layout).
- Нюанс: `app-pi-input` кладёт `id` на host-тег, а не на внутренний `<input>` — `focusFirstInvalidField` при не-native host ищет `input, select, textarea` внутри (нативные `<select>` unit/kind/category фокусятся напрямую).
- Valid-path не менял: успешный create/update, фото-write-on-save, dirty-close — как было.
- Backlog (не в scope TZ-01): тот же silent-invalid паттерн в category/material/module/unit/work-type/worker/simple-registry form dialogs — записан в `WAVE-NX-PO-SWEEP-2026-09-12.md` §Backlog.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-12
