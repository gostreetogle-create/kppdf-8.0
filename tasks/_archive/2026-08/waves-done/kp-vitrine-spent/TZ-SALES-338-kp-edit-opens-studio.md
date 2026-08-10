═══════════════════════════════════════════════════════════════
TZ-SALES-338: КП — правка только в студии Create; убрать form-диалог
═══════════════════════════════════════════════════════════════

PAGES: /proposals ; /proposals/create
PAGE_DOCS: proposals.page.md ; proposals-create.page.md
Аудит: docs/audits/2026-08-09-kp-usable-gap-map.md
PO 2026-08-09: «Редактировать» открывает непонятный диалог — нельзя; редактор КП = всегда Create-студия.

РОЛЬ АГЕНТА: frontend
ЗАВИСИМОСТИ: TZ-SALES-333 (Save/resume на Create)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposals.page.ts; frontend/src/app/pages/commercial/proposals/proposals.page.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/pages/commercial/proposals/proposal-form-dialog.component.ts; docs/pages/proposals.page.md; docs/pages/proposals-create.page.md

Проверено: `proposals.page.ts` `openCreate`/`openEdit` → `ProposalFormDialogComponent`; Create-студия = `/proposals/create` + `kp.create.lastDraftId`; query `?id=` нет; inspector hint «Подсказка по draft × наценка» (EN leak).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Список КП → студия**
   - «Создать» / chip Создать КП → `router.navigate(['/proposals/create'])` **без** form-диалога (новый пустой лист; можно сбросить lastDraftId только по явному «Новое КП» если уже есть — MVP: navigate на create; если нужен чистый лист — query `?new=1` очищает lastDraftId).
   - Row «Редактировать» → `router.navigate(['/proposals/create'], { queryParams: { id: row._id } })` — **не** `ProposalFormDialogComponent`.

2. **Create hydrates by `?id=`**
   - Если `id` в query и GET ok и status editable (`draft` / позже sent по 336 rules — MVP: `draft` + тот же editable set что 333) → hydrate как resume (template, items, org, markup, vat).
   - Записать `kp.create.lastDraftId = id`.
   - Если id hard-locked / not found → toast RU + чистый Create.
   - Без `id`: текущий resume lastDraftId / lastTemplate (333) остаётся.

3. **Убрать form-диалог из CRUD пути**
   - Удалить вызовы create/edit через `ProposalFormDialogComponent` со списка.
   - Файл диалога: удалить **или** оставить только если ещё нужен view-variant — предпочтение PO: **не использовать** для редактирования КП. Если variant/view ещё цепляется — тонкий redirect в студию; не плодить второй редактор.
   - Не оставлять мёртвую кнопку «Создать КП» в диалоге.

4. **RU copy на Create (обязательно в этой TZ)**
   - Любой user-visible EN на inspector Create: `draft` → «черновик»; подсказка оценки → полностью по-русски (напр. «Сумма строк × наценка; в сохранённый итог не пишется»).
   - Toast/disabled Save hints — RU. Код/status enum `draft` в API не трогать.
   - Eyebrow «оценка» можно оставить; без англ. жаргона.

5. Tests + page docs
   - openEdit navigates with id; create page hydrates from query.
   - Нет open of ProposalFormDialog on edit.

═══════════════════════════════════════════════════════════════
НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- Autosave на каждый F5 (Save = кнопка «Сохранить» из 333)
- Counterparty picker (334); qty/photo (335); paid lock (336)
- FROZEN A4 shell 317; print/PDF; deploy
- DOC-343 / system-role dirty WIP

AC:
- С списка «Редактировать» → студия Create с тем же КП (товары/шаблон).
- «Создать» не открывает form-диалог.
- Нет англ. «draft» в подсказках Create UI.
- Jest/tsc зоны PASS.

Archive после gates + лёгкий visual (edit из списка).
