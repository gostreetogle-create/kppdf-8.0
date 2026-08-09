═══════════════════════════════════════════════════════════════
TZ-DOC-342: upload-background null file → 400
═══════════════════════════════════════════════════════════════

> Domain preflight: DocumentTemplate (не Counterparty); upload = mutation на
> существующий шаблон; unique N/A. Проверено: controller L162–191 без
> `if (!file)`; photos/organization уже проверяют; reproduce: POST без
> поля `file` → 500 `{message:"Internal server error"}`; PNG/JPEG через
> `/api/.../upload-background` → 201.

РОЛЬ АГЕНТА: Backend Engineer (Nest upload hardening)

ЗАВИСИМОСТИ: Нет (hotfix поверх TZ-86 / DOC-333)

LAYER: 3

PAGES: /doc-constructor/builder/:id
PAGE_DOCS: builder.page.md

CONFLICT KEYS: backend/src/modules/document-template/document-template.controller.ts; backend/src/modules/document-template/document-template.service.ts; backend/src/modules/template-block/template-block.controller.ts; backend/src/modules/template-block/template-block.service.ts; backend/test/e2e/document-templates-upload-background.e2e-spec.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `POST /api/document-templates/:id/upload-background` (`document-template.controller.ts`)
   принимает `@UploadedFile() file` и сразу зовёт `service.uploadBackground(id, file)`.

2. Если multipart **без** поля `file` (или multer не распарсил файл):
   `file` = `undefined` → обращение к `file.mimetype` / `file.buffer` →
   необработанный TypeError → глобальный filter → **HTTP 500**
   `"Internal server error"`.

3. Соседние upload'ы (`photos.controller`, `organization.controller`) уже делают
   `if (!file) throw BadRequestException(...)`. `template-block` uploadImage —
   тот же пробел (симметрия).

4. Happy path (PNG/JPEG/WebP ≤5MB, поле `file`) на локали = **201** (проверено
   2026-08-09). Лимит 5 фонов = **409** с RU-текстом (не 500).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: GUARD MISSING FILE (document-template)

  В `uploadBackground` controller **до** вызова service:

  ```ts
  if (!file) {
    throw new BadRequestException(
      'Файл не получен. Выберите PNG, JPEG или WebP (поле «file»).',
    );
  }
  ```

  Опционально defense-in-depth в `DocumentTemplateService.uploadBackground`:
  тот же check в начале (не обязательно, если controller покрыт тестом).

ШАГ 2: SYMMETRY — template-block uploadImage

  Тот же `if (!file)` в `template-block.controller.ts` `uploadImage`
  (и при желании в service). Сообщение RU аналогичное.

ШАГ 3: E2E / UNIT

  В `document-templates-upload-background.e2e-spec.ts` добавить кейс:
  POST multipart **без** `file` (или пустое тело / чужое поле) → **400**,
  не 500; message содержит «Файл не получен» (или стабильный фрагмент).

ШАГ 4: DOCS (коротко)

  Одна строка в `docs/pages/builder.page.md` (или page note): upload фон —
  только png|jpeg|webp ≤5MB; max 5; пустой file → 400.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- MIME whitelist / 5MB / MAX_BACKGROUND_IMAGES=5 поведение
- FE builder upload UX (кроме если toast уже ок через extractErrorMessage)
- OwnershipGuard / Roles
- Storage path `/uploads/document-templates/...`
- Печать / schema rewrite

known_limitation:
- Расширение MIME (HEIC/GIF) — отдельный successor, не здесь
- Диагностика «почему FE occasional empty file» — только если воспроизведётся
  после 400 (сеть/прокси); в этой TZ не копать FE без факта

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. POST upload-background без поля `file` → **400** + понятный RU message (не 500).
2. POST с валидным PNG → по-прежнему **201** + url.
3. template-block uploadImage без file → **400** (не 500).
4. Gates:
   ```
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test:e2e -- test/e2e/document-templates-upload-background.e2e-spec.ts
   ```
   (если e2e infra тяжёлая — минимум unit на controller/service + tsc; e2e
   предпочтителен; зафиксировать в checklist что реально гоняли)

5. Executor report (auto) + archive после Cursor/PO PASS.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

GEMINI.md claim → code → gates → review →
`tasks/_archive/2026-08/TZ-DOC-342.done.md`
