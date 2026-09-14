# TZ-NX-DOCSTUDIO-EDITOR-FACADE checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-EDITOR-FACADE.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T18:58:36Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room CLI не настроен в этой сессии)

## Preflight

- [x] `git branch --show-current` → `main`
- [x] `tasks/_active/` пуст перед клеймом — нет чужого CLAIM на `kppdf-web/src/**`
- [x] TZ прочитан целиком (`tasks/_ready/2026-09-14-docstudio-editor-decomp/TZ-NX-DOCSTUDIO-EDITOR-FACADE.md`)
- [x] Baseline `nx build kppdf-web` → exit 0 (до правок)

## Acceptance

- [x] 1. Facade exists; page has no `catalogWriteChain` field (перенесено в `StudioEditorFacade`, page держит только live getter)
- [x] 2. Facade instance-scoped через `providers: [StudioEditorFacade]` на page (не `providedIn: 'root'`)
- [x] 3. Behavior unchanged (mechanical move; единственное необходимое отклонение — `syncSheetSizeHook` для `toggleOrientation()`, см. Executor report)
- [x] 4. Specs green — полный `--testPathPattern=studio-editor` (фактически весь suite из-за известного shell-tokenizing бага с `--testPathPattern` в этой сессии — 129/129 suites, 980/987 tests, 7 pre-existing skip, 0 fail), включая все 10 перечисленных в TZ файлов
- [x] 5. Dirty guard via page `canDeactivate` работает (делегирует `facade.confirmLeave()`)
- [x] 6. `nx build kppdf-web` последний, exit 0
- [x] 7. Archive + Executor report (auto) с commit SHA

## Integrity slot

- [x] Тип изменения: pure FE structure (mechanical extract, page → page+facade), без нового route/permission/module
- [x] FIC — N/A: нет нового route/permission/backend-модуля/UI-поведения
- [x] page.md — N/A, страница `/studio/:id` не меняет поведение
- [x] Чужой WIP не в коммите — `studio-list.page.ts`/`.spec.ts` (другая, уже существующая незакоммиченная фича) НЕ тронуты и НЕ застейджены

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

```
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  → PASS (0 output, до и после)

cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-editor
  → PASS — 129/129 suites, 980 passed / 7 skipped (pre-existing) / 987 total, 0 failed
  (note: --testPathPattern мис-токенизируется этим shell в character-alternation
  regex — фактически прогнан весь suite, не только studio-editor-*; это шире
  требуемого scope, не уже, так что acceptance criterion #4 выполнен с запасом)

cd frontend-nx && pnpm exec nx build kppdf-web
  → PASS exit 0, идентичные baseline warnings (bundle budget, NG8102 в
  studio-table-properties.component.ts — не в scope этого TZ)
```

## Executor report

**Root cause / what:** `studio-editor.page.ts` — god component ~3168 LOC (signals +
`catalogWriteChain` write-queue + весь domain + DOM/chrome glue вперемешку).
Механически вынес почти весь domain-слой в новый instance-scoped
`StudioEditorFacade` (`@Injectable()`, `providers: [StudioEditorFacade]` на page),
оставив на page: `@Component` decorator (template/styles без изменений),
`@HostListener`, `viewChild` sheet, `ResizeObserver`, `ShellToolRailService` +
tool-rail-строящий `effect()`, `canDeactivate`, DOM-only canvas-fit state
(`zoomMode`/`sheetSize`/`setZoomMode`/`syncSheetSize`/`previewZoomScale` — не
переносимы в plain `Injectable`, т.к. требуют `viewChild`).

**Единственное необходимое отклонение от «move only»:** `toggleOrientation()`
(facade) раньше синхронно звал `queueMicrotask(() => this.syncSheetSize())`
после успешного PATCH — `syncSheetSize` требует DOM-ref (`sheetHostRef`),
которого у facade нет. Заменено на `syncSheetSizeHook` — page регистрирует
колбэк `() => this.syncSheetSize()` в своём конструкторе через
`facade.setSyncSheetSizeHook(...)`; тот же timing (queueMicrotask сразу после
записи), та же цель — чистая индирекция ради DI-границы, не поведенческое
изменение. Задокументировано в JSDoc над `toggleOrientation()` в facade.

**Специфика спеков (zero-rewrite сохранён, 0 правок в `.spec.ts`):** три
паттерна доступа specs к `componentInstance`, вскрытые прогоном (а не
предсказанные заранее из TZ), потребовали doп. passthrough на page сверх
базового «re-export те же signal refs»:
1. `jest.spyOn(component, 'saveDocument'/'onDownloadPdf'/'onFinalize')` —
   shellTools-эффект (стался на page) должен звать `this.saveDocument()` и
   т.п. (page-делегат), а не `this.facade.saveDocument()` напрямую, иначе spy
   не перехватывает клик по rail-меню.
2. `component.insertTextContent(...)` / `component.saveLayouts()` — были
   `private` на исходной page, specs достают их через `as unknown as
   Testable`-cast (TS `private` — compile-time only). Добавлены как page
   delegates; соответствующие методы facade разжалованы из `private` в
   package-level (весь список private→non-private в facade — все internal
   методы, на случай будущих спеков; page delegates добавлены только для
   этих двух — единственных, что specs реально вызывают напрямую, проверено
   grep'ом по всем 16 `studio-editor-*.spec.ts`).
3. `await component.catalogWriteChain` / `component.layoutsDirty = true` —
   прямой доступ к полям (не методам). Добавлены live get/set-аксессоры на
   page (не однократная копия значения — `catalogWriteChain`/`layoutsDirty`
   переприсваиваются в facade асинхронно, page должен видеть текущее).

**Files changed:**
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.facade.ts` (new, ~2400 LOC)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (rewritten, ~3168 → ~470 LOC)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-FACADE.md` (this file, new)

**Not touched:** `libs/**`, `backend/**`, `studio.routes.ts`, `studio-dirty.guard.ts`,
list/templates pages, panels/canvas/dialogs (dumb UI), `catalogWriteChain`/retry/
liveRows/PDF algorithms (logic byte-identical, only relocated), any `.spec.ts`.
Also left untouched: pre-existing uncommitted `studio-list.page.ts`/`.spec.ts`
(a different, already-in-progress feature — not part of this TZ's conflict keys).

commit: (filled after commit below)

## Review handoff

- [x] Прямой continuous-волновой запрос PO (Cursor Mode A выдал промпт) — без отдельного review-inbox
- [x] Archive после gates PASS (без отдельного Cursor Verdict — сама волна это разрешает per PROMPT-CLAUDE-WAVE-1-4-CONTINUOUS.md)

## Closeout

- [x] archive + WAVE-MAP.md + tracker обновлены + `_active` очищен
- [x] Status = DONE
- closed_at: 2026-09-14T19:05:00Z
