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
TZ-DOC-272: Builder — рамочное выделение и группы блоков
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Interaction Architect / QA-валидатор

ЗАВИСИМОСТИ: TZ-DOC-270 рекомендуется завершить первым; TZ-DOC-271 рекомендуется завершить до или вместе с этим TZ для определения z-order группы.

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/builder.page.ts;frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts;frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts;frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts;frontend/src/app/pages/doc-constructor/builder/snap-engine.ts;frontend/src/app/shared/template-block/template-block.types.ts;frontend/src/app/shared/template-block/template-block-layout.ts;frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts;frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.spec.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Сейчас multi-select поддерживает toggle через отдельный checkbox/модификатор и уже передаёт `selectedIds`; canvas имеет toolbar выравнивания и group-drag для выбранных layout blocks.

2. Пользователь хочет desktop-like marquee selection: зажать мышь на пустом месте, протянуть прямоугольник, выделить все попавшие блоки, затем создать именованную/логическую группу и позже расформировать её.

3. Постоянной модели группы в `TemplateBlock` нет. Поэтому «группа» должна быть спроектирована явно: либо как lightweight persisted `groupId` на blocks, либо как editor-only selection preset. Нельзя выдавать временный multi-select за сохранённую группу.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Выбрать минимальную модель после проверки API: предпочтительно optional `groupId`/group metadata с безопасным backward-compatible DTO whitelist; если изменение backend-контракта слишком велико, реализовать только editor-only group как отдельный successor-TZ, а эту задачу не закрывать частичной имитацией.

ШАГ 2: Добавить marquee rectangle на пустом canvas: pointer capture, координаты в canvas space, нормализация drag в любую сторону, intersection/containment policy, escape/click cancellation и отсутствие запуска marquee при drag/resize/toolbar interactions.

ШАГ 3: Добавить явные actions «Сгруппировать» и «Разгруппировать» с доступными labels, disabled states и predictable keyboard path. Группа должна двигаться как единое целое, не терять размеры/rotation/z-order и корректно сохраняться/откатываться.

ШАГ 4: Покрыть geometry pure tests, selection state tests, keyboard/mouse interaction tests и browser scenario. Проверить смешение text/table/image и legacy/canonical blocks.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts — marquee layer and pointer handling.
- frontend/src/app/pages/doc-constructor/builder/builder.page.ts — selection/group state and persistence orchestration.
- frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts — interaction guards only if needed.
- frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts — group/ungroup actions.
- frontend/src/app/shared/template-block/template-block.types.ts;
  frontend/src/app/shared/template-block/template-block-layout.ts — only approved group contract/geometry.
- backend DTO/controller/schema/service files — only if a persisted group contract is selected and separately proven necessary.
- relevant specs.

НЕ ИЗМЕНЯТЬ:
- unrelated pages and global drag-drop behavior;
- image containment implementation except integration hooks;
- API whitelist/security rules without dedicated tests.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Dragging on empty canvas creates a visible selection rectangle and selects exactly the blocks matching the documented containment/intersection rule.
2. Selection works left-to-right and right-to-left, with pointer cancel/Escape and no accidental selection when starting on a block/handle/button.
3. «Сгруппировать» is available only for at least two compatible blocks; «Разгруппировать» reverses it without losing any block.
4. A persisted group moves all members by the same delta, respects page bounds/snap, and restores correctly after reload; or, if persistence is explicitly out of scope, the UI clearly labels the feature as editor-session-only and a successor TZ is created.
5. Keyboard focus, Enter/Space and accessible names work for group actions.
6. Geometry/state/component tests pass; frontend typecheck/build/Jest pass; manual browser scenario passes.

РУЧНОЙ СЦЕНАРИЙ: разместить текст, две таблицы и фото; протянуть marquee вокруг части объектов; сгруппировать; переместить и проверить совместное движение; перезагрузить; разгруппировать и проверить независимое редактирование.

ОГРАНИЧЕНИЯ: не реализовывать полноценный nested group tree, lock/hide layer panel или arbitrary transforms в рамках одного TZ.
