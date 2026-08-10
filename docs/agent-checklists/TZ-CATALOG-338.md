# TZ-CATALOG-338 checklist

> Status: **DONE**
> Marker: archived; `tasks/_active/TZ-CATALOG-338.md` removed
> Commit/push: **YES** per continuous wave prompt

## Claim slot

- agent_id: `Buffy/freebuff-259639d6-2fe2-49fd-bb50-6b4af549f3c3`
- claimed_at: `2026-08-10T16:54:22.5951215Z`
- workspace: `D:\kppdf-8.0` (host-managed isolated worktree)
- team_room_claim: unavailable (`Unknown task`; sync required)

## Acceptance

- [x] Product `sku` is required and trimmed; Product `name` is optional and list/detail use `sku` fallback.
- [x] Module `article` is required; same-organization duplicate articles map to RU 409 feedback.
- [x] Material `article` is required; same-organization duplicate articles map to RU 409 feedback; internal `sku` generation remains intact.
- [x] Product/Module/Material schemas and DTOs enforce the new contracts and document legacy empty rows.
- [x] Product, Module, Material forms and QuickCreate use required article/sku validators and RU labels.
- [x] Form profiles lock Product `sku` and Module `article`; Product `name` is not locked-required.
- [x] Backend targeted Jest and frontend tsc/targeted Jest/build pass.
- [x] Executor report, archive marker, lock, checkpoint, commit, and push completed.

## Integrity

- [x] Type: module + page; existing routes and permissions unchanged.
- [x] Relevant docs updated: products, modules, materials, and form-profiles.
- [x] Foreign WIP and banned paths excluded; no deploy, EAV, WAVE-KP, SALES-340+, SUPPLY-303, desktop, or mcp-runtime changes.
- [x] Canon: `docs/DOCS-INTEGRITY.md` respected.

## Gates (fact)

- [x] Backend tsc: `pnpm exec tsc -p tsconfig.build.json --noEmit`
- [x] Backend targeted Jest: **63/63** across product/material/module/form-profile/schema specs
- [x] Frontend tsc: `pnpm exec tsc -p tsconfig.app.json --noEmit`
- [x] Frontend targeted Jest: **95/95** across product/module/material/QuickCreate/form-profile specs
- [x] Frontend build: `pnpm run build:dev`
- [x] Changed-file ESLint: PASS (pre-existing `no-explicit-any` warnings only in legacy test harnesses)
- [x] `git diff --check`: PASS
- [ ] Prettier: frontend check reports existing CRLF/style drift in legacy changed files; backend workspace has no Prettier binary. No formatter rewrite was applied.

## Executor report (auto)

- status: DONE
- changed: Product `sku`/name contract and fallback; Module/Material article DTO/schema/service/index/RU duplicate handling; form profiles, QuickCreate, FullEditor validators/labels; docs and regression specs.
- conflict disclosure: no competing `_active` keys at claim time; only TZ-CATALOG-338 active marker was present.
- known limits: legacy rows with empty article remain readable but need migration/backfill before edits that trigger schema validation; no cross-entity uniqueness; Material clone receives an `-COPY` article suffix.
- deploy: NO

## Closeout

- archive: `tasks/_archive/2026-08/TZ-CATALOG-338.done.md`
- lock: `.mimocode/locks/TZ-CATALOG-338-article-required-unique.lock`
- closed_at: `2026-08-10T17:32:05.3769468Z`
