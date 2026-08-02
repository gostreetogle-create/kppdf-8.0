ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
commit: e0c9568 (main) — archive marker itself committed in docs(closeout)
verification:
  - acceptance criteria: PASS (all 5 criteria proven by tests)
  - backend tsc (tsconfig.build.json --noEmit): PASS (exit 0)
  - frontend tsc (tsconfig.app.json --noEmit): PASS (exit 0)
  - ng build --configuration=development: PASS (exit 0)
  - backend e2e document-templates-props (5 tests): PASS
  - backend unit document-template (58 tests / 4 suites): PASS
  - frontend builder + templates service jest (126 tests / 7 suites): PASS
  - eslint (changed FE files): PASS (0 errors, 4 pre-existing warnings in builder.page.ts)
  - git diff --check: PASS
  - code review: PASS (independent review — 3 minor findings fixed: unused import, section renumber 03->02, e2e assert tightened to toBe(200))
  - verify-status.sh: PASS
  - checklist: ADDED
  - progress.md: UPDATED
  - STATUS.md: UPDATED (READY -> DONE)
browser: MANUAL_BROWSER_CHECK_REQUIRED (no live dev-stack credentials in this session; API contract verified via e2e + unit tests)

═══════════════════════════════════════════════════════════════
TZ-DOC-311: Свойства шаблона — починить «Нумерацию страниц», убрать «Оглавление»/«Шапку»/«Подвал» из UI
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Developer (DTO) + Frontend Component Engineer

ЗАВИСИМОСТИ: Нет. Не запускать параллельно с TZ-DOC-313/TZ-DOC-314
(общий файл builder-inspector.component.ts).

LAYER: 4 (затрагивает backend DTO — ставим самый строгий слой)

CONFLICT KEYS:
backend/src/modules/document-template/dto/create-document-template.dto.ts;backend/src/modules/document-template/document-template.service.spec.ts;frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts;frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts;frontend/src/app/pages/doc-constructor/builder/builder.page.ts;frontend/src/app/shared/services/pi-document-templates.service.ts;frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.spec.ts;frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.spec.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Наблюдение пользователя: в свойствах холста ставишь галочку «Нумерация
   страниц» — она исчезает; то же с «Оглавление». Вписываешь текст в
   «Шапка документа» / «Подвал документа» — текст появляется и сразу исчезает.

2. ПРИЧИНА (подтверждена кодом): поля `pageNumbering`, `tableOfContents`,
   `headerText`, `footerText` ЕСТЬ в схеме
   (`backend/src/modules/document-template/document-template.schema.ts`, строки
   ~58-67), но ОТСУТСТВУЮТ в `CreateDocumentTemplateDto`
   (`backend/src/modules/document-template/dto/create-document-template.dto.ts`;
   `UpdateDocumentTemplateDto` — PartialType, т.е. тоже без них). Глобальный
   `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`
   (`backend/src/main.ts`) отклоняет такие поля: PATCH возвращает 400.

3. `BuilderPage.onTemplateUpdate()` (builder.page.ts): оптимистичное обновление
   `template`, а при `!res.ok` — `findById` и замена `template` серверной
   копией. Из-за 400 оптимистичное значение откатывается: галка снимается,
   текст шапки/подвала пропадает (~300ms debounce в инспекторе + время запроса).

4. Дополнительно: на канвасе `tableOfContents` вообще не рендерится (в
   `BuilderCanvasComponent` нет такого input; рендерится только
   `pageNumbering` → `.canvas-page-number`). «Шапка/Подвал» рендерятся как
   статичные индикаторы `.canvas-header-text` / `.canvas-footer-text`.

5. Продуктовое решение пользователя:
   - «Нумерация страниц» — ОСТАВИТЬ и починить.
   - «Оглавление» — УДАЛИТЬ из UI (не имеет смысла, нигде не отображается).
   - «Шапка документа» / «Подвал документа» — УДАЛИТЬ из UI (тексты
     добавляются обычными текстовыми блоками).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 (backend): добавить сохранение «Нумерации страниц».

  В `CreateDocumentTemplateDto` добавить:
  `@IsOptional() @IsBoolean() pageNumbering?: boolean;`
  (`UpdateDocumentTemplateDto` наследует через PartialType). `tableOfContents`,
  `headerText`, `footerText` в DTO НЕ добавлять — они уходят из UI (ШАГ 2),
  в схеме остаются как legacy-поля без миграции.

  Тест backend: PATCH `/document-templates/:id` c `{ pageNumbering: true }` →
  200/2xx, поле сохранено и возвращается; поле `headerText` в PATCH → 400
  (подтверждает, что UI больше не шлёт его — после ШАГ 2 это ок).

ШАГ 2 (frontend inspector): убрать лишние поля.

  В `builder-inspector.component.ts` (шаблонная панель свойств шаблона) удалить:
  - toggle «Оглавление» (tableOfContents);
  - поле «Шапка Документа» (headerText);
  - поле «Подвал Документа» (footerText).
  Оставить: «Прозрачность фона», «Нумерация страниц», секцию фонового
  изображения, метаданные (без шапки/подвала). Удалить ставшие мёртвыми
  `onTemplateTextInput`/`textInput$`/debounce, если они используются только для
  header/footer (проверить — если больше ни для чего, выпилить чисто).

ШАГ 3 (frontend canvas + page): убрать рендер шапки/подвала.

  - `builder-canvas.component.ts`: удалить inputs `headerText`/`footerText`,
    рендер `.canvas-header-text` / `.canvas-footer-text`; ОСТАВИТЬ
    `pageNumbering` → `.canvas-page-number`.
  - `builder.page.ts`: убрать прокидывание `[headerText]`/`[footerText]`.
  - `pi-document-templates.service.ts`: типы `headerText?/footerText?/
    tableOfContents?` пометить legacy-комментарием (или убрать из интерфейса,
    если не используются больше нигде — проверить потребителей
    code-search'ем: templates.page.ts, duplicate-флоу и др.).

ШАГ 4: проверить backend build/duplicate.

  `document-template.service.ts` (duplicate, строки ~338-341) копирует
  headerText/footerText/pageNumbering/tableOfContents — это legacy-копирование,
  оставить как есть (без миграции); убедиться, что build() не падает без них.

ШАГ 5: тесты frontend.

  - spec инспектора: «Нумерация страниц» не откатывается после эмита update;
    «Оглавление», «Шапка Документа», «Подвал Документа» отсутствуют в DOM.
  - spec канваса: header/footer не рендерятся; page-number рендерится при
    pageNumbering=true.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- backend/src/modules/document-template/dto/create-document-template.dto.ts — добавить pageNumbering.
- backend тесты document-template (unit/e2e) — PATCH pageNumbering.
- frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts — удалить оглавление/шапку/подвал.
- frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts — удалить header/footer рендер.
- frontend/src/app/pages/doc-constructor/builder/builder.page.ts — убрать прокидывание headerText/footerText.
- frontend/src/app/shared/services/pi-document-templates.service.ts — типы legacy-пометка.
- соответствующие .spec.ts файлы.

НЕ ИЗМЕНЯТЬ:
- document-template.schema.ts — поля остаются (без миграции);
- layout-renderer.ts build-логику, пока не проверена необходимость;
- другие TZ-файлы, progress.md, ARCHITECTURE.md.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Галка «Нумерация страниц» остаётся включённой после клика, сохраняется в
   базе и переживает перезагрузку страницы.
2. В шаблонной панели инспектора больше нет «Оглавление», «Шапка Документа»,
   «Подвал Документа».
3. На канвасе нет `.canvas-header-text`/`.canvas-footer-text`; индикатор
   номера страницы работает.
4. PATCH `{ pageNumbering: true }` на backend возвращает успех и сохраняет поле
   (unit/e2e тест).
5. Frontend typecheck, backend typecheck, targeted Jest (FE+BE),
   `git diff --check` проходят.

РУЧНОЙ СЦЕНАРИЙ: открыть шаблон → свойства холста → включить «Нумерация
страниц» (галка не снимается, на холсте появляется номер «1») → перезагрузить
страницу → галка включена. Убедиться, что полей «Оглавление/Шапка/Подвал» нет.

ОГРАНИЧЕНИЯ: удаление полей из схемы и миграция данных — НЕ в scope (при
необходимости оформить отдельный successor).
