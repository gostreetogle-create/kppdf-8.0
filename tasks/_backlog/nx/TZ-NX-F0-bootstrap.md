# TZ-NX-F0: Bootstrap Nx workspace `frontend-nx/`

**РОЛЬ АГЕНТА:** Executor (Gemini / Claude CLI / Freebuff)  
**ЗАВИСИМОСТИ:** нет (foundation wave 0)  
**LAYER:** infra / Nx workspace (не legacy `frontend/`)  
**CONFLICT KEYS:** `frontend/nx-foundation`; `frontend/build-config`; `frontend/package-graph`; `root/start-deploy-contract`

**PAGES:** N/A (инфраструктура)  
**PAGE_DOCS:** N/A

## ИСХОДНОЕ СОСТОЯНИЕ

- Nx workspace **отсутствует** (`nx.json` не найден).
- Legacy Angular app: [`frontend/`](../frontend/) — Angular 20.3, pnpm, standalone, OnPush.
- План миграции: [`.cursor/plans/nx_foundation_bootstrap_d5eeb4d5.plan.md`](../.cursor/plans/nx_foundation_bootstrap_d5eeb4d5.plan.md) — sign-off 3/3 от PO 2026-08-29.
- PO decisions: папка `frontend-nx`, dev port **4201**, F5 = Document Studio, secondary entries only (no god-barrel).

**Проверено:** `frontend/package.json`; `frontend/proxy.conf.json`; `frontend/jest.config.js`; `scripts/architecture-check.mjs` (хардкод `frontend/src` — расширение в TZ-NX-GATES, не в F0).

## ЧТО ДЕЛАТЬ

### F0a — Nx scaffold

1. `npx create-nx-workspace@latest frontend-nx` — Angular monorepo, app `kppdf-web`, pnpm, standalone, CSS, Jest, esbuild, **без** Nx Cloud.
2. Сгенерировать libs (пустые scaffold):
   - `libs/ui/paper-and-ink` → import `@kppdf/ui`
   - `libs/util/http` → import `@kppdf/util-http`
   - `libs/data-access` → import `@kppdf/data-access`
   - `libs/features` → import `@kppdf/features` (пустой каркас)
3. `tsconfig.base.json` paths для `@kppdf/*`.

### F0b — Runtime contract

4. Dev-server port **4201** (`project.json` serve options).
5. Скопировать [`frontend/proxy.conf.json`](../frontend/proxy.conf.json) → `frontend-nx/apps/kppdf-web/proxy.conf.json`; подключить в serve target.
6. Pin Angular/CDK версии = legacy [`frontend/package.json`](../frontend/package.json) (20.3.x).

### F0c — Boundaries + gates baseline

7. Nx tags + `@nx/enforce-module-boundaries` в root `frontend-nx/eslint.config.mjs`:

| sourceTag | onlyDependOnLibsWithTags |
|-----------|--------------------------|
| `type:app` | `type:ui`, `type:data-access`, `type:util`, `type:feature` |
| `type:ui` | **`type:ui` only** (строгая изоляция — ни util, ни data-access) |
| `type:data-access` | `type:util`, `type:data-access` |
| `type:feature` | `type:ui`, `type:data-access`, `type:util` (**без** `type:feature`) |
| `type:util` | `type:util` |

8. Явные запреты: `type:ui` → `type:util` / `type:data-access`; `type:feature` → `type:feature`; `type:data-access` → `type:feature`.

### F0d — Verify

9. `pnpm install` в `frontend-nx/`.
10. Gates green (см. AC).

## ИЗМЕНЯТЬ

- `frontend-nx/**` (новый workspace)
- `tasks/TZ-NX-F0-bootstrap.md` (этот файл — статус в archive при закрытии)

## НЕ ИЗМЕНЯТЬ

- `frontend/**` (legacy склад)
- `backend/**`
- `scripts/architecture-check.mjs` (отдельная TZ-NX-GATES)
- `start.mjs` / root deploy scripts (отдельная TZ)

## КРИТЕРИИ ПРИЁМКИ

```bash
cd frontend-nx && pnpm install
cd frontend-nx && pnpm exec nx build kppdf-web
cd frontend-nx && pnpm exec nx lint kppdf-web
cd frontend-nx && pnpm exec nx test kppdf-web --passWithNoTests
cd frontend-nx && pnpm exec nx run-many -t lint --all
```

- [ ] `frontend-nx/` существует; `nx.json` + 4 libs + app `kppdf-web`
- [ ] `@kppdf/ui`, `@kppdf/util-http`, `@kppdf/data-access`, `@kppdf/features` резолвятся
- [ ] Serve port 4201; proxy `/api`, `/uploads`, `/downloads`
- [ ] Module boundaries lint: ui ↛ data-access
- [ ] Legacy `frontend/` git-clean (no changes)
- [ ] PO: `nx serve kppdf-web` → default Angular welcome на `:4201`

## CLAIM

```text
agent_id: cursor
claimed_at: 2026-08-29T06:12:00+03:00
task: TZ-NX-F0-bootstrap
```

## ARCHIVE

После DONE: `tasks/_archive/2026-08/TZ-NX-F0-bootstrap.done.md` + lock при необходимости.

---

## F0 COMPLETION (2026-08-29)

**Outcome:** **DONE** (после rollback scope creep по ADR Principal Architect)

### Rollback (2026-08-29)

Удалено вне scope F0:
- `libs/ui/paper-and-ink/src/lib/**` (кроме scaffold `paper-and-ink/`), `page/`, `theme/`, `styles/global.css`
- `libs/util/http/` migrated code → scaffold `http.ts`
- `libs/features/pi-group-workspace*` → scaffold `features.ts`
- `libs/data-access/` stubs → scaffold `data-access.ts`
- F1 deps (tailwind, tiptap, lucide, fontsource, clsx) из `package.json`
- `postcss.config.js`

Осталось: 4 `.ts` в `paper-and-ink` (scaffold), пустые libs, `kppdf-web` shell :4201.

### Evidence

```text
cd frontend-nx && pnpm install
cd frontend-nx && pnpm exec nx build kppdf-web          → SUCCESS
cd frontend-nx && pnpm exec nx test kppdf-web           → passed
cd frontend-nx && pnpm exec nx run-many -t lint --all   → SUCCESS
```

### Delivered

- `frontend-nx/` Nx 21.4 + Angular **20.3.30**
- App `apps/kppdf-web` — port **4201**, proxy parity legacy
- Libs scaffold: `@kppdf/ui`, `@kppdf/util-http`, `@kppdf/data-access`, `@kppdf/features`
- `@nx/enforce-module-boundaries` — матрица F0c (см. выше)
- `@angular/cdk` pinned в `package.json` (F0b.6)
- Legacy `frontend/` — not modified

### Next wave

- **TZ-NX-F1-foundation** — styles + util/http + API tokens (отдельный Claim)
