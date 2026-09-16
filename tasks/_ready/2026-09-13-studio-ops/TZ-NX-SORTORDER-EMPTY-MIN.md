# TZ-NX-SORTORDER-EMPTY-MIN: `sortOrder: Значение слишком мало` на пустом «Порядок»

> **SIZE:** S · **PACK:** successor studio-ops  
> **РОЛЬ:** Freebuff / Claude  
> **LAYER:** 3  
> **PO symptom:** при Save видит `sortOrder: Значение слишком мало` (RU из `http-exception.filter` ← class-validator `@Min`).

**CONFLICT KEYS:**  
(уточнить в ШАГ 0; вероятные)  
`frontend-nx/libs/ui/paper-and-ink/src/lib/input/input.component.ts` (только если нужен number CVA — предпочтительно **не** трогать глобально);  
формы с полем «Порядок»/`sortOrder` + их payload builders;  
BE DTO с `@Min(0)` / `@Min(1)` на `sortOrder` (table-template, unit, role, document-table-type, quotation lines, composition-line, …).

**PAGES:** форма, где PO поймал ошибку (часто: модуль «Порядок», вид таблицы «Порядок», единица «Порядок»)  
**PAGE_DOCS:** по факту шага 0

---

## Domain preflight

- **Канон текста:** `backend/src/common/filters/http-exception.filter.ts` — `min: 'Значение слишком мало'`.
- **Механика:** `app-pi-input` CVA всегда отдаёт **string**. Пустое числовое поле = `""`. `Number("")===0`, но `Number(" ")` / битый ввод / отсутствие `Number()` в payload → **NaN**. У `@Min(n)` NaN **не проходит** (`NaN >= n` = false) → именно это сообщение. Пустой optional + `@IsOptional()` **не** срабатывает на `""` (это не null/undefined).
- **Проверено:** `CreateProductModuleDto.sortOrder` — `@Type(Number)+@IsNumber` **без** `@Min` (пустой → 0 обычно ок). `CreateTableTemplateDto` / `CreateUnitDto` / composition — `@Min(0)` (+ unit `@IsInt`). Table template FE шлёт `sortOrder: v.sortOrder` **без** `Number()` (`table-template-form-dialog` + `doc-studio-payloads.ts`).
- **Necessity:** да — пустой «Порядок» = «по умолчанию», не ошибка оператора.

## ЧТО ДЕЛАТЬ

**ШАГ 0 — Evidence.** Network на failing Save: URL + body `sortOrder` (сырое значение) + полный message. Зафиксировать форму. Не гадать.

**ШАГ 1 — FE payload (главный fix).**  
Для затронутой формы(форм): optional `sortOrder` в JSON только если `Number.isFinite(n)`; иначе **omit** или явный `0` (если продукт хочет 0). То же для вложенных `workTypes[].sortOrder`. Не слать `""` / `NaN`.

**ШАГ 2 — BE belt.**  
На DTO с `@Min` на optional `sortOrder`: `@Transform` `'' | null | NaN → undefined` **до** validators (чтобы `@IsOptional` сработал). Не менять смысл Min для реальных отрицательных чисел (отриц. по-прежнему 400, но RU яснее: «Порядок не может быть меньше 0» — опционально).

**ШАГ 3 — Specs.**  
Пустой «Порядок» → 201/200; `sortOrder: -1` → 400; не регресс create с явным 0.

## НЕ

Глобальный rewrite всех number inputs без нужды; wipe; менять `@Min` на сортировку в меньшую сторону «чтобы прошло» (скрыть баг).

## ACCEPT

1. Evidence: какой endpoint + былое сырое значение.  
2. Пустой «Порядок» сохраняет сущность без этой ошибки.  
3. Specs FE payload и/или BE DTO.  
4. Gates зоны.

## known_limitation

Один TZ может закрыть 1–2 горячих формы из шага 0; остальные с тем же паттерном — backlog note в отчёте, не раздувать scope без факта.
