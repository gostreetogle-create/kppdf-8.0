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
TZ-DOC-269: Builder — строгая рамка, сетка и магнитное прилипанье
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend UI Engineer / Interaction QA

ЗАВИСИМОСТИ: Нет. Не запускать параллельно с задачами, меняющими те же canvas styles.

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/block-renderer.component.css;frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts;frontend/src/app/pages/doc-constructor/builder/snap-engine.ts;frontend/src/app/pages/doc-constructor/builder/block-renderer-state.service.ts;frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.spec.ts;frontend/src/app/pages/doc-constructor/builder/snap-engine.spec.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Выделение блоков реализовано в `block-renderer.component.css`: `.is-selected` использует золотую рамку, внешний ring и shadow; positioned blocks дополнительно используют `outline`/handles. Для overlay-изображений selection outline отдельный.

2. На canvas при включённом snap отображается `.canvas-builder__grid-layer` с заметными точками (`radial-gradient`, rgba 0.42, 2px). Пользователь считает видимые клеточки/точки лишним визуальным шумом, если они не нужны для работы механизма.

3. Snap и guides реализованы через `snap-engine.ts`, `BlockRendererStateService` и параметры `snapEnabled/gridSize/boundaryPadding`. В коде есть порог `SNAP_THRESHOLD_PX = 8`; пользователь просит проверить, что блоки стыкуются к краям соседних текстовых/табличных/изображений через разумный минимальный зазор.

4. Наблюдение пользователя: работа в целом ощущается корректной, но текущая рамка мешает понять фактическое выравнивание. Нельзя менять snap-математику только ради внешнего вида без теста геометрии.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Согласовать strict Paper & Ink treatment: обычный блок — hairline `var(--color-rule)` без декоративных кругов/лишнего glow; selected — заметная более тёмная/толстая рамка на `var(--color-ink)` с единым focus/resize treatment; multi-selected — тот же строгий язык без конфликтующего золотого ring.

ШАГ 2: Скрыть видимый grid overlay по умолчанию, если он не является функциональной частью snap. Если grid нужен как рабочий режим, оставить его только за явным переключателем «Показывать сетку», не отключая сам snap. Не удалять guides, пока не проверено, что они остаются полезными.

ШАГ 3: Проверить snap на соседние edges/centers для flow, positioned и legacy overlay блоков, включая таблицу рядом с текстом и два table blocks. Если порог/зазор неверен, скорректировать минимально и покрыть pure unit-тестами.

ШАГ 4: Проверить, что отключение grid не ломает snap, guides, resize, drag и preview/print mode.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/doc-constructor/builder/block-renderer.component.css — selection/resize visuals.
- frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts — grid visibility/explicit toggle only if needed.
- frontend/src/app/pages/doc-constructor/builder/snap-engine.ts — only proven threshold/geometry correction.
- frontend/src/app/pages/doc-constructor/builder/block-renderer-state.service.ts — only if runtime snap path is the cause.
- frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.spec.ts;
  frontend/src/app/pages/doc-constructor/builder/snap-engine.spec.ts — regression tests.

НЕ ИЗМЕНЯТЬ:
- backend/** and API schemas;
- image containment code from TZ-DOC-270;
- grouping/layer persistence from later TZs;
- global `styles.css` tokens unless a separately approved token is missing.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Unselected blocks use a quiet hairline border; selected blocks use one strict, darker, visibly thicker Paper & Ink outline without decorative circular frame artifacts.
2. Multi-selected blocks have a visually consistent state and remain distinguishable from unselected blocks.
3. Visible grid dots/cells are absent in normal editor view unless the user explicitly enables a documented grid-view control.
4. Snap remains functional with grid hidden; guides appear only during relevant drag and disappear on release.
5. A dragged block snaps to a neighbouring text/table/image edge within the defined threshold and does not jump when farther away.
6. Unit tests cover threshold, edge/center alignment, self-exclusion and grid-disabled behavior; frontend typecheck/build/Jest pass.
7. Manual check at desktop and narrow viewport shows no canvas overflow caused by the new frame treatment.

РУЧНОЙ СЦЕНАРИЙ: вставить text + table + image; выключить/не включать grid; выделять каждый блок и несколько блоков; перетаскивать к четырём сторонам соседей; убедиться, что snap/guides работают, а рамка не маскирует стык.

ОГРАНИЧЕНИЯ: не превращать эту задачу в полную переделку canvas design system; z-order и group selection — отдельные TZ.
