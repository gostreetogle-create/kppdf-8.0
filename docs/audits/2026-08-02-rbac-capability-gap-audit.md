# Audit: RBAC / capability gap (2026-08-02)

> **Peer-validate note (Cursor Mode A):** исходный файл по пути
> `docs/audits/2026-08-02-rbac-capability-gap-audit.md` в worktree **отсутствовал**
> на момент peer-pass. Ниже — grounded reconstruction + peer verdicts с
> file:line. Не путать с lifecycle / DOC / PRODUCTS / MATERIALS.

**Scope:** frontend route/nav capability gates ↔ backend `@Roles` /
`@Permissions` / `PermissionsGuard` ↔ vision page-ACL (ACCESS-301/302).

---

## Finding 1 — App routes almost ungated by capability

**Claim (upstream ~25):** большинство operational routes без
`capabilityRouteGuard` / `data.capabilities`.

**Peer verdict: CONFIRM (count corrected).**

| Metric | Count | Evidence |
|--------|------:|----------|
| `path:` entries in `app.routes.ts` | 40 | full file |
| `loadComponent` leafs (all layouts) | 36 | incl. kit + login + forbidden |
| AppLayout operational leafs (excl. `builder` redirect) | **24** | `app.routes.ts:106–297` |
| With `capabilityRouteGuard` | **2** | `admin/users` L271–276, `admin/roles` L281–283 |
| Ungated operational leafs | **22** | materials…stock-movements + `admin` placeholder |

PO «~25» ≈ 22 ungated + redirect `doc-constructor/builder` (L231–233) +
`admin` placeholder (L293–296) ≈ 24–25 path slots. **Use 22 ungated leaf
pages** as precise gate debt.

**Recommended stub:** `TZ-ACCESS-303` (route → pageKey + CanMatch).

---

## Finding 2 — Nav capability filter only on admin items

**Peer verdict: CONFIRM.**

- `app-layout.component.ts` — only admin nav entries carry `capabilities`:
  `user:admin` / `role:read` (≈ L130, L135; comment TZ-256 §ШАГ 3 ≈ L117).
- All catalog / docs / warehouse / sales nav items visible to any
  authenticated user (parent `authGuard` only).

**Recommended stub:** `TZ-ACCESS-304` (nav pageKey filter for all sections;
depends ACCESS-301; overlaps ACCESS-302 — 304 = wire remaining items +
regression AC after 302).

---

## Finding 3 — «PermissionsGuard missing»

**Peer verdict: CORRECTED — infrastructure already present; adoption gap remains.**

| Check | Result | Citation |
|-------|--------|----------|
| Guard file exists | ✅ | `backend/src/common/guards/permissions.guard.ts` (TZ-255) |
| Registered as `APP_GUARD` | ✅ | `app.module.ts:268` **before** `RolesGuard` L269 |
| Parallel with `@Roles` | ✅ AND-compose | guard header L39–49; module comment L253–263 |
| Pass-through if no `@Permissions` | ✅ | `permissions.guard.ts:67–69` |
| `@Permissions` usage | sparse | essentially **admin/** controllers only (see Z-007) |

Finding 3 is **partially closed** as «create guard». Remaining work =
adoption / read-policy (already parked as `Z-007`) + shop decision:
page-ACL (ACCESS-*) vs fine `@Permissions` on every controller.

**Recommended stub:** `TZ-RBAC-302` (policy foundation: when page ACL vs
`@Permissions`; do **not** re-implement guard).

---

## Finding 4 — Vision page-ACL vs fine-grained catalog drift

**Peer verdict: CONFIRM.**

- Vision: «страница целиком да/нет» — `docs/product-vision-lite.md` L16.
- Runtime catalog: `section:action` keys — `capabilities.metadata.ts`,
  `RBAC-CONTRACT.md` §1–2.
- ACCESS-301/302 specs exist under `tasks/` but **page:\*** layer not
  materialized in seed / `/auth/me` yet.

**Recommended stub:** covered by ACCESS-301/302 + ACCESS-303 map; no fifth
duplicate — instead `TZ-RBAC-302` locks the policy so executors don’t
paint `@Permissions` on 73 modules against vision.

---

## Finding 5 — `user:read` / `/me` contract under-documented; no `_backlog/` `/me` TZ

**Peer verdict: CONFIRM (with nuance).**

| Check | Result |
|-------|--------|
| `GET /auth/me` exists | ✅ `auth.controller.ts:97–103` → `getMe` |
| Returns `permissions` | ✅ `auth.service.ts:271` |
| Returns `pages[]` | ❌ not in `toAuthUser` (L264–278) |
| Dedicated `_backlog/**` TZ for `/me` | ❌ none (ACCESS-301 in `tasks/` mentions pages on `/auth/me` as step, not a parked `/me` stub) |
| `user:read` semantics in `RBAC-CONTRACT.md` | ❌ only table row L36; **no** self-service note |
| Code already reserves `user:read` for self-service | ✅ `app.routes.ts:274–275`; `users-admin.controller.ts` comments ≈ L57–59, L81, L205 |

**Recommended stub:** `TZ-RBAC-304` (contract + `/auth/me` pages[] handoff with ACCESS-301).

---

## Recommended TZ stubs (5)

| # | ID | Finding | Layer |
|---|-----|---------|-------|
| 1 | `TZ-RBAC-302` | 3+4 policy foundation | 4 / docs |
| 2 | `TZ-ACCESS-303` | 1 route→page map + guards | 3 |
| 3 | `TZ-ACCESS-304` | 2 nav page filter completeness | 3 |
| 4 | `TZ-RBAC-303` | 3 adoption lite (pointer Z-007) | 4 |
| 5 | `TZ-RBAC-304` | 5 `user:read` + `/me` contract | 4 |

**First by deps:** `TZ-RBAC-302` (policy) → existing `TZ-ACCESS-301` →
`TZ-ACCESS-303` (quick win wiring) → `TZ-ACCESS-302`/`304` → `TZ-RBAC-304`.
`TZ-RBAC-303` parallel after 302; full read sweep remains `Z-007`.

---

## Out of scope

GEMINI.md executor loops; TZ-DOC / TZ-PRODUCTS / TZ-MATERIALS chains;
lifecycle ORDERS/PRODUCTION stubs.
