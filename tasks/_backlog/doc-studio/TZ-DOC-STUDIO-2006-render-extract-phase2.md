# TZ-DOC-STUDIO-2006: DocumentRenderService extract неглубокий — DocumentTemplateService всё ещё god-object

> **Приоритет: НЕЗНАЧИТЕЛЬНО (техдолг, не блокер)** · найдено инспекцией плана Document Studio v2 (2026-08-29)
> **ADR:** [`docs/architecture/document-studio.md`](../../docs/architecture/document-studio.md) — Wave 1 extract requirement

## CONFLICT KEYS

`backend/src/modules/document-template/document-template.service.ts`; `backend/src/modules/document-render/**`

## ДОКАЗАТЕЛЬСТВО

`document-render/` создан, 6 файлов, ~560 строк — реальный extract произошёл. Но `document-template.service.ts` похудел лишь на 256 строк (было 2197, стало 1959) — по-прежнему совмещает CRUD + duplicate + backgrounds (upload/remove/setDefault) + orientation + resolveBinding + пагинацию в одном файле. Wave 1 план предполагал вынос рендера как отдельную зону ответственности, а не косметическое сокращение god-object на ~12%.

## ЧТО ДЕЛАТЬ

Не блокирует текущие Wave 16+ задачи, но перед тем как студия и builder начнут одинаково активно писать в `document-template.service.ts`/`document-render`, стоит:

1. Вынести `resolveBinding`/`previewLineValue` (резолвинг данных для рендера) в `document-render` или отдельный `document-data-resolver`, отделив от HTML/PDF-генерации.
2. Вынести background upload/remove/setDefault в отдельный сервис (не относится к рендеру и не относится к CRUD шаблона напрямую).
3. Цель: `document-template.service.ts` — только CRUD + orchestration, без бизнес-логики рендера/данных/файлов.

## ACCEPTANCE CRITERIA

- [ ] `document-template.service.ts` сокращён до CRUD/orchestration; резолвинг данных и file-handling живут в отдельных сервисах
- [ ] tsc + существующие render/CRUD тесты зелёные после разделения
