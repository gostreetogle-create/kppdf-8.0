# TZ-NX-PO-SWEEP-01: product form — Save молчит при invalid (фото «не сохраняются»)

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** WAVE `docs/agent-checklists/WAVE-NX-PO-SWEEP-2026-09-12.md` #01  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/registries` product dialog  
**PAGE_DOCS:** `docs/pages/registries.page.md` (если есть)  

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.spec.ts` ;  
опционально shared helper toast/scroll invalid (если уже есть в kit — reuse)

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** `product-form-dialog.component.ts` `onSubmit` L271–275; PO screenshot (empty unit+category, photo dirty, dirty-close works)
- **Key Constraints:** Mode A diagnosis done; silent `return` на invalid; dirty ≠ valid
- **Planned Deliverable:** toast + подсветка/фокус первого invalid; тест
- **Validation Path:** unit test invalid submit; nx build last

**Проверено:** `if (this.form.invalid) { markAllAsTouched(); return; }` — без toast/errorMessage/scroll. Фото через `markAsDirty()` → «Закрыть без сохранения» ок. На скрине пустые обязательные **Единица** и **Категория**.

---

## ИСХОДНОЕ СОСТОЯНИЕ

PO: добавил фото в «Редактировать изделие» → «Сохранить» — ноль реакции, даже console. Dirty-close видит изменения.

## ЧТО ДЕЛАТЬ

1. При `form.invalid` на Save: не молчать.
   - Toast (существующий Pi toast/snack pattern проекта) с текстом вроде «Заполните обязательные поля» + перечислить пустые (Единица / Категория / …) **или** один общий + фокус.
   - `markAllAsTouched()` оставить.
   - `scrollIntoView` / focus первого invalid control (unit или category).
2. Убедиться, что `app-pi-form-field` / select показывают ошибку после touched (если сейчас не видно — минимальный error hint у required selects).
3. Spec: submit при пустых unit+category → **не** зовёт `productsService.update/create`; есть toast или `errorMessage` / data-test alert.
4. Не менять правило: фото пишутся на entity только вместе с успешным Save паспорта (уже так).

## НЕ ИЗМЕНЯТЬ

BE; orphan uploads cleanup; composition; module/material dialogs **в этом TZ** (если тот же silent pattern — backlog note в WAVE, не scope creep).

## КРИТЕРИИ ПРИЁМКИ

1. Invalid Save → оператор видит явную обратную связь (toast и/или inline + focus), не «кнопка мёртвая».  
2. Valid form + фото → Save закрывает/сохраняет как раньше.  
3. Specs green; `nx build kppdf-web` last.
