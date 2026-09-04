# TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP: text-блоки пропадают из Просмотра/PDF

**РОЛЬ АГЕНТА:** Executor (backend)  
**LAYER:** 2  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S37 live closeout FAIL (root cause найден и записан)  
**CONFLICT KEYS:** `backend/src/modules/studio-document/studio-table-tokens.ts` (`applyTableAggregateTokensToBlocks`); regression-тест рядом (`studio-table-tokens.spec.ts` или `studio-output.service.spec.ts`)  
**IMPLICIT CONFLICT:** нет frontend-изменений — backend-only

## ИСХОДНОЕ (root cause, уже найден)

Полная диагностика: `docs/audits/2026-09-04-docstudio-s37-s41-live-closeout.md`.

Живой браузерный тест (headless Chromium): клиент выбран → «Поле ERP» →
`{{counterparty.name}}` вставлен в текстовый блок (подтверждено сетевым PATCH и DOM) →
Просмотр показывает **полностью пустой лист** (не токен, не имя — вообще ничего).

Временная диагностика (`console.error`, добавлена/воспроизведена/**откачена** этой
сессией — в репозитории её нет) точно локализовала потерю:

```
studio-table-tokens.ts → applyTableAggregateTokensToBlocks():
  before spread: block.layout = {page:1,x:...}  block.constructor.name = 'model'  (Mongoose Document!)
  after  spread: result.layout = undefined                                        (потерян)
```

`applyTableAggregateTokensToBlocks` (`backend/src/modules/studio-document/studio-table-tokens.ts:71-77`)
делает `{...block}` на **сыром Mongoose Document** — subdocument-поле `layout` не
переживает shallow spread (известная особенность Mongoose: нужен `.toObject()` перед
spread). Условие функции — `block.type === 'text' && typeof content === 'string'` —
то есть баг задевает **практически любой текстовый блок студии**.

Дальше `document-render.service.ts` фильтрует блоки для studio-canvas строго по
`Boolean(b.layout)` (`renderBlocks = foreground.filter(b => Boolean(b.layout))`) —
блок без layout тихо выпадает, без exception, без 500 — просто пустой `.doc-stage`.

**Соседняя функция `injectTableContent`** (`studio-data-resolver.ts:220-245`, тот же
пайплайн, шагом раньше) уже правильно защищена:
```ts
const plain = typeof block.toObject === 'function' ? block.toObject() : { ...block };
return { ...plain, content: html };
```
`applyTableAggregateTokensToBlocks` — единственное место без этой защиты.

**Почему не поймано unit-тестом:** `studio-output.service.spec.ts` («preview
substitutes counterparty tokens…», S8-1, зелёный) кормит функцию **plain-объектом**,
не Mongoose-моделью — баг требует настоящего hydrated document (`constructor.name
=== 'model'`), что ручной мок структурно не воспроизводит.

## ЧТО ДЕЛАТЬ

1. В `applyTableAggregateTokensToBlocks` (`studio-table-tokens.ts`) применить тот же
   паттерн, что уже в `injectTableContent`:

```ts
export function applyTableAggregateTokensToBlocks(
  blocks: TemplateBlockDocument[],
  dataSets: Record<string, unknown>[],
  vatPercent: number,
): TemplateBlockDocument[] {
  return blocks.map((block) => {
    if (block.type !== 'text' || typeof block.content !== 'string') return block;
    const plain =
      typeof (block as { toObject?: () => Record<string, unknown> }).toObject === 'function'
        ? (block as { toObject: () => Record<string, unknown> }).toObject()
        : { ...(block as object) };
    return {
      ...plain,
      content: resolveTableAggregateTokens(block.content, blocks, dataSets, vatPercent),
    } as TemplateBlockDocument;
  });
}
```

2. **Regression-тест обязателен** и должен воспроизводить именно этот класс дефекта —
   ручной plain-object мок НЕ поймает регрессию повторно. Варианты:
   - собрать мок-объект с `constructor.name === 'model'` и методом `toObject()`,
     имитирующий Mongoose Document достаточно точно, чтобы старый код (`{...block}`
     без `.toObject()`) на нём падал (терял `layout`), а новый — нет;
   - или (предпочтительнее, если бюджет позволяет) integration-тест через реальную
     Mongoose-модель `TemplateBlock` с in-memory/test Mongo, создающий текстовый блок
     и проверяющий, что `layout` переживает `applyTableAggregateTokensToBlocks`.
3. Прогнать существующий `studio-output.service.spec.ts` — не должен сломаться
   (там блоки уже plain-объекты, останутся зелёными; новый тест — дополнительный).
4. **Живая проверка обязательна** (эта TZ существует именно потому, что unit-тесты
   были зелёными при живом дефекте): пройти тот же flow, что в
   `docs/audits/2026-09-04-docstudio-s37-s41-live-closeout.md` (клиент → Поле ERP →
   Просмотр) и подтвердить, что имя клиента реально появляется на листе. Если нет
   браузерного инструмента в сессии — минимум: curl/скрипт с реальным логином через
   dev-server (см. заметку в аудите про `fill-demo-button`) и прямой вызов
   `POST /studio-documents/:id/preview`, проверить `.doc-stage` непустой.
5. `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test && pnpm lint`.

## НЕ ИЗМЕНЯТЬ

- `injectTableContent` (уже корректен, не трогать без нужды).
- Frontend — дефект чисто backend, витрина/S41/S37B не при чём.
- PDF pipeline тестировать НЕ обязательно отдельно (тот же рендер-пайплайн, тот же фикс
  чинит и PDF заодно — `renderPdf` тоже проходит через `renderStudioDocument`), но если
  есть время — один smoke PDF-скачивания не помешает.

## КРИТЕРИИ ПРИЁМКИ

1. `applyTableAggregateTokensToBlocks` не теряет `layout` для реального Mongoose-документа.
2. Regression-тест воспроизводит дефект на старом коде и проходит на новом.
3. Живой Preview показывает подставленное имя клиента (не пустой лист, не сырой токен).
4. Gates PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP.done.md`  
После DONE → повторный живой AC2 (или мини-версия) → archive `TZ-NX-DOCSTUDIO-S37-OPERATOR-SMOKE.done.md` DONE → WAVE-DOCSTUDIO-FINISH-S27 closeout.

## Claim slot
- agent_id: claude
- claimed_at: 2026-09-04T20:42:26Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

### Preflight Check Output
- **Context read:** `tasks/_ready/TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP.md`, `docs/audits/2026-09-04-docstudio-s37-s41-live-closeout.md`, `tasks/_ready/docstudio-finish/prompts/PROMPT-17-S37C-PREVIEW-LAYOUT.md`
- **Key Constraints:** backend-only (conflict key: `studio-table-tokens.ts`); do not touch frontend-nx (Freebuff's Gantt G2 active there); do not touch `injectTableContent`
- **Planned Deliverable:** apply `.toObject()` fix to `applyTableAggregateTokensToBlocks` → regression test reproducing the Mongoose-document-spread bug → gates → live Preview re-check (restart frontend-nx if stale) → archive S37C → archive S37 DONE → WAVE closeout → _NOW/QUEUE → commit/push
- **Validation Path:** `pnpm test` (new regression test fails on old code / passes on new) + `tsc --noEmit` + `lint` + live browser AC2 confirmation

## Что сделано (см. полный отчёт `docs/agent-checklists/TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP.md`)

`applyTableAggregateTokensToBlocks` (`studio-table-tokens.ts`) теперь конвертирует блок
через `.toObject()` перед spread (тот же паттерн, что уже был в `injectTableContent`).
Добавлен regression-тест с фикстурой, воспроизводящей реальный Mongoose Document
(`layout` как getter на прототипе, не own property) — верифицирован падающим на старом
коде (`git stash`), зелёным на новом. Живой browser re-check: client name
«АО «Торговая сеть „Формат“»» теперь подставляется в Просмотр вместо пустого листа.

## Gates (факт)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
→ PASS, exit 0

cd backend && pnpm exec jest src/modules/studio-document src/modules/document-render src/modules/template-block
→ PASS, 18 suites / 137 tests

cd backend && pnpm lint
→ PASS, 0 errors (197 pre-existing warnings, none in touched files)

Live browser (headless Chromium): S41 PASS + S37 AC2 PASS — see
docs/audits/evidence-s37-3/
```

## Финализация

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: Claude
verification:
  - acceptance criteria: PASS (layout survives Mongoose spread; regression test fails-on-old/passes-on-new; live Preview substitutes name; gates PASS)
  - typecheck: PASS
  - tests: PASS (137/137 incl. 2 new)
  - lint: PASS (0 errors)
  - checklist: ADDED (`docs/agent-checklists/TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP.md`)
  - progress.md: N/A (bugfix, no architecture change)
  - status synchronization: PASS
