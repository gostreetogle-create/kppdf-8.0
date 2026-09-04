# Doc Studio FINISH S27→S37 — live closeout attempt (S41 smoke + S37 AC2)

date: 2026-09-04
HEAD: `9f3481187553a4b51d9a2cd2fae841ebf3c0c91e`
surface: NX `http://localhost:4201` + BE `http://127.0.0.1:3000` (both dev servers **restarted clean** for this session — see «Инфраструктурная находка» below)
agent: claude (Playwright via headless Chromium, `npx playwright` installed to a scratch dir this session — no project browser-driving skill existed yet)
login: `fill-demo-button` dev helper (admin/admin123 local seed) — no manual credentials embedded in scripts

## Инфраструктурная находка (перед тестом)

`frontend-nx` dev-server процесс (:4201) не перезапускался с **2026-09-03 21:40** —
это ДО всех today's правок (S37B, S41). Vite watch, судя по всему, тихо перестал
подхватывать изменения файлов: живой UI показывал pre-S41 вёрстку (md-карточки,
click-to-toggle, без кнопок Добавить/Убрать) несмотря на запушенный код. Перезапуск
`pnpm start` (frontend-nx) обязателен перед любым live-тестом в этой сессии —
иначе тестируется вчерашний код. Зафиксировано в `_NOW.md`/WAVE для будущих сессий.

## AC matrix

| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| S41.1 | Новое КП → Данные → 3 быстрых клика «Добавить» подряд | **PASS** | Все 3 добавились (3 кнопки «Убрать» видны после), **без** диалога «Документ изменён в другом месте». Скрин: `evidence-s37-2/s37-2-01-s41-rapid-add-no-conflict.png`. |
| S41.2 | «Убрать» одну позицию | **PASS** | 2 осталось (было 3); чип «2 изделия×». Скрин: `s37-2-02-s41-after-remove-one.png`. |
| S41.3 | Кнопки заметно компактнее (sm) | **PASS** (визуально, см. скрины) | `size="sm"` + single column, как задумано в S41 checklist. |
| S37.AC2a | Клиент выбран + «Поле ERP» → `{{counterparty.name}}` вставлен в текст | **PASS** | Подтверждено сетевым PATCH `template-blocks/:id` (content содержит `{{counterparty.name}}`) и DOM редактора. Скрин: `s37-2-03-s37-token-inserted.png`. |
| S37.AC2b | Просмотр показывает имя клиента (не токен) | **FAIL** | Просмотр показывает **полностью пустой лист** — не токен, не имя, ничего. `.doc-stage` в HTML preview — пустой `<div>`. Скрин: `s37-2-04-s37-preview-empty-FAIL.png`; сырой HTML: `preview-srcdoc-empty.html`. |

## Root cause (найдено, подтверждено temporary диагностикой, откачено)

Диагностика через временные `console.error` в трёх точках backend-пайплайна (добавлены,
воспроизведены, **откачены** — `git diff` на затронутые файлы пуст) показала точное
место потери блока:

```
studio-output.service.ts   blocks.length=1  (блок с layout корректно из БД)
studio-table-tokens.ts     applyTableAggregateTokensToBlocks:
                              before spread layout={...}  ctor=model  ← Mongoose Document!
                              after spread  layout=undefined          ← потерян
document-render.service.ts renderHtml: foreground.length=1 → renderBlocks.length=0
```

**`applyTableAggregateTokensToBlocks`** (`backend/src/modules/studio-document/studio-table-tokens.ts:71-77`)
делает `{...block}` (object spread) напрямую на **сыром Mongoose Document**
(`block.constructor.name === 'model'`), а не на plain-объекте. Mongoose не гарантирует,
что вложенные subdocument-поля (здесь — `layout`) переживут shallow spread через
`{...doc}` — это известная особенность Mongoose (нужно `.toObject()`/`.toJSON()` перед
spread). Результат: `layout` молча становится `undefined` для **любого текстового блока
со строковым content** (условие функции: `block.type === 'text' && typeof content ===
'string'` — то есть почти каждый текстовый блок студии).

Дальше по пайплайну `document-render.service.ts` фильтрует блоки для studio-canvas
рендера строго по `Boolean(b.layout)` — блок без layout **тихо выпадает** из
`renderBlocks`, без exception, без 500 — просто пустой `.doc-stage`.

**Соседняя функция `injectTableContent`** (`studio-data-resolver.ts:220-245`, чуть выше
в том же пайплайне) уже содержит защиту от этого:
```ts
const plain = typeof block.toObject === 'function' ? block.toObject() : { ...block };
return { ...plain, content: html };
```
`applyTableAggregateTokensToBlocks` — единственное место, где эта защита отсутствует.

**Почему не поймано раньше:** unit-тест `studio-output.service.spec.ts` («preview
substitutes counterparty tokens…», S8-1, PASS) кормит блок как **plain-объект**
(`{ _id: ..., type: 'text', ... }`, не Mongoose-модель) — баг воспроизводится только
с **реальным Mongoose-документом** из живой БД, что unit-тест с ручными моками
структурно не может поймать. Отсюда и разрыв: backend-тест зелёный, живой Preview —
пустой.

## Предлагаемый минимальный фикс (для hotfix TZ)

`backend/src/modules/studio-document/studio-table-tokens.ts`, `applyTableAggregateTokensToBlocks`:

```ts
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
```

(Тот же паттерн, что уже в `injectTableContent`.) Плюс regression-тест, кормящий
функцию **настоящим Mongoose-документом** (`new SomeModel({...}).toObject()` в
обратную сторону не подходит — нужен реальный hydrated doc или мок с
`constructor.name`/`toObject`, воспроизводящий именно этот класс дефекта), иначе баг
может вернуться незаметно для unit-тестов.

## Вывод

**S41 — PASS**, подтверждено живым браузером. Write-queue фикс работает: 3 быстрых
добавления не породили ни одного конфликта.

**S37 AC2 — FAIL**, но с точным root cause (не «предположительно UI», а конкретная
строка backend-кода). Это НЕ регрессия S41/S37B — баг существовал в
`studio-table-tokens.ts` независимо от сегодняшних правок и был замаскирован тем,
что frontend dev-server был на суточной стали (см. «Инфраструктурная находка») —
никто до сих пор не тестировал живой Preview с реальным Mongo-документом после
введения `applyTableAggregateTokensToBlocks`.

Hotfix TZ: `tasks/_ready/TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP.md`

## Evidence artefacts

- `docs/audits/evidence-s37-2/s37-2-01-s41-rapid-add-no-conflict.png`
- `docs/audits/evidence-s37-2/s37-2-02-s41-after-remove-one.png`
- `docs/audits/evidence-s37-2/s37-2-03-s37-token-inserted.png`
- `docs/audits/evidence-s37-2/s37-2-04-s37-preview-empty-FAIL.png`
- `docs/audits/evidence-s37-2/preview-srcdoc-empty.html` (raw backend Preview response)
