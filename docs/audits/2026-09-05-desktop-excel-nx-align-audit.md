# Аудит: Desktop Excel Form Studio ↔ NX-реестры

date: 2026-09-05  
author: Cursor (Mode A)  
peer: Claude Code review (принят)  
trigger: PO — массовый Excel через Desktop; сверка с NX; без Excel-кнопок в `/registries`

### Preflight Check Output
- **Context read:** `desktop/src/core/import-targets.ts`, `excel-form-template.ts`, `multi-import.ts`, `App.svelte`; `frontend-nx/.../registries.catalog.ts`; `pi-units.service.ts`; `warehouse.schema.ts`; `worker.controller.ts` / `create-worker.dto.ts`; `WAVE-DESKTOP-EXCEL-FORMS.md`; `PO-CANON.md`; `registries.page.md`
- **Key Constraints:** Mode A; Excel = Desktop HITL; Units OUT; warehouse.type совпадает; TZD-68+
- **Planned Deliverable:** WAVE `WAVE-DESKTOP-EXCEL-NX-ALIGN` (TZD-68…73)
- **Validation Path:** desktop `npx tsx --test`; smoke Form Studio

---

## 1. Для PO

На Desktop уже есть: **скачать пустую форму → заполнить → загрузить → проверка → записать**.  
Не хватает главного: **скачать Excel с текущими данными реестра**.  
Кнопок Excel в веб-реестрах NX **не делаем** (канон).

---

## 2. PO-wish × Desktop

| Wish | Статус | TZ |
|------|--------|-----|
| Пустой шаблон | Есть (`buildFormWorkbook` скелет) | — |
| Импорт + типы/обязательные/дубли | Есть (`validateTableRows`) | — |
| «Зелёный = можно лить» | Частично: чипы ok; кнопка `disabled` только при `sendableRowsCount===0`, **не** при наличии `invalid` | TZD-70 |
| Запись SoT | material → journal; остальные → `createEntities` | — |
| Export с данными | **Нет** | TZD-68 |

---

## 3. Allowlist Desktop vs NX registries

| Desktop `ImportTargetKey` | NX реестр | Вердикт |
|---------------------------|-----------|---------|
| material / product / module | да | Align колонок в TZD-69 (только `desktop/src`) |
| counterparty | не отдельный реестр (через заказы) | Оставить Excel; не путать с Organization |
| warehouse | WAVE warehouse / schema | **type enum совпадает** — не трогать type |
| workType | да (Гант) | Align + export пилот |
| colorReference / category | вне/частично NX registries | Оставить |
| supplyRequest / supplyTask | supply-requests | Оставить |
| — | **workers** | **Добавить** target в TZD-69 (`POST /workers` + NX create готовы) |
| — | **units** | **OUT** — NX read-slice осознанный (`TZ-NX-REGISTRY-UNITS-READ-SLICE`) |
| — | vat-rate, formulas, passports, text-blocks, table-templates | Вне волны |

### Снятые ложные тревоги (peer Claude)

- `warehouse.type` — schema NX обязателен `main|branch|transit|production|other` = Desktop. PO-CANON «без типов» = UX-формулировка про ячейки/лишнюю таксономию для оператора; **не** повод убирать поле из Excel.
- Люди — не ждать «аудит API»; write-path живой.

---

## 4. Worker Excel (черновик колонок для TZD-69)

Required: `lastName`, `firstName`  
Optional: `patronymic`, `position`, `department`, `email`, `phone`, `grade`, `ratePerHour`, `isActive`  
`workTypeIds`: V1 = **имена видов работ через `;`**, resolve по name в org (как UX Ганта); битое имя → `invalid`  
Dedupe: `email` если непуст; иначе `lastName+firstName+patronymic` casefold (файл + каталог)

---

## 5. NOT-IN-SCOPE

- Excel кнопки в `frontend-nx/**/registries/**`
- Units mass-write
- Паспорта / CAD BOM / Sheets / orders-KP bulk
- Менять schema warehouse / units NX create

---

## 6. `_active` gate

Сейчас: `tasks/_active/TZ-NX-WAREHOUSE-W1-SHELL.md`.  
Аудиты/спеки — ок. **Claim кода TZD-68+** — после archive W1 или явного «параллель ок» PO (keys не пересекаются: `desktop/**` vs warehouse NX).
