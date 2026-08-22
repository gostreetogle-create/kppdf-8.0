═══════════════════════════════════════════════════════════════
TZ-CORE-304: запушить leftover CORE-302 (deletedAt)
═══════════════════════════════════════════════════════════════

> docs/TZ-AUTHORING.md. Покупатель = Counterparty ≠ Organization.

РОЛЬ АГЕНТА: Backend Developer
ЗАВИСИМОСТИ: TZ-CORE-302 archive говорит DONE, но Group B **не на origin**.
  CORE-303 починил только `@Schema` у 17 файлов. На диске остались
  незакоммиченные `deletedAt` в ~44 schema.ts + spec.
LAYER: 4
PAGES: N/A
PAGE_DOCS: N/A

CONFLICT KEYS:
backend/src/database/soft-delete-coverage.spec.ts;
backend/src/modules/actual-cost/actual-cost.schema.ts;
backend/src/modules/attachments/attachment.schema.ts;
backend/src/modules/attribute-definition/attribute-definition.schema.ts;
backend/src/modules/bom/bom.schema.ts;
backend/src/modules/cart-item/cart-item.schema.ts;
backend/src/modules/cart-session/cart-session.schema.ts;
backend/src/modules/certificate/certificate.schema.ts;
backend/src/modules/comment/comment.schema.ts;
backend/src/modules/contract/contract.schema.ts;
backend/src/modules/desk-note/desk-note.schema.ts;
backend/src/modules/document-table-type/document-table-type.schema.ts;
backend/src/modules/document-template-category/document-template-category.schema.ts;
backend/src/modules/document-template/document-template.schema.ts;
backend/src/modules/entity-attribute-value/entity-attribute-value.schema.ts;
backend/src/modules/financial-report/financial-report.schema.ts;
backend/src/modules/form-profiles/form-profile.schema.ts;
backend/src/modules/generated-document/generated-document.schema.ts;
backend/src/modules/import-jobs/import-jobs.schema.ts;
backend/src/modules/import-task/import-task.schema.ts;
backend/src/modules/import-todo/import-todo.schema.ts;
backend/src/modules/interaction/interaction.schema.ts;
backend/src/modules/inventor-file/inventor-file.schema.ts;
backend/src/modules/invoice/invoice.schema.ts;
backend/src/modules/order-task/order-task.schema.ts;
backend/src/modules/organization/contacts/organization-contact.schema.ts;
backend/src/modules/person/person.schema.ts;
backend/src/modules/photos/photo.schema.ts;
backend/src/modules/product-module-photo/product-module-photo.schema.ts;
backend/src/modules/product-passport/product-passport.schema.ts;
backend/src/modules/product-photo/product-photo.schema.ts;
backend/src/modules/production-order/production-order.schema.ts;
backend/src/modules/purchase-order/purchase-order.schema.ts;
backend/src/modules/purchase-request/purchase-request.schema.ts;
backend/src/modules/reconciliation-act/reconciliation-act.schema.ts;
backend/src/modules/reservation/reservation.schema.ts;
backend/src/modules/routing-step/routing-step.schema.ts;
backend/src/modules/rpp/rpp.schema.ts;
backend/src/modules/stock-movement/stock-movement.schema.ts;
backend/src/modules/storage-item/storage-item.schema.ts;
backend/src/modules/tech-process/tech-process.schema.ts;
backend/src/modules/tender/tender.schema.ts;
backend/src/modules/text-block-category/text-block-category.schema.ts;
backend/src/modules/text-block/text-block.schema.ts;
backend/src/modules/work-order-operation/work-order-operation.schema.ts;
backend/src/modules/work-order/work-order.schema.ts

═══════════════════════════════════════════════════════════════
DOMAIN PREFLIGHT
═══════════════════════════════════════════════════════════════

Проверено: `git diff` на диске vs `origin/main` (`bafac3ea`). Diff —
`deletedAt?: Date | null` (CORE-302 Group B). Не inventить новые поля.
`DocType` уже на origin с `@Schema({ softDelete: false, ... })`.
Вложенный `ContractItem` тоже получил deletedAt — если это `_id: false`
subdoc, CORE-302 skip: убери deletedAt только с чистых subdocs, не с
коллекций.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: `git fetch` + `git status`. Не `git add -A`. Не трогать docs/
Cursor (PO-CANON, CLAUDE.md, skills).

ШАГ 2: Stage **только** CONFLICT KEYS (схемы + spec).
  `git add -- backend/src/modules/...schema.ts backend/src/database/soft-delete-coverage.spec.ts`

ШАГ 3: Gates
  `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
  `cd backend && pnpm exec jest src/database/soft-delete-coverage.spec.ts --runInBand`
  Если spec красный из-за schema без deletedAt и без softDelete:false —
  допиши opt-in/out **только** в том файле, не по всему репо.

ШАГ 4: commit + push (не --no-verify без нужды). Archive
  `tasks/_archive/2026-08/TZ-CORE-304.done.md` + lock. Строка `_NOW`.
  Deploy нет.

НЕ ИЗМЕНЯТЬ: frontend/**, desktop/**, docs PO-CANON/CLAUDE, чужой WIP вне KEYS.

КРИТЕРИИ: KEYS на origin; spec PASS; tsc PASS; `git status` без M на этих schema.
