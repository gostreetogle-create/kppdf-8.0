═══════════════════════════════════════════════════════════════
TZ-NX-COUNTERPARTY-HUB-TO-FEATURES
═══════════════════════════════════════════════════════════════

SIZE: S
LAYER: 3
ЗАВИСИМОСТИ: TZ-NX-COUNTERPARTY-HUB-FACADE archived DONE
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/counterparties/**; frontend-nx/libs/features/src/lib/counterparties/**; frontend-nx/tsconfig.base.json (path alias only if new)

### ЧТО ДЕЛАТЬ
1. Move facade (+ tray UI if TZ/pattern requires dumb ui under features — prefer: facade to `@kppdf/features/counterparties`, tray can stay in app importing facade OR move tray to `features/.../ui` if already pure enough; do not invent dual copies).
2. Export from feature index; page/list host keeps route in app.
3. Specs + nx build last.
4. Archive.

### НЕ ТРОГАТЬ
registries/** · studio list · order-hub

### AC
Import from `@kppdf/features/counterparties`; no behavior change; build green; archive.

CLAIM:
agent_id:
claimed_at:
