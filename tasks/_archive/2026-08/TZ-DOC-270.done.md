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
TZ-DOC-270: Builder — удерживать изображение внутри рамки
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Interaction Engineer / QA-валидатор

ЗАВИСИМОСТИ: Нет. Может выполняться после TZ-DOC-269, чтобы визуальная диагностика была понятнее.

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts;frontend/src/app/pages/doc-constructor/builder/block-renderer.component.css;frontend/src/app/pages/doc-constructor/builder/block-renderer-state.service.ts;frontend/src/app/pages/doc-constructor/builder/snap-engine.ts;frontend/src/app/pages/doc-constructor/builder/builder.page.ts;frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.spec.ts;frontend/src/app/pages/doc-constructor/builder/snap-engine.spec.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Positioned blocks рендерятся с `overflow: visible` в `.block-renderer--positioned`, чтобы внешние resize handles не обрезались. Изображение получает размеры через `imageWidth/imageHeight` и `object-fit: contain`.

2. Пользователь наблюдает: при изменении изображения по боковым/верхней сторонам содержимое остаётся в рамке, но при перетаскивании нижнего resize handle рамка останавливается, а фотография визуально продолжает уходить ниже рамки. При diagonal resize размер обычно меняется вместе с рамкой.

3. В `BlockRendererComponent` есть раздельные DOM-пути для positioned blocks и legacy overlay images, поэтому исправление должно учитывать оба режима и не сломать внешние handles.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Воспроизвести баг на image block с portrait/landscape aspect ratio и зафиксировать, какой именно контейнер имеет неверную высоту/overflow: frame, image-wrap или img.

ШАГ 2: Разделить визуальную рамку/handles и clipping-контейнер: внешние handles должны оставаться кликабельными, а содержимое изображения должно клипаться ровно по внутренней рамке. Сохранить `object-fit: contain` либо зафиксировать другое решение с объяснением.

ШАГ 3: Привести resize math и persisted settings к единому источнику размеров. Нижний, верхний, левый, правый и все четыре corner handles должны обновлять frame и image согласованно; значения должны clamped к странице и минимальному размеру.

ШАГ 4: Добавить pure/component regression tests и проверить legacy overlay fallback, временный локальный preview до загрузки и серверный image URL.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts — DOM bindings/resize events.
- frontend/src/app/pages/doc-constructor/builder/block-renderer.component.css — inner clip frame and external handles.
- frontend/src/app/pages/doc-constructor/builder/block-renderer-state.service.ts — size/position state if required.
- frontend/src/app/pages/doc-constructor/builder/snap-engine.ts — resize math only if proven there.
- frontend/src/app/pages/doc-constructor/builder/builder.page.ts — persistence only if payload mapping is incomplete.
- relevant builder/snap specs.

НЕ ИЗМЕНЯТЬ:
- backend image upload endpoint, file validation or database schema;
- unrelated text/table rendering;
- global page overflow rules.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Во время любого resize ни одна часть изображения не видна за пределами его frame.
2. Нижний handle изменяет высоту frame и image синхронно; верхний handle сохраняет ожидаемую нижнюю границу; левый/правый работают аналогично.
3. Corner resize сохраняет выбранную стратегию aspect ratio и не создаёт отрицательных/нулевых размеров.
4. Внешние handles остаются доступны мышью, клавиатурой/assistive labels не ломаются.
5. После отпускания мыши и после перезагрузки builder сохраняются одинаковые размеры и позиция.
6. Legacy overlay и canonical `layout` image paths покрыты тестами; frontend typecheck/build/Jest pass.
7. Manual check на узком viewport не создаёт горизонтального overflow страницы.

РУЧНОЙ СЦЕНАРИЙ: добавить фото; изменить размер последовательно за N/E/S/W и NW/NE/SW/SE; перетащить к нижней границе страницы; отпустить, обновить страницу и повторить. Проверить, что фото всегда внутри frame.

ОГРАНИЧЕНИЯ: не решать здесь групповой resize и z-order.
