# frontend-nx — kppdf Nx warehouse (clean)

Parallel Angular monorepo for incremental migration from legacy [`../frontend/`](../frontend/).

## Quick start

```bash
cd frontend-nx
pnpm install
pnpm exec nx serve kppdf-web    # http://localhost:4201
pnpm exec nx build kppdf-web
pnpm exec nx run-many -t lint --all
```

## Verify architecture and UI tokens

From the repository root:

```bash
pnpm run architecture:check:nx
pnpm run ui:tokens:nx
```

The token gate intentionally compares the Nx UI tree with `scripts/check-ui-tokens.nx-baseline.json`; existing migration debt is frozen there, while newly introduced raw hex/RGB colors fail the gate.

Proxy (dev): `/api`, `/uploads`, `/downloads` → `http://localhost:3000` (see `apps/kppdf-web/proxy.conf.json`).

## Libs (F0 scaffold)

| Path | Import | Tag |
|------|--------|-----|
| `libs/ui/paper-and-ink` | `@kppdf/ui` | `type:ui` |
| `libs/util/http` | `@kppdf/util-http` | `type:util` |
| `libs/data-access` | `@kppdf/data-access` | `type:data-access` |
| `libs/features` | `@kppdf/features` | `type:feature` |

Module boundaries: `@nx/enforce-module-boundaries` in root `eslint.config.mjs` — **ui ↛ data-access**.

## Full stack (Mongo + backend + Nx UI)

Из корня репозитория — тот же оркестратор, что и для legacy:

```bash
node start.mjs --nx              # Mongo :27017 + backend :3000 + nx :4201 + browser
node start.mjs --nx --no-browser
pnpm run start:nx                # alias
```

Legacy склад (`frontend/`) при этом **не** стартует — параллельно на :4200.

### Когда смотреть в браузере

| Волна | URL | Что увидите |
|-------|-----|-------------|
| F1 ✅ | http://localhost:4201 | Paper & Ink global styles (пустой shell) |
| **F4** (kit shell) | http://localhost:4201/kit/overview | UI Kit — 4 канона (side-by-side с legacy :4200) |
| F3+ | `/api/*` через proxy | login/logout после data-access |

**Сейчас:** F2a ✅, F4 в работе → после зелёного F4 запускайте `node start.mjs --nx` и открывайте `/kit/overview`.

## Waves

- **F0** ✅ bootstrap
- **F1** ✅ styles + util/http
- **F2a** ✅ Pi primitives
- **F4** kit shell (in progress)
- **F3** auth/data-access (+ error-banner F3d)
- **F5** Document Studio
