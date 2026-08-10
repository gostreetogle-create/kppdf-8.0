# RESEARCH BRIEF — Create КП: preview fidelity wave-2 (для сильной модели)

**Кому:** более мощный исследовательский ИИ (не исполнитель кода).  
**От кого:** оркестратор Cursor + PO kppdf-8.0.  
**Цель:** независимое исследование → executable TZ (+ промпт исполнителю), а не «ещё один быстрый фикс».  
**Репо:** `D:\kppdf-8.0` · ветка `main` · после `TZ-SALES-321` DONE (`44a1583e` / preview fidelity closeout).

Скопируй **весь блок ниже** сильной модели:

---

```text
ROLE
Ты — senior product+frontend/backend исследователь для цехового ERP kppdf (~10 пользователей).
Язык ответа: русский. Код продукта НЕ пишешь. Не «соглашайся» с PO без проверки кода.
Сначала факты из репозитория, потом независимое UX-мнение, потом TZ.

CONTEXT (уже сделано — не переоткрывай)
- TZ-SALES-317: Create КП focus shell — A4 center, icon-rails, overlay (FROZEN в docs/ux/kp-create-studio-spec.md §0).
- TZ-SALES-319/321: center показывает HTML из POST /api/document-templates/:id/build в sandbox iframe;
  layout блоков сохраняется через toObject(); /uploads rewrite; scale contain частично.
- Snapshot/lock / «оплачена» / SALES-322 — PARK (NOTE-KP-template-snapshot-lock.md); не смешивай в эту волну без нужды.

PO VISUAL 2026-08-09 (после 321) — что уже хорошо
- Фон шаблона виден.
- Тексты и цвета блоков в целом на местах — «сграмотно».

PO VISUAL — что НЕ нравится (исследовать, не слепо кодировать)
1) SCROLL: на center всё ещё есть H и/или V scrollbar. Нужно: лист A4 целиком влезает в доступный viewport студии (между rails), пропорция 210:297 сохраняется, без «письменного» скролла листа. Scale можно чуть сильнее ужимать.
2) EMPTY TABLE UX: вместо Excel-подобной таблицы с рамками/заголовками столбцов видно пугающее «Нет данных» (plain text). Ожидание PO: даже без строк — отрисованная таблица (thead + хотя бы одна пустая строка / пустые ячейки), как бланк.
3) ADD DATA: из левого рейла «Товары» позиции в draftLines добавляются в память, но в превью бланка / таблице шаблона НЕ появляются. PO думал, что «добавил данные в КП» = они видны на листе.

HYPOTHESES TO VERIFY IN CODE (обязательно проверь file:line)
A) Scale: iframe intrinsic 794×1123 + transform scale на .center__sheet; кто ещё даёт overflow (body mm, padding build HTML, studio height, parent scroll)?
B) Empty table: TableTemplateService.preview() при sampleRows=[] возвращает <p>Нет данных</p> вместо <table><thead>…</thead><tbody>empty row</tbody>. Builder canvas может рисовать иначе (block-renderer «Нет данных» внутри таблицы).
C) Products: proposal-create.page вызывает build(id, { organizationId? }) и НЕ передаёт draftLines / productIds в build; resolveTableBlock берёт только table-template preview(sampleRows) — значит «данные не добавляются» может быть by design gap, не баг клика.

INDEPENDENT RESEARCH (обязательно, даже если PO «наболтал»)
Ответь отдельно от диктовки PO:
1) Как в зрелых KP/quote builders обычно устроен live preview: scale-to-fit, empty tables, line items → document tables?
2) Нужен ли на Create КП bind draftLines→table уже сейчас, или достаточно: (i) skeleton table headers + (ii) отдельная зона «позиции КП» вне бланка до Save?
3) Где граница: presentation blank vs commercial data fill? Не сломай FROZEN shell 317.
4) Что PO мог недосказать / лишнее: зафиксируй 3–5 рисков.

READ (минимум)
- docs/PO-DIARY.md §1–§4 + хвост §5 про КП
- docs/ux/kp-create-studio-spec.md (§0 FROZEN)
- docs/audits/2026-08-09-kp-create-template-preview-fidelity-fail.md
- docs/audits/2026-08-09-kp-create-template-insert-fidelity-audit.md
- tasks/_backlog/kp-vitrine/NOTE-KP-template-snapshot-lock.md
- frontend/.../proposal-create.page.ts (build payload, draftLines)
- frontend/.../proposal-create-template-center.component.ts (scale, iframe)
- backend/.../document-template.service.ts (build, resolveTableBlock, renderHtml)
- backend/.../table-template.service.ts (preview empty)
- frontend/.../builder block-renderer (как таблица в editor)

DELIVERABLES (строго в этом порядке)
1) VERDICT (10 строк): что реально сломано vs что by design.
2) AUDIT MD draft path: docs/audits/YYYY-MM-DD-kp-create-preview-wave2.md
   (симптомы → evidence file:line → root cause).
3) PRODUCT DECISIONS: таблица решений (вопрос | варианты | рекомендация | почему).
4) TZ SPLIT: 1–3 executable TZ (не монолит). Для каждой:
   - CONFLICT KEYS; deps; НЕ делать; AC измеримые; pnpm gates.
   Следуй docs/TZ-AUTHORING.md (Counterparty≠Organization; Quotation).
   Предлагаемые ID: TZ-SALES-323+ (не занимай 322 — PARK stale refresh).
5) PROMPT для локального исполнителя (Gemini/Buffy): один копипастный блок на первую TZ.
6) OUT OF SCOPE list (snapshot 322, print 320, builder drag, deploy).

QUALITY BAR
- Не предлагай встроить весь BuilderCanvas.
- Не авто-обновляй все КП при save шаблона.
- Пустая таблица ≠ скрыть блок; ≠ один scary paragraph.
- Scale: contain в sheet; scrollbars на листе = FAIL.
- Если bind изделий в таблицу — явный контракт (какие колонки, qty/price), иначе skeleton-only TZ.

STOP CONDITIONS
Если не можешь открыть код — скажи, какие пути нужны; не выдумывай schema.
Конец ответа: «Готово к передаче оркестратору» + список файлов, которые оркестратор должен положить в git.
```

---

## Заметки оркестратора (коротко)

| Тема | Сейчас в коде (ориентир) |
|------|---------------------------|
| Scroll | Scale есть, но PO всё ещё видит скролл → дожать contain / html body padding / overflow chain |
| «Нет данных» | `table-template.service.ts` empty → `<p>`, не `<table>` |
| Товары на листе | `draftLines` не уходят в `build()` — known gap после 321 |

После ответа сильной модели: оркестратор (Cursor) кладёт audit+TZ+prompt в `tasks/_backlog/kp-vitrine/` и выдаёт PO один путь промпта исполнителю.
