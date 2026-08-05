═══════════════════════════════════════════════════════════════
TZD-05: Web «Подключить десктоп» — pairing JSON packet — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: Buffy
acceptance_status: PASS
verification:
  - Button in header (Monitor icon, auth-guarded): PASS
  - Dialog with JSON + Copy + Close: PASS
  - Clipboard API + execCommand fallback: PASS
  - RU errors: no token, expired token, missing user: PASS
  - apiBaseUrl = backend origin (isDevMode-aware): PASS
  - FE tsc (tsconfig.app.json): PASS
  - jest pairing-dialog: 8/8 PASS
  - desktop/docs/PAIRING.md updated: PASS
checklist: docs/agent-checklists/TZD-05.md
source: tasks/_backlog/desktop/TZD-05-web-desktop-pairing-button.md

---

## Summary

Pure-FE pairing button in app header → dialog with JSON packet.
Fields: apiBaseUrl (dev: http://127.0.0.1:3000, prod: window.location.origin),
apiKey (JWT access token), username, expiresAt (ISO-8601 from JWT exp).

No backend endpoint created. Pairing JSON matches desktop parsePairing() contract.

Files:
- frontend/src/app/pages/desktop/pairing-dialog.component.ts (new)
- frontend/src/app/pages/desktop/pairing-dialog.component.spec.ts (new)
- frontend/src/app/layout/app-layout.component.ts (modified)
- desktop/docs/PAIRING.md (updated)
- docs/agent-checklists/TZD-05.md (checklist)
