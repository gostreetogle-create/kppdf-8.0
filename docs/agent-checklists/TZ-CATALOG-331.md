# TZ-CATALOG-331 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-CATALOG-331.md` (removed at closeout)
> Route: `/catalog/appearance`

## Claim slot

- agent_id: `agent-3e757640b7`
- claimed_at: `2026-08-07T22:22:24Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: yes

## Scope delivered

- [x] Russian admin page «Оформление каталога» with four hue slots: product, module, material, raw material.
- [x] Shared `PiAccentHueFieldComponent` with presets and «Авто».
- [x] Footer action uses `(click)="onSubmit()"` and button type `button`.
- [x] Existing settings collection reused; organization scope is derived from JWT and namespaced as `catalog.appearance.<organizationId>`.
- [x] Global fallback remains `catalog.appearance`; code defaults remain the final fallback.
- [x] Server DTO validates each hue as integer `0..359`; organizationId is not accepted from request body.
- [x] `catalogKindOklch` receives the loaded palette; tree and BOM inspector consume the reactive palette signal.
- [x] Route and Catalog navigation are admin-only and are not mixed with RAL/color_references.
- [x] Page docs and page↔TZ index updated.

## Gates

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- [x] Targeted frontend Jest: kind palette + appearance service + BOM panel — 3 suites / 6 tests PASS
- [x] Targeted backend Jest: setting service — 1 suite / 2 tests PASS
- [x] Scoped frontend ESLint (without `--fix`) — PASS
- [x] Scoped backend ESLint (without `--fix`) — PASS
- [x] Angular development build — PASS; pre-existing NG8113 warning in DocumentsPage remains outside TZ scope
- [x] `git diff --check` — PASS
- [x] Code review — critical findings addressed: reactive palette, org cache key, RBAC alignment, DTO validation, page index.

## Closeout

- Archive: `tasks/_archive/2026-08/TZ-CATALOG-331.done.md`
- Lock: `.mimocode/locks/TZ-CATALOG-331-catalog-appearance.lock`
- Commit: pending closeout commit
- Deploy: **not run**
- Browser smoke: pending local authenticated admin session; verify `/catalog/appearance`, save, reload `/products/:id`, light/dark.
