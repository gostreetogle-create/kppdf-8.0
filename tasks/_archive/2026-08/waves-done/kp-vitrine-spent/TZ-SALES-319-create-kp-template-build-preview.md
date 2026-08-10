# TZ-SALES-319: Create КП — WYSIWYG вставка шаблона (build HTML)

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: `docs/audits/2026-08-09-kp-create-template-insert-fidelity-audit.md`
Spec: `docs/ux/kp-create-studio-spec.md` (обновить § center preview)

РОЛЬ АГЕНТА: frontend executor (Angular) — заменить stub-превью на серверный HTML шаблона.
ЗАВИСИМОСТИ: **TZ-SALES-317 DONE/archived** (те же CONFLICT KEYS; не claim пока 317 в `_active`).
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; docs/pages/proposals-create.page.md; docs/ux/kp-create-studio-spec.md

Проверено: `proposal-create-template-center.component.ts` (stub name/description/«упрощённое»/draftLines); `pi-document-templates.service.ts` `build()`; `document-template.service.ts` `build` + `resolveTableBlock` + `renderHtml` (bg + layout); e2e `document-templates-build.e2e-spec.ts` empty body → empty placeholders.
Dictation: «личная информация» → не chrome реестра / не stub draftLines на листе; бланк = Organization через build issuer / inspector, клиент = Counterparty later.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. После выбора шаблона center рисует **метаданные** (`name`, description) и текст «Превью A4 (упрощённое)» + optional `<ul>` из `draftLines` — это **не** layout шаблона.
2. `POST /api/document-templates/:id/build` уже отдаёт text/html с фонами, positioned blocks, table preview — FE сервис `DocumentTemplatesService.build` готов, Create КП не вызывает.
3. Legacy `GET :id/preview` **не** SoT (без того же resolveTableBlock path) — только `build`.
4. Shell 317 (A4 fit, rails, overlay) оставляем; меняем **содержимое** листа.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Загрузка HTML при выборе шаблона**
   - При `selectedTemplate()` с `_id` → `DocumentTemplatesService.build(id, sourceIds)`.
   - `sourceIds`: если inspector уже знает `organizationId` — передать; иначе `{}`.
   - Не передавать выдуманные counterparty/product ids.
   - Хранить: `previewHtml` / `previewStatus` (`idle|loading|ready|error`) в page или center (один владелец состояния).
   - При смене шаблона или org в inspector — пересобрать (debounce ≤300ms ок).

2. **Рендер листа**
   - Убрать с sheet: `h3` name, description, фразу про «упрощённое», список `draftLines`.
   - Показать sandboxed **iframe** (`srcdoc` или blob URL) с HTML от build; `sandbox` без `allow-scripts` (достаточно для статичного HTML+img).
   - Масштаб: iframe внутренний размер = page mm из HTML; снаружи **contain** в `.center__sheet` (transform scale или width/height %), top-aligned — как нынешний A4 fit.
   - Пустой selected — без изменений: CTA «Добавить шаблон».
   - Loading: короткий RU на листе («Загрузка шаблона…»). Error: «Не удалось загрузить шаблон» + можно оставить кнопку «Добавить шаблон»/повтор не обязателен если re-select есть.

3. **Фоны / таблицы / позиции**
   - Не изобретать клиентский layout-renderer: доверять HTML `build`.
   - Убедиться (ручной / unit mock), что в ответе есть `.doc-bg` при наличии background у шаблона и table markup при table-блоке (мок HTML в spec ок).
   - Если img `/uploads/...` не грузятся из srcdoc — поправить base URL (absolute origin API / `<base href>`) **минимально** в FE обёртке, без переписывания BE renderHtml без нужды.

4. **Тесты**
   - Обновить `proposal-create.page.spec.ts`: после select — **нет** `kp-tpl-name` chrome; есть контейнер превью (`data-test="kp-tpl-html-preview"` или iframe); mock `build` возвращает HTML с маркером (напр. `DATA_TEST_BUILD_OK` / `.doc-bg`).
   - Регресс: пустой state CTA; pick открывает left tool.

5. **Docs**
   - `proposals-create.page.md` + `kp-create-studio-spec.md` § center: stub → build HTML; убрать «richer preview later» как открытый долг для 319.
   - Checklist + Executor report перед READY FOR REVIEW.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- `proposal-create-template-center.component.ts` (+ styles)
- `proposal-create.page.ts` — wiring build / org id / inputs
- `proposal-create.page.spec.ts`
- page doc + kp-create-studio-spec (только § preview / зона center)

Опционально тонкий helper (sanitize/trust srcdoc) рядом с center — не в `styles.css` global.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- backend `document-template.service` / schema (кроме если img URL реально ломается — тогда минимальный fix + сказать в report)
- builder.page / DOC-344 keys
- SALES-318 cascade, SALES-320 print
- persist Quotation / Counterparty write
- подстановка `draftLines` в table HTML (successor)
- global `styles.css` theme
- чужие `_active` TZ

known_limitation:
- Полный parity editor-canvas ↔ build HTML (ручки resize) — не цель; SoT = build.
- Живые строки изделий в таблице шаблона — later.
- Counterparty на бланке — later.
- skipIssuerFallback flag — не в этой TZ (issuer org на бланке ок).

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Выбран шаблон → на center **нет** имени шаблона / «упрощённое превью» / bullet draftLines.
2. Center показывает HTML из `build` (iframe/srcdoc); в mock/spec ответ `build` вызван с id шаблона.
3. В HTML от реального/мок build видны признаки фона и/или positioned/table контента (не пустая белая карточка с chrome).
4. Смена шаблона → новый `build`; пустой state → «Добавить шаблон».
5. Shell 317 не регресс: rails/overlay/A4 fit container остаются.
6. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=proposal-create
   ```
7. Checklist `docs/agent-checklists/TZ-SALES-319.md` + `## Executor report (auto)`.
8. Archive после Cursor/PO visual PASS на шаблоне **с фоном и позициями** (не на пустом).

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

По `GEMINI.md`: claim → code → gates → READY FOR REVIEW → Cursor/PO PASS →
`tasks/_archive/2026-08/TZ-SALES-319.done.md` + progress + lock + убрать `_active`.
Deploy: НЕТ.
