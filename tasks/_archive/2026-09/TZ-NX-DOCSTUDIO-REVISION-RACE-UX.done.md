> **STATUS: DONE** — 2026-09-14. Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-REVISION-RACE-UX.md`. Evidence: `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-REVISION-RACE-UX.txt`.

# TZ-NX-DOCSTUDIO-REVISION-RACE-UX: убрать ложный «изменён в другом месте»

**РОЛЬ АГЕНТА:** Executor (frontend-nx studio-editor) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL` DONE (частичная очередь)  
**LAYER:** 3 · **SIZE:** M  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-write-serial.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-*.spec.ts` (только если ломаются моки) ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/_NOW.md` ;  
`docs/agent-checklists/STREAM-QUEUE.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-13-docstudio-revision-conflict-spam.md`; `studio-editor.page.ts` (`conflict`, `schedule`/`saveLayouts`, `createTextLayer`, `rehydrateLiveRowsAfterColumnChange`, `enqueueDocumentWrite`); `TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL.done.md`; `frontend-nx/libs/util/http/src/lib/silent-http.ts` (`SilentResult` + `HttpErrorResponse`)
- **Key Constraints:** Mode A handoff; KEEP optimistic concurrency; fix self-races + honest UX
- **Planned Deliverable:** full write serial + 409-only dialog + one soft retry
- **Validation Path:** write-serial specs + live Network no cascade-409 + `nx build`

### Domain
- Диалог = защита от двух писателей; **не** должен пугать при обычном drag/hydrate/правке таблицы в одной вкладке.
- Настоящий second-tab 409 — оставить диалог Перезагрузить/Отмена.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Часть document writes уже в `catalogWriteChain`; **layout save, create text/image, rehydrate putDataSet — вне цепи** → 409 сами на себя.
2. `conflict()` на почти любой `!ok` с текстом «другая вкладка» — в т.ч. не-409 (ошибка `template-blocks` PATCH и т.п.).
3. PO: диалог «постоянно вылезает».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Одна очередь на все revision-gated записи

Через `enqueueDocumentWrite` / ту же `catalogWriteChain` (читать `this.document()` **внутри** run):

- `saveLayouts` / `schedule` / `flushLayouts` (когда реально шлёт updateLayouts)
- `blocksService.create` (text / image / table create paths that take expectedRevision)
- `rehydrateLiveRowsAfterColumnChange` / любые ad-hoc `putDataSet` вне hydrateTablesSerially
- Уже стоящие addPage/hydrate — не ломать

Не включать в цепь: `template-blocks` PATCH settings/content (не gate revision) — но и не звать `conflict()` на их fail.

ШАГ 2: Честный `conflict` vs toast

- Helper `isRevisionConflict(result: SilentResult<…>): boolean` → `!ok && error.status === 409` (и/или body code `STUDIO_DOCUMENT_REVISION_CONFLICT` если есть).
- Dialog «Документ изменён в другом месте» — **только** revision conflict.
- Иные `!ok` — `toast.error` с `extractErrorMessage` (или коротко «Не сохранено: …»), без этого диалога.

ШАГ 3: Один soft-retry на self-409 (опционально но желательно)

При 409 на queued write:

1. `getById` → `document.set`
2. Повторить **ту же** операцию один раз с новым `expectedRevision` (layout payload / putDataSet payload из замыкания run)
3. Если снова 409 → тогда `conflict()` dialog
4. Не затирать несохранённый local layout: перед retry layout save читать **текущие** `this.blocks()`, не старый snapshot

ШАГ 4: Specs + live

- Unit: layout save queued behind in-flight hydrate → no conflict dialog; non-409 → toast not dialog; 409 after retry exhausted → dialog once.
- Live Playwright или Network: open doc with ≥1 catalog table, drag block, edit qty — **нет** conflict dialog; second tab real conflict still shows dialog.
- `document-studio.page.md` — 5–8 строк про revision / когда диалог честный.

═══════════════════════════════════════════════════════════════
НЕ
═══════════════════════════════════════════════════════════════

- Снимать `expectedRevision` с API
- Auto-reload без спроса при реальном second-tab conflict
- LWW без gate
- TOKEN / PRICE / ISSUER follow-ups

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Одна вкладка: open → hydrate → drag → «+ Текст» → правка qty — **0** показов диалога conflict (Network: нет серии 409 от self-race; или 409 только с успешным silent retry).
2. Не-409 ошибка записи → toast, не «другая вкладка».
3. Две вкладки / искусственный stale revision → диалог Перезагрузить/Отмена один раз.
4. Gates:

```bash
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-editor-write-serial
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-editor
cd frontend-nx && pnpm exec nx build kppdf-web
```

5. Archive + STREAM/_NOW IDLE.

### Claim slot

```
agent_id:
claimed_at:
branch:
baseline_sha:
```
