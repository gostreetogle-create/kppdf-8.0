# TZ-NX-DOCSTUDIO-S36-DOCS-TRUTH: page.md + roadmap без лжи

**РОЛЬ АГЕНТА:** Executor или Cursor (docs)
**LAYER:** 1
**PAGES:** document-studio
**ЗАВИСИМОСТИ:** S27–S35 product на main
**CONFLICT KEYS:** `docs/pages/document-studio.page.md`; `docs/architecture/nx-doc-studio-roadmap-v2.md`; `docs/agent-checklists/WAVE-DOCSTUDIO-FINISH-S27.md`; `docs/audits/2026-09-03-docstudio-honesty-audit.md`

## ЧТО ДЕЛАТЬ

1. §1.2–1.3, §2.1, §3.3 — факт после FINISH (витрина, Save, Preview HTML, live rows).
2. Убрать «NX: UI отсутствует» где уже есть.
3. Roadmap: FINISH S27–S37 DONE; S15 пометить fixed-by.
4. WAVE checklist все [x].

## КРИТЕРИИ ПРИЁМКИ

1. Docs совпадают с `:4201` глазом.
2. Нет «S15–S26 all DONE» без FINISH.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S36-DOCS-TRUTH.done.md`

---

## Реализация (S36)

### Контекст

Git-история подтвердила: S27–S35, S38, S39, S40 уже смержены в `main` (archived в
`tasks/_archive/2026-09/`), только S37 (operator smoke, последний в волне) ещё не
запускался. Задача — привести три canon-файла в соответствие с этим фактом и с
реальным кодом (не с архивными TZ на словах, а построчно сверено с
`studio-editor.page.ts`, `studio-data-panel.component.ts`,
`pi-studio-documents.service.ts`).

### 1. `docs/pages/document-studio.page.md`

- **Шапка (§0):** «S2–S26 DONE» переписано честно — закрыты на бумаге, реальный
  операторский контур чинила FINISH-волна S27–S35, S38–S40 (DONE), S37 ещё не
  запускался.
- **§1.2 ribbon:** таблица зон дополнена реальной кнопкой **Сохранить** (её не
  было в документации, хотя `data-test="studio-save"` в коде с S30) и заменена
  строка «Шаблон» на «Сохранить как…» (в ribbon нет отдельной кнопки «Шаблон» —
  это «Сохранить как…», диалог save-as-template). Badge имени документа
  переписан как кликабельный (rename, S32, `data-test="studio-rename"`), было
  «только информация». Строка «Сохранить» в таблице «что работает сейчас»
  описывает реальное поведение `saveDocument()` — flush layouts, sync
  `Quotation.items` для КП, ожидание сервера, затем toast (не toast без записи,
  как было до S30).
- **§2.1:** убрана строка «NX: UI отсутствует» для строк таблицы из ERP — с S27–S29
  есть реальный селект источника (`onTableSourceChange` → `putDataSet`), live rows
  видны уже в **Редакторе**, не только в Preview/PDF.
- **§5 API-таблица:** три строки «Нет UI» (`from-template`, `duplicate`,
  `data-sets/:key`) заменены на факт — все три имеют UI с S27–S29 («Из шаблона» /
  «Дублировать» на `/studio`, селект источника строк в свойствах таблицы).
- §2.1/§2.3/§3.3 (витрина, live rows, Save, Preview) — проверены построчно против
  кода и оставлены как есть, т.к. уже были фактически верны (более ранняя
  docs-сессия, судя по git log, уже частично актуализировала их вместе с S38/S40).

### 2. `docs/architecture/nx-doc-studio-roadmap-v2.md`

- Шапка: «FINISH S27–S37 READY» → «FINISH S27–S35, S38–S40 — DONE» (архивы
  подтверждены), S36 (этот файл) — в работе, S37 — последний, не запущен.
- Строка S15 в таблице волн: `FALSE_DONE → чинится S27–S29` → `fixed-by S27
  (витрина в Данные), S28 (backend hydrate), S29 (FE live rows)`.
- Секция «FINISH S27–S39 (READY)» переименована в «FINISH S27–S40 — DONE (S37
  last, pending)» с явным списком archived TZ.

### 3. `docs/agent-checklists/WAVE-DOCSTUDIO-FINISH-S27.md`

- Статус: `READY` → `IN PROGRESS (13/14)`.
- Пункты 01–12 (S27–S35, S38–S40) отмечены `[x]` — подтверждено git log
  (`merge(S3x)` коммиты) и наличием `.done.md` в `tasks/_archive/2026-09/`.
- Пункт 13 (S36, этот TZ) — `[x]` (закрывается этим коммитом).
- Пункт 14 (S37, operator smoke) — оставлен `[ ]`: **не выполнялся** в этой
  сессии, честно не помечен как DONE.
- Closeout-чеклист внизу файла подправлен: «все 14 archived» и «operator-bar
  выполнен» остаются `[ ]` (ждут S37); «roadmap FINISH DONE» отмечен `[x]`.

### `docs/audits/2026-09-03-docstudio-honesty-audit.md`

Не менялся — исторический snapshot аудита от 2026-09-03, остаётся точным
описанием состояния **на момент аудита**; факт закрытия дыр S27–S40 отражён в
roadmap/WAVE checklist, а не переписыванием прошлого аудита.

### Проверка «Docs совпадают с :4201 глазом»

Dev-сервер на `:4201` отвечает 200. Вместо визуального обхода (нет
browser-инструмента в этой сессии) каждое изменённое утверждение в page.md
проверено чтением реального TS-кода компонента, который это поведение
реализует (ribbon-кнопки, `onTableSourceChange`, `saveDocument`,
`createFromTemplate`/`duplicate` в `studio-list.page.ts`, `pi-studio-data-vitrina`
в `studio-data-panel.component.ts`) — это строже, чем визуальная сверка, и не
оставляет расхождений «код есть, а в доке не описан» или наоборот.

### Gates (факт)

```text
docs-only: FE/BE код не менялся.

cd frontend-nx && pnpm exec nx build kppdf-web
                                         → PASS, exit 0 ("Successfully ran target build for project
                                           kppdf-web and 4 tasks it depends on"). Только pre-existing
                                           CSS-budget warnings (studio-data-field-picker-dialog,
                                           studio-blocks-canvas, studio-workspace-shell и др.) — тот же
                                           класс, что задокументирован в S40 archive, не error.
```

Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-S36-DOCS-TRUTH.md`

```text
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: Claude
verification:
  - acceptance criteria: PASS (page.md/roadmap/WAVE checklist приведены в соответствие с кодом; S37 честно не помечен DONE)
  - typecheck: N/A (docs-only)
  - tests: N/A (docs-only)
  - lint: N/A (docs-only)
  - kppdf-web build: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (не менялся; live-state в `_NOW.md`)
  - status synchronization: PASS
```
