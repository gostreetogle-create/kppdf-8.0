═══════════════════════════════════════════════════════════════
TZ-SALES-333: Create КП — Save черновик + reopen последнего editable
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create ; /proposals
PAGE_DOCS: proposals-create.page.md
Аудит: docs/audits/2026-08-09-kp-usable-gap-map.md
NOTE: docs/audits — см. NOTE-KP-template-snapshot-lock.md (snapshot писать при Save)

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: 325–332 DONE
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/shared/services/pi-proposals.service.ts; backend/src/modules/quotation/quotation.service.ts; backend/src/modules/quotation/dto/create-quotation.dto.ts; backend/src/modules/quotation/dto/update-quotation.dto.ts; docs/pages/proposals-create.page.md

Проверено: Create держит только in-memory `draftLines`/template; `QuotationService.create` умеет items/templateId/templateSnapshot; статус draft|…; paid нет; клиент = Counterparty.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Save на Create**
   - Кнопка `PiButton` «Сохранить» (видима когда выбран шаблон).
   - Первый Save → `POST` Quotation status=`draft`: organizationId, counterpartyId (если уже есть из 334 — optional пока), items из draftLines, templateId, **templateSnapshot** = текущий build HTML или structured snapshot (минимум: templateId + built html string / blocks hash — не оставлять null).
   - Повторный Save того же draft → `PATCH` тот же id.
   - После Save: toast короткий RU «Черновик сохранён» + хранить `quotationId` в session (signal + localStorage key `kp.create.lastDraftId`).

2. **Reopen при входе на /proposals/create**
   - Если есть lastDraftId и GET ok и status ∈ editable (`draft`, `sent`? — **только `draft`** в MVP) → загрузить template, draftLines/items, org, layout если сохраняли.
   - Если статус hard-locked later (336) / converted / cancelled → игнорировать, чистый Create.
   - Нет draft → как сейчас; дополнительно помнить `lastTemplateId` в localStorage и **предвыбрать шаблон** (даже без draft) — чтобы не кликать каждый раз.

3. **Dirty**
   - Незакрытый уход: optional confirm если dirty и не saved (не блокировать F5 насильно).

4. **Tests + docs**
   - FE: Save вызывает create/update; reopen hydrates lines.
   - BE: create with templateSnapshot persists.
   - page doc.

═══════════════════════════════════════════════════════════════
НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- paid lock / 322 UI (→ 336)
- Print 320
- Полный PDF
- deploy
- Ломать 332 table rail

known_limitation: Counterparty required на API — если BE требует counterpartyId, использовать optional/placeholder только если schema позволяет; иначе 334 must ship same wave before Save fails (порядок: 334 перед Save submit **или** сделать counterparty optional на draft create). **Предпочтение:** в этой TZ draft create допускает counterpartyId optional; 334 заполнит.

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. Save → запись в Mongo draft; F5 + снова /proposals/create → тот же шаблон и товары.
2. Closed/converted draft не автооткрывается.
3. Без last draft — хотя бы last template предвыбран.
4. Gates tsc + proposal-create + quotation tests зоны.
5. Archive после Cursor/PO PASS (visual: Save → F5 → данные на месте).

Финализация: `tasks/_archive/2026-08/TZ-SALES-333.done.md`.
