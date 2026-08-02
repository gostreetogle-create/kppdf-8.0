ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
commit: c1241af
verification:
  - acceptance criteria: PASS
  - frontend jest: PASS (699/699 full)
  - backend jest: PASS (320/320 full)
  - ng build (development): PASS
  - frontend typecheck: PASS (targeted; full tsc blocked by foreign categories.page.ts)
  - backend typecheck: PASS
  - git diff --check: PASS
  - code review: PASS
  - verify-status.sh: PASS
browser: MANUAL_BROWSER_CHECK_REQUIRED (no live dev-stack credentials in this session)

═══════════════════════════════════════════════════════════════
TZ-DOC-268: Builder — закрывать диалог после создания шаблона
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer / QA-валидатор

ЗАВИСИМОСТИ: Нет. Выполнять до ручной проверки остальных builder-сценариев.

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/builder.page.ts;frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts;frontend/src/app/shared/ui/dialog/pi-dialog.service.ts;frontend/src/app/shared/util/on-dialog-close-once.ts;frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts;frontend/src/app/pages/doc-constructor/templates/templates.page.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Диалог `TemplateSetupDialogComponent` открывается из `BuilderPage.onCreateTemplate()` и из `TemplatesPage.onCreate()` через `PiDialogService.open()` и `onDialogCloseOnce()`.

2. `TemplateSetupDialogComponent.onConfirm()` вызывает `ref.close(result)`. В `BuilderPage` после результата запускаются запросы организации/типа документа, затем создание шаблона и навигация.

3. Наблюдение пользователя: после одного нажатия «Создать» шаблон уже появляется созданным в фоне, но окно настройки остаётся видимым. Пользователю приходится дополнительно нажимать крестик или вне диалога. Это создаёт риск повторной отправки и визуально показывает устаревшее состояние.

4. Код содержит защиту RAF в `PiDialogService`, поэтому нельзя устранять симптом удалением общей защиты позиционирования без доказательства регрессии.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Воспроизвести проблему отдельно для двух входов: `/doc-constructor/builder` и `/doc-constructor/templates`. Зафиксировать, закрывается ли overlay сразу после подтверждения, не зависит ли результат от скорости API и не возникает ли второй POST при двойном клике.

ШАГ 2: Проследить полный lifecycle `DialogRef.closed` → `onDialogCloseOnce` → `onCreateTemplate/createWithSettings` → POST → navigation. Исправить минимально только тот слой, который подтверждён причиной. Закрытие должно происходить ровно один раз при первом подтверждении, а Cancel/Escape/backdrop не должны запускать создание.

ШАГ 3: Добавить регрессионные unit-тесты на подтверждение и отмену. Если проблема зависит от CDK overlay/browser timing, добавить отдельный ручной сценарий и тестировать observable/signal-контракт без хрупкой проверки внутренних DOM-деталей.

ШАГ 4: Проверить loading/disabled состояние: после подтверждения повторное нажатие не должно создавать второй шаблон; при ошибке API окно не должно самопроизвольно открываться снова.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/doc-constructor/builder/builder.page.ts — только подтверждённая причина в create flow.
- frontend/src/app/pages/doc-constructor/templates/templates.page.ts — если тот же дефект воспроизводится во втором входе.
- frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts — только если нужен явный submit guard.
- frontend/src/app/shared/util/on-dialog-close-once.ts — только если доказан общий lifecycle-баг.
- frontend/src/app/shared/ui/dialog/pi-dialog.service.ts — только при доказанном overlay timing-дефекте и с регрессионным тестом.
- frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts — тесты.

НЕ ИЗМЕНЯТЬ:
- backend/**, API-контракты и схемы;
- unrelated dialogs;
- другие TZ-файлы, progress.md и ARCHITECTURE.md без требований TZF-00.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. После одного клика «Создать» overlay диалога закрывается не позднее момента перехода к созданному шаблону; дополнительный клик по кресту не требуется.
2. В Network/API создаётся ровно один шаблон на одно подтверждение.
3. Cancel, Escape и backdrop закрывают диалог без POST и без навигации.
4. Повторный клик по «Создать» во время выполнения запроса не создаёт дубликат.
5. При ошибке подготовки организации/типа документа или POST пользователь получает существующее сообщение об ошибке, а UI не зависает в состоянии `isCreating`.
6. Добавлены unit-тесты для confirm/cancel и выполнен ручной browser-check обоих входов.
7. Frontend typecheck, `ng build --configuration=development`, targeted Jest и `git diff --check` проходят.

РУЧНОЙ СЦЕНАРИЙ: открыть оба маршрута; нажать «Создать» ровно один раз; убедиться, что окно исчезло, созданный шаблон открыт/список обновлён, второй POST отсутствует; повторить Cancel/Escape.

ОГРАНИЧЕНИЯ: browser timing нельзя считать исправленным только по unit-тесту; нужен реальный overlay smoke-check.
