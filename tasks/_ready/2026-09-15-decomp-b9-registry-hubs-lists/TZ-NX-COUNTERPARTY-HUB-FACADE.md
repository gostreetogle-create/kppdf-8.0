═══════════════════════════════════════════════════════════════
TZ-NX-COUNTERPARTY-HUB-FACADE
═══════════════════════════════════════════════════════════════

SIZE: L
LAYER: 3
PAGES: /counterparties
PAGE_DOCS: docs/pages/counterparties.page.md (если есть; иначе создать тонкий note в Integrity)
РОЛЬ АГЕНТА: Frontend Architect (NX decomp)
ЗАВИСИМОСТИ: Нет (studio-list DONE; DETAIL no-move archived — другие keys)
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/counterparties/counterparty-hub-tray.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/counterparties/counterparty-hub-tray.component.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/counterparties/counterparty-hub.facade.ts

### Domain preflight
- Покупатель = Counterparty ≠ Organization.
- НЕ: CRM rule changes, mock data, registries/**, order-hub.

### ИСХОДНОЕ
Tray: `pages/counterparties/counterparty-hub-tray.component.ts` (+spec). Facade файла может ещё не быть — извлечь из tray as-is.

### ЧТО ДЕЛАТЬ
1. Extract `CounterpartyHubFacade` (signals) рядом с tray или `counterparties/counterparty-hub.facade.ts`.
2. Tray thin: inject facade, `providers: [CounterpartyHubFacade]` на tray/host.
3. No behavior/UX change. Specs green.
4. Checklist `docs/agent-checklists/TZ-NX-COUNTERPARTY-HUB-FACADE.md` + archive marker.

### НЕ ТРОГАТЬ
- `pages/registries/**`, `registry-forms/**`, `pages/studio/**`, order-hub

### AC
1. Facade extracted; tray providers local.
2. counterparty* specs green.
3. `nx build kppdf-web` last PASS.
4. Archive DONE.

CLAIM:
agent_id:
claimed_at:
