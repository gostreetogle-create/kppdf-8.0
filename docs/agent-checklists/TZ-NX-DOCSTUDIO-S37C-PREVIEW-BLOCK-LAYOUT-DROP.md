# TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-04T20:42:26Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] `git status` → main, backend-only diff scope confirmed; Freebuff actively on `frontend-nx` (Gantt G2) — no overlap
- [x] TZ / root-cause evidence прочитаны: `tasks/_ready/TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP.md`, `docs/audits/2026-09-04-docstudio-s37-s41-live-closeout.md`
- [x] Claim slot заполнен

## Сделано

### Фикс (`backend/src/modules/studio-document/studio-table-tokens.ts`)

`applyTableAggregateTokensToBlocks` теперь конвертирует блок через `.toObject()`
перед spread — тот же паттерн, что уже был в `injectTableContent`. Один блок кода,
как и предлагала TZ.

### Regression-тест (`studio-table-tokens.spec.ts`)

Добавлен `FakeMongooseTextBlock` — класс с `layout` как **getter на прототипе**
(не own enumerable property) + `toObject()`, воспроизводящий именно тот класс
объектов, что реально возвращает `findAllByStudioDocument` (`constructor.name ===
'model'` — подтверждено живой диагностикой в S37 closeout сессии). Два теста:

1. «Fixture sanity» — доказывает, что сам фикстур воспроизводит баг-класс: `{...block}`
   теряет `layout`, `.toObject()` — нет. Без этого теста фикстур мог бы случайно
   не воспроизводить дефект и давать ложное чувство защищённости.
2. Основной тест — гоняет `applyTableAggregateTokensToBlocks` на этом фикстуре,
   проверяет `layout` сохранился в результате.

**Проверено на старом коде** (`git stash` фикса → прогон → `git stash pop`):
тест #2 **падает** именно так, как ожидалось (`result[0]` содержит `_layout` вместо
`layout` — ключ переименован из-за приватного поля класса, ровно то искажение,
которое и объясняет живой баг). На новом коде — зелёный. Значит тест реально ловит
регрессию, а не просто существует для галочки.

### Живая проверка (обязательный пункт TZ)

Полный live-flow через headless Chromium (тот же сценарий, что в
`docs/audits/2026-09-04-docstudio-s37-s41-live-closeout.md`):
Новое КП → 3 быстрых «Добавить» (S41, без конфликта) → «Убрать» одну (2 осталось) →
клиент «Торговая сеть „Формат“» выбран → «Поле ERP» → `{{counterparty.name}}` вставлен →
**Просмотр показывает «АО «Торговая сеть „Формат“»Новый текст»** — реальное имя
клиента, не пустой лист, не сырой токен.

Backend dev-server (`pnpm start:dev`, nest watch) auto-reloaded on the fix; frontend-nx
dev-server (restarted earlier this session, ~1h uptime) confirmed still serving
current code. Evidence: `docs/audits/evidence-s37-3/`.

## НЕ ИЗМЕНЯЛОСЬ

- `injectTableContent` — уже был корректен, не тронут.
- Frontend — ноль изменений (дефект чисто backend).
- PDF pipeline отдельно не тестировался (тот же `renderStudioDocument`/`renderHtml`
  путь, тот же фикс чинит и PDF — TZ пометила это как опционально).

## Integrity slot

- [x] Тип изменения: backend bugfix, без нового route/permission/module — FIC N/A
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] SECTION-READINESS — N/A
- [x] Coupling map — N/A (внутренний рендер-пайплайн, публичный контракт не менялся)
- [x] Чужой WIP не в коммите; conflict key (`studio-table-tokens.ts` + spec) — единственный product-файл

## Gates (факт)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
→ PASS, exit 0

cd backend && pnpm exec jest src/modules/studio-document src/modules/document-render src/modules/template-block
→ PASS, 18 suites / 137 tests (incl. 2 new regression tests)

cd backend && pnpm lint
→ PASS, 0 errors (197 warnings — pre-existing @typescript-eslint/no-explicit-any
  baseline across unrelated files; none in touched files)

Regression test verified to fail on pre-fix code (git stash the fix, re-run,
confirmed FAIL with the exact expected symptom, then git stash pop to restore).

Live browser (headless Chromium): S41 rapid-add PASS (no conflict), S37 AC2 PASS
(client name substituted in Preview, not raw token, not blank).
```

## Executor report

- Root cause was already pinpointed by the prior S37 live-closeout session
  (temporary diagnostics, fully reverted). This TZ applied the one-line-class fix
  that session's evidence already prescribed, added a regression test that
  specifically reproduces the Mongoose-document-spread defect class (verified to
  fail on old code), and re-confirmed the fix live end-to-end.
- No frontend changes; no conflict with Freebuff's parallel Gantt work on `frontend-nx`.

## Review handoff

- [x] Готово к архивации
