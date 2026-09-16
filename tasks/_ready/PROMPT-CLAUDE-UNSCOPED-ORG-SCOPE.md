# PROMPT — Claude: P0 unscoped org scope lockout (403 +Фото)

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0 на main (continuous).

=== UNATTENDED + THOROUGH ===
PO AFK. После TZ: archive + commit + push. Секреты не печатать.
=== /UNATTENDED ===

## Startup
how-to-connect → GEMINI.md (claude) → PO-CANON.
git fetch && merge origin/main.
Если REVISION-RACE ещё в _active — сначала добей/archive его, потом этот TZ.
Claim: tasks/_ready/TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE.md
Evidence: docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-ISSUER-SELECT.txt §lockout

## Суть
Admin JWT orgId=null → resolveOrganizationId = первая org по имени.
После смены «Исполнитель» doc.organizationId ≠ fallback → assertSameScope 403
на POST …/blocks (+Фото), GET, PATCH. Не 409 revision.

Fix: unscoped caller — не assert against alphabetical fallback; bound user — IDOR оставить.
FE: 403 scope → toast, не conflict dialog.

## Не брать
wipe · Freebuff UI pack · снимать scope у bound user

## Отчёт
SHA | PASS | curl/Playwright: switch issuer → +Фото 200.
```
