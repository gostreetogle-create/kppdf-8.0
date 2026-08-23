# КП Single Workspace — геометрия (закон, не обсуждается)

> **SoT для Wave 0+.** Любая правка shell/demo/workspace **сначала** сверяется с этим чек-листом.
> Живой эталон: `/proposals/demo-workspace`. PO судит только им, не `preview.html`.

## Законы (immutable)

1. **Панель = overlay.** `position: absolute`, поверх viewport. Open/close **не меняет** размер и положение A4 (ни portrait, ни landscape). Запрещены правила вида «если панель открыта — уменьшить `max-width` листа».
2. **A4 книжный:** height-first ~95% fill, **справа**, ~8px от правого края stage (`flex-end` + `padding-right: 8px`). Не двигать лист ради «красивого зазора» под меню.
3. **A4 альбомный:** width-first на всю доступную ширину stage (минус 8px справа), **то же** выравнивание `flex-end`. Open/close панели лист **не reflow**.
4. **Ширина панели:** **480px** фиксированно, portrait = landscape. Контент внутри компактный, `max-width: 272px`. Без JS-расчёта «эффективной ширины».
5. **Left rail:** иконки разделов в `app-chrome-rail-left` через `PiChromeToolsService`. В альбоме **остаются слева**; горизонтальная полоса — только mobile (`<lg`).
6. **Lucide** + segmented orientation toggle. Без emoji и текстовой кнопки ориентации.
7. **Ribbon** не крадёт высоту плоскости; toolbar viewport — overlay в углу листа.

## Чек-лист перед PASS / Wave 1

| # | Проверка | Portrait | Landscape |
|---|----------|----------|-------------|
| 1 | `panelW === 480` | ☐ | ☐ |
| 2 | A4 `right` gap stage ≈ 8px | ☐ | ☐ |
| 3 | A4 rect **идентичен** open vs collapsed (Δ width/height/right ≤ 0.5px) | ☐ | ☐ |
| 4 | Панель `z-index` выше viewport, видна поверх серой зоны | ☐ | ☐ |
| 5 | Left rail в chrome, не horizontal strip (desktop) | ☐ | ☐ |
| 6 | Контент панели `max-width: 272px` | ☐ | ☐ |
| 7 | Клик по A4 сворачивает панель без jerk | ☐ | ☐ |

## Антипаттерны (reject)

- Сжать/сдвинуть A4 при открытии панели (любой ориентации).
- `flex-start` + `padding-left` на stage «чтобы меню не налезало» — вместо overlay.
- Динамическая `--kp-panel-w-effective` из JS.
- `@media` уменьшает панель на desktop без отдельного TZ PO.
- Standalone `preview.html` как единственное доказательство — только demo-route.

## Файлы

| Зона | Путь |
|------|------|
| **Page SoT** | [`kp-workspace.page.md`](./kp-workspace.page.md) — устройство страницы; обновлять вместе с TZ |
| **Shell (SoT геометрии)** | `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace-shell.component.*` (TZ-KP-WS-401) |
| Demo (эталон) | `frontend/src/app/pages/commercial/proposals/demo/proposal-workspace-demo.page.*` (тонкий wrapper над shell) |
| Production route | `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace.page.ts` (`/proposals/workspace`) |
| Dummy sync (reference only) | `tasks/kp-workspace-dummy/kp-workspace-shell.css` (снапшот shell-стилей; правки — в компонент) |

## История

- 2026-08-23: зафиксировано после регрессии «landscape panel shrink sheet» — PO: меню **поверх**, не двигает лист.
- 2026-08-23 (TZ-KP-WS-401): геометрия вынесена из demo в `ProposalWorkspaceShellComponent`; demo — тонкий wrapper; добавлен `/proposals/workspace` (placeholder-панель).
