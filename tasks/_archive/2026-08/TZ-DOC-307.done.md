ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Gemini
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (21/21 document-template-category, 45/45 document-template)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS

TZ-DOC-307: Категории шаблонов — доменный контракт

Архитектурное решение: отдельная сущность DocumentTemplateCategory (НЕ переиспользование generic Category).
Причины: generic Category требует skuPrefix (не применимо к шаблонам), имеет type=material|product|general,
глобальный уникальный индекс {type, slug} — не поддерживает org-scoped уникальность.

Ключевые решения:
- categoryId в DocumentTemplate schema, Create/Update DTO, service create/update/duplicate/findAll
- Server-side default resolution: active org-scoped isDefault → system «Общее» → 400 BadRequest
- assertAssignable: exists + active + same org scope (or system/global) — testable 4xx
- Remove: 409 Conflict when referenced by templates; 409 for system categories
- Duplicate preserves source template's categoryId
- findAll supports categoryId filter
- Backfill migration for legacy templates without categoryId
- RBAC: admin|manager read, admin write only
- DTO whitelist with class-validator
- Organization scope via organizationId (sparse index, null = system)
