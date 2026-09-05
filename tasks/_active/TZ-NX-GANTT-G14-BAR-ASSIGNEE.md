# TZ-NX-GANTT-G14-BAR-ASSIGNEE: выбрать исполнителей в панели вида работ

**РОЛЬ:** Executor (backend + frontend-nx)
**LAYER:** 3
**PAGES:** production
**ЗАВИСИМОСТИ:** G13 желателен; audit assignment
**CONFLICT KEYS:** `backend/.../order.schema.ts` (+ dto/service/controller); `production-read.facade.ts`; `gantt-bars.component.ts` work-detail; order service specs; IMPLICIT `nx build kppdf-web` + backend gates

> **Scope note (2026-09-05, PO prompt):** сейчас в работе только **G14-BE**
> (schema + PATCH + tests, backend-only conflict keys). G14-FE — после
> подтверждения, что `production/**` свободен от Freebuff (см.
> `docs/agent-checklists/WAVE-NX-GANTT-ASSIGN.md`).

## ИСХОДНОЕ

`workerLabel` на баре = join людей с `Worker.workTypeIds` ⊇ этот WT — **навык**, не поручение на заказ.
PO: в фиолетовой панели — список, выбрать кому дать **эту** сварку.

## Модель (канон)

Новое на Order (зеркало estimate overrides):

`estimateWorkerOverrides[]`: `{ orderItemIndex, moduleId, workTypeId, workerIds: ObjectId[] }`

- Пустой / нет строки → на Ганте для планирования показывать **«Не назначен»** (не подставлять автоматически всех «умеющих»).
- Список кандидатов в UI = активные workers, у кого в skills есть этот `workTypeId` (и опционально все workers — default: **только с навыком**, + пункт «показать всех»).
- PATCH endpoint рядом с estimate-days/start; org-scope через `assertOrgAccess`.
- Facade: label бара = имена из override, иначе «Не назначен».

## ЧТО ДЕЛАТЬ

1. Schema + DTO + service PATCH + tests (cross-org).
2. UI в work-detail: multi-select / chips вместо plain «Люди: …»; Save → PATCH; refresh bars.
3. «По рабочим» группирует по новому label (override).
4. Docs: page.md — навык vs поручение.
5. Gates BE + NX build.

## НЕ

Drag между рабочими. Auto-assign. Чип на свёрнутой строке. Менять смысл `Worker.workTypeIds`.

## AC

1. На заказе A назначил Петрова на сварку → на заказе B сварка без override остаётся «Не назначен» (не копируется навык как поручение).
2. Смена в панели видна на баре и в «По рабочим» после обновления.
3. Gates PASS.

## Archive

`tasks/_archive/2026-09/TZ-NX-GANTT-G14-BAR-ASSIGNEE.done.md`
