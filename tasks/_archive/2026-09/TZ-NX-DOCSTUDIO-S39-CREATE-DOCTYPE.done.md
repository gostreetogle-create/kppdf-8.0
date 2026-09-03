# TZ-NX-DOCSTUDIO-S39-CREATE-DOCTYPE: тип при создании любого документа

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §1  
**ЗАВИСИМОСТИ:** S33 (Новое КП уже shortcut)  
**CONFLICT KEYS:** `frontend-nx/.../studio-list.page.ts`; small dialog component under studio/  
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## Domain preflight

Студия = **любые** A4 (КП, договор, счёт, акт — seed DocTypes).  
«Создать документ» сейчас без `docTypeId` → оператор забывает тип → Save-as-template и токены/КП-lifecycle ломаются по смыслу. S33 закрывает только КП.

## ИСХОДНОЕ

`create({ name, orientation, pageSize })` без типа. Типы: `PiDocTypesService` / seed proposal, contract, invoice, …

## ЧТО ДЕЛАТЬ

1. «Создать документ» → dialog: имя (default как сейчас) + **обязательный** select типа из live DocTypes.  
2. Create API с `docTypeId`.  
3. «Новое КП» (S33) остаётся одним кликом без dialog (уже proposal).  
4. «Из шаблона» не трогать (тип наследуется от шаблона).  
5. `data-test="studio-create-doctype-dialog"`.

## КРИТЕРИИ ПРИЁМКИ

1. Нельзя создать blank без типа.  
2. Создал «Договор» → в панели Шаблон выбран договор.  
3. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S39-CREATE-DOCTYPE.done.md`

---

## Реализация (S39)

`docs/pages/document-studio.page.md` не существует в этом воркспейсе (нет каталога
`docs/pages/`) — PAGE_DOCS из TZ устарел, integrity-пункт закрыт как N/A с этой
причиной (см. checklist).

Файлы:

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-create-doctype-dialog.component.ts`
  (новый) — `StudioCreateDoctypeDialogComponent`: reactive-form диалог по образцу
  `studio-save-as-template-dialog.component.ts`. Поля: «Название» (`Validators.required`,
  `maxLength(256)`, дефолт передаётся снаружи) и «Тип документа» (`app-pi-select` +
  `app-pi-select-option`, список из `data.docTypes`, `Validators.required`, без
  выбранного значения по умолчанию — тот же паттерн select, что и в
  `StudioTemplatePanelComponent`). `data-test="studio-create-doctype-dialog"` на
  `<form>` (п.5 TZ буквально). `submit()` закрывает диалог `ref.close({ name, docTypeId })`
  только когда форма валидна — блокирует "blank без типа" на уровне формы
  (кнопка «Создать» задизейблена `[disabled]="form.invalid"`).
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts`:
  - `create()` больше не создаёт документ напрямую. Сначала грузит live
    `PiDocTypesService.list()`; при ошибке или пустом списке — `toast.error`,
    ничего не создаётся; иначе открывает `StudioCreateDoctypeDialogComponent`
    через общий `openCreateDoctypeDialog()` (паттерн идентичен существующему
    `openTemplatePicker()` + `onDialogCloseOnce`).
  - Документ создаётся только из колбэка `onDialogCloseOnce` — то есть только
    после явного подтверждения формы с обязательным `docTypeId` (криterий
    приёмки №1).
  - `createDocument(docTypeId?)` превращён в `createDocument(name, docTypeId)` —
    имя теперь всегда приходит явно (из диалога или из `buildDefaultName`
    для «Новое КП»), а не выводится внутри по спец-правилу "если docTypeId
    truthy → prefix КП" (это правило было верным только пока «КП» был
    единственным путём с непустым `docTypeId`; с генериковым диалогом оно
    сломало бы имя для любого другого типа).
  - `buildDefaultName(prefix)` — вынесенная общая дедуп-логика имени
    (`Документ ДД.ММ.ГГГГ`/`(N)`), переиспользуется и в `createKp()`, и как
    `defaultName` для диалога generic-создания. «Новое КП» (`createKp()`)
    поведенчески не изменился — по-прежнему один клик без диалога, тянет
    `findKpDocType` и сразу создаёт (п.3 TZ).
  - `createFromTemplate()` / `openTemplatePicker()` не тронуты (п.4 TZ) — тип
    документа наследуется от шаблона как раньше.
- Критерий приёмки №2 («Договор» → в панели Шаблон выбран договор) закрывается
  существующей, не изменённой связкой: `studio-editor.page.ts` вычисляет
  `docTypeId` из `document().docTypeId`, эта связка + `StudioTemplatePanelComponent`
  уже показывали выбранный тип для любого документа с непустым `docTypeId`
  (использовались для «Новое КП» из S33) — теперь то же самое происходит для
  любого документа, созданного через новый обязательный диалог.

### Тесты

`studio-list.page.spec.ts` обновлён:
- тест «оставляет docTypeId неопределённым для generic-кнопки» заменён на
  «requires an explicit doc type from the create-doctype dialog»: клик по
  `studio-create` → грузит DocTypes → открывает диалог с этим списком →
  `service.create` НЕ вызывается до закрытия диалога → после `ref.close({name,
  docTypeId})` документ создаётся с этими значениями и происходит навигация.
- новый тест: пустой список DocTypes → `toast.error`, диалог не открывается,
  `service.create` не вызывается.
- существующие тесты «Новое КП» (создание с pre-selected КП-типом, ошибка при
  отсутствии КП-типа) не менялись по сути, только `PiDialogService` теперь
  мокается явно (нужно для нового теста, ранее использовался реальный
  provider, но `createKp()` его не задействует).

### Gates (факт)

```text
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  → PASS, exit 0

cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-list.page.ts \
  apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts \
  apps/kppdf-web/src/app/pages/studio/studio-create-doctype-dialog.component.ts
  → PASS, exit 0, 0 problems

cd frontend-nx && pnpm exec jest --config apps/kppdf-web/jest.config.ts studio-list
  → PASS, exit 0 (1 suite, 4 tests, 0 failed)

cd frontend-nx && pnpm exec jest --config apps/kppdf-web/jest.config.ts studio (full studio scope)
  → 1 failing suite: registries.catalog.spec.ts — ПРЕДСУЩЕСТВУЮЩИЙ baseline,
    вне diff этого TZ (catalog обзавёлся registries `vat-rate`/`formulas`
    независимо от этой правки); подтверждено `git stash` на дочистовое дерево —
    падает идентично без моих изменений. Все studio-сьюты, включая
    studio-list.page.spec.ts, зелёные (351 passed / 7 skipped / 360 total, было
    так же на baseline минус мои 2 новых теста).

pnpm architecture:check (root)
  → PASS: "Architecture check passed (1399 files; baseline 17; resolved since baseline: 2)."

cd frontend-nx && pnpm exec nx build kppdf-web (baseline, до правок)
  → PASS, exit 0

cd frontend-nx && pnpm exec nx build kppdf-web (после правок, закрывающий гейт)
  → PASS, exit 0 (Successfully ran target build for project kppdf-web and 4 tasks it depends on)
```

Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-S39-CREATE-DOCTYPE.md`

```text
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS for changed-scope specs; pre-existing baseline FAIL unrelated to this TZ (see Gates)
  - lint: PASS for changed-scope files; full-project lint has pre-existing unrelated debt (see Gates)
  - kppdf-web build: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (не менялся; live-state в `_NOW.md`)
  - status synchronization: PASS
```
