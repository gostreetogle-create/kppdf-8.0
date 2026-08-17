# TZ-MIG-304: Почта фirmы (Counterparty.email) + 10 адресов КП3

> **Статус:** PARTIAL DONE · 2026-08-17 · composer-executor-mig-304
> Checklist: `docs/agent-checklists/TZ-MIG-304.md`
> Report: `docs/audits/2026-08-12-kp3-cp-email-person-report.md`
> Deps: TZ-MIG-302 DONE

---

## Что сделано

1. **Schema:** optional `Counterparty.email` (no unique index).
2. **API:** create/update DTO + `@IsEmail()` + trim/lowercase transform; search includes email.
3. **UI:** поле «Почта» в FullEditor рядом с телефоном (`data-test="cp-email"`).
4. **Tests:** backend counterparty 17/17; editor spec 9/9 (+ email payload test).
5. **Load script:** `data/from-kp3/_mig304_cp_email_load.py` (REST, Person backfill if empty).

## Load outcome

- **0/10** emails written — SoT `192.168.1.103:3000` timeout; MCP offline.
- Schema+UI = DONE; load = BLOCKED (honest report with 10-row table).

## Gates

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
cd backend && pnpm exec jest --testPathPattern=counterparty --no-coverage  → 17/17
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
cd frontend && pnpm exec jest counterparty-full-editor-dialog.component.spec.ts  → 9/9
```

## Files

- `backend/src/modules/counterparty/counterparty.schema.ts`
- `backend/src/modules/counterparty/dto/create-counterparty.dto.ts`
- `backend/src/modules/counterparty/counterparty.service.ts`
- `backend/src/modules/counterparty/counterparty.spec.ts`
- `frontend/src/app/shared/services/pi-counterparty.service.ts`
- `frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.ts`
- `frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.spec.ts`
- `docs/pages/counterparties.page.md`
- `docs/audits/2026-08-12-kp3-cp-email-person-report.md`
- `data/from-kp3/_mig304_cp_email_load.py`

ARCHIVE_MARKER
outcome: PARTIAL
closed_at: 2026-08-17
closed_by: composer-executor-mig-304
verification:
  - acceptance criteria: PARTIAL (schema+UI PASS; load BLOCKED SoT down)
  - typecheck: PASS
  - tests: PASS (17 BE + 9 FE editor)
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: PASS
