# TZ-NX-SHELL-01-IDLE-RAILS: убрать мёртвые L/R rails на страницах без tools

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** нет  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** shell (все ERP list routes без setTools) ; `/production` ; `/studio/:id` (регрессия)  
**PAGE_DOCS:** `page-chrome.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/shell-tool-rail.service.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/tool-rail-definitions.ts` ;  
`docs/pages/page-chrome.md` ;  
`docs/agent-checklists/WAVE-NX-SHELL-HUB-POLISH.md` ;  
`docs/agent-checklists/SHELL-HUB-POLISH-CHECKLIST.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

### Preflight Check Output
- **Context read:** PO скрин `/counterparties` (красные X на L/R); `shell-tool-rail.service.ts` DEFAULT_LEFT/RIGHT = disabled «скоро»; `app-shell.component.ts` всегда 3-колоночный grid; `page-chrome.md` § page tools
- **Key Constraints:** Мёртвые placeholder tools запрещены. History ←→ не терять. Production/studio rails с `setTools` сохранить.
- **Planned Deliverable:** idle pages = full-width content; tools pages = rails as today
- **Validation Path:** app-shell specs + production/studio smoke specs + nx build last

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. `ShellToolRailService` при `owner: null` отдаёт `DEFAULT_LEFT` / `DEFAULT_RIGHT` — disabled иконки «Фильтры (скоро)», «Вид…», «Поиск…» и т.д. (`tool-rail-definitions.ts`).
2. `app-shell` всегда `grid-template-columns: rail | main | rail` → на `/counterparties`, `/supply`, … видны пустые «менюшки».
3. PO 2026-09-10: не нужны неиспользуемые L/R меню на странице.

Проверено: Гант/студия зовут `setTools` — их rails живые.

## ЧТО ДЕЛАТЬ

1. **Убрать fallback placeholders:** default state = `{ owner: null, left: [], right: [] }`. `clear(owner)` → empty, не DEFAULT_*.
2. **Рендер rails:** показывать `aside.shell-rail-left/right` **только** если на этой стороне `tools.length > 0` (реальные tools от страницы). Иначе aside не в DOM / `hidden`.
3. **Grid:** если оба side пусты → `grid-template-columns: minmax(0,1fr)` (контент на всю ширину). Если только left или только right — две колонки (`rail | main` или `main | rail`).
4. **History ←→:** перенести в **header** (рядом с theme/notifications), всегда доступны (`shell-nav-back` / `shell-nav-forward` data-test сохранить или добавить header-варианты + обновить specs). Не дублировать ←→ в пустом rail.
5. Когда страница `setTools` (production, studio) — rails как сейчас: history можно **оставить сверху rail** *или* только в header (один SoT — **предпочтительно header-only**, чтобы не плодить две пары ←→). Выбрать header-only.
6. Specs: idle shell = нет `shell-rail-left/right` или width 0 / not rendered; header back/forward работают; production setTools → rails видны с tools; clear → rails исчезают.
7. `page-chrome.md` — обновить канон: нет disabled demo tools; rails только при page-tools; history в header.
8. Checklist/WAVE sync.

## НЕ ИЗМЕНЯТЬ

- Логику Ганта/студии flyouts (только регрессия rails)
- BE, wipe, deploy
- Invent новых page-tools на list pages «заодно»

## Сбои

1. Ушли со студии → clear → placeholders снова (сейчас баг) — после FIX должны исчезнуть rails.
2. Back disabled на первом URL — кнопка в header disabled, не «пустой rail».
3. Узкий viewport — header ←→ не ломают top-nav (shrink ok).

## КРИТЕРИИ ПРИЁМКИ

1. На `/counterparties` и `/supply` нет L/R колонок с disabled «скоро»-иконками.
2. `/production` и studio editor с tools — rails с рабочими иконками.
3. ←→ в header работают.
4. Gates:

```text
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=app-shell|shell-tool|production-cockpit|studio-editor-chrome
cd frontend-nx && pnpm exec nx build kppdf-web
```

## BUILD INTEGRITY

Baseline + build last. Sequential vs stage 02.

## Archive

`tasks/_archive/2026-09/` + Executor report SHA.
