# TZ-NX-DOCSTUDIO-S41-VITRINA-ADD-UX checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S41-VITRINA-ADD-UX.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-04T19:28:15Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] `git status`/`branch` → main, `D:\kppdf-8.0`, `tasks/_active/` пуст перед claim
- [x] TZ прочитан: `tasks/_ready/TZ-NX-DOCSTUDIO-S41-VITRINA-ADD-UX.md`
- [x] Прочитаны conflict-key файлы до правки: `studio-data-vitrina.component.ts`, `studio-editor.page.ts` (`onCatalogSelectionChange`/`patchDocumentContext`), `studio-data-panel.component.ts`, `pi-showcase-card.component.ts` (для `size="sm"` API)
- [x] Claim slot заполнен

## Root cause (до фикса)

`onCatalogSelectionChange` слал PATCH `context` (`patchDocumentContext`, fire-and-forget
async) и **сразу же**, синхронно в том же вызове, цикл `putDataSet` по таблицам с
`expectedRevision = this.document()?.revision ?? doc.revision ?? 1` — то есть **старой**
ревизией, снятой ДО того как PATCH context успел вернуться и обновить `document()`.
Быстрый клик по второй/третьей карточке плодил ещё один такой же параллельный PATCH+PUT
на той же устаревшей ревизии → 409 → диалог «Документ изменён в другом месте». Это в
точности совпадает с болью TZ («Быстро ткнул 3 изделия → cascade 409»).

## Сделано

### A. UX выбора (`studio-data-vitrina.component.ts`)
- Убран `(click)` на карточке как write-триггер. Карточка `size="sm"` (компактная строка,
  40×40 медиа) без `interactive`/`arrow` — сама по себе больше не «выглядит кликабельной».
- Explicit-кнопки в `sc-actions-sm` слоте `PiShowcaseCard`: не выбрано → **«Добавить»**
  (`data-test="studio-data-vitrina-add"`); выбрано → бейдж **«Выбрано»**
  (`data-test="studio-data-vitrina-badge"`) + **«Убрать»**
  (`data-test="studio-data-vitrina-remove"`).
- `add()`/`remove()` — no-op при уже (не)выбранном id, обычная client-side проверка перед
  `catalogChange.emit(...)`; не блокируются локальным `busy()` — см. следующий пункт, почему.
- `busy` input прокинут в `[disabled]` обеих кнопок как DOM-affordance, но **не**
  перепроверяется внутри `add()/remove()`: очередь на стороне `studio-editor.page.ts`
  обязана принять клик, даже если он долетел до обработчика раньше, чем DOM отрисовал
  `disabled` — иначе «Spam-клики по разным карточкам — все должны доехать» превратился
  бы в «часть кликов молча теряется».

### B. Очередь записи (`studio-editor.page.ts`)
- `onCatalogSelectionChange` больше не шлёт PATCH+PUT параллельно. Каждый вызов
  добавляется в `catalogWriteChain` (приватный `Promise<void>`, mutex-подобная цепочка) —
  через `commitCatalogSelectionChange(kind, next, idsCount)`.
- `commitCatalogSelectionChange`: `await documents.update(...)` (PATCH context,
  `expectedRevision = this.document().revision`, читается **в момент фактического запуска**
  своего шага очереди, не в момент клика) → `this.document.set(...)` новой ревизией →
  цикл по таблицам, каждый `putDataSet` берёт `this.document()?.revision` **после**
  предыдущего успешного шага.
- `catalogWriteBusy` signal — `true` пока `catalogWritePending > 0`; прокинут
  `studio-editor.page.ts` → `[catalogWriteBusy]` на `pi-studio-data-panel` →
  `[busy]` на `pi-studio-data-vitrina` → `[disabled]` на кнопках.
- Реальный 409 (чужая вкладка) по-прежнему открывает conflict dialog (`this.conflict()`),
  как и раньше — просто теперь это возможно **только** от внешней гонки, не от своей.
- `sync-quotation` (`syncKpQuotationItems`) уже был toast-only на ошибке (не
  conflict-dialog) — проверено, фикс не понадобился, TZ п.B.4 закрыт без изменений.

### C. Размер карточек
- `size="sm"` вместо `size="md"` — компактная строка вместо крупной плитки; заметно
  меньше по высоте (56px min-height строки vs. полноценная md-плитка с 16:9 медиа).
- Сетка: **1 колонка**, не 2/3 как в TZ-формулировке «на усмотрение». Причина: панель
  «Данные» — overlay шириной 480px, контент внутри `max-width: 272px`
  (`docs/architecture/nx-doc-studio.md` § 5, «Панели — overlay»). В 272px 2 колонки
  sm-строк (media 40px + padding + текст) обрезали бы каждое название — TZ прямо
  требует «главное читаемость названия», что при этой ширине панели возможно только
  в 1 колонку. Задокументировано инлайн-комментарием в CSS.
- `PiShowcaseCard` (`libs/ui/paper-and-ink/src/lib/card/pi-showcase-card.component.ts`)
  **не менялся** — md/lg на `/registries` не затронуты.

### D. Gates / evidence
- Focused-спека `studio-editor-catalog-queue.spec.ts` (новый файл): два быстрых
  `onCatalogSelectionChange` подряд (без await между ними) → `dialog.open` (conflict)
  ни разу не вызван; `documents.update`/`putDataSet` вызваны по 2 раза каждый, ревизии
  идут строго по цепочке (`update#1: rev1 → put#1: rev2 → update#2: rev3 → put#2: rev4`);
  второй тест — настоящий 409 от мока (`update` вернул `ok:false`) всё ещё открывает
  conflict dialog (защита от регрессии в обратную сторону).
- `nx build kppdf-web` — LAST, PASS.

## НЕ ИЗМЕНЯЛОСЬ

- Backend hydrate/resolver (S28), Preview HTML (S31), Save (S30) — не тронуты.
- `PiShowcaseCard` глобально (md/lg, `/registries`) — не тронут.
- counterparty / S37B — не тронуто.

## Integrity slot

- [x] Тип изменения: UI behavior (page-level), без нового route/permission/module — FIC N/A
- [x] page.md / PAGE-TZ-INDEX — N/A (нет нового route)
- [x] SECTION-READINESS — N/A
- [x] Coupling map — N/A (внутренний рефакторинг записи в пределах studio editor)
- [x] Чужой WIP не в коммите; conflict keys (`studio-data-vitrina.component.ts`,
      `studio-editor.page.ts` write queue, `studio-data-panel.component.ts`) — единственные
      product-файлы в diff

## Gates (факт)

```
cd frontend-nx && pnpm exec jest apps/kppdf-web/src/app/pages/studio
→ PASS, 12 suites / 58 tests (incl. new studio-editor-catalog-queue.spec.ts)

cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
→ PASS, exit 0

cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.spec.json --noEmit
→ FAIL (baseline, pre-existing — ~40 errors across orders/proposals/registries/composition
  spec files unrelated to this TZ; none in studio-data-vitrina/studio-editor/new spec files;
  same category of pre-existing debt noted in S37B session)

cd frontend-nx && pnpm exec nx lint kppdf-web
→ FAIL (baseline, pre-existing — same 21 errors/74 warnings as S37B session baseline;
  studio-editor.page.ts's one error is at L225, untouched by this TZ's diff; no errors/
  warnings in studio-data-vitrina.component.ts, studio-data-panel.component.ts, or the
  new studio-editor-catalog-queue.spec.ts)

cd frontend-nx && pnpm exec nx build kppdf-web
→ PASS, exit 0 (LAST command; warnings only, same pre-existing CSS-budget/NG8102 set,
  studio-data-vitrina.component.ts not among them)
```

## Executor report

- Root cause confirmed and fixed: parallel PATCH context + PUT data-set racing on a
  revision snapshot taken before the PATCH resolved. Replaced with a single serialized
  write chain in `studio-editor.page.ts`.
- Vitrina UX: explicit Добавить/Убрать buttons replace bare-card-click; `size="sm"` +
  single-column list for readability at the panel's actual 272px content width.
- `busy` UI affordance disables buttons but deliberately doesn't gate the write queue
  itself — the queue is what guarantees no dropped/raced writes, not a client-side guard.
- Known baseline debt (lint, spec tsconfig) pre-exists this TZ and is out of scope per
  conflict keys; confirmed no new occurrences introduced by this change.

## Review handoff

- [x] Готово к архивации
