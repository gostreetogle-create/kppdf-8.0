# TZ-NX-PO-SWEEP-07: studio chrome-rail — lifecycle в одну категорию-меню

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** audit `docs/audits/2026-09-12-studio-chrome-rail-categories.md`; WAVE-DOCSTUDIO-CHROME-IA C3 (пересмотр раскладки)  
**LAYER:** 3 · **SIZE:** M  
**PAGES:** `/studio/:id`  

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/layout/shell-tool-rail.service.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts` (+ html/css/specs) — рендер menu/popover ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (setTools) ;  
`studio-editor-chrome-ia.spec.ts` и shell specs

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** audit 2026-09-12; `studio-editor.page.ts` setTools right: 5 lifecycle + 5 panels; `ShellToolRailItem` flat only
- **Key Constraints:** A4 no reflow; left Данные/Выбрано без изменений; panel flyouts сохранить
- **Planned Deliverable:** group API + Document menu + studio registration
- **Validation Path:** chrome-ia specs; shell specs; nx build

---

## РЕШЕНИЕ (PO)

Rail = **категории**. Кликнул категорию → открылось меню/панель с **несколькими** действиями.  
Не держать 5 отдельных lifecycle-иконок в столбе.

### Целевой правый rail (студия)

1. **Документ** (одно место) → popover/меню:  
   - Редактор  
   - Просмотр  
   - Сохранить  
   - Скачать PDF  
   - В архив  
2. **Элементы** · **Слои** · **Страницы** · **Свойства** · **Шаблон** — как сейчас (открывают flyout).

Active: при открытом меню «Документ» и/или когда выбран режим — категория подсвечена; пункты Редактор/Просмотр отражают `viewMode`.

## ЧТО ДЕЛАТЬ

1. Расширить `ShellToolRailItem` (или добавить `ShellToolRailGroup`): `kind: 'action' | 'menu'`, `items?: { id, label, icon?, active?, disabled?, onClick }[]`.  
2. `AppShell` / chrome-rail: клик по menu-item → popover рядом с rail (не раздувать 64px колонку списком). Закрытие: outside / Escape / выбор пункта.  
3. Studio `setTools`: убрать 5 flat lifecycle; одна группа «Документ».  
4. Specs: right rail ids = `document` + panels; menu содержит 5 actions; mode switch через menu. Обновить chrome-ia spec.  
5. Docs: page.md / audit closeout — C3 раскладка обновлена PO-sweep-07.

## НЕ ИЗМЕНЯТЬ

Левый rail; логику save/pdf/archive; A4 geometry; другие страницы rails без явной нужды (API generic — ok если не ломает).

## КРИТЕРИИ ПРИЁМКИ

1. В студии справа **нет** пяти отдельных lifecycle-иконок подряд.  
2. Одна кнопка «Документ» открывает меню ≥2 пунктов с save/preview/pdf/archive/editor.  
3. Панельные категории по-прежнему открывают flyout.  
4. Specs + `nx build kppdf-web` green.
