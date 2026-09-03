# TZ-NX-DOCSTUDIO-S8-RIBBON-NORMALIZE: ribbon — единая высота контролов

**РОЛЬ АГЕНТА:** Executor (Freebuff / Claude CLI)  
**LAYER:** frontend-nx / studio shell  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-shell.component.css`  
**PAGES:** `document-studio`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`  
**ЗАВИСИМОСТИ:** S7 wave DONE; ribbon actions уже wired (PDF/архив/preview)

## Domain preflight

Проверено: `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (ribbon template + styles); `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-shell.component.css` (`.kp-ws-ribbon-btn` 26px, `--kp-ribbon-h: 36px`); legacy этalon `frontend/src/app/shared/document-workspace-shell/proposal-workspace-shell.component.css`; `docs/ui-density-canon.md` §компактность (кнопки 28–32px в dense-экранах, но KP/studio ribbon = 26px в 36px row); `docs/pages/kp-workspace-geometry.md`.

## ИСХОДНОЕ СОСТОЯНИЕ

PO-скрин `/studio/:id`: вторая строка (ribbon) «разношёрстная» — разная высота кнопок и текста, элементы не на одной базовой линии.

Факты по коду:

| Элемент | Высота / шрифт | Файл |
|---------|----------------|------|
| `.kp-ws-ribbon-btn` (К списку, Редактор, …) | **26px**, 13px mono UPPERCASE | shell CSS |
| `app-pi-button size="sm"` (+ Страница) | **32px** (`h-8`) | studio-editor.page.ts |
| `.page-nav__btn` (стрелки) | **32×32px** | studio-editor.page.ts styles |
| `.page-nav` wrapper | padding 2px + border → ещё выше | studio-editor.page.ts styles |
| `.ribbon-label` | 12px sans, muted | studio-editor.page.ts |
| `.kp-ws-badge` / `.kp-ws-total` | 12px / 13px, без фикс. высоты | shell CSS |

Ribbon row = 36px; допустимый контрол = **26px** (канон legacy KP shell, 5px «воздух» сверху/снизу).

## ЧТО ДЕЛАТЬ

1. **«+ Страница»** — заменить `app-pi-button` на нативный `<button type="button" class="kp-ws-ribbon-btn" …>+ Страница</button>`. Убрать неиспользуемый `ButtonComponent` из imports, если больше не нужен.
2. **Page nav** — привести к ribbon-канону:
   - `.page-nav`: `display: inline-flex; align-items: center; gap: var(--space-1); height: 26px; padding: 0 var(--space-1);` — без лишнего vertical padding.
   - `.page-nav__btn`: **26×26px** (не 32), border/radius как у `.kp-ws-ribbon-btn`; icon size **14** (не 16).
   - `.page-nav__label`: `font-size: 13px; font-weight: 600; font-family: var(--font-mono); letter-spacing: 0.04em;` — tabular-nums сохранить.
3. **Группы ribbon** — визуальное разделение без смены layout:
   - `.studio-ribbon-actions`: `border-left: 1px solid var(--color-rule); padding-left: var(--space-2); margin-left: var(--space-1);`
   - `.studio-ribbon-extra`: `padding-right: var(--space-1);` (если нужно для симметрии).
4. **Active state** — перенести `.kp-ws-ribbon-btn--active` из `:host ::ng-deep` в `studio-workspace-shell.component.css` рядом с `.kp-ws-ribbon-btn` (gold fill, on-gold text). Удалить ng-deep override в editor.
5. **Shell token (опционально, предпочтительно):** `--kp-ribbon-control-h: 26px` в `:host` shell; использовать в `.kp-ws-ribbon-btn` и page-nav btn height — один источник.

## ИЗМЕНЯТЬ

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (template + component styles)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-shell.component.css`

## НЕ ИЗМЕНЯТЬ

- Геометрию A4 / overlay-панелей / icon-rail слева
- Логику PDF, архива, preview, pagination
- `--kp-ribbon-h: 36px` (не раздувать ribbon row)
- Backend / data-access
- Другие страницы с `kp-ws-ribbon`

## КРИТЕРИИ ПРИЁМКИ

1. На `/studio/:id` все интерактивные элементы ribbon (**+ Страница**, стрелки, Книжная/Альбомная, К списку…В архив) — **одинаковая видимая высота 26px**, вертикально центрированы в строке 36px.
2. Нет `app-pi-button` в ribbon extra.
3. Метка «Стр. N / M», badge имени документа и «Страниц: N» не выбиваются по baseline (визуально на одной горизонтали с кнопками).
4. Active «Редактор» / «Просмотр» — gold pill той же высоты, что остальные кнопки.
5. Gates (exit 0):

```bash
cd frontend-nx && pnpm exec nx build kppdf-web
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio
```

6. `docs/pages/document-studio.page.md` — одна строка в §NX Studio S2 shell: ribbon controls unified 26px (не править overlay page panel 32px law).

## Build-integrity (§5 TZ-NX-BUILD-INTEGRITY)

- Baseline `nx build kppdf-web` PASS до claim.
- `nx build kppdf-web` — **последняя** команда перед archive.
- Не параллелить с другим TZ на `kppdf-web/src/**`.

## Финализация

- Claim → `tasks/_active/TZ-NX-DOCSTUDIO-S8-RIBBON-NORMALIZE.md`
- Archive → `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S8-RIBBON-NORMALIZE.done.md`
- Строка в `tasks/QUEUE-LIVE.md` (если есть очередь studio)
