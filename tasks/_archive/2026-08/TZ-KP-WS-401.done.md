# TZ-KP-WS-401 — DONE

**agent_id:** freebuff-1 · **claimed_at:** 2026-08-23T14:09:09+0300 · **workspace:** D:\kppdf-8.0
**Dep:** TZ-KP-WS-400 DONE (rail IA doc) · **Layer:** frontend (shell + route)

## DoD

| TZ | SHA | Proof of adoption | Gates |
|----|-----|-------------------|-------|
| **KP-WS-401** (shell из demo + `/proposals/workspace`) | `97780365` | ✅ consumer: `/proposals/workspace` (route, adminOnly) + demo wrapper над shell; тесты shell **8/8**; docs geometry § Files + kp-workspace.page.md + PAGE-TZ-INDEX + dummy README; migration: геометрия только в shell.css (dummy = reference); legacy: `proposal-create.page.ts` не тронут | tsc 0 · jest proposal 122/122 · eslint 0 (touched) · `ng build` PASS · diff --check PASS |

## Что сделано

1. **`ProposalWorkspaceShellComponent`** (`frontend/src/app/pages/commercial/proposals/workspace/`):
   - Controlled layout frame: inputs `orientation`/`panelCollapsed`/`activeSection`/`panelTitle`/
     `railItems`/`badgeText`/`totalText`/`statusText`/`debugText`; outputs `orientationChange`/
     `sectionChange`/`panelToggle`/`sheetClick`.
   - Ribbon: built-in orientation segment + `[kpWsRibbonExtra]` (mid) + `[kpWsRibbonActions]`
     (end) + status/total; горизонтальный rail-стрип из `railItems` (mobile `<lg`);
     панель-оверлей 480px с `[kpWsPanel]`; viewport + A4-sheet со слотом `[kpWsSheet]`
     + toolbar; status bar.
   - CSS = single source геометрии (перенесены все frame-стили из demo).
2. **Demo → тонкий wrapper:** dummy-контент (селекторы/поля/actions, 6 секций-плейсхолдеров)
   проецируется в shell; chrome-rail регистрация (закон #5) осталась в demo; debug-метрики
   читаются из shell через `viewChild(..., { read: ElementRef })`.
3. **`/proposals/workspace`** (`proposal-workspace.page.ts`, adminOnly) — shell +
   placeholder-панель «Панели подключаются в TZ-402…404» + ссылка на `/proposals/create`.
   `/proposals/create` не тронут.
4. **Shell spec 8 тестов:** frame рендер, orientation классы + emit, panel title/collapsed,
   rail-кнопки (sectionChange / panelToggle / скрытие пустого), sheetClick, статус-бар,
   проекции (panel/sheet/ribbon).
5. **Docs:** geometry § Files (shell = SoT, demo = wrapper, dummy = reference), kp-workspace.page.md
   (routes 401 DONE, файлы, wave), PAGE-TZ-INDEX, dummy README (reference only).

## Geometry checklist (статическая сверка CSS)

| # | Проверка | Статус |
|---|----------|--------|
| 1 | panelW 480 (`--kp-panel-w: 480px`) | ✅ |
| 2 | A4 right gap stage ≈8px (`flex-end` + `padding-right: var(--space-2,8px)`) | ✅ |
| 3 | A4 rect идентичен open vs collapsed (только `.kp-ws-panel` transform) | ✅ |
| 4 | Панель z-index 5 поверх viewport | ✅ |
| 5 | Left rail в chrome (demo регистрирует tools); strip `display:none` >1023px | ✅ |
| 6 | Контент панели max-width 272px (`--kp-panel-content-max`) | ✅ |
| 7 | Клик по A4 → sheetClick → collapse | ✅ |

## Notes

- Ribbon mid-слот один (`kpWsRibbonExtra`): селекторы и №/дата в demo — в одной группе
  (без 1px разделителя между ними — минимальное отклонение dummy, геометрия не затронута).
- `ng-container` с атрибутом не матчится `ng-content select` — проекции сделаны
  поатрибутно на элементах.
- Чужие dirty-файлы (Cursor docs, backlog deletions, app-layout gold-active WIP) не трогал.

## Legacy leftover

- `proposal-create.page.ts` + `proposal-create-*.component.ts` — до cutover 408.
- Инлайн rails/фиолетовые `kp-create-toggle-*` — до 402/409.
- `tasks/kp-workspace-dummy/*` — reference only (не правки).
