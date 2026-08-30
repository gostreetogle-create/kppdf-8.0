# TZ-NX-DOCSTUDIO-S7-RAILS-DATA — rail «Данные» в NX студии

**РОЛЬ:** executor · **ЗАВИСИМОСТИ:** S7-WIP-CLOSEOUT DONE  
**LAYER:** `studio/**` + data-access если нужно  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `studio-editor.page.ts`; `studio-workspace-chrome.ts`; новый `studio-data-panel.component.ts`

**PAGE_DOCS:** `docs/pages/document-studio.page.md` § Rails; `docs/architecture/document-studio-data-anchors.md`

## ЧТО ДЕЛАТЬ

1. Добавить rail **«Данные»** (4-й пункт слева) в `STUDIO_RAIL_ITEMS`.
2. Панель: issuer org, counterparty, привязка **КП/заказ** (live ERP) — по legacy `document-studio.page.md` и `frontend/src` аналогам.
3. `putDataSet` / чтение через существующие `PiStudioDocumentsService` API.
4. Краткая сводка в панели (не полные графики).

## КРИТЕРИИ

- [ ] Rail переключается, панель не ломает геометрию A4
- [ ] Привязка КП сохраняется и переживает F5
- [ ] Gates studio + build green

## НЕ ДЕЛАТЬ

- Rail «Шаблон» (S7-2)
