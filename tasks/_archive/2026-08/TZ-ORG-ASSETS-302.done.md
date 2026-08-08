═══════════════════════════════════════════════════════════════
TZ-ORG-ASSETS-302: Requisites print + image bindings
═══════════════════════════════════════════════════════════════

STATUS: DONE · WAVE-PARTY-DOCS #6
DEPENDS ON: TZ-ORG-ASSETS-301 DONE + TZ-ORDERS-306 DONE
LAYER: 3–4
CHECKLIST: docs/agent-checklists/TZ-ORG-ASSETS-302.md
PAGES: documents / print pipeline
PAGE_DOCS: documents.page.md + organizations.page.md + builder.page.md

РОЛЬ: Backend print/registry + thin FE contract update

CONFLICT KEYS:
backend/src/modules/document-template/**;
backend/src/modules/generated-document/**;
backend/src/modules/template-block/**;
backend/src/modules/registry/registry.service.ts;
frontend/src/app/shared/services/pi-registry.service.ts;
docs/agent-checklists/TZ-ORG-ASSETS-302.md;

---

## OUTCOME

Существующий HTML render/snapshot pipeline получил typed bindings для организации,
контрагента, КП, счёта и заказа. Registry exposes organization requisites plus
`logoUrl`, `sealUrl`, `signatureUrl` aliases backed by `Organization.assets[]` roles.
Order builds cascade the linked stub quotation and counterparty; the issuer organization
comes from the template. Missing vault slots remain graceful: image/seal output is empty,
signature keeps its placeholder line. No new PDF engine was introduced.

## ACCEPTANCE

1. С печатью видны реквизиты + vault images when slots exist: PASS.
2. Без vault — empty/placeholder output, generation does not crash: PASS.
3. Existing build and generated-document snapshot paths remain the only render paths: PASS.
4. Designer-facing registry/docs updated: PASS.

## VERIFICATION

- Backend `pnpm typecheck`: PASS.
- Backend focused document-template Jest: PASS, 60 tests.
- Backend generated-document Jest: PASS, 10 tests.
- Frontend `pnpm typecheck`: PASS.
- Frontend focused registry/builder Jest: PASS, 32 tests.
- Targeted ESLint: 0 errors (two pre-existing `no-explicit-any` warnings in render code).
- `git diff --check`: PASS.
- Prettier: frontend reports existing CRLF files against configured LF; backend package has no Prettier binary. No formatter rewrite was applied.
- `bash OrchestratorKit/verify-status.sh`: pre-existing FAIL remains for 72 legacy kit-era entries; not in this zone.

## NOT TOUCHED

- New PDF engine / deploy / DaData.
- `desktop/mcp-runtime/**` and other foreign WIP.
- `tasks/Данные/` and secrets.

ARCHIVE_MARKER:
outcome: DONE
closed_at: 2026-08-08
closed_by: agent-3e757640b7 (Freebuff executor)
archive: tasks/_archive/2026-08/TZ-ORG-ASSETS-302.done.md
lock: .mimocode/locks/TZ-ORG-ASSETS-302-print-bind.lock
deploy: NO
