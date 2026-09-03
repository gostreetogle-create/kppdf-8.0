# TZ-NX-DOCSTUDIO-S17-RIBBON-PAGES-PANEL: ribbon + панель «Страницы»

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** document-studio  
**PAGE_DOCS:** `docs/architecture/nx-doc-studio-roadmap-v2.md`  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**ЗАВИСИМОСТИ:** S16 DONE  
**CONFLICT KEYS:** `studio-editor.page.ts`; new `studio-pages-panel.component.ts`; `studio-workspace-shell.component.css`

## ИСХОДНОЕ

Ribbon перегружен (`studio-editor.page.ts:139-198`): label, +Страница, nav, нумерация, фон, прозрачность, ориентация — «некрасиво», дублирует будущую панель.

## ЧТО ДЕЛАТЬ

### Панель «Страницы» (правый rail)

1. Новый `studio-pages-panel.component.ts`:
   - Список страниц 1..N (клик → jump `currentPage`)
   - `+ Страница`, ‹ › навигация
   - Toggle нумерация (`pageNumbering`)
   - Фон страницы: select из `backgroundImage[]`, прозрачность slider
   - Ориентация: segmented Книжная/Альбомная (PATCH `orientation`)
   - Поля страницы (`pageMargins`) — read/edit если уже в schema (S12)
2. Убрать эти контролы из `kpWsRibbonExtra`.

### Ribbon (компакт)

1. Убрать текст «Студия документов».
2. Центр ribbon: только `badgeText` (имя документа), опционально «Стр. N/M» одной строкой **или** убрать если есть в панели.
3. Actions: К списку · Редактор · Просмотр · PDF · В архив — **без** «Шаблон» (есть в правом rail).
4. Типографика ribbon: `var(--kp-ribbon-control-h)`, единый размер шрифта 11–12px, выравнивание по `kp-ws-ribbon` (сверка с `/proposals/workspace` demo).

### Дизайн

- Секции панели с подзаголовками RU: «Страницы», «Оформление листа».
- Без page H1 внутри flyout.

## КРИТЕРИИ ПРИЁМКИ

1. Ribbon ≤ 2 зоны, без geometry controls.
2. Все бывшие ribbon geometry controls работают из «Страницы».
3. Регрессия multipage/orientation/background — нет.
4. `nx build kppdf-web` exit 0 last.

## Archive

`tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S17-RIBBON-PAGES-PANEL.done.md`
