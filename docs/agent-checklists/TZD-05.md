# TZD-05 checklist

> Status: **DONE**
> Source: `tasks/_backlog/desktop/TZD-05-web-desktop-pairing-button.md`

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-05T20:00:00Z
- closed_at: 2026-08-05T20:45:00Z
- workspace: D:\kppdf-8.0

## Acceptance

- [x] Logged-in manager can copy a valid pairing JSON matching `parsePairing` rules
- [x] Expired/missing token → clear RU error, no silent bad packet
- [x] FE tsc / focused tests PASS
- [x] No unrelated dirty staged
- [x] apiBaseUrl = backend origin (dev: 127.0.0.1:3000, prod: window.location.origin)

## Gates (fact)

- [x] `cd frontend && pnpm exec tsc --noEmit --project tsconfig.app.json` — PASS
- [x] `cd frontend && npx jest -- pairing-dialog` — 8/8 PASS

## Executor report

- Added `frontend/src/app/pages/desktop/pairing-dialog.component.ts` — standalone dialog, `variant="content"`, Copy + Close.
- Modified `frontend/src/app/layout/app-layout.component.ts` — Monitor-icon button in header, `resolveApiBaseUrl()` via `isDevMode()` + `API_BASE_URL`.
- `onDesktopPairing()` builds JSON: `apiBaseUrl` (dev: `http://127.0.0.1:3000`, prod: `window.location.origin`), `apiKey`, `username`, `expiresAt`.
- RU toast errors for: missing token, user not hydrated, malformed JWT, expired token.
- Updated `desktop/docs/PAIRING.md` — dev/prod apiBaseUrl note.
- Pure FE — no backend endpoint.
- No touch to desktop/mcp, TZD-11/12/13, Catalog-313.
