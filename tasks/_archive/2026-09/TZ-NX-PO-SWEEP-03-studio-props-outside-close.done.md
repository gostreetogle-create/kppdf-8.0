# TZ-NX-PO-SWEEP-03: studio — закрытие Свойств по клику снаружи (не только лист A4)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build AOT)
  - tests: PASS (818/825, 7 skipped, 0 failed; +5 new)
  - lint: N/A (не запускал отдельно, build/AOT clean)
  - checklist: ADDED
  - progress.md: N/A (ops/UX sweep wave)
  - status synchronization: PASS

## Root cause

`onSheetClick()` — единственный dismiss-путь для панели Свойства/Слои/… —
срабатывал только при клике на сам лист A4. Клик в ribbon, footer, поля вокруг
листа (`.kp-ws-viewport` padding) или пустом chrome не имел обработчика вовсе
→ панель оставалась открытой навсегда, пока пользователь не кликал именно по
листу.

## Fix

`studio-editor.page.ts`: новый `@HostListener('document:click')
onDocumentClickOutside()` — если панель уже свёрнута, no-op; иначе исключает
клики внутри CDK overlay (`.cdk-overlay-container` — диалоги), панели
(`[data-test="studio-tools-panel"]`), chrome rail (`.shell-rail` — сам
управляет toggle) и мобильного дубля rail в shell
(`[data-test="studio-icon-rail-horizontal"]`); иначе переиспользует
существующий `onSheetClick()` для единого dismiss.

Клик внутри панели и по выбранному блоку на холсте и так не долетают до
`document` — панель (`studio-workspace-shell` `aside`) и canvas
`selectBlock`/`startDrag` уже вызывают `stopPropagation()`. Реальный gap был
именно в «пустом» chrome — его и закрыли.

## Gates

| Gate | Result |
|------|--------|
| `nx test kppdf-web` (outside-click spec, ran full suite) | PASS 818/825 |
| `nx build kppdf-web` | PASS |

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-outside-click.spec.ts` (new)
- `docs/agent-checklists/TZ-NX-PO-SWEEP-03-studio-props-outside-close.md` (new)
