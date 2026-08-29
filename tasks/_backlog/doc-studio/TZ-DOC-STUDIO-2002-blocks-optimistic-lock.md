# TZ-DOC-STUDIO-2002: Optimistic lock на block CRUD в студии

> **[ИСПРАВЛЕНО]** — проверено инспекцией 2026-08-29 (повторная сверка кода, не commit message)

## Проверка исправления

- `studio-document.controller.ts:170-224` — `POST :id/blocks`, `PATCH :id/blocks/layouts`, `POST :id/blocks/reorder` все принимают `expectedRevision` в DTO, ApiOperation-описание явно помечает «expectedRevision required».
- `studio-document.service.ts:283-339` — три метода помечены комментарием `TZ-DOC-STUDIO-2002 — ... revision gate (not LWW)`, каждый вызывает `this.assertRevision(doc, expectedRevision)` перед мутацией; `assertRevision` (:113-126) кидает конфликт и инкрементирует `doc.revision += 1`.
- `studio-blocks-state.service.ts` хранит и прокидывает `expectedRevision` во все мутирующие вызовы (:206, :272, :336, `updateStudioLayouts` ×3), инкрементирует на успехе (:617).
- `studio-document.service.spec.ts:624` — тест `addBlock returns 409 on stale expectedRevision` подтверждает конфликт на backend.

## Было (для истории)

CONFLICT KEYS: `backend/src/modules/studio-document/studio-document.controller.ts`; `studio-document.service.ts`; frontend `studio-blocks-state.service.ts`, `studio-revision-conflict-dialog.component.ts`

Доказательство: blocks-эндпоинты не принимали `expectedRevision`, revision-гейт был только на PATCH/data-sets — конкурентное редактирование блоков било тихим last-write-wins.

## ACCEPTANCE CRITERIA

- [x] Все mutating blocks-эндпоинты требуют `expectedRevision`, отдают 409 при рассинхроне
- [x] `revision` документа инкрементируется при любой мутации блоков
- [x] FE прокидывает `expectedRevision` на blocks-эндпоинты (диалог конфликта — не проверялся визуально, но контракт данных на месте)
- [x] API-тест конкурентной правки (stale expectedRevision → 409) есть
