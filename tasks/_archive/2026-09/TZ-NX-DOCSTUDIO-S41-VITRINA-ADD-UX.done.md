# TZ-NX-DOCSTUDIO-S41-VITRINA-ADD-UX: витрина как витрина магазина — без гонок 409

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`  
**ЗАВИСИМОСТИ:** S27–S29 (витрина + hydrate); не блокируется S37B  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (`onCatalogSelectionChange` / `patchDocumentContext` / очередь записи); при необходимости локальные styles host витрины  
**IMPLICIT CONFLICT:** `nx build kppdf-web`

Проверено: `studio-data-vitrina.component.ts` (toggle на click карточки, `size="md"`); `studio-editor.page.ts` L1540–1569 (`patchDocumentContext` + параллельный `putDataSet` с одной `expectedRevision` → 409); `pi-showcase-card` sizes `sm|md|lg`.

Loose wording → канон: «иконки товаров» = карточки витрины `PiShowcaseCard` в панели Данные (products/modules/parts/materials), не chrome-rail.

## Domain preflight

- Клиент сделки = Counterparty (не трогать в этом TZ).  
- Выбор витрины = **множество id** в `context.catalogSelections` + hydrate строк таблицы (1 строка / выбранный id, qty из resolver).  
- **Не** вводить «клик = +1 qty той же SKU» без отдельного PO — стандарт здесь: добавить/убрать позицию в набор для документа.

## ИСХОДНОЕ (боль)

1. Клик по карточке = `toggle(id)` → сразу PATCH context + PUT data-set **параллельно** со старой revision → **409** и диалог «Документ изменён в другом месте».  
2. Оператор не должен «аккуратно кликать»; сейчас поведение хрупкое.  
3. Карточки `size="md"` слишком крупные — в панели мало позиций видно.

## Сбои оператора (≥3)

1. Быстро ткнул 3 изделия → cascade 409, строки не все попали.  
2. Не понял, добавилось или нет (нет явной кнопки Добавить/Убрать).  
3. После «Перезагрузить» потерял локальный выбор / путаница.  
4. Ищет товар скроллом — огромные карточки.

## ЧТО ДЕЛАТЬ

### A. UX выбора (магазинный паттерн)

1. Убрать «голый» click-по-карточке как единственный write-trigger.  
2. На карточке витрины:  
   - не выбрано → явная кнопка **«Добавить»** (data-test);  
   - выбрано → badge «Выбрано» + **«Убрать»**.  
3. Клик по медиа/названию **не** пишет на сервер сам (или только фокус/preview) — write только через Добавить/Убрать.  
4. Мультивыбор: N разных id → N позиций в selection и в таблице после успешного sync. Spam-клики по **разным** карточкам — все должны доехать без диалога conflict.  
5. Повтор «Добавить» на уже выбранном — no-op (или коротко disabled), не 409. «Убрать» снимает id.

### B. Запись без гонки (обязательно)

1. **Одна очередь** на document writes из витрины:  
   - сначала `documents.update` (context/catalogSelections) с `expectedRevision`;  
   - дождаться ok → взять **новую** `revision` из response;  
   - затем `putDataSet` с этой revision;  
   - обновить `document` signal после каждого шага.  
2. Пока очередь занята: disable кнопок Добавить/Убрать (или spinner на витрине), чтобы не копить stale revision.  
3. 409 от чужой вкладки — оставить conflict dialog; **не** показывать conflict на собственной гонке одного клика (её не должно быть).  
4. `sync-quotation` после context: не валить UX витрины; ошибки sync — toast, не conflict-dialog (если сейчас так — поправить).

### C. Размер карточек

1. В студийной витрине перейти на `size="sm"` **или** host CSS, чтобы визуально **≈½** текущих md по ширине и высоте медиа (больше карточек в viewport).  
2. Не ломать `PiShowcaseCard` md/lg на реестрах/каталоге вне studio data panel.  
3. Сетка: при sm допустимо 2 колонки плотнее / при необходимости 3 — на усмотрение, главное читаемость названия.

### D. Gates / evidence

1. Focused spec: очередь — два быстрых add подряд не зовут `conflict()` (mock HTTP).  
2. `cd frontend-nx && pnpm exec nx build kppdf-web` — **последним**.

## НЕ ИЗМЕНЯТЬ

- Backend hydrate/resolver (S28), Preview HTML (S31), Save (S30).  
- Глобальные размеры showcase на `/registries` без нужды.  
- Qty++ по повторному Add той же SKU (отдельный TZ, если PO захочет).

## КРИТЕРИИ ПРИЁМКИ

1. Добавил 3 изделия подряд быстро → 3 строки в Просмотре/после sync, **без** диалога «изменён в другом месте».  
2. Убрать одно → осталось 2; кнопки Добавить/Убрать однозначны.  
3. Network: PATCH context и PUT data-set **последовательны**; второй несёт revision после первого.  
4. Карточки заметно меньше (sm / ~½ md), в панели видно больше позиций.  
5. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S41-VITRINA-ADD-UX.done.md`  
Checklist → `docs/agent-checklists/TZ-NX-DOCSTUDIO-S41-VITRINA-ADD-UX.md`

## Claim slot
- agent_id: claude
- claimed_at: 2026-09-04T19:28:15Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

### Preflight Check Output
- **Context read:** `tasks/_ready/TZ-NX-DOCSTUDIO-S41-VITRINA-ADD-UX.md`, `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.ts`, `docs/agent-checklists/_NOW.md`
- **Key Constraints:** conflict keys = studio-data-vitrina.component.ts + studio-editor.page.ts (onCatalogSelectionChange/patchDocumentContext/write queue); do not touch backend resolver/Preview HTML/Save; do not touch counterparty/S37B; PiShowcaseCard md/lg elsewhere must stay intact
- **Planned Deliverable:** explicit Add/Remove buttons on vitrina cards (no bare-click write) → single sequential write queue (context PATCH → new revision → putDataSet) with buttons disabled while busy → sm card size scoped to studio only → focused spec proving rapid double-add doesn't trigger conflict() → nx build kppdf-web LAST
- **Validation Path:** FIC N/A (UI behavior change, no new page/permission/module) + Integrity = AC1-5 + focused spec PASS + build gate PASS

## Что сделано (см. полный отчёт `docs/agent-checklists/TZ-NX-DOCSTUDIO-S41-VITRINA-ADD-UX.md`)

Root cause: `onCatalogSelectionChange` слал PATCH context и цикл `putDataSet` **параллельно**
против ревизии, снятой ДО того как PATCH успел вернуться — отсюда cascade 409 на быстрых
кликах. Фикс: единая serialized write chain (`catalogWriteChain`) в `studio-editor.page.ts` —
PATCH context → await новую ревизию → `putDataSet` с этой ревизией. Витрина
(`studio-data-vitrina.component.ts`): explicit «Добавить»/«Убрать» кнопки вместо
click-по-карточке, `size="sm"` + 1 колонка (панель 272px — 2/3 колонки обрезали бы
названия). `busy` — DOM-affordance (disable кнопок), не гейт очереди (иначе быстрые клики
по разным карточкам молча терялись бы вместо «все долетают»). `sync-quotation` уже был
toast-only на ошибке — фикс не понадобился.

Новый focused-тест `studio-editor-catalog-queue.spec.ts`: два быстрых add подряд без await
между ними → `conflict()`/dialog.open не вызван; revision-цепочка верна
(update rev1→put rev2→update rev3→put rev4); отдельный тест — реальный 409 от мока
по-прежнему открывает conflict dialog.

## Gates (факт)

```
cd frontend-nx && pnpm exec jest apps/kppdf-web/src/app/pages/studio
→ PASS, 12 suites / 58 tests

cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
→ PASS, exit 0

cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.spec.json --noEmit
→ FAIL (baseline, pre-existing — ~40 errors in unrelated spec files; none in touched files)

cd frontend-nx && pnpm exec nx lint kppdf-web
→ FAIL (baseline, pre-existing — identical 95 problems / 21 errors / 74 warnings as the
  S37B session baseline; zero new occurrences in files touched by this TZ)

cd frontend-nx && pnpm exec nx build kppdf-web
→ PASS, exit 0 (LAST command, warnings only — pre-existing CSS budget / NG8102, none new)
```

## Финализация

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: Claude
verification:
  - acceptance criteria: PASS (AC1-5: rapid multi-add no conflict; remove works; PATCH→PUT sequential with chained revision; cards visibly smaller; build PASS)
  - typecheck: PASS (app); spec tsconfig FAIL is pre-existing baseline noise, not from this TZ's files
  - tests: PASS (studio suite incl. new focused write-queue spec)
  - lint: FAIL (pre-existing baseline, unchanged problem count, zero new issues in touched files)
  - checklist: ADDED (`docs/agent-checklists/TZ-NX-DOCSTUDIO-S41-VITRINA-ADD-UX.md`)
  - progress.md: N/A (no architecture change)
  - status synchronization: PASS
