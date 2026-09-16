# TZ-NX-DOCSTUDIO-TABLE-KIND-IA: «Вид таблицы» понятен оператору

> **SIZE:** S · **PACK:** `tasks/_ready/2026-09-13-studio-ops/`  
> **РОЛЬ:** Freebuff  
> **LAYER:** 3  
> **ЗАВИСИМОСТИ:** желательно после/с `TZ-NX-DOCSTUDIO-INSERT-APPLY-KIND` (можно первым — только copy)

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.spec.ts; docs/pages/document-studio.page.md`

**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`  
**AUDIT:** `docs/audits/2026-09-13-studio-table-kind-vs-source.md`

IMPLICIT CONFLICT: nx build kppdf-web

---

## Domain preflight

- **Вид таблицы** = пресет колонок (`TableTemplate` из реестра), не источник строк.  
- **Источник строк** = manual/КП/заказ/catalog-*.  
- **Проверено:** select «Вид таблицы» + отдельно «Источник строк»; Insert не трогает вид (см. audit).

## ЧТО ДЕЛАТЬ

1. Переименовать/уточнить label: **«Макет колонок»** (или «Вид (макет колонок)»); под select одна строка hint: «Пресет из Реестры → Виды таблиц. Не путать с источником строк ниже.»
2. Блок **Источник строк** — выше или сразу под видом с явным eyebrow «Откуда строки». Порядок: Источник → Вид (макет) → структура/колонки — чтобы поток «сначала данные, потом как выглядят» или наоборот единообразно с audit: **Источник → Вид → Колонки** (рекомендация audit: источник важнее для Insert-сценария).
3. Если `tableTemplateId` пуст, а `dataSource` catalog-* — hint: «Макет не выбран — колонки сейчас служебные; выберите вид или сохраните свой.»
4. Ссылка на реестр видов — оставить/усилить (уже есть).
5. page.md: 5–8 строк «Вид vs Источник vs Insert». Spec: labels/hints в DOM.

## НЕ

Менять resolve/API template; не удалять вид как сущность; width apply — другой TZ.

## ACCEPT

1. PO по подписям понимает: вид ≠ источник.  
2. Пустой вид при catalog source — виден hint.  
3. Spec + nx build.
