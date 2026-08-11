═══════════════════════════════════════════════════════════════
TZD-39: Desktop/MCP + nginx Basic Auth coexist
═══════════════════════════════════════════════════════════════

> Исправление «Failed to fetch» при паринге к https://kppdf-crm.ru после
> включения подъезда (HTTP Basic Auth). Часть работы уже в коде main;
> этот файл — AC/closeout если нужен отдельный archive.

РОЛЬ АГЕНТА: Desktop + Backend guard (Cursor desktop zone)

ЗАВИСИМОСТИ: Basic Auth на VPS (2026-08-10); SPA JWT → X-Access-Token hotfix

LAYER: 3

CONFLICT KEYS: desktop/src/core/api.ts; desktop/src/App.svelte; desktop/src/core/config.ts; desktop/src/core/mcpHost.ts; desktop/mcp/src/backend.ts; backend/src/common/guards/jwt-auth.guard.ts; backend/src/modules/desktop/desktop-pairing-key.service.ts; frontend/src/app/pages/desktop/pairing-dialog.component.ts; desktop/docs/PAIRING.md; desktop/docs/MCP.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ (диагноз 2026-08-11)
═══════════════════════════════════════════════════════════════

1. nginx Basic на всём сайте; `Authorization: Bearer kppd_…` → 401 HTML без CORS
   → Desktop fetch → TypeError `Failed to fetch` (не «устарело»).
2. SPA уже шлёт JWT в `X-Access-Token`; Desktop/MCP ещё слали Bearer.
3. JwtAuthGuard читал pairing **только** из Bearer — надо и из X-Access-Token.
4. Pairing dialog: revoke soft-delete → «отозван» висит в списке; Copy внизу слабо видна.

═══════════════════════════════════════════════════════════════
ЧТО СДЕЛАНО / AC
═══════════════════════════════════════════════════════════════

- [x] Nest: pairing key из `X-Access-Token` или Bearer
- [x] Desktop api: `X-Access-Token` + optional Basic; поля подъезда в UI
- [x] MCP backend: `X-Access-Token` + `KPPDF_HTTP_BASIC_USER/PASS`
- [x] mcpHost прокидывает Basic в env
- [x] revoke = hard delete; list только active
- [x] Copy рядом с «Выпустить ключ»
- [ ] Warm deploy BE+FE; Desktop rebuild/publish (PO)
- [ ] Smoke: Basic+X-Access-Token `/api/auth/me` с валидным kppd_ = 200

Gates:
```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- desktop-pairing
cd frontend && pnpm test -- pairing-dialog
cd desktop && pnpm typecheck && pnpm mcp:check
```
