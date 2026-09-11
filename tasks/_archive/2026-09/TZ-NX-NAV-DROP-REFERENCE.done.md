# TZ-NX-NAV-DROP-REFERENCE: убрать вкладку «Справ.»

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-REG-TEXT-BLOCK-CATEGORIES` DONE  
**LAYER:** 3 · **SIZE:** M  
**PAGES:** shell nav  
**PAGE_DOCS:** `text-block-categories.page.md` ; DOMAIN-MAP/PAGE-TZ-INDEX touch if listed

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/app-shell-constructor-nav.spec.ts` (если reference) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/permission-labels.ru.ts` (только если мёртвые labels чистим — optional) ;  
`docs/DOMAIN-MAP.md` (NX nav row) ;  
`docs/pages/text-block-categories.page.md` ;  
`docs/agent-checklists/WAVE-NX-DROP-REFERENCE-NAV.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight
- `filterNavCategories` сейчас показывает `reference` только из-за live text-block-categories.
- После TZ-01 этот route уходит из dictionaries — вкладка станет пустой **или** всё ещё укажет на мёртвые paths. Удалить группу целиком.

## ЧТО ДЕЛАТЬ

1. Удалить блок `id: 'reference'` из `NAV_CATEGORIES` (все stubs + text-block-categories item).
2. Обновить specs: chip `shell-quicknav-reference` **отсутствует**; counts 8→7 (или актуальное).
3. Почистить `activeAliases`/order comments; studio hint «Справочники → Виды таблиц» если врёт — поправить на реестры.
4. Docs: нет top-nav «Справ.»; категории текстов только в реестрах.
5. WAVE row 02 COMPLETE.

## НЕ

- Удалять pageKey/RBAC seed `text-block-categories` (capability может остаться на route registries)
- Трогать группу «Справочники» **внутри** `/registries` (units/categories catalog)

## AC

1. В header нет «Справ.» / «Справочники».
2. Категории текстов доступны только через Реестры.
3. Нет dead nav items на `/dictionaries/*` в UI.
4. Gates + shell specs PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T13:25:00Z — WAVE-NX-DROP-REFERENCE-NAV COMPLETE, see docs/agent-checklists/TZ-NX-NAV-DROP-REFERENCE.md for SHA
