ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Gemini + Buffy (review round)
commit: 06ff27c (initial) / 73cc8a0 (final review fixes)
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (backend tsc exit 0)
  - tests: PASS (50/50 targeted document-template-category + document-template; 315/315 full backend suite)
  - review: PASS (3 review rounds — IDOR org-scope guards, escaped search regex, server-side slug, validated duplicate)
  - checklist: ADDED
  - progress.md: UPDATED
  - STATUS.md: UPDATED
  - status synchronization: PASS
browser: MANUAL_BROWSER_CHECK_REQUIRED (deep E2E scenarios; contract verified via backend unit/integration tests)

TZ-DOC-307: Категории шаблонов — доменный контракт

Архитектурное решение: отдельная сущность DocumentTemplateCategory (НЕ переиспользование generic Category).
Причины: generic Category требует skuPrefix (не применимо к шаблонам), имеет type=material|product|general,
глобальный уникальный индекс {type, slug} — не поддерживает org-scoped уникальность.

Ключевые решения:
- categoryId в DocumentTemplate schema, Create/Update DTO, service create/update/duplicate/findAll
- Server-side default resolution: active org-scoped isDefault → system «Общее» → 400 BadRequest
- assertAssignable: exists + active + same org scope (or system/global) — testable 4xx
- Remove: 409 Conflict when referenced by templates; 409 for system categories
- Duplicate preserves source template's categoryId (validated, fallback on default)
- findAll supports categoryId filter (search + org-scope merged via $and, escaped regex)
- Backfill migration for legacy templates without categoryId
- RBAC: admin|manager read, admin write only
- DTO whitelist with class-validator
- Organization scope via organizationId (sparse index, null = system)
