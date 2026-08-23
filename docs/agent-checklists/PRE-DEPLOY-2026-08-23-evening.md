# PRE-DEPLOY — 2026-08-23 (evening refresh)

> Target SHA for warm deploy. **Deploy not executed** (§F empty).
> Replaces earlier midday stamp; gates re-run on this HEAD.

```yaml
deploy_sha_target: 167865c9be944b3f9c4f6dd6154a960137ad477b
prepared_at: 2026-08-23T23:35:00+03:00
prepared_by: cursor-orchestrator
prod_before: c8ebdeb6 (2026-08-11)
```

## Delta themes (origin/main..HEAD, 20 commits)

- KP workspace mechanics MECH-501…505 (in-place cards, IA, number, VAT, duplicate)
- UI + overflow selects PLUS-601…604 / PARTY-306
- Supply quick-order: layout 307→308R→310 Paper&Ink; material filter 316; supplier autofill+blur-persist **317**
- KP-WS-405 workspace dialogs / table layout
- Desktop TZD-67 AI error UX; deploy start.mjs harden
- Architecture baseline refresh (inline dialogs)

## Gates (HEAD `167865c9`)

| Gate | Result |
|------|--------|
| FE `tsc -p tsconfig.app.json` | PASS |
| FE `pnpm test` | **2015/2015** PASS |
| FE `pnpm lint` | PASS (0 errors, 17 warnings baseline OnInit pages) |
| BE `tsc -p tsconfig.build.json` | PASS |
| BE `pnpm test` | **969/971** — 2 baseline failures (§Debt) |
| `pnpm architecture:check` | PASS (999 files; baseline 16) |

Supply focused: `supply-quick-order.component.spec.ts` **37/37** (incl. SUPPLY-316/317).

## §Debt (baseline — do not fix in deploy-prep)

- `backend/src/modules/catalog/catalog-314.archive.spec.ts` (~L79) — WorkTypeController roles metadata
- `backend/src/modules/admin/users-admin.controller.spec.ts` (~L114) — resetPassword lean mock
- BE `pnpm lint`: many unused-import errors (pre-existing; not a READY gate per PROMPT-DEPLOY-READY)
- Unstaged peer WIP (not in deploy SHA): `document-template.service.ts`, `table-template.service*` — left out of commits on purpose

## §F Deploy

**Not run.** No `deploy.ps1`, SSH write, or wipe.

## PO before «кати» / «сделай деплой по документации»

1. Hard refresh: снабжение → быстрый заказ → поставщик (сайт/почта после blur; подсказка «в карточке»)
2. Spot `/desk`, `/proposals/workspace`, `/production`
3. VPN **off** for deploy agent

## Desktop

`desktop_zip: accept-stale` — TZD-67 code on HEAD; installer zip not rebuilt this session. Rebuild only if PO needs fresh Desktop download link.
