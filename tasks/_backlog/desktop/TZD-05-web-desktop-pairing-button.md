═══════════════════════════════════════════════════════════════
TZD-05: Web «Подключить десктоп» — pairing JSON packet
═══════════════════════════════════════════════════════════════

> READY for parallel work with TZD-11 (no shared conflict with `desktop/mcp/`).
> LAYER 2 · Web FE + optional thin backend.
> Vision/contract: `desktop/docs/PAIRING.md`
> CONFLICT: see keys below — НЕ трогать `desktop/mcp/**`, Catalog-313 photos.

РОЛЬ АГЕНТА: executor (Angular FE + Nest if needed).

ЗАВИСИМОСТИ: none for MVP (may mint packet from current session JWT).

Проверено: `desktop/docs/PAIRING.md`; `desktop/src/core/pairing.ts`; archive TZD-00 roadmap.

---

## ИСХОДНОЕ

- Desktop already validates pairing JSON via `parsePairing()`.
- Web has **no** «Подключить десктоп» button yet.
- Contract fields: `apiBaseUrl`, `apiKey`, `username`, `expiresAt`.

---

## ЧТО ДЕЛАТЬ

1. **MVP (preferred):** On an authenticated settings/profile or admin-visible place, button «Подключить десктоп»:
   - Builds JSON from current session: `apiBaseUrl` (window origin API base or env), `apiKey` = current access token, `username` from `/auth/me`, `expiresAt` from token claims or session expiry.
   - Shows modal: pretty-printed JSON + **Copy** + short instructions (paste into desktop).
2. If access token is not readable from FE storage by design — add `POST /api/desktop/pairing` that returns a short-lived pairing packet (JWT admin/manager); document in PAIRING.md.
3. Tests: unit for packet builder; optional component smoke.
4. Do **not** change desktop MCP (TZD-11).

---

## НЕ

- `desktop/mcp/**`, TZD-11/12/13/14/15 implementation.
- TZ-CATALOG-313 conflict keys (photos/attachments/modules).
- Full OAuth device-flow / QR (nice later).
- Storing password in pairing packet.

---

## ACCEPTANCE

- [ ] Logged-in manager can copy a valid pairing JSON matching `parsePairing` rules.
- [ ] Expired/missing token → clear RU error, no silent bad packet.
- [ ] PAIRING.md updated if backend endpoint added.
- [ ] FE tsc / focused tests PASS; no unrelated dirty staged.

CONFLICT KEYS: `frontend/src/app/layout/;frontend/src/app/pages/admin/;frontend/src/app/core/;backend/src/modules/desktop/;desktop/docs/PAIRING.md;docs/agent-checklists/TZD-05.md;tasks/_active/TZD-05.md;progress.md`
