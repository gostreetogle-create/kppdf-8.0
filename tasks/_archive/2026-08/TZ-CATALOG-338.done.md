# TZ-CATALOG-338 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10T17:32:05.3769468Z
closed_by: Buffy / continuous executor
workspace: `D:\kppdf-8.0` (executed in the host-managed Freebuff worktree)

## Scope

Product `sku`, Module `article`, and Material `article` are now required, trimmed catalog identities with organization-scoped unique indexes and Russian duplicate-key feedback. Product names are optional, with SKU fallback in list/detail. Full editors, QuickCreate, form-profile LockedRequired rules, DTOs, schemas, service guards, regression tests, and page docs were aligned.

Material internal `sku` remains optional/server-generated through the existing category counter path. Material clone articles receive an `-COPY` suffix to preserve the new uniqueness contract.

## Acceptance evidence

- Product form blocks empty SKU and allows an empty name; list/detail fallback to SKU is covered in service/UI behavior.
- Module and Material forms block empty Article; QuickCreate keeps Product SKU and Module Article visible/required even when a profile omits them.
- Product/Module/Material create services reject blank identity values and translate E11000 article/SKU collisions to `409 Артикул уже используется`.
- Form profiles lock Product `sku` and Module `article`; Product `name` is optional.
- Legacy rows without article remain readable; migration/backfill is documented as a known limitation.

## Gates

- Backend tsc: PASS
- Backend targeted Jest: PASS, 6 suites / 63 tests
- Frontend tsc: PASS
- Frontend targeted Jest: PASS, 5 suites / 95 tests
- Frontend development build: PASS
- Changed-file ESLint: PASS with pre-existing `no-explicit-any` warnings in legacy test harnesses
- `git diff --check`: PASS
- Prettier: frontend reports existing CRLF/style drift in legacy changed files; backend workspace has no Prettier binary; no formatter rewrite applied
- deploy: NO (`deploy.ps1` not run)

## Files

- Product, ProductModule, Material schemas/DTOs/services/controllers and regression specs
- Form-profile constants/service/page specs
- Product, Module, Material FullEditors and QuickCreate
- Products, Modules, Materials, and Form Profiles page docs
- `docs/agent-checklists/TZ-CATALOG-338.md`
- `docs/agent-checklists/_active-map.md`
- `.mimocode/locks/TZ-CATALOG-338-article-required-unique.lock`
