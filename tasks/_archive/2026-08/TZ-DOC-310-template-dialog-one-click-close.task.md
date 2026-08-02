═══════════════════════════════════════════════════════════════
TZ-DOC-310: Диалог создания — закрытие по одному клику + валидация
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer / Interaction QA

ЗАВИСИМОСТИ: TZ-DOC-309 (общий файл диалога; выполнять после него).
См. также TZ-DOC-268 (уже закрыл double-submit, но симптом у пользователя
сохранился — см. ИСХОДНОЕ СОСТОЯНИЕ п.4).

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts;frontend/src/app/pages/doc-constructor/builder/builder.page.ts;frontend/src/app/pages/doc-constructor/templates/templates.page.ts;frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts;frontend/src/app/pages/doc-constructor/templates/templates.page.spec.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Наблюдение пользователя: выбираешь категорию, А4, книжная → жмёшь «Создать» —
   диалог не исчезает, «висит и ждёт второго нажатия». Шаблон при этом может
   создаться/открыться на заднем фоне.

2. В `TemplateSetupDialogComponent.onConfirm()` есть молчаливый выход:
   `if (this.submitted()) return; if (!this.categoryId()) return;` — если
   категория ещё не выбрана (грузится кэш/пользователь кликнул рано), клик
   «Создать» проглатывается БЕЗ какого-либо фидбека. Сообщение
   `hasCategoryError()` («Выберите категорию») рендерится только когда
   `categories().length > 0`, т.е. во время «Загрузка категорий…» пользователь
   не получает никакой подсказки. Это и выглядит как «нужно второе нажатие».

3. `BuilderPage.onCreateTemplate()` и `onDuplicateTemplate()`, а также
   `TemplatesPage.onCreate()` вызывают `this.dialog.open(...)` БЕЗ
   `parentDestroyRef` (известное ограничение, зафиксировано в TZ-259):
   если навигация разрушает страницу раньше, чем диалог успевает закрыться,
   CDK overlay-контейнер может остаться в DOM — диалог «зависает на экране».

4. TZ-DOC-268 (done) уже добавил submit-guard и `ref.close()` при подтверждении.
   Однако пользователь всё ещё видит симптом — нужна реальная browser-проверка
   обоих входов, а не только unit-тесты, и устранение остаточных причин
   из п.2 и п.3.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Воспроизвести в браузере на обоих входах.

  Открыть `/doc-constructor/builder` и `/doc-constructor/templates`; нажать
  «Создать» с выбранной и с невыбранной категорией; проверить duplicate-flow.
  Зафиксировать: закрывается ли overlay сразу, приходит ли второй POST при
  двойном клике, остаётся ли overlay в DOM после навигации (вкладка Elements).

ШАГ 2: Убрать «молчаливый» клик — сделать валидацию видимой.

  - Кнопка «Создать» (и «Дублировать») disabled, пока категории не загружены
    или категория не выбрана.
  - Если категория не выбрана, а пользователь всё же пытается подтвердить —
    показать явное сообщение «Выберите категорию» (существующий
    `hasCategoryError` довести до всех состояний: loading, empty, error).
  - `onConfirm()` при невалидном состоянии не должен закрывать диалог и не
    должен запускать создание; это должно быть единое видимое правило.

ШАГ 3: Гарантировать закрытие при подтверждении и при навигации.

  - Убедиться, что `ref.close(result)` вызывается ровно один раз на первое
    валидное подтверждение (guard TZ-DOC-268 сохранить).
  - Передать `parentDestroyRef: this.destroyRef` в `dialog.open()` во всех трёх
    местах (builder onCreateTemplate, onDuplicateTemplate, templates onCreate),
    чтобы при навигации overlay гарантированно уничтожался.

ШАГ 4: Проверить отсутствие дубликата POST и корректный Cancel/Escape.

  - Повторный клик во время создания не создаёт второй шаблон.
  - Cancel/Escape/backdrop закрывают диалог без POST и без навигации.

ШАГ 5: Тесты.

  - spec диалога: confirm при пустой категории НЕ закрывает и НЕ эмитит
    результат; confirm при выбранной категории закрывает ровно один раз.
  - spec страницы: `dialog.open` получает `parentDestroyRef`; двойной клик —
    один POST.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts — видимая валидация, disabled-кнопка.
- frontend/src/app/pages/doc-constructor/builder/builder.page.ts — parentDestroyRef в open() (onCreateTemplate, onDuplicateTemplate).
- frontend/src/app/pages/doc-constructor/templates/templates.page.ts — parentDestroyRef в open() (onCreate).
- frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts; frontend/src/app/pages/doc-constructor/templates/templates.page.spec.ts — тесты.
- frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.spec.ts — тесты валидации.

НЕ ИЗМЕНЯТЬ:
- backend/** и API контракты;
- frontend/src/app/shared/ui/dialog/pi-dialog.service.ts — только если доказан
  overlay-дефект, и тогда с регрессионным тестом (TZ-103.3 RAF-guard не трогать);
- frontend/src/app/shared/util/on-dialog-close-once.ts — только при доказанном
  lifecycle-баге.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Один клик «Создать» (категория выбрана) закрывает диалог не позднее момента
   перехода к созданному шаблону; повторный клик не требуется.
2. Клик «Создать» без категории показывает видимое сообщение «Выберите
   категорию» и НЕ запускает создание.
3. В Network/API ровно один POST на одно подтверждение; двойной клик —
   без дубликата.
4. Cancel/Escape/backdrop закрывают диалог без POST и навигации.
5. При навигации (создание) overlay-контейнер не остаётся в DOM.
6. Frontend typecheck, targeted Jest, `git diff --check` проходят.

РУЧНОЙ СЦЕНАРИЙ: оба маршрута; клик «Создать» без категории (показ ошибки);
выбрать категорию → один клик (закрытие + переход); двойной клик (один POST);
Cancel/Escape; duplicate.

ОГРАНИЧЕНИЯ: TZ-DOC-268 уже в архиве — НЕ переделывать его с нуля, а
подтвердить оставшиеся причины и закрыть их минимальными правками.
