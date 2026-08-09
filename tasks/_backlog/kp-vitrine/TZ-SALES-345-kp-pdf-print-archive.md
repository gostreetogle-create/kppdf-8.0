═══════════════════════════════════════════════════════════════
TZ-SALES-345: Create КП — «Скачать ▾»: PDF, Печать, В архив документов
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create ; /proposals ; /doc-constructor/documents
PAGE_DOCS: proposals-create.page.md ; proposals.page.md ; documents.page.md
Аудит: docs/audits/2026-08-09-kp-builder-completeness-audit.md §2.6

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: 341 DONE (итог/НДС persist)
LAYER: 3
CONFLICT KEYS: backend/src/modules/quotation/quotation.controller.ts; backend/src/modules/quotation/quotation.service.ts; backend/src/modules/document-template/document-template.service.ts; backend/src/modules/document-template/document-template.controller.ts; backend/src/modules/generated-document/generated-document.service.ts; backend/package.json; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/shared/services/pi-proposals.service.ts; docs/pages/proposals-create.page.md

Проверено: в backend **нет** PDF-движка (0 совпадений `puppeteer|pdfkit|pdf-lib`);
`financial-report.service.ts:137–141` возвращает «not implemented»;
готовый HTML уже собирается `document-template.service.ts` `build()` → `renderHtml()`;
`GeneratedDocument` хранит `html` + `buildPayload` и умеет `POST /generated-documents/from-template/:templateId`,
но из студии не вызывается. Печати и скачивания в FE КП нет вообще.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Backend: PDF из того же HTML**
   - Добавить `puppeteer-core` (+ `@sparticuz/chromium` или системный Chrome через
     `PUPPETEER_EXECUTABLE_PATH`) — решение фиксировать в `docs/pages/proposals-create.page.md`.
   - `POST /quotations/:id/pdf` → рендерит **тот же** HTML, что видит студия
     (снимок `templateSnapshot.html`, если он есть; иначе свежий `build`), формат из шаблона
     (A4/A3, ориентация), `printBackground: true`, поля 0 (вёрстка уже в HTML).
   - Ответ `application/pdf` с именем `КП-<number>.pdf`; ошибки движка → 503 + RU-сообщение
     «Сервис печати недоступен, используйте Печать в браузере».
   - Таймаут ≤ 20 с, один экземпляр браузера на процесс (не запускать Chromium на каждый клик).

2. **Backend: сохранить в архив**
   - `POST /quotations/:id/generated-document` (или переиспользовать существующий эндпоинт)
     кладёт `GeneratedDocument` с `sourceType: 'quotation'`, `sourceId`, `html`, `buildPayload`,
     `status: 'final'`; повторный вызов создаёт новую запись, не перетирает старую.

3. **Frontend: одна кнопка «Скачать ▾» в верхней строке студии**
   - Пункты: **PDF** · **Печать** · **Сохранить в архив документов**.
   - Печать = `print()` того же A4-iframe, без открытия нового окна с «сырым» HTML.
   - Перед любым пунктом дожать автосохранение (не печатать несохранённое).
   - Успех/ошибка — один тост, важное дублируется в колокольчик.
   - Те же действия доступны из «Все КП» строкой меню (PDF/Печать), чтобы не заходить в студию.

4. **Деплой-заметка**
   - В `docs/` зафиксировать, какие системные пакеты нужны Chromium на VM; если движок не
     установлен — приложение стартует нормально, PDF отвечает 503, печать работает.

5. Tests: e2e — `POST /quotations/:id/pdf` отдаёт `application/pdf` и непустой буфер (или 503
   при отсутствии движка); архивная запись создаётся с `sourceType: 'quotation'`.
   FE — меню содержит три пункта; печать вызывается на iframe; автосохранение дожимается.

ИЗМЕНЯТЬ: quotation controller/service, document-template render (только вызов из PDF),
generated-document, верхнюю строку студии, зависимости backend.
НЕ ИЗМЕНЯТЬ: вёрстку бланка, отправку почтой, публичные ссылки, `Quotation.status`
(это 347), шелл 317.

known_limitation: e-mail клиенту и ссылка «клиент смотрит онлайн» — вне волны;
многостраничность PDF ограничена тем, что умеет HTML до TZ-SALES-346.

КРИТЕРИИ ПРИЁМКИ:
1. «Скачать → PDF» отдаёт файл, визуально совпадающий с листом в студии (фон, таблица, подвал).
2. «Печать» открывает системный диалог печати именно бланка, без служебного chrome.
3. «Сохранить в архив документов» создаёт запись, видимую в `/doc-constructor/documents`.
4. Без установленного движка приложение работает, PDF даёт понятное RU-сообщение.
5. Gates: BE tsc + `pnpm test -- quotation`; FE tsc + `pnpm test -- proposal-create`;
   Prettier/ESLint/diff-check PASS; browser self-verify PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-345.done.md` + lock + checklist Executor report.
