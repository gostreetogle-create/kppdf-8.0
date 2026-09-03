# TZ-NX-DOCSTUDIO-S11-SELECT-LABELS: PiSelect показывает выбранное

**РОЛЬ АГЕНТА:** Executor (frontend-nx kit)  
**LAYER:** 2  
**PAGES:** document-studio (+ все PiSelect consumers)  
**ЗАВИСИМОСТИ:** S10 DONE (`87329b37`)  
**CONFLICT KEYS:** `frontend-nx/libs/ui/paper-and-ink/src/lib/select/`; `studio-data-panel.component.spec.ts`

## Domain preflight

Проверено: **блокер TZ1 (2026-09-01)** — `@if (open())` вокруг listbox уничтожает `<app-pi-select-option>` когда select закрыт → `viewChildren(SelectOptionComponent)` пуст → fallback `selectedLabel()` не может прочитать текст опции. Это не баг projection в trigger; это **conditional destroy options**.

## ИСХОДНОЕ

- Trigger: slot `[selected-label]` optional; без slot — пусто.
- `select.component.spec.ts` уже добавлен тест «shows selected option label in trigger» — **должен PASS** после fix.

## ЧТО ДЕЛАТЬ (канон fix — без archive пока тест красный)

### Шаг 1 — options всегда в DOM

1. Убрать `@if (open())` вокруг listbox.
2. Listbox всегда рендерится, закрытое состояние: `[hidden]="!open()"` (или `class="hidden"`), `aria-hidden`/`inert` по необходимости.
3. Обновить существующие spec-тесты: вместо `listbox() === null` → `listbox()!.hidden === true` (или эквивалент).

### Шаг 2 — label registry (dynamic @for options)

1. `SelectParent`: `registerOption(value, label)` / `unregisterOption(value)`.
2. `SelectOptionComponent`: `label = input<string>('')`; в `ngAfterViewInit` register `label() || hostText()`; `ngOnDestroy` unregister.
3. `SelectComponent.selectedLabel` computed: `value` → map lookup → иначе `placeholder()`.
4. Trigger: `@if (!hasSelectedLabelSlot()) { {{ selectedLabel() }} }` + optional slot override.

### Шаг 3 — gates

1. `cd frontend-nx && pnpm exec nx test paper-and-ink --testPathPattern=select` exit 0.
2. `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 **last**.

## НЕ ДЕЛАТЬ

- Archive с known_limitation «projection broken» — **STOP**, не archive.
- Переписывать studio на `pi-overflow-select` в этой TZ.

## КРИТЕРИИ ПРИЁМКИ

1. Trigger closed + `formControl value='admin'` → текст содержит `Admin`.
2. После выбора Manager → trigger содержит `Manager`.
3. Dynamic options (studio counterparties @for) — label обновляется после load.
4. Все select specs PASS; build PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S11-SELECT-LABELS.done.md`  
→ сразу TZ2 без паузы.
