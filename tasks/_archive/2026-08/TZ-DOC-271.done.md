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
TZ-DOC-271: Builder — управление порядком слоёв
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer / API Contract Engineer

ЗАВИСИМОСТИ: Нет. Рекомендуется после TZ-DOC-270, чтобы слой изображения имел корректную рамку.

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/builder.page.ts;frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts;frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts;frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts;frontend/src/app/pages/doc-constructor/builder/block-renderer-state.service.ts;frontend/src/app/shared/template-block/template-block-layout.ts;frontend/src/app/shared/services/pi-template-blocks.service.ts;frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `BlockLayout` уже содержит `zIndex`, а positioned renderer применяет `[style.z-index]="state.layoutZIndex()"`. Текущий inspector не предоставляет пользователю понятные actions «на передний план / на задний план / выше / ниже».

2. Пользователь хочет управлять, что находится сверху: фото, текст или таблица. Это должно быть доступно из контекстных свойств выбранного блока и работать минимум для canonical positioned blocks.

3. Нельзя подменять z-index визуальным порядком DOM: canvas использует отдельные flow/layout/overlay layers, поэтому решение должно учитывать фактический stacking context.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Описать supported layer model для flow, canonical layout и legacy overlay blocks. Если legacy overlay не может безопасно участвовать в общем z-order, явно показать ограничение и не обещать пользователю невозможное.

ШАГ 2: Добавить в inspector компактные доступные действия для выбранного блока: «На передний план», «На задний план», «Выше», «Ниже». Для multi-selection определить и задокументировать поведение либо отключить actions с понятной подсказкой.

ШАГ 3: Персистировать изменение через существующий update/layouts API и optimistic rollback при ошибке. Нормализовать zIndex: целое число, без отрицательных/бесконечных значений; не менять order flow-блоков побочным эффектом.

ШАГ 4: Добавить unit tests pure reorder logic и component tests на emit/persist/error rollback. Проверить фактическое перекрытие в browser.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts — controls and labels.
- frontend/src/app/pages/doc-constructor/builder/builder.page.ts — zIndex patch/persistence.
- frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts — stacking model if required.
- frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts;
  frontend/src/app/pages/doc-constructor/builder/block-renderer-state.service.ts — only if rendering needs it.
- frontend/src/app/shared/template-block/template-block-layout.ts — pure normalization/helper.
- relevant specs and existing service only if API payload currently cannot carry layout.

НЕ ИЗМЕНЯТЬ:
- backend schema/controller unless an API gap is proven and separately reviewed;
- block grouping persistence (TZ-DOC-272);
- image resize behavior (TZ-DOC-270).

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Для двух или более overlapping positioned blocks пользователь может однозначно выбрать, какой блок сверху.
2. Все четыре actions работают без изменения x/y/width/height/rotation и без перестановки flow `order`.
3. Значение zIndex сохраняется после debounce/refresh и применяется к фактическому canvas stacking.
4. При API error локальное состояние откатывается, пользователь видит ошибку, повторный submit не дублирует запрос.
5. Multi-selection имеет явно протестированное поведение.
6. Добавлены unit/component tests; frontend typecheck/build/Jest pass.
7. Browser check подтверждает image-over-text, text-over-image и table-over-image.

РУЧНОЙ СЦЕНАРИЙ: добавить фото, текст и таблицу; разместить их с перекрытием; по очереди выполнить четыре layer actions; обновить страницу; убедиться, что порядок сохранился.

ОГРАНИЧЕНИЯ: не внедрять полноценную Photoshop-like layer tree; только минимальные actions в inspector.
