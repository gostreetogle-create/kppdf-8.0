# TZ-KP-443: Ориентация КП = из шаблона; toggle убрать с превью

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-26T15:40:00Z
closed_by: claude (Buffy / Freebuff executor)

## Outcome

Ориентация листа КП теперь целиком определяется шаблоном (`DocumentTemplate.orientation`), один
write-path: builder inspector. КП workspace только отображает её (read-only derived) — портретный/альбомный
toggle убран с ribbon. Lucide-иконки ориентации перенесены на chips в builder inspector (не emoji).

## Changed surface

- `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace.store.ts` — `orientation` стал
  `computed(() => draft.selectedTemplate()?.orientation ?? 'portrait')`; `setOrientation` удалён.
- `.../workspace/proposal-workspace-shell.component.{ts,html,css}` — убран segment portrait/landscape с ribbon
  и `orientationChange` output; input `[orientation]` оставлен (class `kp-ws-shell--portrait|landscape`).
- `.../workspace/proposal-workspace.page.ts` — убрана привязка `(orientationChange)`.
- `.../demo/proposal-workspace-demo.page.{ts,html}` — убраны `(orientationChange)` / локальный `setOrientation`.
- `frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.{ts,spec}` — chips ориентации
  получили Lucide `RectangleVertical`/`RectangleHorizontal` (Книжная/Альбомная); PATCH-путь `templateUpdate`
  не менялся.
- Specs: store (TestBed + stub draft, mirror-тесты), shell (нет toggle, class от input), inspector (icons + emit).
- Docs: `docs/pages/kp-workspace-geometry.md` law #6 переписан; `docs/pages/kp-workspace.page.md` (store
  derived, ribbon, TZ row).

## Verification

- typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
- tests: PASS (focused jest shell + store + draft.service + builder-inspector 72/72; demo spec отсутствует)
- lint: 0 новых нарушений от TZ (pre-existing: `proposal-workspace.page.ts` 6×no-raw-ui-values,
  `builder-inspector.component.ts` 16×no-raw-ui-values — атрибутируются к началу legacy styles-блоков, НЕ правки KP-443)
- prettier: PASS (2 spec-файла отформатированы)
- diff-check: PASS

## Pre-existing (не регрессия)

- `proposal-workspace.page.spec.ts`: 3 фейла (`kp-ws-text-block-create` ожидается без открытой библиотеки) —
  подтверждено на HEAD со stashed-правками; не связано с KP-443.

## Known limits

- Live-браузерный smoke не выполнялся (headless); поведение покрыто spec: store mirror-landscape,
  shell без toggle, class от input.
- PDF print pipeline не тронут (TZ-запрет): backend `build` сам потребляет `template.orientation`.

## Conflict keys

`proposal-workspace-shell.component.{ts,html,spec}`, `proposal-workspace.store.{ts,spec}`,
`proposal-workspace.page.ts`, `proposal-workspace-draft.service.ts`, demo `proposal-workspace-demo.page.{ts,html}`,
`builder-inspector.component.{ts,spec}`, `docs/pages/kp-workspace-geometry.md`, `docs/pages/kp-workspace.page.md`.
TZ-DOC-443 (параллель) — disjoint keys, не пересекались.
