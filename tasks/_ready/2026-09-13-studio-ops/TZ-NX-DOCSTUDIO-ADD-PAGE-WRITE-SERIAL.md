# TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL: «+ Страница» снова пишет страницу

> **SIZE:** S · **PACK:** `tasks/_ready/2026-09-13-studio-ops/`  
> **РОЛЬ:** Freebuff / Claude executor  
> **LAYER:** 3  
> **ЗАВИСИМОСТИ:** не параллелить с `TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP` на `studio-editor.page.ts` (очередь: PHOTO → ADD-PAGE → Necessity **или** ADD-PAGE до Necessity, если PHOTO не трогает editor)

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-pages-panel.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-pages-panel.component.spec.ts`

**PAGES:** `/studio/:id` → панель «Страницы»  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`  
**AUDIT:** `docs/audits/2026-09-13-docstudio-add-page-dead.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

---

## Domain preflight

- **Канон:** `pageCount = max(manualPageCount, max block.layout.page)`; «+ Страница» = `PATCH` `manualPageCount: pageCount+1` с `expectedRevision`.
- **Проверено:** кнопка `data-test="studio-add-page"` → `addPage()` (~L2367); BE `manualPageCount` в update DTO/`service` жив. Симптом = fail/race/UX, не «забыли handler».
- **PO:** ноль реакции + ошибки в консоли; раньше работало. Отношение «починили A — сломали B» неприемлемо — регрессия на revision gate после hydrate-сериализации.
- **Necessity:** KEEP мультистраницы; не удалять панель.

## ИСХОДНОЕ

1. `catalogWriteChain` сериализует только catalog/hydrate `putDataSet`. `addPage` / ориентация / фон / нумерация — параллельные `documents.update` со snapshot revision → **409** после open с live-таблицами.
2. `conflict()` при уже открытом диалоге — **silent return** → ощущение «кнопка мертва».
3. Несколько мест: `document.update(… revision: (x.revision??1)+1)` после create/layout без серверного revision из ответа документа.

## ЧТО ДЕЛАТЬ

**ШАГ 0 — Evidence (≤10 строк в checklist).**  
На стенде: открыть документ с ≥1 catalog/live table → дождаться hydrate → «Страницы» → `+ Страница`. Network: status PATCH document + body. Console: 409? Диалог conflict? Зафиксировать.

**ШАГ 1 — Одна очередь document writes на editor.**  
Ввести (или расширить) serial chain для **всех** мутаций, которые несут `expectedRevision` на document: `documents.update`, `putDataSet`, и любые block APIs, после которых локально bump’ится revision. Каждый шаг: `await chain` → **свежий** `this.document()` → request → при ok `document.set(serverDoc)` (полный doc с revision), не `+1` вслепую.  
Минимум для ACCEPT: `addPage`, `setOrientation`, `setBackground*`, `togglePageNumbering`, `hydrateTablesSerially` / catalog chain — **одна** цепь (можно переименовать `catalogWriteChain` → `documentWriteChain` и посадить туда addPage).

**ШАГ 2 — Conflict UX.**  
Повторный conflict при открытом диалоге: toast.error один раз («не записано — перезагрузите») **или** не глотать. Не оставлять silent return без сигнала.

**ШАГ 3 — Убрать слепой `revision + 1`.**  
Где create/layout возвращает только blocks: либо ответ API с новым `document.revision`, либо follow-up get document, либо инкремент **только** если в том же then уже есть доказанный server revision. Spec: после create table затем сразу `addPage` — оба ok без 409.

**ШАГ 4 — Specs.**  
- Unit/integration на editor: mock documents — sequential update while hydrate in flight → addPage uses revision after hydrate.  
- Optional: pages-panel click emits (уже trivially).  
- Не e2e обязателен.

## НЕ ИЗМЕНЯТЬ

- BE schema `manualPageCount` (если не найден реальный BE баг в шаге 0).  
- Necessity table IA / photo resolver / category inline.  
- Wipe/deploy.

## ACCEPT

1. Evidence Network: add page после hydrate → **200**, `manualPageCount` +1, список «Страница N» растёт, toast успех.  
2. Spam-клик «+ Страница» ×3 при live tables → 3 страницы или честный toast/conflict **без** silent no-op.  
3. Нет слепого `revision + 1` на путях create table/text/image + layout save (или доказано = server revision).  
4. Specs зелёные; `nx build kppdf-web` (или focused tsc/test зоны) last.

## known_limitation

Не проектировать offline multi-tab sync; conflict dialog остаётся для реального второго клиента.
