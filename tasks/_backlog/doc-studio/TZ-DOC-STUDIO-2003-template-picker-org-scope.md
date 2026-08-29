# TZ-DOC-STUDIO-2003: DocumentTemplate picker не org-scoped

> **[ИСПРАВЛЕНО]** — проверено инспекцией 2026-08-29 (повторная сверка кода, не commit message)

## Проверка исправления

`document-template.controller.ts:79-92` — `findAll` теперь берёт `organizationId` из `@CurrentUser()` (JWT), клиентский query-параметр organizationId убран из сигнатуры полностью. Комментарий :75-77 явно фиксирует контракт: «org-scoped users cannot enumerate cross-org templates; system admin (null org) sees all». Picker (`studio-template-pick-dialog.component.ts`) правок не потребовалось, как и предполагалось.

Известный gap до фикса: [`docs/audits/2026-08-23-kp-workspace-mcp-supplier-audit.md`](../../docs/audits/2026-08-23-kp-workspace-mcp-supplier-audit.md) §3.1.

## CONFLICT KEYS

`backend/src/modules/document-template/document-template.controller.ts`; `frontend/src/app/pages/doc-constructor/studio/studio-template-pick-dialog.component.ts`

## ДОКАЗАТЕЛЬСТВО

`document-template.controller.ts:71-79` — `findAll(@Query('organizationId') organizationId?: string)`: значение приходит от клиента и опционально. `studio-template-pick-dialog.component.ts:81` — `this.templatesSvc.list({})`, без organizationId вовсе.

Итог: picker в студии показывает шаблоны **всех** организаций. При выборе чужого шаблона `createFromTemplate` (`studio-document.service.ts:300`) вернёт ошибку — пользователь видит шаблон в списке, выбирает и получает отказ; плюс утечка названий/структуры чужих шаблонов в UI.

## ЧТО ДЕЛАТЬ

1. В `DocumentTemplateController.findAll` брать `organizationId` из `@CurrentUser()` (server-derived), а не из query — для не-sysadmin ролей игнорировать/отклонять клиентское значение.
2. Для sysadmin (если у роли есть кросс-org доступ по канону проекта) — явный флаг, не implicit "raw query passthrough".
3. Picker (`studio-template-pick-dialog.component.ts`) правок не требует, если backend теперь сам фильтрует по org.
4. Тест: пользователь org A не видит в списке шаблон org B; sysadmin (если применимо) видит оба.

## ACCEPTANCE CRITERIA

- [x] `findAll` org-scoped на backend независимо от query-параметра для обычных ролей
- [x] API-тест изоляции по organizationId
- [x] Ручная проверка picker'а в студии: список не содержит чужих шаблонов
