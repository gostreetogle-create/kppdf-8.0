# TZD-21 — Desktop pairing keys TTL/multi/revoke

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (self — continuous executor AC+gates)

## Delivered

- Opaque `kppd_…` keys + hash registry; JWT session no longer in pairing packet
- API: issue / list / revoke; TTL 1d|7d|30d|90d|never; multi-key (max 10)
- JwtAuthGuard accepts pairing Bearer
- FE dialog: issue form + list/revoke + copy packet
- Desktop `parsePairing` allows `expiresAt: null`
- Docs: PAIRING.md, MCP.md, FEATURE checklist

## Verification

- backend tsc PASS; jest desktop-pairing 6/6 PASS
- frontend tsc PASS; jest pairing 4/4 PASS
- desktop tsc PASS

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: continuous-executor-composer
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - checklist: ADDED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: continuous-executor-composer
