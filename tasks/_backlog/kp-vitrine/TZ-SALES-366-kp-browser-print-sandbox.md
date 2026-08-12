═══════════════════════════════════════════════════════════════
TZ-SALES-366: Create КП — дочинить браузерную «Печать» (sandbox)
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create ; /proposals
PAGE_DOCS: proposals-create.page.md ; proposals.page.md

РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: TZ-SALES-345 DONE (меню PDF · Печать · Архив уже есть)
LAYER: 2
CONFLICT KEYS:
  frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts ;
  frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.spec.ts
  (создать если нет) ;
  docs/pages/proposals-create.page.md

**Не трогать** без нужды: `proposal-create.page.ts` (достаточно оставить вызов
`templateCenter.printPreview()`), `quotation-output*`, puppeteer, Desktop.

Проверено (2026-08-12):
- PDF = сервер: `POST /quotations/:id/pdf` → `QuotationOutputService` + puppeteer-core — **DONE**.
- Архив = `GeneratedDocument` — **DONE**, это не печать.
- «Печать» = `iframe.contentWindow.print()` при `sandbox="allow-same-origin"` без
  `allow-modals` → Chrome: `Ignored call to 'print()'`. Консоль `Blocked script…` —
  ожидаемый шум превью, не чинить через `allow-scripts`.
- `#previewFrame` + `@for` страниц → ViewChild видит **первый** iframe; многостраничное КП
  печаталось бы неполно даже после allow-modals.
- TZ-SALES-320 (печать семьи бланков пачкой) — **остаётся PARKED**, не эта TZ.

═══════════════════════════════════════════════════════════════
СМЫСЛ ДЛЯ ПРОДУКТА (зафиксировано)
═══════════════════════════════════════════════════════════════

Два канала **оставить** — разные задачи менеджера:

| Действие | Зачем | Реализация |
|----------|--------|------------|
| **PDF** | файл клиенту / почта / архив на диске | сервер (уже есть) |
| **Печать** | быстро на принтер «как на экране» | браузерный диалог (эта TZ) |
| Архив документов | история в приложении | не печать |

**Не** добавлять третий «серверная печать» / отдельный print-pipeline.
Пачка бланков (320) — после того как Create КП «нравится на все 100» — отдельный unpark.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Не ослаблять превью навсегда**
   - Рабочий iframe превью оставить `sandbox="allow-same-origin"` без scripts.
   - Не ставить постоянный `allow-scripts` ради тишины в консоли.

2. **Печать вне превью-песочницы**
   - В `printPreview()` собрать HTML всех страниц превью (`previewPages` или один
     `previewHtml`), открыть **временное** окно/`iframe` печати (parent-owned),
     куда положить тот же HTML (с `@media print` / page-break между листами).
   - Вызвать `print()` там (где модалки разрешены), затем закрыть/убрать временный узел.
   - Альтернатива допустима: на время print только у **временного** кадра
     `sandbox="allow-same-origin allow-modals"` — не у ленты превью.

3. **Много страниц**
   - Одно действие «Печать» → все листы текущего превью (не только первая).
   - Пустое/loading превью → RU toast (как сейчас на page), без пустого диалога.

4. **Список «Все КП»**
   - Маршрут `?id=&action=print` уже открывает студию и зовёт print — после фикса
     `printPreview` должен заработать без правок списка (smoke вручную).

5. Spec + page.md
   - Jest: print helper вызывается / временный print path существует; превью sandbox
     по-прежнему без `allow-scripts`.
   - В `proposals-create.page.md` одна строка: печать = parent/temp frame, не print
     внутри sandbox-превью; PDF отдельно.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Контракт PDF / puppeteer / 503 fallback текст
- Shared TableTemplate, Редактор таблицы, build HTML смысл
- Unpark TZ-SALES-320
- Deploy (только по слову PO)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] «Скачать ▾ → Печать» открывает системный диалог печати (нет
      `Ignored call to 'print()'` из-за sandbox превью)
- [ ] Превью iframe по-прежнему `sandbox="allow-same-origin"` без scripts
- [ ] КП с 2+ листами: в печати видны все страницы превью
- [ ] PDF и Архив не регрессируют (меню на месте; PDF путь не тронут в diff)
- [ ] FE tsc + focused Jest по template-center / proposal-create print path
- [ ] page.md обновлён одной честной строкой

Gates:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern="proposal-create-template-center|proposal-create.page" --no-coverage
```

Финализация: archive `tasks/_archive/2026-08/TZ-SALES-366.done.md` + lock + Checkpoint
в `_active-map.md` + commit/push. Deploy НЕ.

═══════════════════════════════════════════════════════════════
HANDOFF (копировать исполнителю)
═══════════════════════════════════════════════════════════════

```text
CLAIM первым (до кода):
node OrchestratorKit/team-room/cli.mjs join
node OrchestratorKit/team-room/cli.mjs inbox
# claim TZ-SALES-366 по правилам AGENTS.md / checklist

Читай: GEMINI.md · kppdf-executor-continuous · OrchestratorKit/AGENTS.md
TZ: tasks/_backlog/kp-vitrine/TZ-SALES-366-kp-browser-print-sandbox.md
PO: docs/PO-DIARY.md §1–§4

Дочини браузерную «Печать» без ослабления A4-превью и без нового серверного print.
PDF/Архив не трогай. 320 не unpark. Deploy НЕ. Commit+push после DONE.
```
